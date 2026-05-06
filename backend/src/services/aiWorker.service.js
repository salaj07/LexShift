require('dotenv').config();
const { Worker } = require('bullmq');
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const pdfParse = require('pdf-parse');

const Document = require('../models/document.model');
const { processDocument, restoreNames, extractTextFromScannedPDF } = require('./aiProcessor.service');
const { generateLegalPDF } = require('./pdfGenerator.service');
const { s3 } = require('./storage/s3.service.storage'); // shared S3 client
const logger = require('../utils/logger');

// ─── REDIS PUBLISHER ─────────────────────────────────────────────────────────
// A dedicated Redis connection used ONLY for publishing progress events.
// The server process subscribes to the same channel (in src/sockets/index.js)
// and relays the events to the correct user via Socket.io.
// We need a separate connection because BullMQ's Redis connection is not
// accessible directly for pub/sub.
const Redis = require('ioredis');
const redisPublisher = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

// Helper: publish a status update to the Redis channel
// The server picks this up and emits it to the user via socket.io
const emitProgress = async (docId, userId, status) => {
  await redisPublisher.publish(
    'lexshift:progress',                          // channel name
    JSON.stringify({ docId, userId, status })     // payload
  );
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Convert S3 stream to buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

// Clean up extracted text
const normalizeText = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Upload converted text back to S3 as .txt file
const uploadConvertedToS3 = async (docId, userId, pdfBuffer) => {
  const key = `${userId}/converted/${docId}-converted.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    })
  );

  return key;
};


// ─── WORKER ──────────────────────────────────────────────────────────────────

logger.info('AI Worker initialized and waiting for jobs...');

const worker = new Worker(
  'conversionQueue',
  async (job) => {
    const { docId, s3Key, userId } = job.data;

    try {
      logger.info(`Job started → docId: ${docId}`);

      // ── STEP 1: EXTRACTING ───────────────────────────────────────────────
      await Document.findByIdAndUpdate(docId, { $set: { status: 'Extracting' } });
      await emitProgress(docId, userId, 'Extracting'); // 🔔 notify client

      // Download PDF from S3
      const s3Response = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: s3Key,
        })
      );
      const fileBuffer = await streamToBuffer(s3Response.Body);
      logger.debug('PDF downloaded from S3');

      // ── STEP 2: DETECT PDF TYPE AND EXTRACT TEXT ─────────────────────────
      let rawText = '';

      const pdfData = await pdfParse(fileBuffer);
      const parsedText = pdfData.text?.trim();

      if (parsedText && parsedText.length > 50) {
        // Text-based PDF
        logger.debug('Text-based PDF — using pdf-parse');
        rawText = parsedText;
      } else {
        logger.debug('Scanned PDF — using Gemini Vision');
        rawText = await extractTextFromScannedPDF(fileBuffer);
      }

      // ── STEP 3: NORMALIZE ────────────────────────────────────────────────
      rawText = normalizeText(rawText);
      logger.debug(`Text extracted — ${rawText.length} characters`);

      // ── STEP 4: SCRUBBING (PII masking prep) ─────────────────────────────
      await Document.findByIdAndUpdate(docId, { $set: { status: 'Scrubbing' } });
      await emitProgress(docId, userId, 'Scrubbing'); // 🔔 notify client

      // ── STEP 4: CONVERTING ───────────────────────────────────────────────
      await Document.findByIdAndUpdate(docId, { $set: { status: 'Converting' } });
      await emitProgress(docId, userId, 'Converting'); // 🔔 notify client

      // Gemini: mask names + convert IPC → BNS (chunked if large)
      const { convertedText: scrubbedText, mapping } = await processDocument(rawText);
      logger.debug(`Names masked: ${Object.keys(mapping).length} person(s) found`);

      // ── STEP 5: RESTORE NAMES ────────────────────────────────────────────
      const finalText = restoreNames(scrubbedText, mapping);
      logger.debug('Names restored in final output');

      // ── STEP 6: GENERATING PDF ───────────────────────────────────────────
      await Document.findByIdAndUpdate(docId, { $set: { status: 'Generating' } });
      await emitProgress(docId, userId, 'Generating'); // 🔔 notify client
      logger.debug('Generating PDF...');
      const pdfBuffer = await generateLegalPDF(finalText);
      logger.debug('PDF generated');

      // ── STEP 7: UPLOAD PDF TO S3 ─────────────────────────────────────────
      await Document.findByIdAndUpdate(docId, { $set: { status: 'Uploading' } });
      await emitProgress(docId, userId, 'Uploading'); // 🔔 notify client
      const convertedS3Key = await uploadConvertedToS3(docId, userId, pdfBuffer);
      logger.debug(`PDF uploaded to S3 → ${convertedS3Key}`);

      // ── STEP 8: SAVE TO DB + NOTIFY CLIENT ──────────────────────────────
      await Document.findByIdAndUpdate(docId, {
        $set: {
          convertedS3Key,
          status: 'Completed',
        },
      });
      await emitProgress(docId, userId, 'Completed'); // 🔔 notify client — job done!

      logger.info(`Job completed → docId: ${docId}`);
    } catch (error) {
      logger.error(`Worker job failed → docId: ${docId} | ${error.message}`);

      await Document.findByIdAndUpdate(docId, {
        $set: { status: 'Failed' },
      });
      await emitProgress(docId, userId, 'Failed'); // 🔔 notify client — job failed

      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  }
);

module.exports = worker;

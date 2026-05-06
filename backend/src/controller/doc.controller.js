const Document = require('../models/document.model');
const { Queue } = require('bullmq');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../services/storage/s3.service.storage');
const logger = require('../utils/logger');

// Create queue instance (connects to Redis)
const aiQueue = new Queue('conversionQueue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

// 📤 Upload Controller
const uploadDoc = async (req, res) => {
  try {
    // 1️⃣ Check file exists
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    // 2️⃣ Save document in DB
    const newDoc = await Document.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      s3FileKey: req.file.key,
    });

    // 3️⃣ Add job to queue
    await aiQueue.add('processDoc', {
      docId: newDoc._id,
      s3Key: req.file.key,
      userId: req.user._id,
    });

    // 4️⃣ Send response
    return res.status(200).json({
      message: 'File uploaded successfully',
      docId: newDoc._id,
    });

  } catch (error) {
    logger.error(`uploadDoc error: ${error.message}`);
    res.status(500).json({
      message: 'Upload failed',
    });
  }
};

// 📊 Poll conversion status
const getStatus = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId).select('status originalName');

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    return res.status(200).json({
      docId: doc._id,
      status: doc.status,
      originalName: doc.originalName,
    });

  } catch (error) {
    logger.error(`getStatus error: ${error.message}`);
    res.status(500).json({ message: 'Failed to get status' });
  }
};

// 📥 Download converted result from S3
const getResult = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (doc.status !== 'Completed') {
      return res.status(400).json({
        message: 'Document not ready yet',
        status: doc.status,
      });
    }

    if (!doc.convertedS3Key) {
      return res.status(404).json({ message: 'Converted file not found in S3' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: doc.convertedS3Key,
    });

    const s3Response = await s3.send(command);

 const downloadName = doc.originalName.replace('.pdf', '-converted.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

    s3Response.Body.pipe(res);

  } catch (error) {
    logger.error(`getResult error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch result' });
  }
};

module.exports = {
  uploadDoc,
  getStatus,
  getResult,
};

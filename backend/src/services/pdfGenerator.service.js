/**
 * @file src/services/pdfGenerator.service.js
 * @description Generates a legal PDF using a singleton Puppeteer browser.
 *
 * Performance: Instead of launching + closing a browser per job (~1-2s overhead),
 * we reuse one browser instance across all jobs. Each job only opens/closes a PAGE.
 *
 * Safety:
 *  - If the browser crashes/disconnects, the singleton is reset to null.
 *  - The next job will automatically relaunch a fresh browser.
 *  - Pages are always closed in a finally block — even if PDF generation throws.
 */

const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

// Singleton browser instance — shared across all conversion jobs
let browserInstance = null;

/**
 * Returns the shared browser instance.
 * Relaunches automatically if the browser has crashed or disconnected.
 */
const getBrowser = async () => {
  if (!browserInstance || !browserInstance.connected) {
    logger.info('Launching Puppeteer browser instance...');
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',  // prevents crashes in low-memory environments
        '--disable-gpu',
      ],
    });

    // When browser crashes, reset singleton so next job gets a fresh one
    browserInstance.on('disconnected', () => {
      logger.warn('Puppeteer browser disconnected — will relaunch on next job');
      browserInstance = null;
    });

    logger.info('Puppeteer browser ready');
  }

  return browserInstance;
};

/**
 * Generates a legal PDF from HTML content.
 * Opens a new page on the shared browser, generates PDF, then closes ONLY the page.
 * @param {string} htmlContent - The HTML body content to render
 * @returns {Buffer} PDF buffer
 */
const generateLegalPDF = async (htmlContent) => {
  const browser = await getBrowser();
  const page = await browser.newPage(); // open new tab, NOT new browser

  try {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            color: #000;
            padding: 30px 50px;
            line-height: 1.5;
          }

          h1, h2 {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          p { margin-bottom: 5px; text-align: justify; }
          strong { font-weight: bold; }

          /* ── FIR Header ── */
          .fir-header { text-align: center; margin-bottom: 14px; }
          .fir-header h2 { font-size: 15px; margin-bottom: 3px; }
          .fir-header p  { font-size: 12px; margin: 2px 0; }

          /* ── Outer FIR Form Table ── */
          table.fir-outer {
            width: 100%;
            border-collapse: collapse;
          }
          table.fir-outer > tbody > tr > td {
            border: 1px solid #000;
            padding: 5px 7px;
            vertical-align: top;
          }
          td.sec-num {
            width: 6%;
            font-weight: bold;
            white-space: nowrap;
          }
          td.sec-content { width: 94%; }

          /* ── Inner Field Tables ── */
          table.inner-fields {
            width: 100%;
            border-collapse: collapse;
            margin: 2px 0;
          }
          table.inner-fields td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
            font-size: 12px;
          }
          table.inner-fields td.field-label { width: 35%; }

          /* ── Accused / Witness Table ── */
          table.accused-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
          }
          table.accused-table th {
            background-color: #e8e8e8;
            font-weight: bold;
            padding: 5px 7px;
            border: 1px solid #000;
          }
          table.accused-table td {
            padding: 5px 7px;
            border: 1px solid #000;
            vertical-align: top;
          }

          /* ── FIR Letter Box ── */
          .letter-box {
            border: 1px solid #000;
            padding: 10px 14px;
            margin-top: 4px;
            text-align: justify;
            line-height: 1.6;
          }
          .letter-box p { margin-bottom: 8px; }

          /* ── Signature Block ── */
          .sig-block {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
          }
          .sig-area { width: 45%; font-size: 12px; }
          .sig-line {
            border-top: 1px solid #000;
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '40px', bottom: '40px', left: '60px', right: '60px' },
      printBackground: true,
    });

    return pdfBuffer;

  } finally {
    // Always close the PAGE — never close the shared browser
    await page.close();
  }
};

module.exports = { generateLegalPDF };

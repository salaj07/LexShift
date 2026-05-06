    33323e4

const express = require('express');
const router = express.Router();

const { upload } = require('../services/storage/s3.service.storage');
const { uploadDoc, getStatus, getResult } = require('../controller/doc.controller');
const requireAuth = require('../middlewares/auth.middleware');
const { uploadLimiter } = require('../middlewares/rateLimiter.middleware');

// 📤 Upload PDF — rate limited (10/hr) as each job triggers expensive AI processing
router.post('/upload', requireAuth, uploadLimiter, upload.single('document'), uploadDoc);

// 📊 Poll conversion status
router.get('/status/:docId', requireAuth, getStatus);

// 📥 Download converted result
router.get('/result/:docId', requireAuth, getResult);

module.exports = router;

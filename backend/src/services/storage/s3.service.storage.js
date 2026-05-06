const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');


//* Initialize the S3 client with credentials and region from environment variables
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

//* Configure multer to use multer-s3 for uploading files directly to S3

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const uniqueName = `${req.user._id}/${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        },
    }),
    // Only allow PDF uploads — reject everything else before it hits S3
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max — prevents oversized uploads
    },
});

module.exports = {
    upload,
    s3,
    
};
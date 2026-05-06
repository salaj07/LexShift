const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    s3FileKey: { 
      type: String,
      required: true,
    },
     convertedS3Key: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        'Uploaded',
        'Extracting',
        'Scrubbing',
        'Converting',
        'Rebuilding',
        'Completed',
        'Failed',
      ],
      default: 'Uploaded',
    },
  },
  { timestamps: true }
);

// ── Indexes for query performance ────────────────────────────────────────────
// Without these, Mongo does full collection scans as documents grow
DocumentSchema.index({ userId: 1 });            // fast user document lookups
DocumentSchema.index({ userId: 1, status: 1 }); // fast status-filtered queries

module.exports = mongoose.model('Document', DocumentSchema);
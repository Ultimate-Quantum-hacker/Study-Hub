const mongoose = require('mongoose');

const courseFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    course: { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 500 },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    extractedText: { type: String, default: '' },
    summary: { type: String, default: '' },
    keyPoints: [String],
    isProcessed: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

courseFileSchema.index({ course: 1 });
courseFileSchema.index({ originalName: 'text', course: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('CourseFile', courseFileSchema);

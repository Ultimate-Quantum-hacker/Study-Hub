const CourseFile = require('../models/CourseFile');
const path = require('path');
const fs = require('fs');

// POST /api/files/upload
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const { course, description, tags } = req.body;
  const fileUrl = `/uploads/modules/${req.file.filename}`;
  const courseFile = await CourseFile.create({
    originalName: req.file.originalname,
    storedName: req.file.filename,
    filePath: req.file.path,
    fileUrl,
    mimeType: req.file.mimetype,
    size: req.file.size,
    course: course || 'General',
    description: description || '',
    uploader: req.user._id,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
  });
  // Trigger async processing (non-blocking)
  setImmediate(() => processDocument(courseFile._id, req.file.path, req.file.mimetype));
  const populated = await courseFile.populate('uploader', 'username avatar');
  res.status(201).json({ success: true, file: populated });
};

// Async document text extraction + AI processing
async function processDocument(fileId, filePath, mimeType) {
  try {
    let text = '';
    if (mimeType === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (mimeType === 'text/plain') {
      text = fs.readFileSync(filePath, 'utf8');
    }
    if (text) {
      await CourseFile.findByIdAndUpdate(fileId, {
        extractedText: text.slice(0, 50000),
        isProcessed: true,
      });
    }
  } catch (err) {
    console.error('Document processing error:', err.message);
  }
}

// GET /api/files — list files, optionally filter by course
exports.getFiles = async (req, res) => {
  const { course, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (course) query.course = new RegExp(course, 'i');
  if (search) query.$text = { $search: search };
  const files = await CourseFile.find(query)
    .populate('uploader', 'username avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await CourseFile.countDocuments(query);
  res.json({ success: true, files, total, pages: Math.ceil(total / limit) });
};

// GET /api/files/courses — get unique course names
exports.getCourses = async (req, res) => {
  const courses = await CourseFile.distinct('course');
  res.json({ success: true, courses });
};

// GET /api/files/:id
exports.getFile = async (req, res) => {
  const file = await CourseFile.findById(req.params.id).populate('uploader', 'username avatar');
  if (!file) return res.status(404).json({ success: false, message: 'File not found' });
  res.json({ success: true, file });
};

// GET /api/files/:id/download
exports.downloadFile = async (req, res) => {
  const file = await CourseFile.findById(req.params.id);
  if (!file) return res.status(404).json({ success: false, message: 'File not found' });
  file.downloadCount += 1;
  await file.save();
  res.download(file.filePath, file.originalName);
};

// DELETE /api/files/:id
exports.deleteFile = async (req, res) => {
  const file = await CourseFile.findById(req.params.id);
  if (!file) return res.status(404).json({ success: false, message: 'File not found' });
  const isOwner = file.uploader.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { fs.unlinkSync(file.filePath); } catch (_) {}
  await CourseFile.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'File deleted' });
};

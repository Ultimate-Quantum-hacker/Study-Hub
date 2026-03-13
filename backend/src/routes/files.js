const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fileController = require('../controllers/fileController');

router.get('/', authenticate, fileController.getFiles);
router.get('/courses', authenticate, fileController.getCourses);
router.post('/upload', authenticate, (req, res, next) => {
  req.uploadSubDir = 'modules';
  next();
}, upload.single('file'), fileController.uploadFile);
router.get('/:id', authenticate, fileController.getFile);
router.get('/:id/download', authenticate, fileController.downloadFile);
router.delete('/:id', authenticate, fileController.deleteFile);

module.exports = router;

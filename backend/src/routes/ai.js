const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

router.post('/chat', authenticate, aiController.chat);
router.post('/summarize', authenticate, aiController.summarize);
router.post('/quiz', authenticate, aiController.generateQuiz);
router.post('/key-points', authenticate, aiController.keyPoints);
router.post('/search', authenticate, aiController.semanticSearch);

module.exports = router;

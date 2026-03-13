const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const channelController = require('../controllers/channelController');

router.get('/', authenticate, channelController.getChannels);
router.post('/', authenticate, channelController.createChannel);
router.post('/direct', authenticate, channelController.getOrCreateDirectChannel);
router.get('/:id', authenticate, channelController.getChannel);
router.put('/:id', authenticate, channelController.updateChannel);
router.delete('/:id', authenticate, authorize('admin'), channelController.deleteChannel);
router.post('/:id/join', authenticate, channelController.joinChannel);
router.get('/:id/messages', authenticate, channelController.getMessages);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const channelController = require('../controllers/channelController');

router.get('/', authenticate, channelController.getChannels);
router.get('/discover', authenticate, channelController.discoverChannels);
router.post('/', authenticate, channelController.createChannel);
router.post('/direct', authenticate, channelController.getOrCreateDirectChannel);
router.get('/:id', authenticate, channelController.getChannel);
router.put('/:id', authenticate, channelController.updateChannel);
router.delete('/:id', authenticate, channelController.deleteChannel);
router.post('/:id/join', authenticate, channelController.joinChannel);
router.post('/:id/leave', authenticate, channelController.leaveChannel);
router.get('/:id/messages', authenticate, channelController.getMessages);
router.get('/:id/messages/search', authenticate, channelController.searchMessages);
router.get('/:id/pinned', authenticate, channelController.getPinnedMessages);

module.exports = router;

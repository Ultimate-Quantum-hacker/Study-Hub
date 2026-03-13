const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/channels — channels user is a member of
exports.getChannels = async (req, res) => {
  const channels = await Channel.find({
    members: req.user._id,
    isArchived: false,
  })
    .populate('members', 'username avatar isOnline')
    .populate('lastMessage')
    .populate('createdBy', 'username')
    .sort({ updatedAt: -1 });
  res.json({ success: true, channels });
};

// GET /api/channels/discover — all group channels (for browsing/joining)
exports.discoverChannels = async (req, res) => {
  const channels = await Channel.find({
    type: 'group',
    isArchived: false,
  })
    .populate('members', 'username avatar isOnline')
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 });
  res.json({ success: true, channels });
};

// POST /api/channels — create new channel
exports.createChannel = async (req, res) => {
  const { name, description, type, members } = req.body;
  const memberIds = [...new Set([...(members || []), req.user._id.toString()])];
  const channel = await Channel.create({
    name,
    description,
    type: type || 'group',
    members: memberIds,
    admins: [req.user._id],
    createdBy: req.user._id,
  });
  const populated = await channel.populate('members', 'username avatar isOnline');
  res.status(201).json({ success: true, channel: populated });
};

// GET /api/channels/:id
exports.getChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id)
    .populate('members', 'username avatar isOnline lastSeen')
    .populate('createdBy', 'username');
  if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });
  if (!channel.members.some((m) => m._id.equals(req.user._id))) {
    return res.status(403).json({ success: false, message: 'Not a member of this channel' });
  }
  res.json({ success: true, channel });
};

// PUT /api/channels/:id
exports.updateChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });
  const isAdmin = channel.admins.some((a) => a.equals(req.user._id)) || req.user.role === 'admin';
  if (!isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { name, description } = req.body;
  if (name) channel.name = name;
  if (description !== undefined) channel.description = description;
  await channel.save();
  res.json({ success: true, channel });
};

// DELETE /api/channels/:id (admin only)
exports.deleteChannel = async (req, res) => {
  await Channel.findByIdAndDelete(req.params.id);
  await Message.deleteMany({ channel: req.params.id });
  res.json({ success: true, message: 'Channel deleted' });
};

// POST /api/channels/:id/join
exports.joinChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });
  if (!channel.members.includes(req.user._id)) {
    channel.members.push(req.user._id);
    await channel.save();
  }
  res.json({ success: true, message: 'Joined channel' });
};

// POST /api/channels/direct — create or get DM channel
exports.getOrCreateDirectChannel = async (req, res) => {
  const { userId } = req.body;
  const me = req.user._id;
  let channel = await Channel.findOne({
    type: 'direct',
    members: { $all: [me, userId], $size: 2 },
  }).populate('members', 'username avatar isOnline');
  if (!channel) {
    channel = await Channel.create({
      name: `dm-${me}-${userId}`,
      type: 'direct',
      members: [me, userId],
      admins: [me],
      createdBy: me,
    });
    await channel.populate('members', 'username avatar isOnline');
  }
  res.json({ success: true, channel });
};

// GET /api/channels/:id/messages
exports.getMessages = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const messages = await Message.find({ channel: req.params.id, isDeleted: false })
    .populate('sender', 'username avatar')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json({ success: true, messages: messages.reverse() });
};

const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');

const socketHandler = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🟢 User connected: ${socket.user.username}`);

    // Mark user online
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
    socket.broadcast.emit('user-online', { userId: socket.user._id });

    // Join rooms for all user's channels
    const channels = await Channel.find({ members: socket.user._id }, '_id');
    channels.forEach((ch) => socket.join(ch._id.toString()));

    // Private room for user
    socket.join(socket.user._id.toString());

    // CHAT
    socket.on('send-message', async (data) => {
      try {
        const { channelId, content, type = 'text', replyTo, fileUrl, fileName, fileMimeType, fileSize } = data;
        const channel = await Channel.findById(channelId);
        if (!channel || !channel.members.some((m) => m.equals(socket.user._id))) return;

        const message = await Message.create({
          channel: channelId,
          sender: socket.user._id,
          content,
          type,
          replyTo,
          fileUrl,
          fileName,
          fileMimeType,
          fileSize,
        });

        await message.populate('sender', 'username avatar');
        if (replyTo) await message.populate('replyTo');

        channel.lastMessage = message._id;
        await channel.save();

        io.to(channelId).emit('new-message', message);

        // Push notifications to channel members
        const members = channel.members.filter((m) => !m.equals(socket.user._id));
        for (const memberId of members) {
          await User.findByIdAndUpdate(memberId, {
            $push: {
              notifications: {
                type: 'message',
                reference: message._id,
                referenceModel: 'Message',
                message: `${socket.user.username}: ${content?.slice(0, 60) || 'Sent a file'}`,
              },
            },
          });
          io.to(memberId.toString()).emit('notification', {
            type: 'message',
            message: `${socket.user.username}: ${content?.slice(0, 60) || 'Sent a file'}`,
          });
        }
      } catch (err) {
        console.error('send-message error:', err.message);
      }
    });

    // REACTION
    socket.on('add-reaction', async ({ messageId, emoji }) => {
      const message = await Message.findById(messageId);
      if (!message) return;
      const existing = message.reactions.find((r) => r.emoji === emoji);
      if (existing) {
        const userIdx = existing.users.indexOf(socket.user._id);
        if (userIdx > -1) existing.users.splice(userIdx, 1);
        else existing.users.push(socket.user._id);
      } else {
        message.reactions.push({ emoji, users: [socket.user._id] });
      }
      await message.save();
      io.to(message.channel.toString()).emit('message-reaction', { messageId, channelId: message.channel.toString(), reactions: message.reactions });
    });

    // TYPING
    socket.on('typing', ({ channelId, isTyping }) => {
      socket.to(channelId).emit('user-typing', { userId: socket.user._id, username: socket.user.username, isTyping });
    });

    // JOIN CHANNEL (runtime)
    socket.on('join-channel', (channelId) => {
      socket.join(channelId);
    });

    // WEBRTC SIGNALING
    socket.on('call-offer', ({ to, channelId, offer, type }) => {
      io.to(to).emit('call-incoming', { from: socket.user._id, fromName: socket.user.username, channelId, offer, type });
    });
    socket.on('call-answer', ({ to, answer }) => {
      io.to(to).emit('call-answered', { from: socket.user._id, answer });
    });
    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', { from: socket.user._id, candidate });
    });
    socket.on('call-end', ({ to }) => {
      io.to(to).emit('call-ended', { from: socket.user._id });
    });

    // DISCONNECT
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(socket.user._id, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit('user-offline', { userId: socket.user._id });
      console.log(`🔴 User disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = socketHandler;

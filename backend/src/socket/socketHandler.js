const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');

// Helper: push notification to a user and emit via socket
async function pushNotification(io, memberId, notif) {
  await User.findByIdAndUpdate(memberId, {
    $push: {
      notifications: {
        $each: [notif],
        $slice: -100, // Keep only the last 100 notifications per user
      },
    },
  });
  io.to(memberId.toString()).emit('notification', notif);
}

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

    // ─── SEND MESSAGE ───
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

        // Push notifications to other channel members
        const members = channel.members.filter((m) => !m.equals(socket.user._id));
        for (const memberId of members) {
          pushNotification(io, memberId, {
            type: 'message',
            reference: message._id,
            referenceModel: 'Message',
            message: `${socket.user.username}: ${content?.slice(0, 60) || 'Sent a file'}`,
          });
        }
      } catch (err) {
        console.error('send-message error:', err.message);
      }
    });

    // ─── EDIT MESSAGE ───
    socket.on('edit-message', async ({ messageId, content }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || !message.sender.equals(socket.user._id)) return;
        // Save previous content to edit history
        message.editHistory.push({ content: message.content, editedAt: new Date() });
        message.content = content;
        message.isEdited = true;
        await message.save();
        await message.populate('sender', 'username avatar');
        io.to(message.channel.toString()).emit('message-edited', {
          messageId,
          channelId: message.channel.toString(),
          content: message.content,
          isEdited: true,
          editHistory: message.editHistory,
        });
      } catch (err) {
        console.error('edit-message error:', err.message);
      }
    });

    // ─── DELETE MESSAGE ───
    socket.on('delete-message', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        // Allow sender or channel/platform admins to delete
        const channel = await Channel.findById(message.channel);
        const isSender = message.sender.equals(socket.user._id);
        const isChannelAdmin = channel?.admins?.some((a) => a.equals(socket.user._id));
        const isPlatformAdmin = socket.user.role === 'admin';
        if (!isSender && !isChannelAdmin && !isPlatformAdmin) return;
        message.isDeleted = true;
        message.content = '';
        await message.save();
        io.to(message.channel.toString()).emit('message-deleted', {
          messageId,
          channelId: message.channel.toString(),
        });
      } catch (err) {
        console.error('delete-message error:', err.message);
      }
    });

    // ─── REACTION ───
    socket.on('add-reaction', async ({ messageId, emoji }) => {
      try {
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
      } catch (err) {
        console.error('add-reaction error:', err.message);
      }
    });

    // ─── CREATE POLL ───
    socket.on('create-poll', async ({ channelId, question, options, multipleChoice = false, endsAt }) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel || !channel.members.some((m) => m.equals(socket.user._id))) return;

        const message = await Message.create({
          channel: channelId,
          sender: socket.user._id,
          content: question,
          type: 'poll',
          pollQuestion: question,
          pollOptions: options.map((text) => ({ text, votes: [] })),
          pollMultipleChoice: multipleChoice,
          pollEndsAt: endsAt ? new Date(endsAt) : undefined,
        });

        await message.populate('sender', 'username avatar');
        channel.lastMessage = message._id;
        await channel.save();

        io.to(channelId).emit('new-message', message);
      } catch (err) {
        console.error('create-poll error:', err.message);
      }
    });

    // ─── VOTE POLL ───
    socket.on('vote-poll', async ({ messageId, optionIndex }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.type !== 'poll') return;
        // Check if poll has ended
        if (message.pollEndsAt && new Date() > message.pollEndsAt) return;

        const userId = socket.user._id;

        if (!message.pollMultipleChoice) {
          // Single choice: remove previous vote from all options
          message.pollOptions.forEach((opt) => {
            opt.votes = opt.votes.filter((v) => !v.equals(userId));
          });
        }

        // Toggle vote on selected option
        const option = message.pollOptions[optionIndex];
        if (!option) return;
        const existingIdx = option.votes.findIndex((v) => v.equals(userId));
        if (existingIdx > -1) {
          option.votes.splice(existingIdx, 1);
        } else {
          option.votes.push(userId);
        }

        message.markModified('pollOptions');
        await message.save();

        io.to(message.channel.toString()).emit('poll-updated', {
          messageId,
          channelId: message.channel.toString(),
          pollOptions: message.pollOptions,
        });
      } catch (err) {
        console.error('vote-poll error:', err.message);
      }
    });

    // ─── PIN MESSAGE ───
    socket.on('pin-message', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        const channel = await Channel.findById(message.channel);
        const isSender = message.sender.equals(socket.user._id);
        const isChannelAdmin = channel?.admins?.some((a) => a.equals(socket.user._id));
        const isPlatformAdmin = socket.user.role === 'admin';
        if (!isSender && !isChannelAdmin && !isPlatformAdmin) return;
        message.isPinned = !message.isPinned;
        await message.save();
        io.to(message.channel.toString()).emit('message-pinned', {
          messageId,
          channelId: message.channel.toString(),
          isPinned: message.isPinned,
        });
      } catch (err) {
        console.error('pin-message error:', err.message);
      }
    });

    // ─── TYPING ───
    socket.on('typing', ({ channelId, isTyping }) => {
      socket.to(channelId).emit('user-typing', { userId: socket.user._id, username: socket.user.username, isTyping });
    });

    // ─── JOIN CHANNEL (runtime) ───
    socket.on('join-channel', (channelId) => {
      socket.join(channelId);
    });

    // ─── WEBRTC SIGNALING ───
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

    // ─── DISCONNECT ───
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(socket.user._id, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit('user-offline', { userId: socket.user._id });
      console.log(`🔴 User disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = socketHandler;

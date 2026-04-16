const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system', 'poll'],
      default: 'text',
    },
    fileUrl: { type: String },
    fileName: { type: String },
    fileMimeType: { type: String },
    fileSize: { type: Number },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [
      {
        emoji: { type: String },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    editHistory: [{ content: String, editedAt: Date }],
    // Poll fields
    pollQuestion: { type: String },
    pollOptions: [
      {
        text: { type: String },
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    pollMultipleChoice: { type: Boolean, default: false },
    pollEndsAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

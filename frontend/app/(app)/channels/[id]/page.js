'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore, useChatStore } from '../../../../store/index';
import { channelsAPI } from '../../../../lib/api';
import { getSocket } from '../../../../lib/socket';
import { Hash, Paperclip, Smile, Send, Phone, Video, Users, Reply, X, Image } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import axios from '../../../../lib/api';
import { filesAPI } from '../../../../lib/api';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '✅'];

export default function ChannelPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage, clearUnread, typingUsers } = useChatStore();
  const [channel, setChannel] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  const channelMessages = messages[id] || [];
  const typingUsersInChannel = (typingUsers[id] || []).filter((u) => u.userId !== user?._id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      channelsAPI.getById(id),
      channelsAPI.getMessages(id),
    ]).then(([chRes, msgRes]) => {
      setChannel(chRes.data.channel);
      setMessages(id, msgRes.data.messages || []);
      clearUnread(id);
    }).finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) socket.emit('join-channel', id);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { channelId: id, isTyping: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', { channelId: id, isTyping: false });
      }, 1500);
    }
  };

  const sendMessage = async (content = input, type = 'text', extra = {}) => {
    if (!content.trim() && type === 'text') return;
    setSending(true);
    inputRef.current?.focus();
    const socket = getSocket();
    if (socket) {
      socket.emit('send-message', { channelId: id, content, type, replyTo: replyTo?._id, ...extra });
    }
    if (type === 'text') setInput('');
    setReplyTo(null);
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course', channel?.name || 'General');
      try {
        const res = await filesAPI.upload(formData);
        const uploaded = res.data.file;
        sendMessage(uploaded.originalName, 'file', {
          fileUrl: uploaded.fileUrl,
          fileName: uploaded.originalName,
          fileMimeType: uploaded.mimeType,
          fileSize: uploaded.size,
        });
      } catch {}
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    noClick: true,
    accept: { 'image/*': [], 'application/pdf': [], 'application/msword': [], 'text/*': [] },
  });

  const handleReaction = (messageId, emoji) => {
    const socket = getSocket();
    if (socket) socket.emit('add-reaction', { messageId, emoji });
  };

  const getFileIcon = (mime) => {
    if (!mime) return '📎';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime === 'application/pdf') return '📄';
    if (mime.includes('word')) return '📝';
    return '📎';
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="chat-container" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Header */}
      <div className="topbar">
        <Hash size={18} style={{ color: 'var(--text-muted)' }} />
        <span className="topbar-title">{channel?.name || 'Channel'}</span>
        {channel?.description && <span style={{ fontSize: 12, color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>{channel.description}</span>}
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-icon" title="Members" onClick={() => setShowMembers(!showMembers)}>
            <Users size={16} />
            <span style={{ fontSize: 12 }}>{channel?.members?.length || 0}</span>
          </button>
          <button className="btn btn-ghost btn-icon" title="Voice Call" onClick={() => window.open(`/calls?channel=${id}&type=voice`, '_blank')}>
            <Phone size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Video Call" onClick={() => window.open(`/calls?channel=${id}&type=video`, '_blank')}>
            <Video size={16} />
          </button>
        </div>
      </div>

      {isDragActive && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-dim)', border: '2px dashed var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontSize: 18, gap: 12 }}>
          <Paperclip size={24} color="var(--accent)" /> Drop files to upload
        </div>
      )}

      {/* Members panel */}
      {showMembers && (
        <div style={{ position: 'absolute', right: 0, top: 60, width: 220, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', height: 'calc(100% - 60px)', zIndex: 50, padding: 16, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>Members ({channel?.members?.length})</div>
          {channel?.members?.map((m) => (
            <div key={m._id} className="sidebar-item" style={{ borderRadius: 8 }}>
              <div className="avatar-wrapper">
                <div className="avatar avatar-sm">{m.username?.[0]?.toUpperCase()}</div>
                {m.isOnline && <span className="online-dot" style={{ width: 8, height: 8 }} />}
              </div>
              <span style={{ fontSize: 13 }}>{m.username}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {channelMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            <Hash size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>Welcome to #{channel?.name}!</p>
            <p style={{ fontSize: 13 }}>This is the start of the channel.</p>
          </div>
        )}

        {channelMessages.map((msg, i) => {
          const prev = channelMessages[i - 1];
          const isConsecutive = prev && prev.sender?._id === msg.sender?._id &&
            new Date(msg.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000;
          const isOwn = msg.sender?._id === user?._id;
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

          return (
            <div key={msg._id}
              className="message"
              onMouseEnter={() => setHoveredMsg(msg._id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {!isConsecutive ? (
                <div className="avatar avatar-md">
                  {msg.sender?.avatar
                    ? <img src={`${apiBase}${msg.sender.avatar}`} className="avatar avatar-md" />
                    : msg.sender?.username?.[0]?.toUpperCase() || '?'}
                </div>
              ) : <div style={{ width: 36, flexShrink: 0 }} />}

              <div className="message-content">
                {!isConsecutive && (
                  <div className="message-header">
                    <span className="message-username">{msg.sender?.username || 'Unknown'}</span>
                    <span className="message-time">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                  </div>
                )}

                {msg.replyTo && (
                  <div className="reply-preview">
                    ↩ {msg.replyTo.sender?.username}: {msg.replyTo.content?.slice(0, 80)}
                  </div>
                )}

                {msg.type === 'text' && (
                  <div className="message-text">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {msg.type === 'file' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', maxWidth: 280 }}
                    onClick={() => window.open(`${apiBase}${msg.fileUrl}`, '_blank')}>
                    <span style={{ fontSize: 24 }}>{getFileIcon(msg.fileMimeType)}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{msg.fileName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : ''}</div>
                    </div>
                  </div>
                )}

                {msg.reactions?.length > 0 && (
                  <div className="message-reactions">
                    {msg.reactions.filter((r) => r.users?.length > 0).map((r) => (
                      <button key={r.emoji} className={`reaction-pill ${r.users?.includes(user?._id) ? 'active' : ''}`}
                        onClick={() => handleReaction(msg._id, r.emoji)}>
                        {r.emoji} <span style={{ fontSize: 11 }}>{r.users?.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message actions */}
              {hoveredMsg === msg._id && (
                <div style={{ display: 'flex', gap: 4, position: 'absolute', right: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 6px' }}>
                  {REACTIONS.slice(0, 5).map((emoji) => (
                    <button key={emoji} style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
                      onClick={() => handleReaction(msg._id, emoji)}>
                      {emoji}
                    </button>
                  ))}
                  <button style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                    onClick={() => setReplyTo(msg)}>
                    <Reply size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {typingUsersInChannel.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', color: 'var(--text-muted)', fontSize: 12 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
            {typingUsersInChannel.map((u) => u.username).join(', ')} {typingUsersInChannel.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {replyTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-tertiary)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <Reply size={13} />
            Replying to <strong style={{ color: 'var(--accent)' }}>{replyTo.sender?.username}</strong>: {replyTo.content?.slice(0, 60)}
            <button style={{ marginLeft: 'auto' }} className="btn btn-ghost" onClick={() => setReplyTo(null)}><X size={13} /></button>
          </div>
        )}
        <div className="chat-input-wrapper">
          <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} title="Upload file">
            <Paperclip size={18} />
            <input id="file-upload" type="file" style={{ display: 'none' }} multiple onChange={(e) => handleFileUpload(Array.from(e.target.files))} />
          </label>

          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={`Message #${channel?.name || 'channel'}`}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ height: 'auto' }}
          />

          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setShowEmoji(!showEmoji)}>
              <Smile size={18} />
            </button>
            {showEmoji && (
              <div style={{ position: 'absolute', bottom: 40, right: 0, zIndex: 100 }}>
                <EmojiPicker onEmojiClick={(e) => { setInput((v) => v + e.emoji); setShowEmoji(false); }} theme="dark" height={400} width={320} />
              </div>
            )}
          </div>

          <button className="btn btn-primary" style={{ padding: '7px 12px' }} onClick={() => sendMessage()} disabled={!input.trim() || sending}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

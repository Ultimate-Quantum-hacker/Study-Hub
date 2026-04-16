'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore, useChatStore, useUIStore } from '../../../../store/index';
import { channelsAPI } from '../../../../lib/api';
import { getSocket } from '../../../../lib/socket';
import { Hash, Paperclip, Smile, Send, Phone, Video, Users, Reply, X, Edit3, Trash2, Check, Menu, BarChart3, Plus, Minus, Pin, Search } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { filesAPI } from '../../../../lib/api';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '✅'];

export default function ChannelPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage, clearUnread, typingUsers } = useChatStore();
  const { setActiveChannel, setSidebarOpen } = useUIStore();
  const [channel, setChannel] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  // Edit state
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Image lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);
  // Poll creation
  const [showPollCreate, setShowPollCreate] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollMultiple, setPollMultiple] = useState(false);
  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  const channelMessages = messages[id] || [];
  const typingUsersInChannel = (typingUsers[id] || []).filter((u) => u.userId !== user?._id);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initial load
  useEffect(() => {
    if (!id) return;
    setActiveChannel(id);
    clearUnread(id);
    setLoading(true);
    setPage(1);
    setHasMore(true);
    Promise.all([
      channelsAPI.getById(id),
      channelsAPI.getMessages(id, { page: 1, limit: 50 }),
    ]).then(([chRes, msgRes]) => {
      setChannel(chRes.data.channel);
      const msgs = msgRes.data.messages || [];
      setMessages(id, msgs);
      setHasMore(msgs.length >= 50);
      clearUnread(id);
    }).finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) socket.emit('join-channel', id);

    return () => setActiveChannel(null);
  }, [id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages.length]);

  // Infinite scroll — load older messages
  const loadOlderMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      const res = await channelsAPI.getMessages(id, { page: nextPage, limit: 50 });
      const older = res.data.messages || [];
      if (older.length < 50) setHasMore(false);
      if (older.length > 0) {
        setMessages(id, [...older, ...channelMessages]);
        setPage(nextPage);
        // Maintain scroll position after prepending
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        });
      }
    } catch {}
    setLoadingMore(false);
  }, [id, page, hasMore, loadingMore, channelMessages]);

  const handleScroll = useCallback((e) => {
    if (e.target.scrollTop < 80 && hasMore && !loadingMore) {
      loadOlderMessages();
    }
  }, [loadOlderMessages, hasMore, loadingMore]);

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
    accept: { 'image/*': [], 'application/pdf': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], 'text/*': [] },
  });

  const handleReaction = (messageId, emoji) => {
    const socket = getSocket();
    if (socket) socket.emit('add-reaction', { messageId, emoji });
    setReactionPickerMsgId(null);
  };

  // ─── Edit / Delete ───
  const startEdit = (msg) => {
    setEditingMsgId(msg._id);
    setEditContent(msg.content);
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditContent('');
  };

  const submitEdit = () => {
    if (!editContent.trim()) return;
    const socket = getSocket();
    if (socket) socket.emit('edit-message', { messageId: editingMsgId, content: editContent });
    cancelEdit();
  };

  const handleDelete = (messageId) => {
    const socket = getSocket();
    if (socket) socket.emit('delete-message', { messageId });
  };

  const getFileIcon = (mime) => {
    if (!mime) return '📎';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime === 'application/pdf') return '📄';
    if (mime.includes('word')) return '📝';
    return '📎';
  };

  const isImageFile = (mime) => mime && mime.startsWith('image/');

  // ─── Poll helpers ───
  const createPoll = () => {
    const validOpts = pollOptions.filter((o) => o.trim());
    if (!pollQuestion.trim() || validOpts.length < 2) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('create-poll', { channelId: id, question: pollQuestion, options: validOpts, multipleChoice: pollMultiple });
    }
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollMultiple(false);
    setShowPollCreate(false);
  };

  const votePoll = (messageId, optionIndex) => {
    const socket = getSocket();
    if (socket) socket.emit('vote-poll', { messageId, optionIndex });
  };

  const handlePin = (messageId) => {
    const socket = getSocket();
    if (socket) socket.emit('pin-message', { messageId });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    try {
      const res = await channelsAPI.searchMessages(id, { q: query });
      setSearchResults(res.data.messages || []);
    } catch {}
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="chat-container fifa-entrance" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Header */}
      <div className="topbar">
        <button className="btn btn-ghost btn-icon mobile-only" style={{ marginRight: 8 }} onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <Hash size={18} style={{ color: 'var(--text-muted)' }} />
        <span className="topbar-title truncate" style={{ fontSize: 'clamp(14px, 4vw, 17px)' }}>{channel?.name || 'Channel'}</span>
        {channel?.description && <span className="desktop-only" style={{ fontSize: 12, color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channel.description}</span>}
        <div className="topbar-actions" style={{ gap: 4 }}>
          <button className="btn btn-ghost btn-icon" title="Search messages" onClick={() => setShowSearch(!showSearch)}>
            <Search size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Members" onClick={() => setShowMembers(!showMembers)}>
            <Users size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Voice Call"
            onClick={(e) => { e.preventDefault(); router.push(`/calls?channel=${id}&type=voice`); }}>
            <Phone size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Video Call"
            onClick={(e) => { e.preventDefault(); router.push(`/calls?channel=${id}&type=video`); }}>
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
        <div style={{ position: 'absolute', right: 0, top: 60, width: 240, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', height: 'calc(100% - 60px)', zIndex: 50, padding: 16, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Members ({channel?.members?.length})</span>
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500 }}>
              {channel?.members?.filter(m => m.isOnline).length} online
            </span>
          </div>
          {channel?.members?.map((m) => (
            <div key={m._id} className="sidebar-item" style={{ borderRadius: 8 }}
              onClick={() => { if (m._id !== user?._id) router.push(`/profile?user=${m._id}`); }}>
              <div className="avatar-wrapper">
                <div className="avatar avatar-sm">
                  {m.avatar ? <img src={`${apiBase}${m.avatar}`} className="avatar avatar-sm" /> : m.username?.[0]?.toUpperCase()}
                </div>
                {m.isOnline && <span className="online-dot" style={{ width: 8, height: 8 }} />}
              </div>
              <span style={{ fontSize: 13 }}>{m.username}</span>
              {m._id === user?._id && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>you</span>}
            </div>
          ))}
        </div>
      )}

      {/* Search Panel */}
      {showSearch && (
        <div style={{ position: 'absolute', right: 0, top: 60, width: 300, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', height: 'calc(100% - 60px)', zIndex: 50, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Search Messages</span>
            <button className="btn btn-ghost btn-icon" onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}><X size={14} /></button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 32, fontSize: 13 }} placeholder="Search…" value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)} autoFocus />
          </div>
          {searchResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {searchResults.map((msg) => (
                <div key={msg._id} className="card" style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 13 }}
                  onClick={() => { setShowSearch(false); /* scroll to message could be added */ }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', marginBottom: 2 }}>{msg.sender?.username}</div>
                  <div className="truncate" style={{ color: 'var(--text-secondary)' }}>{msg.content}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</div>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 16 }}>No results found</p>
          ) : null}
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxUrl && (
        <div className="modal-overlay" onClick={() => setLightboxUrl(null)} style={{ zIndex: 2000 }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <img src={lightboxUrl} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} alt="Preview" />
            <button className="btn btn-ghost btn-icon" onClick={() => setLightboxUrl(null)}
              style={{ position: 'absolute', top: -12, right: -12, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', padding: 6 }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {loadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
            <div className="spinner" style={{ width: 20, height: 20 }} />
          </div>
        )}
        {!hasMore && channelMessages.length > 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '12px 0', opacity: 0.6 }}>
            — Beginning of conversation —
          </div>
        )}

        {channelMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            <Hash size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>Welcome to #{channel?.name}!</p>
            <p style={{ fontSize: 13 }}>This is the start of the channel.</p>
          </div>
        )}

        {channelMessages.map((msg, i) => {
          if (msg.isDeleted) {
            return (
              <div key={msg._id} className="message" style={{ opacity: 0.5 }}>
                <div style={{ width: 36, flexShrink: 0 }} />
                <div className="message-content">
                  <span style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    🗑️ This message was deleted
                  </span>
                </div>
              </div>
            );
          }

          const prev = channelMessages[i - 1];
          const isConsecutive = prev && !prev.isDeleted && prev.sender?._id === msg.sender?._id &&
            new Date(msg.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000;
          const isOwn = msg.sender?._id === user?._id;

          return (
            <div key={msg._id}
              className="message"
              onMouseEnter={() => setHoveredMsg(msg._id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {!isConsecutive ? (
                <div className="avatar avatar-md">
                  {msg.sender?.avatar
                    ? <img src={`${apiBase}${msg.sender.avatar}`} className="avatar avatar-md" alt="" />
                    : msg.sender?.username?.[0]?.toUpperCase() || '?'}
                </div>
              ) : <div style={{ width: 36, flexShrink: 0 }} />}

              <div className="message-content">
                {!isConsecutive && (
                  <div className="message-header">
                    <span className="message-username">{msg.sender?.username || 'Unknown'}</span>
                    <span className="message-time">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                    {msg.isEdited && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>(edited)</span>}
                    {msg.isPinned && <span style={{ fontSize: 10, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 2 }}><Pin size={10} /> Pinned</span>}
                  </div>
                )}

                {msg.replyTo && (
                  <div className="reply-preview">
                    ↩ {msg.replyTo.sender?.username}: {msg.replyTo.content?.slice(0, 80)}
                  </div>
                )}

                {/* Edit mode */}
                {editingMsgId === msg._id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <textarea
                      className="form-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ fontSize: 14, minHeight: 60, resize: 'vertical' }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button className="btn btn-primary btn-sm" onClick={submitEdit} style={{ gap: 4 }}>
                        <Check size={12} /> Save
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Escape to cancel · Enter to save</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.type === 'text' && (
                      <div className="message-text">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}

                    {msg.type === 'file' && isImageFile(msg.fileMimeType) && (
                      <div style={{ marginTop: 4 }}>
                        <img
                          src={`${apiBase}${msg.fileUrl}`}
                          alt={msg.fileName}
                          style={{
                            maxWidth: 360, maxHeight: 280, borderRadius: 10,
                            cursor: 'pointer', objectFit: 'cover',
                            border: '1px solid var(--border)',
                          }}
                          onClick={() => setLightboxUrl(`${apiBase}${msg.fileUrl}`)}
                        />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{msg.fileName}</div>
                      </div>
                    )}

                    {msg.type === 'file' && !isImageFile(msg.fileMimeType) && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', maxWidth: 280 }}
                        onClick={() => window.open(`${apiBase}${msg.fileUrl}`, '_blank')}>
                        <span style={{ fontSize: 24 }}>{getFileIcon(msg.fileMimeType)}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }} className="truncate">{msg.fileName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : ''}</div>
                        </div>
                      </div>
                    )}

                    {msg.type === 'poll' && msg.pollOptions && (() => {
                      const totalVotes = msg.pollOptions.reduce((s, o) => s + (o.votes?.length || 0), 0);
                      return (
                        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, maxWidth: 400, marginTop: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <BarChart3 size={16} color="var(--accent)" />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{msg.pollQuestion}</span>
                          </div>
                          {msg.pollMultipleChoice && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Multiple choice · Select all that apply</div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {msg.pollOptions.map((opt, oi) => {
                              const votes = opt.votes?.length || 0;
                              const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                              const hasVoted = opt.votes?.some((v) => v === user?._id || v?._id === user?._id || String(v) === String(user?._id));
                              return (
                                <button key={oi}
                                  onClick={() => votePoll(msg._id, oi)}
                                  style={{
                                    position: 'relative', padding: '10px 14px', borderRadius: 8,
                                    border: hasVoted ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                                    background: 'var(--bg-tertiary)', cursor: 'pointer', textAlign: 'left',
                                    overflow: 'hidden', transition: 'all 0.15s ease',
                                  }}>
                                  <div style={{
                                    position: 'absolute', left: 0, top: 0, bottom: 0,
                                    width: `${pct}%`, background: hasVoted ? 'var(--accent-dim)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: 8, transition: 'width 0.4s ease',
                                  }} />
                                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                                    <span style={{ fontSize: 13, fontWeight: hasVoted ? 600 : 400, color: hasVoted ? 'var(--accent)' : 'var(--text-primary)' }}>
                                      {hasVoted && '✓ '}{opt.text}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginLeft: 12 }}>{pct}%</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Edited indicator on consecutive messages */}
                {isConsecutive && msg.isEdited && editingMsgId !== msg._id && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>(edited)</span>
                )}

                {msg.reactions?.length > 0 && (
                  <div className="message-reactions">
                    {msg.reactions.filter((r) => r.users?.length > 0).map((r) => (
                      <button key={r.emoji} className={`reaction-pill ${r.users?.includes(user?._id) ? 'active' : ''}`}
                        onClick={() => handleReaction(msg._id, r.emoji)}>
                        {r.emoji} <span style={{ fontSize: 11 }}>{r.users?.length}</span>
                      </button>
                    ))}
                    <button className="reaction-pill" style={{ opacity: 0.6 }}
                      onClick={() => setReactionPickerMsgId(reactionPickerMsgId === msg._id ? null : msg._id)}
                      title="Add reaction">
                      ＋
                    </button>
                  </div>
                )}
                {reactionPickerMsgId === msg._id && (
                  <div style={{ position: 'absolute', bottom: '100%', left: 48, zIndex: 200 }}>
                    <EmojiPicker onEmojiClick={(e) => handleReaction(msg._id, e.emoji)} theme="dark" height={350} width={300} />
                  </div>
                )}
              </div>

              {/* Message actions — show on hover */}
              {hoveredMsg === msg._id && editingMsgId !== msg._id && (
                <div style={{ display: 'flex', gap: 4, position: 'absolute', right: 12, top: -4, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 6px', zIndex: 10 }}>
                  {REACTIONS.slice(0, 4).map((emoji) => (
                    <button key={emoji} style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', transition: 'transform 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onClick={() => handleReaction(msg._id, emoji)}>
                      {emoji}
                    </button>
                  ))}
                  <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px' }}
                    onClick={() => setReplyTo(msg)} title="Reply">
                    <Reply size={13} />
                  </button>
                  {isOwn && msg.type === 'text' && (
                    <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px' }}
                      onClick={() => startEdit(msg)} title="Edit">
                      <Edit3 size={13} />
                    </button>
                  )}
                  <button style={{ color: msg.isPinned ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px' }}
                    onClick={() => handlePin(msg._id)} title={msg.isPinned ? 'Unpin' : 'Pin'}>
                    <Pin size={13} />
                  </button>
                  {(isOwn || user?.role === 'admin') && (
                    <button style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px' }}
                      onClick={() => handleDelete(msg._id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  )}
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
        {/* Poll Creation Modal */}
        {showPollCreate && (
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 16, marginBottom: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={16} /> Create Poll</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowPollCreate(false)}><X size={14} /></button>
            </div>
            <input className="form-input" placeholder="Ask a question..." value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)} style={{ marginBottom: 10, fontSize: 14 }} />
            {pollOptions.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input className="form-input" placeholder={`Option ${i + 1}`} value={opt}
                  onChange={(e) => { const c = [...pollOptions]; c[i] = e.target.value; setPollOptions(c); }}
                  style={{ flex: 1, fontSize: 13 }} />
                {pollOptions.length > 2 && (
                  <button className="btn btn-ghost btn-icon" style={{ padding: 4, color: 'var(--danger)' }}
                    onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}><Minus size={14} /></button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {pollOptions.length < 8 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setPollOptions([...pollOptions, ''])} style={{ gap: 4 }}>
                  <Plus size={12} /> Add option
                </button>
              )}
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                <input type="checkbox" checked={pollMultiple} onChange={(e) => setPollMultiple(e.target.checked)} />
                Multiple choice
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPollCreate(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={createPoll}
                disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}>
                Create Poll
              </button>
            </div>
          </div>
        )}
        <div className="chat-input-wrapper">
          <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} title="Upload file">
            <Paperclip size={18} />
            <input id="file-upload" type="file" style={{ display: 'none' }} multiple onChange={(e) => handleFileUpload(Array.from(e.target.files))} />
          </label>
          <button className="btn btn-ghost" style={{ padding: 4, color: 'var(--text-muted)' }} onClick={() => setShowPollCreate(!showPollCreate)} title="Create poll">
            <BarChart3 size={18} />
          </button>

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

'use client';
import { useState, useEffect } from 'react';
import { channelsAPI } from '../../../lib/api';
import { useAuthStore, useChatStore } from '../../../store/index';
import { Hash, Users, Plus, Search, MessageSquare, Globe, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [discoverChannels, setDiscoverChannels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });
  const { user } = useAuthStore();
  const { unreadCounts } = useChatStore();
  const router = useRouter();

  const fetchChannels = () => {
    channelsAPI.getAll().then((r) => { setChannels(r.data.channels || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchChannels(); }, []);

  const loadDiscover = async () => {
    try {
      const res = await channelsAPI.discover();
      setDiscoverChannels(res.data.channels || []);
      setShowDiscover(true);
    } catch { toast.error('Failed to load channels'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await channelsAPI.create({ name: newChannel.name, description: newChannel.description, type: 'group' });
      router.push(`/channels/${res.data.channel._id}`);
    } catch {}
  };

  const handleJoin = async (channelId) => {
    try {
      await channelsAPI.join(channelId);
      toast.success('Joined channel!');
      fetchChannels();
      // Update discover list to reflect joined status
      setDiscoverChannels((prev) => prev.map((c) => c._id === channelId ? { ...c, members: [...(c.members || []), { _id: user._id }] } : c));
    } catch { toast.error('Failed to join channel'); }
  };

  const myChannelIds = new Set(channels.map((c) => c._id));
  const filtered = channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const groups = filtered.filter((c) => c.type === 'group');
  const dms = filtered.filter((c) => c.type === 'direct');

  return (
    <div className="fifa-entrance" style={{ padding: 28, maxWidth: 900, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Channels</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Manage all your group chats and direct messages</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={loadDiscover}>
            <Globe size={16} /> Discover
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Channel
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search channels…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Create Channel Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>Create Channel</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Channel Name</label>
                <input className="form-input" placeholder="e.g. mathematics" value={newChannel.name} onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input className="form-input" placeholder="What's this channel about?" value={newChannel.description} onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Channel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discover Channels Modal */}
      {showDiscover && (
        <div className="modal-overlay" onClick={() => setShowDiscover(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: '70vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: 16 }}><Globe size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Discover Channels</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>Browse and join available channels</p>
            {discoverChannels.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No channels available yet.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {discoverChannels.map((c) => {
                const alreadyJoined = myChannelIds.has(c._id);
                return (
                  <div key={c._id} className="card fifa-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Hash size={16} color="var(--accent)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}># {c.name}</div>
                      {c.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</div>}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        <Users size={11} style={{ verticalAlign: 'middle' }} /> {c.members?.length || 0} members • by {c.createdBy?.username || 'unknown'}
                      </div>
                    </div>
                    {alreadyJoined ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setShowDiscover(false); router.push(`/channels/${c._id}`); }}>Open</button>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleJoin(c._id)}><LogIn size={13} /> Join</button>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowDiscover(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></div> : (
        <>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Group Channels ({groups.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
            {groups.map((c) => {
              const unread = unreadCounts[c._id] || 0;
              return (
              <div key={c._id} className="card" style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                onClick={() => router.push(`/channels/${c._id}`)}>
                <div style={{ width: 40, height: 40, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Hash size={18} color="var(--accent)" />
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--success)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: unread > 0 ? 800 : 600 }}># {c.name}</div>
                  {c.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                  <Users size={13} /> {c.members?.length || 0}
                </div>
              </div>
              );
            })}
            {groups.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No group channels yet. Click "Discover" to find and join channels!</p>}
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Direct Messages ({dms.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {dms.map((c) => {
              const other = c.members?.find((m) => m._id !== user?._id);
              const unread = unreadCounts[c._id] || 0;
              return (
                <div key={c._id} className="card fifa-card" style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                  onClick={() => router.push(`/channels/${c._id}`)}>
                  <div className="avatar-wrapper" style={{ position: 'relative' }}>
                    <div className="avatar avatar-md">{other?.username?.[0]?.toUpperCase() || '?'}</div>
                    {other?.isOnline && <span className="online-dot" />}
                    {unread > 0 && (
                      <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--success)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: unread > 0 ? 800 : 600 }}>{other?.username || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: other?.isOnline ? 'var(--success)' : 'var(--text-muted)' }}>{other?.isOnline ? '● Online' : 'Offline'}</div>
                  </div>
                  {unread > 0 ? (
                    <span style={{ background: 'var(--success)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                      {unread}
                    </span>
                  ) : (
                    <MessageSquare size={14} color="var(--text-muted)" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

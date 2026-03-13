'use client';
import { useState, useEffect } from 'react';
import { channelsAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/index';
import { Hash, Users, Plus, Search, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    channelsAPI.getAll().then((r) => { setChannels(r.data.channels || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await channelsAPI.create({ name: newChannel.name, description: newChannel.description, type: 'group' });
      router.push(`/channels/${res.data.channel._id}`);
    } catch {}
  };

  const filtered = channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const groups = filtered.filter((c) => c.type === 'group');
  const dms = filtered.filter((c) => c.type === 'direct');

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Channels</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Manage all your group chats and direct messages</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Channel
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search channels…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

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

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></div> : (
        <>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Group Channels ({groups.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
            {groups.map((c) => (
              <div key={c._id} className="card" style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                onClick={() => router.push(`/channels/${c._id}`)}>
                <div style={{ width: 40, height: 40, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Hash size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}># {c.name}</div>
                  {c.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                  <Users size={13} /> {c.members?.length || 0}
                </div>
              </div>
            ))}
            {groups.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No group channels yet.</p>}
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Direct Messages ({dms.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {dms.map((c) => {
              const other = c.members?.find((m) => m._id !== user?._id);
              return (
                <div key={c._id} className="card" style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                  onClick={() => router.push(`/channels/${c._id}`)}>
                  <div className="avatar-wrapper">
                    <div className="avatar avatar-md">{other?.username?.[0]?.toUpperCase() || '?'}</div>
                    {other?.isOnline && <span className="online-dot" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{other?.username || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: other?.isOnline ? 'var(--success)' : 'var(--text-muted)' }}>{other?.isOnline ? '● Online' : 'Offline'}</div>
                  </div>
                  <MessageSquare size={14} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

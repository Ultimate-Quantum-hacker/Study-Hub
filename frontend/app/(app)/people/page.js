'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '../../../store/index';
import { usersAPI, channelsAPI } from '../../../lib/api';
import { Search, MessageSquare, Users, Menu, UserPlus, Globe, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function PeoplePage() {
  const { user } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dmLoading, setDmLoading] = useState(null);

  const fetchUsers = useCallback(async (searchQuery = '', pageNum = 1) => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ search: searchQuery, page: pageNum, limit: 30 });
      if (pageNum === 1) {
        setUsers(res.data.users || []);
      } else {
        setUsers((prev) => [...prev, ...(res.data.users || [])]);
      }
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(search, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDM = async (targetUserId) => {
    if (targetUserId === user?._id) return;
    setDmLoading(targetUserId);
    try {
      const res = await channelsAPI.createDirect(targetUserId);
      router.push(`/channels/${res.data.channel._id}`);
    } catch {
      toast.error('Failed to start conversation');
    }
    setDmLoading(null);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchUsers(search, next);
  };

  const onlineCount = users.filter((u) => u.isOnline).length;

  return (
    <div className="fifa-entrance" style={{ padding: '28px clamp(16px, 5vw, 28px)', maxWidth: 900, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button className="btn btn-ghost btn-icon mobile-only" style={{ marginRight: 12 }} onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>People</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {total} {total === 1 ? 'member' : 'members'} · {onlineCount} online
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search by username or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Grid */}
      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No users found</p>
          <p style={{ fontSize: 13 }}>Try a different search term</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {users.map((u) => {
              const isMe = u._id === user?._id;
              const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
              return (
                <div key={u._id} className="card" style={{
                  padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s ease', cursor: 'pointer',
                  border: isMe ? '1px solid var(--accent)' : undefined,
                }}
                  onClick={() => !isMe && handleDM(u._id)}
                >
                  <div className="avatar-wrapper">
                    <div className="avatar avatar-lg" style={{ fontSize: 18 }}>
                      {u.avatar
                        ? <img src={`${apiBase}${u.avatar}`} className="avatar avatar-lg" alt="" />
                        : u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    {u.isOnline && <span className="online-dot" style={{ width: 12, height: 12, borderWidth: 2 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</span>
                      {isMe && <span className="badge badge-primary" style={{ fontSize: 9 }}>You</span>}
                      {u.role === 'admin' && <span className="badge badge-warning" style={{ fontSize: 9 }}>Admin</span>}
                    </div>
                    {u.bio && <div className="truncate" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{u.bio}</div>}
                    <div style={{ fontSize: 11, color: u.isOnline ? 'var(--success)' : 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {u.isOnline ? (
                        <><Globe size={10} /> Online</>
                      ) : u.lastSeen ? (
                        <><Clock size={10} /> {formatDistanceToNow(new Date(u.lastSeen), { addSuffix: true })}</>
                      ) : (
                        'Offline'
                      )}
                    </div>
                  </div>
                  {!isMe && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink: 0, gap: 4 }}
                      onClick={(e) => { e.stopPropagation(); handleDM(u._id); }}
                      disabled={dmLoading === u._id}
                    >
                      {dmLoading === u._id ? (
                        <div className="spinner" style={{ width: 14, height: 14 }} />
                      ) : (
                        <><MessageSquare size={13} /> Chat</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {users.length < total && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={loadMore} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : `Show more (${total - users.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

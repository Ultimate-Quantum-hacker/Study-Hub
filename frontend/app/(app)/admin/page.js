'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersAPI } from '../../../lib/api';
import { useAuthStore } from '../../../store/index';
import { Shield, Users, BookOpen, MessageSquare, Hash, Activity, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/channels');
      return;
    }
    usersAPI.getAnalytics().then((res) => {
      setStats(res.data.analytics);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load admin analytics');
      setLoading(false);
    });
  }, [user]);

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await usersAPI.deleteUser(id);
      toast.success('User deleted');
      setStats((s) => ({
        ...s,
        totalUsers: s.totalUsers - 1,
        recentUsers: s.recentUsers.filter((u) => u._id !== id),
      }));
    } catch { toast.error('Failed to delete user'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} color="var(--accent)" /> Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage users, content, and system analytics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }} onClick={() => {}} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'} title="View users below">
          <div className="stat-icon" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}><Users size={22} /></div>
          <div><div className="stat-value">{stats?.totalUsers || 0}</div><div className="stat-label">Total Users</div></div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }} onClick={() => router.push('/modules')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'} title="Go to Course Modules">
          <div className="stat-icon" style={{ background: 'rgba(74, 222, 128, 0.15)', color: 'var(--success)' }}><BookOpen size={22} /></div>
          <div><div className="stat-value">{stats?.totalFiles || 0}</div><div className="stat-label">Course Modules</div></div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }} onClick={() => router.push('/channels')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'} title="Go to Channels">
          <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)' }}><MessageSquare size={22} /></div>
          <div><div className="stat-value">{stats?.totalMessages || 0}</div><div className="stat-label">Messages Sent</div></div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }} onClick={() => router.push('/channels')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'} title="Go to Channels">
          <div className="stat-icon" style={{ background: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)' }}><Hash size={22} /></div>
          <div><div className="stat-value">{stats?.totalChannels || 0}</div><div className="stat-label">Active Channels</div></div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} color="var(--accent)" /> Recent Users</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Joined</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentUsers?.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-sm">{u.username?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-warning'}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    {u.role !== 'admin' && (
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUser(u._id)} title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {stats?.recentUsers?.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

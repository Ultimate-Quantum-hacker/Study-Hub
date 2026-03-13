'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useUIStore, useChatStore, useNotificationStore } from '../store/index';
import { channelsAPI } from '../lib/api';
import {
  Hash, MessageSquare, BookOpen, Bot, Phone, User, Settings, LogOut,
  Sun, Moon, Plus, Bell, Shield, Menu, X, Users
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useUIStore();
  const { channels, setChannels, unreadCounts } = useChatStore();
  const { unreadCount: notifCount } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  useEffect(() => {
    channelsAPI.getAll().then((res) => setChannels(res.data.channels || [])).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      const res = await channelsAPI.create({ name: newChannelName, type: 'group' });
      setChannels([res.data.channel, ...channels]);
      setNewChannelName('');
      setShowCreateChannel(false);
      router.push(`/channels/${res.data.channel._id}`);
    } catch {}
  };

  const navItems = [
    { href: '/channels', icon: <Hash size={17} />, label: 'Channels' },
    { href: '/modules', icon: <BookOpen size={17} />, label: 'Course Modules' },
    { href: '/ai', icon: <Bot size={17} />, label: 'AI Assistant' },
    { href: '/calls', icon: <Phone size={17} />, label: 'Calls' },
    { href: '/profile', icon: <User size={17} />, label: 'Profile' },
    { href: '/settings', icon: <Settings size={17} />, label: 'Settings' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ href: '/admin', icon: <Shield size={17} />, label: 'Admin Panel' });
  }

  const totalUnread = Object.values(unreadCounts).reduce((s, c) => s + c, 0);

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📚</div>
        <span className="sidebar-logo-text">Study Hub</span>
        <button className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto', display: 'none' }} onClick={() => setSidebarOpen(false)} id="sidebar-close">
          <X size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* Main Navigation */}
        <div className="sidebar-section-title">Navigation</div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`sidebar-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
            {item.href === '/channels' && totalUnread > 0 && (
              <span className="sidebar-item-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
            )}
            {item.href === '/profile' && notifCount > 0 && (
              <span className="sidebar-item-badge">{notifCount}</span>
            )}
          </Link>
        ))}

        {/* Channels List */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px 4px', gap: 6 }}>
          <span className="sidebar-section-title" style={{ padding: 0, flex: 1 }}>Channels</span>
          <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, padding: 0 }} onClick={() => setShowCreateChannel(true)} title="Create Channel">
            <Plus size={14} />
          </button>
        </div>

        {showCreateChannel && (
          <form onSubmit={handleCreateChannel} style={{ padding: '4px 8px 8px' }}>
            <input
              className="form-input"
              style={{ fontSize: 13 }}
              placeholder="channel-name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Escape') setShowCreateChannel(false); }}
            />
          </form>
        )}

        {channels.filter((c) => c.type === 'group').slice(0, 15).map((channel) => {
          const unread = unreadCounts[channel._id] || 0;
          return (
            <Link key={channel._id} href={`/channels/${channel._id}`}
              className={`sidebar-item ${pathname === `/channels/${channel._id}` ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Hash size={14} style={{ opacity: 0.7 }} />
              <span className="truncate" style={{ fontSize: 13 }}>{channel.name}</span>
              {unread > 0 && <span className="sidebar-item-badge">{unread}</span>}
            </Link>
          );
        })}

        {/* Direct Messages */}
        <div className="sidebar-section-title" style={{ marginTop: 4 }}>Direct Messages</div>
        {channels.filter((c) => c.type === 'direct').slice(0, 10).map((channel) => {
          const other = channel.members?.find((m) => m._id !== user?._id);
          const unread = unreadCounts[channel._id] || 0;
          return (
            <Link key={channel._id} href={`/channels/${channel._id}`}
              className={`sidebar-item ${pathname === `/channels/${channel._id}` ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="avatar-wrapper">
                <div className="avatar avatar-sm">
                  {other?.avatar ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${other.avatar}`} className="avatar avatar-sm" /> : other?.username?.[0]?.toUpperCase() || '?'}
                </div>
                {other?.isOnline && <span className="online-dot" style={{ width: 8, height: 8 }} />}
              </div>
              <span className="truncate" style={{ fontSize: 13 }}>{other?.username || 'Unknown'}</span>
              {unread > 0 && <span className="sidebar-item-badge">{unread}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="avatar-wrapper">
          <div className="avatar avatar-md" style={{ cursor: 'pointer' }} onClick={() => router.push('/profile')}>
            {user?.avatar
              ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`} className="avatar avatar-md" />
              : user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {user?.isOnline !== false && <span className="online-dot" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{user?.username}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme" style={{ padding: 6 }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout" style={{ padding: 6, color: 'var(--danger)' }}>
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '../../../store/index';
import { usersAPI, authAPI, filesAPI } from '../../../lib/api';
import {
  Settings, User, Shield, Bell, Eye, Palette, HardDrive, Bot, Phone, LogOut,
  Camera, Save, Trash2, Download, Moon, Sun, Monitor, Mic, Video, Lock,
  MessageSquare, BookOpen, Users, AlertTriangle, X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'files', label: 'Files & Storage', icon: HardDrive },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'management', label: 'Account Management', icon: AlertTriangle },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);

  // Account
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    messages: true, mentions: true, modules: true, groupChat: true, calls: true,
  });

  // Privacy
  const [privacySettings, setPrivacySettings] = useState({
    allowMessages: true, showProfile: true, allowFriendRequests: true,
  });

  // AI
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiAnalyze, setAiAnalyze] = useState(true);

  // Calls
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');

  // Files
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (activeSection === 'calls') {
      navigator.mediaDevices?.enumerateDevices().then((devices) => {
        setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
        setVideoDevices(devices.filter((d) => d.kind === 'videoinput'));
      }).catch(() => {});
    }
    if (activeSection === 'files') {
      setFilesLoading(true);
      filesAPI.getAll({ limit: 100 }).then((r) => {
        const f = r.data.files || [];
        setFiles(f);
        setStorageUsed(f.reduce((a, b) => a + (b.size || 0), 0));
      }).finally(() => setFilesLoading(false));
    }
  }, [activeSection]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSaveAccount = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await usersAPI.updateProfile(fd);
      updateUser(res.data.user);
      toast.success('Profile saved!');
    } catch { toast.error('Failed to save profile'); }
    finally { setLoading(false); }
  };

  const handleDeleteFile = async (id) => {
    try {
      await filesAPI.delete(id);
      setFiles((f) => f.filter((x) => x._id !== id));
      toast.success('File deleted');
    } catch { toast.error('Failed to delete file'); }
  };

  const handleLogout = async () => { await logout(); router.push('/login'); };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return toast.error('Type DELETE to confirm');
    try {
      await usersAPI.deleteUser(user._id);
      await logout();
      router.push('/login');
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete account'); }
  };

  const currentAvatar = avatarPreview || (user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}` : null);

  const Toggle = ({ checked, onChange }) => (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  );

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="settings-section">
            <h2>Account Settings</h2>
            <p>Manage your personal information and profile</p>

            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div className="avatar avatar-xl" style={{ position: 'relative', overflow: 'hidden' }}>
                  {currentAvatar ? <img src={currentAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.username?.[0]?.toUpperCase()}
                  <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <Camera size={22} color="white" />
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.username}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{user?.email}</div>
                  <label className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
                    Change Avatar <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Username</label>
                <input className="form-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} placeholder="Tell us about yourself" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={200} />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Role</label>
                <input className="form-input" value={user?.role || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Member Since</label>
                <input className="form-input" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-primary" onClick={handleSaveAccount} disabled={loading}>
                  {loading ? <span className="spinner" /> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            </div>

            {user?.googleId && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(66, 133, 244, 0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Google Account Linked</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Signed in with Google OAuth</div>
                </div>
                <span className="badge badge-success">Connected</span>
              </div>
            )}
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h2>Appearance</h2>
            <p>Customize how Study Hub looks for you</p>
            <div className="card">
              <div className="settings-row">
                <div className="settings-row-label">
                  <span>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                  <span>Switch between dark and light theme</span>
                </div>
                <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label">
                  <span>🎨 Accent Color</span>
                  <span>Purple (default)</span>
                </div>
                <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8 }} />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notifications</h2>
            <p>Control which notifications you receive</p>
            <div className="card">
              <div className="settings-row">
                <div className="settings-row-label"><span>💬 Message Notifications</span><span>Get notified for new messages</span></div>
                <Toggle checked={notifSettings.messages} onChange={() => setNotifSettings({ ...notifSettings, messages: !notifSettings.messages })} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>@ Mentions & Replies</span><span>Get notified when someone mentions or replies to you</span></div>
                <Toggle checked={notifSettings.mentions} onChange={() => setNotifSettings({ ...notifSettings, mentions: !notifSettings.mentions })} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>📚 New Module Uploads</span><span>Get notified when new course materials are uploaded</span></div>
                <Toggle checked={notifSettings.modules} onChange={() => setNotifSettings({ ...notifSettings, modules: !notifSettings.modules })} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>👥 Group Chat Activity</span><span>Get notified for activity in group channels</span></div>
                <Toggle checked={notifSettings.groupChat} onChange={() => setNotifSettings({ ...notifSettings, groupChat: !notifSettings.groupChat })} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>📞 Call Invitations</span><span>Get notified when someone is calling you</span></div>
                <Toggle checked={notifSettings.calls} onChange={() => setNotifSettings({ ...notifSettings, calls: !notifSettings.calls })} />
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section">
            <h2>Privacy</h2>
            <p>Control who can interact with you</p>
            <div className="card">
              <div className="settings-row">
                <div className="settings-row-label"><span>💬 Allow Direct Messages</span><span>Let other users send you direct messages</span></div>
                <Toggle checked={privacySettings.allowMessages} onChange={() => setPrivacySettings({ ...privacySettings, allowMessages: !privacySettings.allowMessages })} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>👁️ Show Profile Info</span><span>Allow others to see your profile details</span></div>
                <Toggle checked={privacySettings.showProfile} onChange={() => setPrivacySettings({ ...privacySettings, showProfile: !privacySettings.showProfile })} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>🤝 Allow Friend Requests</span><span>Let others send you friend requests</span></div>
                <Toggle checked={privacySettings.allowFriendRequests} onChange={() => setPrivacySettings({ ...privacySettings, allowFriendRequests: !privacySettings.allowFriendRequests })} />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h2>Security</h2>
            <p>Manage your security and login sessions</p>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="settings-row">
                <div className="settings-row-label"><span>🔒 Change Password</span><span>Update your account password</span></div>
                <button className="btn btn-secondary btn-sm">Change</button>
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>🔐 Two-Factor Authentication</span><span>Add an extra layer of security</span></div>
                <span className="badge badge-warning">Coming Soon</span>
              </div>
            </div>
            <div className="card">
              <div className="settings-row">
                <div className="settings-row-label"><span>📱 Active Sessions</span><span>You're currently logged in on this device</span></div>
                <span className="badge badge-success">1 active</span>
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>🚪 Logout from All Devices</span><span>Sign out everywhere except this session</span></div>
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout All</button>
              </div>
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="settings-section">
            <h2>Files & Storage</h2>
            <p>Manage your uploaded files and storage</p>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'var(--accent-dim)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HardDrive size={22} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{formatBytes(storageUsed)}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Storage used • {files.length} files</div>
                </div>
              </div>
              <div style={{ marginTop: 12, background: 'var(--bg-tertiary)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((storageUsed / (50 * 1024 * 1024)) * 100, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 8, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>50 MB limit</div>
            </div>

            <div className="card">
              {filesLoading ? <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" style={{ margin: 'auto' }} /></div> : (
                files.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No files uploaded yet</p> :
                files.slice(0, 20).map((f) => (
                  <div key={f._id} className="settings-row">
                    <div className="settings-row-label" style={{ minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</span>
                      <span>{formatBytes(f.size)} • {f.course}</span>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteFile(f._id)} title="Delete file">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="settings-section">
            <h2>AI Assistant</h2>
            <p>Configure your AI assistant preferences</p>
            <div className="card">
              <div className="settings-row">
                <div className="settings-row-label"><span>🤖 Enable AI Assistant</span><span>Use StudyBot for document analysis and Q&A</span></div>
                <Toggle checked={aiEnabled} onChange={() => setAiEnabled(!aiEnabled)} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>📊 Analyze Uploaded Modules</span><span>Let AI process your uploaded documents</span></div>
                <Toggle checked={aiAnalyze} onChange={() => setAiAnalyze(!aiAnalyze)} />
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>🗑️ Clear AI Chat History</span><span>Remove all previous AI conversations</span></div>
                <button className="btn btn-secondary btn-sm" onClick={() => toast.success('AI chat history cleared')}>Clear History</button>
              </div>
            </div>
          </div>
        );

      case 'calls':
        return (
          <div className="settings-section">
            <h2>Call Settings</h2>
            <p>Configure your microphone and camera</p>
            <div className="card">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">🎤 Microphone</label>
                <select className="form-input" value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)}>
                  <option value="">Default Microphone</option>
                  {audioDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">📷 Camera</label>
                <select className="form-input" value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)}>
                  <option value="">Default Camera</option>
                  {videoDevices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
              <button className="btn btn-secondary" onClick={() => {
                navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
                  toast.success('Mic & Camera working!');
                  stream.getTracks().forEach((t) => t.stop());
                }).catch(() => toast.error('Could not access devices'));
              }}>
                <Monitor size={15} /> Test Devices
              </button>
            </div>
          </div>
        );

      case 'management':
        return (
          <div className="settings-section">
            <h2>Account Management</h2>
            <p>Manage your account, export data, or delete your account</p>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="settings-row">
                <div className="settings-row-label"><span>📥 Download My Data</span><span>Export all your personal data</span></div>
                <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Data export started! Check your email.')}><Download size={14} /> Export</button>
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>🚪 Logout</span><span>Sign out of Study Hub</span></div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}><LogOut size={14} /> Logout</button>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--danger)' }}>
              <h3 style={{ color: 'var(--danger)', fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} /> Danger Zone
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                Once you delete your account, there is no going back. All your data, messages, and uploaded files will be permanently removed.</p>
              {!showDeleteConfirm ? (
                <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} /> Delete My Account
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13 }}>Type <strong>DELETE</strong> to confirm:</div>
                  <input className="form-input" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE here" style={{ borderColor: 'var(--danger)' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE'}>Confirm Delete</button>
                    <button className="btn btn-secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="settings-layout">
      <div className="settings-sidebar">
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 12px' }}>Settings</div>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`settings-sidebar-item ${activeSection === id ? 'active' : ''}`} onClick={() => setActiveSection(id)}>
            <Icon size={16} /> {label}
          </button>
        ))}
        {user?.role === 'admin' && (
          <button className={`settings-sidebar-item ${activeSection === 'admin' ? 'active' : ''}`} onClick={() => setActiveSection('admin')}>
            <Shield size={16} /> Admin
          </button>
        )}
      </div>
      <div className="settings-content">
        {renderSection()}
        {activeSection === 'admin' && user?.role === 'admin' && (
          <div className="settings-section">
            <h2>Admin Settings</h2>
            <p>Manage users, content, and system</p>
            <div className="card">
              <div className="settings-row">
                <div className="settings-row-label"><span>👥 Manage Users</span><span>View, edit, or delete user accounts</span></div>
                <button className="btn btn-secondary btn-sm" onClick={() => router.push('/admin')}>Open Admin</button>
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>📊 System Statistics</span><span>View platform analytics and usage</span></div>
                <button className="btn btn-secondary btn-sm" onClick={() => router.push('/admin')}>View Stats</button>
              </div>
              <div className="settings-row">
                <div className="settings-row-label"><span>💬 Moderate Chats</span><span>Review and manage channel messages</span></div>
                <button className="btn btn-secondary btn-sm" onClick={() => router.push('/channels')}>Go to Channels</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

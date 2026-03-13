'use client';
import { useState } from 'react';
import { useAuthStore } from '../../../store/index';
import { usersAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import { Camera, Save, User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await usersAPI.updateProfile(fd);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = avatarPreview || (user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}` : null);

  return (
    <div style={{ padding: 28, maxWidth: 600, margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage your account details and appearance</p>
      </div>

      <div className="card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="avatar avatar-xl" style={{ position: 'relative', overflow: 'hidden' }}>
              {currentAvatar ? <img src={currentAvatar} className="w-full h-full" style={{ objectFit: 'cover' }} /> : user?.username?.[0]?.toUpperCase()}
              <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <Camera size={24} />
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Profile Picture</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>JPG, GIF or PNG. 1MB max.</p>
              <label className="btn btn-secondary btn-sm" style={{ marginTop: 10, display: 'inline-flex' }}>
                Change Avatar <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 36, opacity: 0.6, cursor: 'not-allowed' }} value={user?.email || ''} readOnly disabled title="Email cannot be changed" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ position: 'relative' }}>
              <Shield size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 36, opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }} value={user?.role || ''} readOnly disabled />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ paddingLeft: 36 }} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} maxLength={30} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input" rows={4} placeholder="Tell us a little bit about yourself" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={200} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

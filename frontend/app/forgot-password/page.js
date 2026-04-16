'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fifa-entrance">
      <div className="auth-card fifa-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <div className="auth-logo-title">Study Hub</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -4 }}>Reset your password</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8 }}>Check your email</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              We sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>The link expires in 1 hour.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ height: 44 }}>
              {loading ? <span className="spinner" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginTop: 20, justifyContent: 'center' }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}

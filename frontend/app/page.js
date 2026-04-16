'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/index';
import { BookOpen, MessageSquare, Users, Bot, Upload, Phone, Shield, Sparkles, ArrowRight, Star, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  const { user, token, isLoading, fetchMe } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (token) {
      fetchMe().then(() => {
        const u = useAuthStore.getState().user;
        if (u) router.push('/channels');
      }).catch(() => {});
    }
  }, []);

  // If authenticated, show loading while redirecting
  if (token && !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  // If authenticated and user exists, don't show landing
  if (token && user) return null;

  const features = [
    { icon: <MessageSquare size={24} />, title: 'Real-time Chat', desc: 'Group channels, direct messages, reactions, replies, and typing indicators — all in real time.' },
    { icon: <Upload size={24} />, title: 'Course Library', desc: 'Upload, organize, and share study materials by course. PDF, Word, and text extraction built in.' },
    { icon: <Bot size={24} />, title: 'AI Assistant', desc: 'Get instant explanations, document summaries, auto-generated quizzes, and smart searches across your materials.' },
    { icon: <Phone size={24} />, title: 'Voice & Video', desc: 'Start voice or video calls for live study sessions with your group — no extra apps needed.' },
    { icon: <Users size={24} />, title: 'Study Groups', desc: 'Create or join study groups, manage members, and keep everything organized by subject.' },
    { icon: <Shield size={24} />, title: 'Smart Moderation', desc: 'Admin tools, role-based access, and content management to keep your community focused.' },
  ];

  const stats = [
    { value: '100%', label: 'Free to use' },
    { value: '24/7', label: 'AI assistance' },
    { value: '∞', label: 'Study materials' },
    { value: '🔒', label: 'End-to-end secure' },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="landing-hero">
        <nav className="landing-nav">
          <div className="landing-nav-brand">
            <div className="sidebar-logo-icon" style={{ width: 38, height: 38 }}>
              <BookOpen size={18} color="white" />
            </div>
            <span className="sidebar-logo-text" style={{ fontSize: 18 }}>Study Hub</span>
          </div>
          <div className="landing-nav-actions">
            <button className="btn btn-ghost" onClick={() => router.push('/login')}>Log in</button>
            <button className="btn btn-primary" onClick={() => router.push('/register')} style={{ gap: 6 }}>
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </nav>

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Sparkles size={14} /> AI-Powered Study Platform
          </div>
          <h1 className="landing-hero-title">
            Study smarter,<br />
            <span className="landing-gradient-text">together.</span>
          </h1>
          <p className="landing-hero-subtitle">
            The all-in-one platform where students collaborate, share course materials,
            and get AI-powered study help. Chat, call, upload, and learn — all in one place.
          </p>
          <div className="landing-hero-cta">
            <button className="btn btn-primary btn-lg landing-cta-primary" onClick={() => router.push('/register')}>
              Start Studying Free <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/login')}>
              I have an account
            </button>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="landing-hero-glow" />
      </header>

      {/* Stats */}
      <section className="landing-stats">
        {stats.map((stat, i) => (
          <div key={i} className="landing-stat-item">
            <div className="landing-stat-value">{stat.value}</div>
            <div className="landing-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-badge"><Zap size={12} /> Features</span>
          <h2 className="landing-section-title">Everything you need to ace your courses</h2>
          <p className="landing-section-subtitle">
            Built by students, for students. Every feature is designed to make studying more efficient and collaborative.
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((feat, i) => (
            <div key={i} className="landing-feature-card fifa-card">
              <div className="landing-feature-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-badge"><Globe size={12} /> How it works</span>
          <h2 className="landing-section-title">Up and running in 3 steps</h2>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number">1</div>
            <h3>Sign up for free</h3>
            <p>Create your account with email or Google — takes 30 seconds.</p>
          </div>
          <div className="landing-step-divider" />
          <div className="landing-step">
            <div className="landing-step-number">2</div>
            <h3>Join or create a group</h3>
            <p>Find your course channels or start your own study group.</p>
          </div>
          <div className="landing-step-divider" />
          <div className="landing-step">
            <div className="landing-step-number">3</div>
            <h3>Start collaborating</h3>
            <p>Chat, share files, quiz yourself with AI, and call your study partners.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <Star size={40} style={{ color: 'var(--accent)', marginBottom: 8 }} />
          <h2>Ready to transform how you study?</h2>
          <p>Join thousands of students using Study Hub to collaborate and succeed.</p>
          <button className="btn btn-primary btn-lg landing-cta-primary" onClick={() => router.push('/register')} style={{ marginTop: 16 }}>
            Get Started — It&apos;s Free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <div className="sidebar-logo-icon" style={{ width: 32, height: 32 }}>
            <BookOpen size={16} color="white" />
          </div>
          <span className="sidebar-logo-text" style={{ fontSize: 15 }}>Study Hub</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} Study Hub. Built with ❤️ by SAGE.
        </p>
      </footer>
    </div>
  );
}

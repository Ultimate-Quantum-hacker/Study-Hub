'use client';
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', minHeight: 300, gap: 16, padding: 32, textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(248, 113, 113, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={28} color="var(--danger)" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Something went wrong</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
            {this.props.fallbackMessage || 'An unexpected error occurred. Try refreshing or going back.'}
          </p>
          <button className="btn btn-primary" onClick={this.handleRetry} style={{ gap: 8 }}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

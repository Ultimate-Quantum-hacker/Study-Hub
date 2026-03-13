'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/index';

export default function HomePage() {
  const { user, token, isLoading, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchMe().then(() => {
        const u = useAuthStore.getState().user;
        if (u) router.push('/channels');
        else router.push('/login');
      });
    } else {
      router.push('/login');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #7c6aff, #a855f7)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📚</div>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );
}

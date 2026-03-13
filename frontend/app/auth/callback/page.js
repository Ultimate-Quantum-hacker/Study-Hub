'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/index';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, fetchMe } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      fetchMe().then(() => {
        router.push('/channels');
      }).catch(() => {
        router.push('/login?error=fetch_failed');
      });
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, setToken, fetchMe]);

  return null;
}

export default function AuthCallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
      <h2 style={{ fontWeight: 600 }}>Completing login...</h2>
    </div>
  );
}

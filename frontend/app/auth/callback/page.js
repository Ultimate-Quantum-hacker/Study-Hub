'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/index';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, fetchMe } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Save the token to state and localStorage
      setToken(token);
      
      // 2. Fetch the user profile from the backend
      fetchMe().then(() => {
        // 3. Redirect into the app
        router.push('/channels');
      }).catch(() => {
        router.push('/login?error=fetch_failed');
      });
    } else {
      router.push('/login?error=no_token');
    }
  }, [searchParams, router, setToken, fetchMe]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
      <h2 style={{ fontWeight: 600 }}>Completing login...</h2>
    </div>
  );
}

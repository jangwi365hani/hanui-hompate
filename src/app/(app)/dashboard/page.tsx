'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem('jw_user');
    if (!userStr) {
      router.replace('/login');
      return;
    }
    try {
      setUser(JSON.parse(userStr));
    } catch {
      router.replace('/login');
    }
  }, [router]);

  if (!user) return null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#F5F0EB' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#F5F0EB', zIndex: 1,
          flexDirection: 'column', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #2D0A0A',
            borderTopColor: 'transparent', borderRadius: '50%',
          }} />
          <p style={{ color: '#2D0A0A', fontWeight: 600 }}>스케줄 로딩 중...</p>
        </div>
      )}
      <iframe
        src="/system/schedule"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        title="스케줄 대시보드"
      />
    </div>
  );
}

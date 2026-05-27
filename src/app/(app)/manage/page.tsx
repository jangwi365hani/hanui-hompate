'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('jw_user');
    if (!userStr) {
      router.replace('/login');
      return;
    }
    try {
      const u = JSON.parse(userStr);
      setUser(u);
      if (u.role !== 'manager' && u.role !== 'chief_doctor') {
        setAccessDenied(true);
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  if (!user) return null;

  if (accessDenied) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F5F0EB', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ color: '#2D0A0A', margin: 0 }}>접근 권한이 없습니다</h2>
        <p style={{ color: '#888', margin: 0 }}>관리자 또는 원장님만 접근할 수 있습니다.</p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            marginTop: 8, padding: '10px 24px',
            background: '#2D0A0A', color: '#F5C842',
            border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          스케줄로 돌아가기
        </button>
      </div>
    );
  }

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
          <p style={{ color: '#2D0A0A', fontWeight: 600 }}>관리 페이지 로딩 중...</p>
        </div>
      )}
      <iframe
        src="/admin"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        title="관리 페이지"
      />
    </div>
  );
}

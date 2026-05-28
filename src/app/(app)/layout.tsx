'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: '스케줄', icon: '📅', group: 'main' },
  { href: '/tangjeon', label: '탕전', icon: '🫙', group: 'main' },
  { href: '/manage', label: '관리', icon: '⚙️', group: 'admin' },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // /login 페이지는 AppShell 인증 체크 없이 그대로 보여줌
    if (pathname === '/login') {
      setLoading(false);
      return;
    }

    const stored = sessionStorage.getItem('jw_user');
    if (stored) {
      setUser(JSON.parse(stored));
      setLoading(false);
    } else {
      router.replace('/login');
    }
  }, [router, pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('jw_user');
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F0EB]">
        <div className="text-[#8B1A1A] font-medium">로딩중...</div>
      </div>
    );
  }

  // /login 페이지: 사이드바 없이 children만 렌더링
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F5F0EB] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 220 : 64,
          minWidth: sidebarOpen ? 220 : 64,
          background: '#2D0A0A',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s, min-width 0.2s',
          overflow: 'hidden',
          height: '100vh',
        }}
      >
        {/* Logo/Title */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: '1px solid rgba(245,200,66,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🏥</span>
          {sidebarOpen && (
            <span style={{ color: '#F5C842', fontWeight: 700, fontSize: 13, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              장위365<br />경희한의원
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: active ? 'rgba(245,200,66,0.15)' : 'transparent',
                  color: active ? '#F5C842' : 'rgba(245,240,235,0.7)',
                  cursor: 'pointer',
                  marginBottom: 4,
                  transition: 'background 0.15s',
                  fontSize: 14,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ fontWeight: active ? 700 : 400 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '12px 8px 20px',
          borderTop: '1px solid rgba(245,200,66,0.15)',
        }}>
          {sidebarOpen && user && (
            <div style={{ color: 'rgba(245,240,235,0.6)', fontSize: 12, padding: '0 12px 8px' }}>
              {user.name} ({user.role})
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, border: 'none',
              background: 'transparent', color: 'rgba(245,240,235,0.5)',
              cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>🚪</span>
            {sidebarOpen && '로그아웃'}
          </button>
        </div>
      </aside>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'absolute',
          left: sidebarOpen ? 208 : 52,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          width: 24, height: 24,
          borderRadius: '50%',
          border: '1.5px solid #2D0A0A',
          background: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: '#2D0A0A',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}

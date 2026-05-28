'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USERS = [
  { name: '안익균', role: 'doctor' },
  { name: '박종성', role: 'doctor' },
  { name: '신지훈', role: 'doctor' },
  { name: '데스크실장', role: 'manager' },
  { name: '김현규', role: 'chief_doctor' },
];

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/system/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && (data.ok || data.success)) {
        const serverUser = data.user || {};
        const localUser = USERS.find(u => u.name === name);
        const role = serverUser.role || localUser?.role || 'staff';
        sessionStorage.setItem('jw_user', JSON.stringify({ name, role }));
        router.push('/dashboard');
      } else {
        setError(data.message || data.error || '이름 또는 PIN이 올바르지 않습니다.');
      }
    } catch {
      setError('서버 연결 오류. 잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F0EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Pretendard, -apple-system, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(45,10,10,0.12)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: '#2D0A0A',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>🏥</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2D0A0A', margin: 0 }}>장위365경희한의원</h1>
          <p style={{ color: '#888', marginTop: 6, fontSize: 14 }}>직원 로그인</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>이름</label>
            <select
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid #ddd', borderRadius: 8,
                fontSize: 15, color: '#222', background: '#fafafa',
                boxSizing: 'border-box',
              }}
            >
              <option value="">이름 선택</option>
              {USERS.map(u => (
                <option key={u.name} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="PIN 입력"
              required
              maxLength={8}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid #ddd', borderRadius: 8,
                fontSize: 15, color: '#222', background: '#fafafa',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0', border: '1px solid #ffcccc',
              borderRadius: 8, padding: '10px 14px',
              color: '#c00', fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#999' : '#2D0A0A',
              color: '#F5C842', border: 'none', borderRadius: 8,
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

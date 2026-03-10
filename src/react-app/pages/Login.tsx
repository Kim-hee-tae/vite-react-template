import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 로직 (로컬 스토리지 사용)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      alert('이메일 또는 비밀번호가 잘못되었습니다.');
      return;
    }
    if (!user.isApproved) {
      alert('관리자 승인 대기 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('로그인 성공!');
    if (user.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <button
          type="submit"
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          로그인
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        <a href="/signup" style={{ color: '#007BFF', textDecoration: 'none' }}>회원 가입</a>
      </p>
    </div>
  );
}

export default Login;
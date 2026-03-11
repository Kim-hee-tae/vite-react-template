import React, { useState } from 'react';

function TestDB() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test@1234');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '';

  const testSignUp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setResponse(`[회원가입]\n상태: ${res.status}\n응답: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResponse(`[회원가입 에러]\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setResponse(`[로그인]\n상태: ${res.status}\n응답: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResponse(`[로그인 에러]\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/pending-users`);
      const data = await res.json();
      setResponse(`[승인 대기 사용자]\n상태: ${res.status}\n응답: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResponse(`[조회 에러]\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testServerStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/`);
      const data = await res.json();
      setResponse(`[서버 상태]\n상태: ${res.status}\n응답: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResponse(`[서버 연결 실패]\n${error.message}\n\n⚠️ wrangler dev가 http://localhost:8787에서 실행 중인지 확인하세요!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📊 데이터베이스 통신 테스트</h2>

      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <p><strong>API 기본 URL:</strong> {API_BASE || '/' } (프로덕션)</p>
        <p style={{ color: '#666', fontSize: '12px' }}>
          🟡 개발 환경: http://localhost:8787 사용 중<br/>
          wrangler dev가 실행되지 않으면 API 요청이 실패합니다!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testServerStatus}
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔌 서버 상태 확인
        </button>
        <button 
          onClick={testSignUp}
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ✍️ 회원가입 테스트
        </button>
        <button 
          onClick={testLogin}
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔐 로그인 테스트
        </button>
        <button 
          onClick={testPendingUsers}
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          👥 승인 대기 조회
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          <strong>테스트 이메일:</strong>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box', marginTop: '5px' }}
          />
        </label>
        <label style={{ display: 'block', marginTop: '10px' }}>
          <strong>테스트 비밀번호:</strong>
          <input 
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box', marginTop: '5px' }}
            placeholder="예: Test@1234"
          />
        </label>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          ℹ️ 비밀번호는 8자 이상, 대문자, 특수문자를 포함해야 합니다
        </p>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '300px' }}>
        <strong>응답 결과:</strong>
        <pre style={{ 
          backgroundColor: '#000', 
          color: '#0f0', 
          padding: '10px', 
          borderRadius: '3px', 
          overflow: 'auto',
          maxHeight: '400px',
          marginTop: '10px',
          fontFamily: 'Courier New'
        }}>
          {loading ? '로딩 중...' : response || '버튼을 클릭하여 테스트하세요'}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fffbea', border: '1px solid #ffc107', borderRadius: '5px' }}>
        <h4>🔧 문제 해결 가이드</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '14px' }}>
          <li><strong>CORS 에러:</strong> wrangler dev가 실행 중인지 확인하세요</li>
          <li><strong>연결 실패:</strong> <code>npx wrangler dev</code>를 터미널에서 실행하세요</li>
          <li><strong>API 404:</strong> 백엔드 라우트가 정확한지 확인하세요</li>
          <li><strong>비밀번호 검증 실패:</strong> 8자 이상, 대문자, 특수문자 포함 필요</li>
        </ul>
      </div>
    </div>
  );
}

export default TestDB;

// 이렇게 수정하거나 (React를 직접 안 쓰면 아예 지워도 됩니다)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Admin from './pages/Admin';

function App() {
  // 초기 로그인 상태를 localStorage 기반으로 설정하여 바로 라우팅이 가능하도록 함
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = localStorage.getItem('currentUser');
    if (user && user !== 'undefined' && user !== 'null') {
      try {
        const parsed = JSON.parse(user);
        return !!(parsed && typeof parsed === 'object');
      } catch {
        return false;
      }
    }
    return false;
  });

  // 이후에도 유효성 검사를 위해 한 번 더 확인
  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser');
      if (user && user !== 'undefined' && user !== 'null') {
        const parsedUser = JSON.parse(user);
        if (parsedUser && typeof parsedUser === 'object') {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('currentUser');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('로컬 스토리지 파싱 오류:', error);
      localStorage.removeItem('currentUser');
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={
          isLoggedIn ? (
            (() => {
              const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
              return user.role === 'admin' ? <Admin /> : <Navigate to="/" />;
            })()
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/" element={
          isLoggedIn ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>메인 페이지</h1>
              
              {/* 로그아웃 버튼 추가 */}
              <button 
                onClick={handleLogout}
                style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}
              >
                로그아웃
              </button>

              {/* 이동 버튼 추가 */}
              <button 
                onClick={() => window.location.href = '/tt'}
                style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                테스트 페이지로 이동
              </button>

              <p style={{ marginTop: '20px' }}>
                현재 Vite + React 환경에서 실행 중입니다.
              </p>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App

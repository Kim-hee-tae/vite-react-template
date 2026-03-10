import React, { useState } from 'react';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 비밀번호 유효성 검사 규칙
  const passwordRules = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isPasswordValid = passwordRules.minLength && passwordRules.hasUpperCase && passwordRules.hasSpecialChar;

  // 이메일 형식 검증
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 비밀번호 일치 확인
  const isPasswordMatching = password === confirmPassword && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이메일 형식 검증
    if (!isEmailValid) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 비밀번호 유효성 검증
    if (!isPasswordValid) {
      alert('비밀번호는 다음 규칙을 모두 만족해야 합니다:\n- 8자 이상\n- 대문자 포함\n- 특수문자 포함');
      return;
    }

    // 비밀번호 일치 확인
    if (!isPasswordMatching) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        window.location.href = '/login';
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('회원 가입 오류:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const getRuleColor = (isValid: boolean) => isValid ? '#4CAF50' : '#ccc';
  const getRuleText = (isValid: boolean) => isValid ? '✓' : '○';

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>회원 가입</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* 이메일 입력 */}
        <div>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              padding: '10px', 
              fontSize: '16px', 
              border: `2px solid ${isEmailValid && email ? '#4CAF50' : '#ccc'}`,
              borderRadius: '5px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          {email && !isEmailValid && (
            <p style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
              올바른 이메일 형식을 입력해주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              padding: '10px', 
              fontSize: '16px', 
              border: `2px solid ${isPasswordValid ? '#4CAF50' : '#ccc'}`,
              borderRadius: '5px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          
          {/* 비밀번호 규칙 표시 */}
          {password && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', fontSize: '14px' }}>
              <p style={{ margin: '5px 0', color: getRuleColor(passwordRules.minLength) }}>
                {getRuleText(passwordRules.minLength)} 8자 이상
              </p>
              <p style={{ margin: '5px 0', color: getRuleColor(passwordRules.hasUpperCase) }}>
                {getRuleText(passwordRules.hasUpperCase)} 대문자 포함 (A-Z)
              </p>
              <p style={{ margin: '5px 0', color: getRuleColor(passwordRules.hasSpecialChar) }}>
                {getRuleText(passwordRules.hasSpecialChar)} 특수문자 포함 (!@#$%^&*など)
              </p>
            </div>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div>
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ 
              padding: '10px', 
              fontSize: '16px', 
              border: `2px solid ${isPasswordMatching ? '#4CAF50' : '#ccc'}`,
              borderRadius: '5px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          {confirmPassword && !isPasswordMatching && (
            <p style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!isEmailValid || !isPasswordValid || !isPasswordMatching}
          style={{ 
            padding: '12px', 
            fontSize: '16px', 
            cursor: (isEmailValid && isPasswordValid && isPasswordMatching) ? 'pointer' : 'not-allowed',
            backgroundColor: (isEmailValid && isPasswordValid && isPasswordMatching) ? '#4CAF50' : '#ccc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          회원 가입
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        💡 관리자 계정: email을 <strong>admin@admin.com</strong>으로 입력하면 관리자 계정이 생성됩니다.
      </p>
      <p style={{ marginTop: '10px', textAlign: 'center' }}>
        <a href="/login" style={{ color: '#007BFF', textDecoration: 'none' }}>로그인 페이지로 돌아가기</a>
      </p>
    </div>
  );
}

export default SignUp;
import  { useState, useEffect } from 'react';

function Admin() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pending = users.filter((u: any) => !u.isApproved);
    const approved = users.filter((u: any) => u.isApproved);
    setPendingUsers(pending);
    setApprovedUsers(approved);
  };

  const approveUser = (email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === email ? { ...u, isApproved: true } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    alert('사용자가 승인되었습니다.');
    loadUsers();
  };

  const rejectUser = (email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: any) => u.email !== email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    alert('사용자가 거부되었습니다.');
    loadUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>관리자 페이지</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          로그아웃
        </button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>승인 대기 중인 사용자 ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 ? (
          <p>승인 대기 중인 사용자가 없습니다.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>이메일</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.email}>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <button 
                      onClick={() => approveUser(user.email)}
                      style={{ padding: '5px 10px', marginRight: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      승인
                    </button>
                    <button 
                      onClick={() => rejectUser(user.email)}
                      style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      거부
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h2>승인된 사용자 ({approvedUsers.length})</h2>
        {approvedUsers.length === 0 ? (
          <p>승인된 사용자가 없습니다.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>이메일</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map((user) => (
                <tr key={user.email}>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;
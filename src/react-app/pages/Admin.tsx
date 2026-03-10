import  { useState, useEffect } from 'react';

function Admin() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/admin/pending-users'),
        fetch('/api/admin/approved-users')
      ]);

      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      if (pendingData.success && approvedData.success) {
        setPendingUsers(pendingData.users);
        setApprovedUsers(approvedData.users);
      } else {
        alert('사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류가 발생했습니다.');
    }
  };

  const approveUser = async (email: string) => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const rejectUser = async (email: string) => {
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
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
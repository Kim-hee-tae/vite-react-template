import { useState, useEffect } from 'react';

function Admin() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/admin/pending-users'),
        fetch('/api/admin/approved-users')
      ]);

      if (!pendingRes.ok || !approvedRes.ok) {
        throw new Error('API 요청 실패');
      }

      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      if (pendingData.success && approvedData.success) {
        setPendingUsers(pendingData.users);
        setApprovedUsers(approvedData.users);
      } else {
        alert('사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 목록 로딩 오류:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
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

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('승인 오류:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
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

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>관리자 패널</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: activeTab === 'pending' ? '#007BFF' : '#f8f9fa',
              color: activeTab === 'pending' ? 'white' : '#333',
              border: '1px solid #dee2e6',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            승인 대기 ({pendingUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: activeTab === 'approved' ? '#28a745' : '#f8f9fa',
              color: activeTab === 'approved' ? 'white' : '#333',
              border: '1px solid #dee2e6',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            승인 완료 ({approvedUsers.length})
          </button>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          로딩 중...
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          <h2 style={{ color: '#007BFF', marginBottom: '20px' }}>🚀 승인 대기 사용자</h2>
          {pendingUsers.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '10px',
              border: '2px dashed #dee2e6'
            }}>
              <h3 style={{ color: '#6c757d', margin: '0' }}>승인 대기 중인 사용자가 없습니다</h3>
              <p style={{ color: '#6c757d', margin: '10px 0 0 0' }}>새로운 회원 가입 요청이 오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {pendingUsers.map((user) => (
                <div key={user.email} style={{ 
                  border: '1px solid #dee2e6', 
                  borderRadius: '10px', 
                  padding: '20px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{user.email}</h3>
                    <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                      가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => approveUser(user.email)}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      ✅ 승인
                    </button>
                    <button 
                      onClick={() => rejectUser(user.email)}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      ❌ 거부
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div>
          <h2 style={{ color: '#28a745', marginBottom: '20px' }}>✅ 승인 완료 사용자</h2>
          {approvedUsers.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '10px',
              border: '2px dashed #dee2e6'
            }}>
              <h3 style={{ color: '#6c757d', margin: '0' }}>승인된 사용자가 없습니다</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {approvedUsers.map((user) => (
                <div key={user.email} style={{ 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{user.email}</span>
                    <span style={{ marginLeft: '10px', color: '#6c757d', fontSize: '14px' }}>
                      승인일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <span style={{ 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    승인됨
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
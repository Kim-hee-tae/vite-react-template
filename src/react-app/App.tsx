// 이렇게 수정하거나 (React를 직접 안 쓰면 아예 지워도 됩니다)
import { } from 'react'

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>메인 페이지</h1>
      
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
  )
}

export default App

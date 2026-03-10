import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // 추가
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate() // 추가

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count 111is {count}
        </button>
        
        {/* 아래 버튼을 추가합니다 */}
        <button onClick={() => navigate('/tt')} style={{ marginLeft: '10px', backgroundColor: '#646cff' }}>
          테스트 페이지로 이동
        </button>
      </div>
    </>
  )
}

export default App

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let user = username;
    if (!user) {
      const randNum = Math.floor(Math.random() * 100) + 1;
      user = '익명' + String(randNum).padStart(3, '0');
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, user }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('jwtToken', result.token);
        localStorage.setItem('username', result.user);
        navigate('/room');
      } else {
        setMessage(`입장 실패: ${result.message}`);
      }
    } catch {
      setMessage('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <form id="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="닉네임을 입력하세요."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="입장 구호를 외치세요."
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">입장</button>
      </form>
      {message && (
        <div id="message" style={{ color: 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
}

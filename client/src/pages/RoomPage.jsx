import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoomPage() {
  const [room, setRoom] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    if (!token || !username) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const roomName = room.trim() || '기본방';
    navigate('/chat', { state: { room: roomName } });
  };

  return (
    <div className="room-container">
      <form id="room-form" onSubmit={handleSubmit}>
        <h2>채팅방 입장</h2>
        <input
          type="text"
          placeholder="채팅방 이름을 입력하세요. (빈칸: 기본방)"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          autoFocus
        />
        <button type="submit">입장</button>
      </form>
    </div>
  );
}

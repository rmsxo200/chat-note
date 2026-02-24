import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import Fireworks from '../components/Fireworks';

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fireworksRef = useRef(null);

  const token = localStorage.getItem('jwtToken');
  const username = localStorage.getItem('username');
  const room = location.state?.room;

  useEffect(() => {
    if (!token || !username) {
      navigate('/');
      return;
    }
    if (!room) {
      navigate('/room');
    }
  }, [token, username, room, navigate]);

  const { messages, authError, sendMessage } = useSocket(token, username, room);

  useEffect(() => {
    if (authError) {
      alert('인증 실패: 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
      navigate('/');
    }
  }, [authError, navigate]);

  const handleCelebration = useCallback(() => {
    setTimeout(() => {
      fireworksRef.current?.launch();
    }, 500);
  }, []);

  if (!room) return null;

  return (
    <>
      <Fireworks ref={fireworksRef} />
      <MessageList messages={messages} onCelebration={handleCelebration} />
      <MessageInput onSend={sendMessage} />
    </>
  );
}

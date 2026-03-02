import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSocket from '../hooks/useSocket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import DrawingCanvas from '../components/DrawingCanvas';
import SharedCanvas from '../components/SharedCanvas';
import Fireworks from '../components/Fireworks';

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fireworksRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('draw');
  const [hasNewDrawing, setHasNewDrawing] = useState(false);
  const sidebarOpenRef = useRef(sidebarOpen);
  const activeTabRef = useRef(activeTab);

  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

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

  const { messages, authError, sendMessage, sendImage, sendDrawStroke, registerDrawStrokeHandler, registerDrawNotifyHandler } = useSocket(token, username, room);

  // 공유 캔버스 탭을 보고 있지 않을 때 원격 획 수신 → 반짝임 알림 활성화
  useEffect(() => {
    registerDrawNotifyHandler((data) => {
      if (data.type === 'stroke' && !(sidebarOpenRef.current && activeTabRef.current === 'shared')) {
        setHasNewDrawing(true);
      }
    });
    return () => registerDrawNotifyHandler(null);
  }, [registerDrawNotifyHandler]);

  const handleTabClick = (tab) => {
    if (tab === 'shared') setHasNewDrawing(false);
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setActiveTab(tab);
    } else if (activeTab === tab) {
      setSidebarOpen(false);
    } else {
      setActiveTab(tab);
    }
  };

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
      <div className="chat-layout">
        <div className="sidebar-strip">
          <button
            className={`sidebar-tab-btn${sidebarOpen && activeTab === 'draw' ? ' active' : ''}`}
            onClick={() => handleTabClick('draw')}
            title="내 그림 그리기"
          >
            ✏️
          </button>
          <button
            className={`sidebar-tab-btn${sidebarOpen && activeTab === 'shared' ? ' active' : ''}${hasNewDrawing ? ' blinking' : ''}`}
            onClick={() => handleTabClick('shared')}
            title="공유 캔버스"
          >
            🎨
          </button>
        </div>
        <div className={`sidebar-panel${sidebarOpen ? ' open' : ''}`}>
          {activeTab === 'draw' && (
            <DrawingCanvas
              onSend={sendImage}
              onClose={() => setSidebarOpen(false)}
            />
          )}
          {activeTab === 'shared' && (
            <SharedCanvas
              onSendStroke={sendDrawStroke}
              onRegisterHandler={registerDrawStrokeHandler}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </div>
        <div className="chat-main">
          <MessageList messages={messages} onCelebration={handleCelebration} />
          <MessageInput onSend={sendMessage} />
        </div>
      </div>
    </>
  );
}

import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

export default function MessageList({ messages, onCelebration }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // 마지막 메시지가 축하 키워드를 포함하면 콜백 호출
    const last = messages[messages.length - 1];
    if (last && last.type === 'chat') {
      const celebrationKeywords = ['축하', 'ㅊㅋ', '퇴근', '연차', '반차', '퇴사'];
      if (celebrationKeywords.some((kw) => last.msg.includes(kw))) {
        onCelebration?.();
      }
    }
  }, [messages, onCelebration]);

  return (
    <ul id="messages">
      {messages.map((msg, idx) => (
        <MessageItem key={idx} message={msg} />
      ))}
      <div ref={bottomRef} />
    </ul>
  );
}

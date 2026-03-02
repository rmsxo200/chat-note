import { useState } from 'react';

export default function MessageInput({ onSend, onToggleDrawing }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form id="form" onSubmit={handleSubmit}>
      <button
        type="button"
        id="draw-toggle-btn"
        onClick={onToggleDrawing}
        title="그림 그리기"
      >
        ✏️
      </button>
      <input
        id="input"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { xorBase64Encrypt, xorBase64Decrypt } from '../utils/crypto';

export default function useSocket(token, username, room) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState(false);
  const drawStrokeHandlerRef = useRef(null);
  const drawNotifyHandlerRef = useRef(null);

  useEffect(() => {
    if (!token || !room) return;

    // Vite 프록시를 통해 연결 (직접 localhost:3000 연결 시 CORS 문제 발생)
    const socket = io({
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinRoom', { room });
    });

    socket.on('connect_error', () => {
      setAuthError(true);
    });

    socket.on('chatMessage', (data) => {
      const isImage = data.msgType === 'image';
      const decodedMsg = isImage ? data.msg : xorBase64Decrypt(data.msg);
      setMessages((prev) => [
        ...prev,
        {
          type: 'chat',
          msgType: isImage ? 'image' : 'text',
          user: data.user,
          msg: decodedMsg,
          color: data.color,
          isMine: data.user === username,
        },
      ]);
    });

    socket.on('drawStroke', (data) => {
      drawStrokeHandlerRef.current?.(data);
      drawNotifyHandlerRef.current?.(data);
    });

    socket.on('userState', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'state',
          stateType: data.type,
          message: data.message,
        },
      ]);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, room, username]);

  const sendMessage = useCallback(
    (text) => {
      if (socketRef.current && text.trim()) {
        const encodedMsg = xorBase64Encrypt(text);
        socketRef.current.emit('chatMessage', {
          user: username,
          msg: encodedMsg,
          room,
        });
      }
    },
    [username, room]
  );

  const sendImage = useCallback(
    (dataUrl) => {
      if (socketRef.current && dataUrl) {
        socketRef.current.emit('chatMessage', {
          user: username,
          msg: dataUrl,
          msgType: 'image',
          room,
        });
      }
    },
    [username, room]
  );

  const sendDrawStroke = useCallback(
    (strokeData) => {
      socketRef.current?.emit('drawStroke', { ...strokeData, room });
    },
    [room]
  );

  const registerDrawStrokeHandler = useCallback((fn) => {
    drawStrokeHandlerRef.current = fn;
  }, []);

  const registerDrawNotifyHandler = useCallback((fn) => {
    drawNotifyHandlerRef.current = fn;
  }, []);

  return { messages, connected, authError, sendMessage, sendImage, sendDrawStroke, registerDrawStrokeHandler, registerDrawNotifyHandler };
}

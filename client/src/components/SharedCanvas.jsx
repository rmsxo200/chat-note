import { useRef, useState, useEffect, useCallback } from 'react';

const COLORS = [
  '#ffffff', '#ff4444', '#ff9944', '#ffff44',
  '#44dd44', '#44aaff', '#aa44ff', '#ff44aa', '#000000',
];

const BG_COLOR = '#2a2a2a';

function drawSegment(ctx, data) {
  ctx.beginPath();
  ctx.moveTo(data.from.x, data.from.y);
  ctx.lineTo(data.to.x, data.to.y);
  ctx.strokeStyle = data.tool === 'eraser' ? BG_COLOR : data.color;
  ctx.lineWidth = data.tool === 'eraser' ? data.size * 3 : data.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export default function SharedCanvas({ onSendStroke, onRegisterHandler, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen');
  const lastPos = useRef(null);

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // 원격 스트로크 수신 핸들러 등록
  useEffect(() => {
    onRegisterHandler((data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (data.type === 'stroke') {
        drawSegment(ctx, data);
      } else if (data.type === 'clear') {
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    });

    return () => onRegisterHandler(null);
  }, [onRegisterHandler]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    lastPos.current = getPos(e, canvasRef.current);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDrawing || !lastPos.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pos = getPos(e, canvas);

      const strokeData = {
        type: 'stroke',
        from: lastPos.current,
        to: pos,
        color,
        size: brushSize,
        tool,
      };

      // 로컬에 즉시 그리기
      drawSegment(ctx, strokeData);

      // 다른 참여자에게 전송
      onSendStroke(strokeData);

      lastPos.current = pos;
    },
    [isDrawing, color, brushSize, tool, onSendStroke]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSendStroke({ type: 'clear' });
  }, [onSendStroke]);

  return (
    <div className="drawing-panel">
      <div className="shared-canvas-header">
        <span className="shared-canvas-title">🎨 공유 캔버스</span>
        <span className="shared-canvas-hint">참여자 전원과 실시간 공유</span>
      </div>

      <div className="drawing-toolbar">
        <div className="color-palette">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`color-btn${color === c && tool === 'pen' ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => { setColor(c); setTool('pen'); }}
            />
          ))}
        </div>
        <button
          className={`tool-btn${tool === 'eraser' ? ' active' : ''}`}
          onClick={() => setTool('eraser')}
        >
          지우개
        </button>
        <div className="brush-control">
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="brush-size"
          />
          <span
            className="brush-preview"
            style={{
              width: brushSize,
              height: brushSize,
              background: tool === 'eraser' ? '#555' : color,
            }}
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="drawing-actions">
        <button onClick={handleClear} className="draw-btn draw-clear-btn">
          전체 지우기
        </button>
        <button onClick={onClose} className="draw-btn draw-close-btn">
          닫기
        </button>
      </div>
    </div>
  );
}

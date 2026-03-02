import { useRef, useState, useEffect, useCallback } from 'react';

const COLORS = [
  '#ffffff', '#ff4444', '#ff9944', '#ffff44',
  '#44dd44', '#44aaff', '#aa44ff', '#ff44aa', '#000000',
];

export default function DrawingCanvas({ onSend, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

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
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDrawing || !lastPos.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const pos = getPos(e, canvas);

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#2a2a2a' : color;
      ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPos.current = pos;
    },
    [isDrawing, color, brushSize, tool]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSend(dataUrl);
    onClose();
  };

  return (
    <div className="drawing-overlay">
      <div className="drawing-panel">
        <div className="drawing-toolbar">
          <div className="color-palette">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-btn${color === c && tool === 'pen' ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => {
                  setColor(c);
                  setTool('pen');
                }}
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
          <button onClick={handleSend} className="draw-btn draw-send-btn">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

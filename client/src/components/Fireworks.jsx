import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

// 파티클 클래스
class Particle {
  constructor(x, y, vx, vy, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.gravity = 0.1;
    this.size = Math.random() * 3 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life--;
    this.vx *= 0.98;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// 폭죽 클래스
class FireworkEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
      '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe',
      '#fd79a8', '#fdcb6e', '#e84393', '#00b894',
    ];
    this.explode();
  }

  explode() {
    const particleCount = 50 + Math.random() * 50;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 5 + 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = 60 + Math.random() * 40;
      this.particles.push(new Particle(this.x, this.y, vx, vy, color, life));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
  }

  isDead() {
    return this.particles.length === 0;
  }
}

const Fireworks = forwardRef(function Fireworks(_, ref) {
  const canvasRef = useRef(null);
  const fireworksRef = useRef([]);
  const isAnimatingRef = useRef(false);

  // 캔버스 리사이즈
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fws = fireworksRef.current;
    for (let i = fws.length - 1; i >= 0; i--) {
      fws[i].update();
      fws[i].draw(ctx);
      if (fws[i].isDead()) {
        fws.splice(i, 1);
      }
    }

    if (fws.length > 0) {
      requestAnimationFrame(animate);
    } else {
      isAnimatingRef.current = false;
    }
  }, []);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    const count = 5 + Math.random() * 5;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6) + canvas.height * 0.1;
        fireworksRef.current.push(new FireworkEffect(x, y));
        if (!isAnimatingRef.current) {
          isAnimatingRef.current = true;
          animate();
        }
      }, i * 200);
    }
  }, [animate]);

  // 부모 컴포넌트에서 launch() 호출 가능하도록 ref 노출
  useImperativeHandle(ref, () => ({ launch }), [launch]);

  return (
    <canvas
      ref={canvasRef}
      id="fireworksCanvas"
    />
  );
});

export default Fireworks;

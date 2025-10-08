import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'star' | 'heart' | 'sparkle';
}

interface MousePosition {
  x: number;
  y: number;
}

const PARTICLE_COLORS = [
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
  '#84cc16', // lime
];

const createParticle = (x: number, y: number, id: number): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 2 + 0.5;
  const life = Math.random() * 120 + 60;
  
  return {
    id,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: Math.random() * 4 + 2,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    opacity: 1,
    life,
    maxLife: life,
    type: ['circle', 'star', 'heart', 'sparkle'][Math.floor(Math.random() * 4)] as Particle['type']
  };
};

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  const { x, y, size, color, opacity, type } = particle;
  
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  switch (type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'star':
      drawStar(ctx, x, y, size);
      break;
      
    case 'heart':
      drawHeart(ctx, x, y, size);
      break;
      
    case 'sparkle':
      drawSparkle(ctx, x, y, size);
      break;
  }
  
  ctx.restore();
};

const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const dx = x + Math.cos(angle) * radius;
    const dy = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(dx, dy);
    } else {
      ctx.lineTo(dx, dy);
    }
  }
  ctx.closePath();
  ctx.fill();
};

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const scale = size / 10;
  ctx.beginPath();
  ctx.moveTo(x, y + scale * 5);
  ctx.bezierCurveTo(x, y + scale * 2, x - scale * 4.5, y - scale * 2, x - scale * 4.5, y + scale * 1);
  ctx.bezierCurveTo(x - scale * 4.5, y - scale * 1, x - scale * 2.5, y - scale * 1, x, y + scale * 2.5);
  ctx.bezierCurveTo(x + scale * 2.5, y - scale * 1, x + scale * 4.5, y - scale * 1, x + scale * 4.5, y + scale * 1);
  ctx.bezierCurveTo(x + scale * 4.5, y - scale * 2, x, y + scale * 2, x, y + scale * 5);
  ctx.fill();
};

const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const lines = 4;
  for (let i = 0; i < lines; i++) {
    const angle = (i * Math.PI) / (lines / 2);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(x + cos * size, y + sin * size);
    ctx.lineTo(x - cos * size, y - sin * size);
    ctx.stroke();
  }
};

export function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const lastMouseMoveRef = useRef<number>(0);
  const nextParticleIdRef = useRef(0);
  
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      lastMouseMoveRef.current = Date.now();
      setIsActive(true);
      
      // Create particles on mouse movement
      if (Math.random() < 0.3) {
        const newParticle = createParticle(
          mouseRef.current.x,
          mouseRef.current.y,
          nextParticleIdRef.current++
        );
        particlesRef.current.push(newParticle);
      }
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if mouse is still active
      if (Date.now() - lastMouseMoveRef.current > 2000) {
        setIsActive(false);
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Apply gravity and friction
        particle.vy += 0.02;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Update life
        particle.life--;
        particle.opacity = particle.life / particle.maxLife;
        
        // Mouse attraction/repulsion
        if (isActive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            const angle = Math.atan2(dy, dx);
            
            // Repel particles from mouse
            particle.vx -= Math.cos(angle) * force * 0.5;
            particle.vy -= Math.sin(angle) * force * 0.5;
          }
        }
        
        // Draw particle
        drawParticle(ctx, particle);
        
        // Remove dead particles or those off-screen
        return particle.life > 0 && 
               particle.x > -50 && particle.x < canvas.width + 50 &&
               particle.y > -50 && particle.y < canvas.height + 50;
      });

      // Limit particle count
      if (particlesRef.current.length > 100) {
        particlesRef.current = particlesRef.current.slice(-100);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  // Add random ambient particles
  useEffect(() => {
    const addAmbientParticle = () => {
      if (particlesRef.current.length < 20) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const newParticle = createParticle(
            Math.random() * rect.width,
            Math.random() * rect.height,
            nextParticleIdRef.current++
          );
          newParticle.vx *= 0.3;
          newParticle.vy *= 0.3;
          newParticle.maxLife *= 2;
          newParticle.life = newParticle.maxLife;
          particlesRef.current.push(newParticle);
        }
      }
    };

    const interval = setInterval(addAmbientParticle, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{
        background: 'transparent',
        mixBlendMode: 'screen'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
}

// Enhanced Background Component with Interactive Elements
export function EnhancedInteractiveBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900" />
      
      {/* Interactive gradient that follows mouse */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(147, 51, 234, 0.3), 
            rgba(59, 130, 246, 0.2), 
            transparent 60%)`
        }}
        animate={{
          opacity: isHovering ? 0.5 : 0.3
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Floating orbs that react to mouse */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full filter blur-3xl"
          style={{
            width: `${200 + i * 50}px`,
            height: `${200 + i * 50}px`,
            background: `linear-gradient(135deg, 
              hsl(${240 + i * 30}, 70%, 60%), 
              hsl(${300 + i * 20}, 80%, 70%))`,
            left: `${10 + i * 15}%`,
            top: `${5 + i * 12}%`,
          }}
          animate={{
            x: mousePosition.x * (20 + i * 10),
            y: mousePosition.y * (15 + i * 8),
            scale: [1, 1.1 + i * 0.1, 1],
            opacity: [0.2 + i * 0.05, 0.4 + i * 0.05, 0.2 + i * 0.05],
          }}
          transition={{
            x: { duration: 0.8, ease: "easeOut" },
            y: { duration: 0.8, ease: "easeOut" },
            scale: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      ))}
      
      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(119, 255, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, rgba(198, 255, 119, 0.3) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Interactive particles */}
      <InteractiveParticles />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
}
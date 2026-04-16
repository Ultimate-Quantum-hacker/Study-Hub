'use client';
import { useEffect, useState, useRef } from 'react';

export default function BackgroundShards() {
  const [elements, setElements] = useState({ particles: [], lines: [], glows: [] });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate high-contrast elements
    const generateParticles = (count) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: `p-${i}`,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.6 + 0.2, // Much higher opacity
        duration: Math.random() * 4 + 2,
        delay: Math.random() * -5,
        color: i % 2 === 0 ? 'var(--accent)' : '#a855f7'
      }));
    };

    const generateLines = (count) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: `l-${i}`,
        width: Math.random() * 600 + 400,
        height: 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        rotate: Math.random() * 45 - 22,
        opacity: Math.random() * 0.15 + 0.05,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * -20
      }));
    };

    const generateGlows = (count) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: `g-${i}`,
        size: Math.random() * 800 + 400,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.2 + 0.1,
        color: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? '#a855f7' : '#3b82f6'
      }));
    };

    setElements({
      particles: generateParticles(30),
      lines: generateLines(12),
      glows: generateGlows(5)
    });

    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 50%, #0a0a1f 0%, #02020a 100%)'
    }}>
      {/* 1. Large Ambient Glows */}
      {elements.glows.map((glow) => (
        <div key={glow.id} style={{
          position: 'absolute',
          width: glow.size,
          height: glow.size,
          left: `${glow.left}%`,
          top: `${glow.top}%`,
          background: `radial-gradient(circle, ${glow.color}, transparent 70%)`,
          opacity: glow.opacity,
          filter: 'blur(80px)',
          transform: `translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`
        }} />
      ))}

      {/* 2. Abstract Geometric Lines (Moving slowly) */}
      {elements.lines.map((line) => (
        <div key={line.id} style={{
          position: 'absolute',
          width: line.width,
          height: line.height,
          left: `${line.left}%`,
          top: `${line.top}%`,
          background: `linear-gradient(90deg, transparent, rgba(124, 106, 255, ${line.opacity}), transparent)`,
          transform: `rotate(${line.rotate}deg) translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
          animation: 'float-shard infinite ease-in-out',
          animationDuration: `${line.duration}s`,
          animationDelay: `${line.delay}s`
        }} />
      ))}

      {/* 3. High-Contrast Sparkle Particles */}
      {elements.particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          width: p.size,
          height: p.size,
          left: `${p.left}%`,
          top: `${p.top}%`,
          backgroundColor: p.color,
          borderRadius: '50%',
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          animation: 'sparkle infinite alternate ease-in-out',
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px)`
        }} />
      ))}

      <style jsx global>{`
        @keyframes sparkle {
          0% { transform: scale(1) translateY(0); opacity: 0.3; }
          100% { transform: scale(1.5) translateY(-20px); opacity: 0.8; }
        }
        
        /* Force extreme visibility in light mode */
        [data-theme="light"] .tech-overlay { opacity: 0.05; }
        [data-theme="light"] body { background: #f8fafc; }
        [data-theme="light"] .chat-container { background: rgba(255, 255, 255, 0.7) !important; backdrop-filter: blur(10px); }
      `}</style>
    </div>
  );
}

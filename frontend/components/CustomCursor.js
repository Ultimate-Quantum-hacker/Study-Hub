'use client';
import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const dotScaleRef = useRef(1);
  const outlineScaleRef = useRef(1);

  useEffect(() => {
    const moveCursor = (e) => {
      const { clientX: x, clientY: y } = e;

      // Update dot position immediately (include current scale)
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${dotScaleRef.current})`;
      }

      // Update outline position immediately (include current scale)
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${outlineScaleRef.current})`;
      }

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => {
      dotScaleRef.current = 1.5;
      outlineScaleRef.current = 0.8;
      if (cursorDotRef.current && cursorOutlineRef.current) {
        // apply immediately so there's no lag
        const rect = cursorDotRef.current.getBoundingClientRect();
        cursorDotRef.current.style.transform = cursorDotRef.current.style.transform.replace(/scale\([^)]*\)/, '') + ` scale(${dotScaleRef.current})`;
        cursorOutlineRef.current.style.transform = cursorOutlineRef.current.style.transform.replace(/scale\([^)]*\)/, '') + ` scale(${outlineScaleRef.current})`;
      }
    };

    const handleMouseUp = () => {
      dotScaleRef.current = 1;
      outlineScaleRef.current = 1;
      if (cursorDotRef.current && cursorOutlineRef.current) {
        cursorDotRef.current.style.transform = cursorDotRef.current.style.transform.replace(/scale\([^)]*\)/, '') + ` scale(${dotScaleRef.current})`;
        cursorOutlineRef.current.style.transform = cursorOutlineRef.current.style.transform.replace(/scale\([^)]*\)/, '') + ` scale(${outlineScaleRef.current})`;
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.body.classList.add('has-custom-cursor');

    const handleMouseEnterInteractive = () => {
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.width = '60px';
        cursorOutlineRef.current.style.height = '60px';
        cursorOutlineRef.current.style.top = '-27px';
        cursorOutlineRef.current.style.left = '-27px';
        cursorOutlineRef.current.style.borderColor = 'rgba(168, 85, 247, 0.4)';
      }
    };

    const handleMouseLeaveInteractive = () => {
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.width = '34px';
        cursorOutlineRef.current.style.height = '34px';
        cursorOutlineRef.current.style.top = '-14px';
        cursorOutlineRef.current.style.left = '-14px';
        cursorOutlineRef.current.style.borderColor = 'var(--accent)';
      }
    };

    const interactives = document.querySelectorAll('a, button, input, textarea, [role="button"], .sidebar-item');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnterInteractive);
      el.addEventListener('mouseleave', handleMouseLeaveInteractive);
    });

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnterInteractive);
        el.removeEventListener('mouseleave', handleMouseLeaveInteractive);
      });
    };
  }, [isVisible]);

  return (
    <>
      <div 
        ref={cursorDotRef} 
        className={`cursor-dot ${isVisible ? 'visible' : ''}`}
      />
      <div 
        ref={cursorOutlineRef} 
        className={`cursor-outline ${isVisible ? 'visible' : ''}`}
      />
    </>
  );
}

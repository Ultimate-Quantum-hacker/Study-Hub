'use client';
import { useEffect, useState } from 'react';

export default function BackgroundShards() {
  const [shards, setShards] = useState([]);

  useEffect(() => {
    const newShards = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 300 + 100,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.05 + 0.02,
      rotate: Math.random() * 360,
    }));
    setShards(newShards);
  }, []);

  return (
    <div className="background-shards-container">
      {shards.map((shard) => (
        <div
          key={shard.id}
          className="background-shard"
          style={{
            width: shard.size,
            height: shard.size,
            left: `${shard.left}%`,
            top: `${shard.top}%`,
            opacity: shard.opacity,
            animationDuration: `${shard.duration}s`,
            animationDelay: `${shard.delay}s`,
            transform: `rotate(${shard.rotate}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        .background-shards-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
          background: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);
        }
        .background-shard {
          position: absolute;
          background: linear-gradient(135deg, var(--accent), transparent);
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
          animation: float-shard infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

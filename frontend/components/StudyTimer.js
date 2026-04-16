import React, { useEffect, useRef } from 'react';
import { useStudyTimerStore } from '../store';

export default function StudyTimer({ focusLength = 25 * 60, breakLength = 5 * 60 }) {
  const { running, seconds, sessionType, start, stop, reset, tick, nextSession, setSeconds } =
    useStudyTimerStore();

  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && !intervalRef.current) {
      intervalRef.current = setInterval(() => tick(), 1000);
    }
    if (!running && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    const limit = sessionType === 'focus' ? focusLength : breakLength;
    if (seconds >= limit) {
      stop();
      nextSession();
    }
  }, [seconds, sessionType, focusLength, breakLength]);

  const remaining = () => {
    const limit = sessionType === 'focus' ? focusLength : breakLength;
    const rem = Math.max(0, limit - seconds);
    const m = Math.floor(rem / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(rem % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="study-timer">
      <h3>{sessionType === 'focus' ? 'Focus' : 'Break'}</h3>
      <div className="time">{remaining()}</div>
      <div className="controls">
        {!running ? (
          <button onClick={() => start()}>Start</button>
        ) : (
          <button onClick={() => stop()}>Pause</button>
        )}
        <button onClick={() => reset()}>Reset</button>
      </div>
      <style jsx>{`
        .study-timer { padding: 16px; border: 1px solid rgba(255,255,255,0.06); border-radius:8px; width:220px; }
        .time { font-size: 2rem; margin: 8px 0; }
        .controls button { margin-right: 8px; }
      `}</style>
    </div>
  );
}

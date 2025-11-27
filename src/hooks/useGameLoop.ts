import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useGameStore } from '@/store/gameStore';

export function useGameLoop() {
  const processTime = useGameStore((s) => s.processTime);
  const touch = useGameStore((s) => s.touch);
  const lastActiveAt = useGameStore((s) => s.lastActiveAt);

  useEffect(() => {
    touch();
  }, [touch]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastActiveAt == null) {
        touch();
        return;
      }
      const now = Date.now();
      const elapsed = now - lastActiveAt;
      if (elapsed > 0) {
        processTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [processTime, touch, lastActiveAt]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        touch();
      }
    });

    return () => {
      sub.remove();
    };
  }, [touch]);
}

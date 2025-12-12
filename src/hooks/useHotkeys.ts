
import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: (e: KeyboardEvent) => void;
};

export const useHotkeys = (shortcuts: KeyCombo[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, alt, shift, action }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          !!event.ctrlKey === !!ctrl &&
          !!event.altKey === !!alt &&
          !!event.shiftKey === !!shift
        ) {
          event.preventDefault();
          action(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

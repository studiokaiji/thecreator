import { useCallback, useEffect } from 'react';

export const useBeforeUnload = (enable = true) => {
  const handler = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  }, []);

  useEffect(() => {
    if (!window) return;
    window.addEventListener('beforeunload', handler);
    if (!enable) {
      window.removeEventListener('beforeunload', handler);
    }
  }, [window, enable]);
};

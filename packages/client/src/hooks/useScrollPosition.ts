import { useEffect, useRef } from 'react';

export const useScrollPosition = (
  handler: (prevScrollTop: number, currentScrollTop: number) => void
) => {
  const tickingRef = useRef(false);
  const scrollTopRef = useRef(0);

  useEffect(() => {
    const listener = () => {
      if (tickingRef.current) {
        return;
      }

      requestAnimationFrame(() => {
        tickingRef.current = false;
        handler(scrollTopRef.current, document.documentElement.scrollTop);
        scrollTopRef.current = document.documentElement.scrollTop;
      });

      tickingRef.current = true;
    };

    window.addEventListener('scroll', listener, { passive: true });

    return () => {
      window.removeEventListener('scroll', listener);
    };
  }, [handler]);
};

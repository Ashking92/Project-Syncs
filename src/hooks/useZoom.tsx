
import { useState, useEffect, useCallback } from 'react';

export const useZoom = () => {
  const [scale, setScale] = useState(1);

  // Disable all zoom functionality
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Prevent zoom via mouse wheel
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    // Add event listeners to prevent zoom
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Prevent pinch zoom with CSS
    document.body.style.touchAction = 'pan-x pan-y';
    document.documentElement.style.touchAction = 'pan-x pan-y';

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('wheel', handleWheel);
      
      // Reset touch action
      document.body.style.touchAction = '';
      document.documentElement.style.touchAction = '';
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  const resetZoom = () => setScale(1);

  return { scale: 1, resetZoom }; // Always return scale as 1
};


import { useState, useEffect, useCallback } from 'react';

export const useZoom = () => {
  const [scale, setScale] = useState(1);

  // Enhanced zoom prevention for mobile devices
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Prevent zoom via mouse wheel with Ctrl key
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent keyboard zoom shortcuts
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleGestureStart = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGestureChange = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGestureEnd = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    // Add comprehensive event listeners to prevent all zoom functionality
    const options = { passive: false, capture: true };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    document.addEventListener('wheel', handleWheel, options);
    document.addEventListener('keydown', handleKeyDown, options);
    
    // Safari-specific gesture events
    document.addEventListener('gesturestart', handleGestureStart, options);
    document.addEventListener('gesturechange', handleGestureChange, options);
    document.addEventListener('gestureend', handleGestureEnd, options);

    // Prevent zoom with CSS and meta viewport settings
    document.body.style.touchAction = 'pan-x pan-y';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';
    document.documentElement.style.touchAction = 'pan-x pan-y';
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', preventDoubleTapZoom, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('gesturestart', handleGestureStart);
      document.removeEventListener('gesturechange', handleGestureChange);
      document.removeEventListener('gestureend', handleGestureEnd);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      
      // Reset styles
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.webkitTouchCallout = '';
      document.documentElement.style.touchAction = '';
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, handleKeyDown, handleGestureStart, handleGestureChange, handleGestureEnd]);

  const resetZoom = () => setScale(1);

  return { scale: 1, resetZoom }; // Always return scale as 1 to prevent zoom
};

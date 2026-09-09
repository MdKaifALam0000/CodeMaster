import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * SmoothScrollProvider - Global silky smooth momentum scrolling
 * Provides consistent, high-performance scroll physics across landing, dashboard, and public pages.
 * Automatically deactivates on IDE/code editor pages to allow native panel scrolling.
 */
export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Problem and Team Coding IDE pages have full-height split layouts with inner scroll containers.
    // Lenis should not run on these pages to prevent wheel event hijacking.
    const isIdeRoute = location.pathname.startsWith('/problem') || location.pathname.startsWith('/team-coding/room');

    if (isIdeRoute) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        window.lenis = null;
      }
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return;
    }

    // Initialize Lenis for standard scrollable pages
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.lenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [location.pathname]);

  // When switching routes, immediately reset scroll position to top
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return children;
}


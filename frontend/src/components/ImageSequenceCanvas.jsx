import React, { useRef, useEffect, useState, useCallback } from 'react';

// Total frames in /public/landingpage/ (ezgif-frame-001.jpg to ezgif-frame-240.jpg)
const TOTAL_FRAMES = 240;

const frameUrls = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return `/landingpage/ezgif-frame-${num}.jpg`;
});

export default function ImageSequenceCanvas() {
  const canvasRef = useRef(null);
  const imagesRef = useRef(new Array(TOTAL_FRAMES).fill(null));
  const loadedCountRef = useRef(0);
  
  // Smooth LERP frame tracking
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);

  // Cached canvas rendering dimensions (avoids resizing on every frame)
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });

  const [loadedPercent, setLoadedPercent] = useState(0);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  // Find the closest loaded image if the requested frame isn't cached yet
  const getClosestLoadedImage = useCallback((targetIndex) => {
    const images = imagesRef.current;
    if (images[targetIndex]?.complete && images[targetIndex]?.naturalWidth > 0) {
      return images[targetIndex];
    }
    // Search outward symmetrically
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const forward = targetIndex + offset;
      if (forward < TOTAL_FRAMES && images[forward]?.complete && images[forward]?.naturalWidth > 0) {
        return images[forward];
      }
      const backward = targetIndex - offset;
      if (backward >= 0 && images[backward]?.complete && images[backward]?.naturalWidth > 0) {
        return images[backward];
      }
    }
    return null;
  }, []);

  // Fast draw without touching canvas.width / canvas.height
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = getClosestLoadedImage(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: cWidth, height: cHeight } = dimensionsRef.current;
    if (cWidth === 0 || cHeight === 0) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const hRatio = cWidth / img.width;
    const vRatio = cHeight / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const renderWidth = img.width * ratio;
    const renderHeight = img.height * ratio;
    const cx = (cWidth - renderWidth) / 2;
    const cy = (cHeight - renderHeight) / 2;

    ctx.clearRect(0, 0, cWidth, cHeight);
    ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, renderWidth, renderHeight);

    lastDrawnFrameRef.current = frameIndex;
  }, [getClosestLoadedImage]);

  // Update canvas resolution ONLY on resize or mount
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    const pixelWidth = Math.round(displayWidth * dpr);
    const pixelHeight = Math.round(displayHeight * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    dimensionsRef.current = {
      width: pixelWidth,
      height: pixelHeight,
      dpr,
    };

    // Re-render current frame immediately with new dimensions
    renderFrame(Math.round(currentFrameRef.current));
  }, [renderFrame]);

  // Progressive image preloading: keyframes first, then full pass
  useEffect(() => {
    imagesRef.current = new Array(TOTAL_FRAMES).fill(null);
    let isCancelled = false;

    const onImageLoaded = (index) => {
      if (isCancelled) return;
      loadedCountRef.current += 1;
      const pct = Math.round((loadedCountRef.current / TOTAL_FRAMES) * 100);
      setLoadedPercent(pct);

      if (index === 0) {
        setFirstFrameReady(true);
      }
    };

    const loadImage = (index) => {
      if (imagesRef.current[index]) return;
      const img = new Image();
      img.src = frameUrls[index];
      img.onload = () => onImageLoaded(index);
      img.onerror = () => {
        if (!isCancelled) {
          loadedCountRef.current += 1;
        }
      };
      imagesRef.current[index] = img;
    };

    // 1. Load initial frame immediately
    loadImage(0);

    // 2. Load keyframes across the whole timeline (every 6th frame) for instant scrubbing coverage
    const KEYFRAME_STEP = 6;
    for (let i = 0; i < TOTAL_FRAMES; i += KEYFRAME_STEP) {
      loadImage(i);
    }

    // 3. Load all intermediate frames in batches
    let currentBatchIndex = 1;
    const BATCH_SIZE = 16;

    const loadNextBatch = () => {
      if (isCancelled) return;
      let loadedInThisBatch = 0;

      while (currentBatchIndex < TOTAL_FRAMES && loadedInThisBatch < BATCH_SIZE) {
        if (currentBatchIndex % KEYFRAME_STEP !== 0) {
          loadImage(currentBatchIndex);
          loadedInThisBatch++;
        }
        currentBatchIndex++;
      }

      if (currentBatchIndex < TOTAL_FRAMES) {
        setTimeout(loadNextBatch, 50);
      }
    };

    // Start filling in frames shortly after keyframes are requested
    const timer = setTimeout(loadNextBatch, 80);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Handle window resizing
  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  // Initial draw when frame 0 is ready
  useEffect(() => {
    if (firstFrameReady) {
      renderFrame(0);
    }
  }, [firstFrameReady, renderFrame]);

  // Continuous smooth interpolation (LERP) loop
  useEffect(() => {
    let animId;

    const loop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      // Smooth inertia factor (0.12 gives a responsive, buttery smooth deceleration)
      if (Math.abs(diff) > 0.02) {
        currentFrameRef.current = current + diff * 0.12;
        const rounded = Math.round(currentFrameRef.current);
        if (rounded !== lastDrawnFrameRef.current) {
          renderFrame(rounded);
        }
      } else if (Math.round(target) !== lastDrawnFrameRef.current) {
        currentFrameRef.current = target;
        renderFrame(Math.round(target));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // Scroll listener updates targetFrameRef with high precision
  useEffect(() => {
    const handleScroll = () => {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollRange > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollRange)) : 0;
      targetFrameRef.current = scrollFraction * (TOTAL_FRAMES - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{
          mixBlendMode: 'screen',
          filter: 'contrast(1.2) brightness(1.1) drop-shadow(0 0 20px rgba(255,69,0,0.3))',
          opacity: firstFrameReady ? 0.85 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Loading progress bar */}
      {loadedPercent < 100 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${loadedPercent}%`,
              background: 'linear-gradient(90deg, #ff4500, #ff003c)',
              transition: 'width 0.2s ease',
              boxShadow: '0 0 8px rgba(255,69,0,0.8)',
            }}
          />
        </div>
      )}
    </div>
  );
}

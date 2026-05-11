import React, { useRef, useEffect, useState, useCallback } from 'react';

// Total frames in /public/landingpage/ — adjust if you add/remove frames
const TOTAL_FRAMES = 240;

// Generate URLs pointing to the public folder (NOT bundled by Vite)
// Files are served directly as static assets — no build-time overhead
const frameUrls = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return `/landingpage/ezgif-frame-${num}.jpg`;
});

export default function ImageSequenceCanvas() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]); // store Image objects by index
  const loadedCountRef = useRef(0);
  const currentFrameRef = useRef(0);
  const animationFrameId = useRef(null);

  const [loadedPercent, setLoadedPercent] = useState(0);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  // Draw a specific frame index onto the canvas
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[frameIndex];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const cx = (canvas.width - img.width * ratio) / 2;
    const cy = (canvas.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
  }, []);

  useEffect(() => {
    imagesRef.current = new Array(TOTAL_FRAMES).fill(null);

    const onLoad = (index) => {
      loadedCountRef.current += 1;
      const pct = Math.round((loadedCountRef.current / TOTAL_FRAMES) * 100);
      setLoadedPercent(pct);

      // As soon as frame 0 is loaded, show it immediately — don't wait for all
      if (index === 0) {
        setFirstFrameReady(true);
        renderFrame(0);
      }
    };

    // Load frames in small batches to avoid overwhelming the network
    const BATCH_SIZE = 20;
    let batchStart = 0;

    const loadNextBatch = () => {
      const end = Math.min(batchStart + BATCH_SIZE, TOTAL_FRAMES);
      for (let i = batchStart; i < end; i++) {
        const img = new Image();
        img.src = frameUrls[i];
        img.onload = () => onLoad(i);
        img.onerror = () => { loadedCountRef.current += 1; }; // skip broken frames gracefully
        imagesRef.current[i] = img;
      }
      batchStart = end;
      if (batchStart < TOTAL_FRAMES) {
        // Schedule next batch after a short delay to let the browser breathe
        setTimeout(loadNextBatch, 100);
      }
    };

    loadNextBatch();
  }, [renderFrame]);

  useEffect(() => {
    if (!firstFrameReady) return;

    const handleScroll = () => {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollRange > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollRange)) : 0;

      // Only use frames that have actually been loaded so far
      const availableFrames = Math.min(loadedCountRef.current, TOTAL_FRAMES);
      const targetFrame = Math.min(availableFrames - 1, Math.floor(scrollFraction * TOTAL_FRAMES));

      if (targetFrame === currentFrameRef.current) return;
      currentFrameRef.current = targetFrame;

      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(() => renderFrame(targetFrame));
    };

    const handleResize = () => renderFrame(currentFrameRef.current);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [firstFrameReady, renderFrame]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover opacity-80"
        style={{
          mixBlendMode: 'screen',
          filter: 'contrast(1.2) brightness(1.1) drop-shadow(0 0 20px rgba(255,69,0,0.3))',
          opacity: firstFrameReady ? 0.8 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Loading progress bar — shown until fully loaded */}
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
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(255,69,0,0.8)',
            }}
          />
        </div>
      )}
    </div>
  );
}

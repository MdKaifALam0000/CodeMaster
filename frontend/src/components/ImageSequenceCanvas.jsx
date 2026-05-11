import React, { useRef, useEffect, useState } from 'react';

const frameImages = import.meta.glob('../assets/landingpage/*.jpg', { eager: true, import: 'default' });
const frameUrls = Object.keys(frameImages).sort().map(key => frameImages[key]);

export default function ImageSequenceCanvas() {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = frameUrls.map(url => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameUrls.length) {
          setLoaded(true);
        }
      };
      return img;
    });
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (!loaded || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const render = (frameIndex) => {
        const img = images[frameIndex];
        if(!img) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;  
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0,0, img.width, img.height,
                      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }
    
    // Initial render
    render(0);
    
    let animationFrameId;
    
    const handleScroll = () => {
        // We want the sequence to play over the first 2-3 scroll heights
        const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = Math.max(0, Math.min(1, window.scrollY / scrollRange));
        
        const frameIndex = Math.min(
            images.length - 1,
            Math.floor(scrollFraction * images.length)
        );
        
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => render(frameIndex));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  }, [loaded, images]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-black">
      <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover opacity-80" 
          style={{ 
            mixBlendMode: 'screen',
            filter: 'contrast(1.2) brightness(1.1) drop-shadow(0 0 20px rgba(255,69,0,0.3))'
          }}
      />
      {/* Fallback dark gradient to ensure readability if image fails or is too bright */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
    </div>
  );
}

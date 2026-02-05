import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import GIF from 'gif.js';
import { MemeConfig } from './types';

interface CanvasPreviewProps {
  config: MemeConfig;
}

export interface CanvasPreviewRef {
  exportGif: () => Promise<string>;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export const CanvasPreview = forwardRef<CanvasPreviewRef, CanvasPreviewProps>(({ config }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);

  // Load avatar image when config changes
  useEffect(() => {
    if (config.avatarImage) {
      const img = new Image();
      img.src = config.avatarImage;
      img.onload = () => {
        avatarImageRef.current = img;
      };
    } else {
      avatarImageRef.current = null;
    }
  }, [config.avatarImage]);

  const draw = (ctx: CanvasRenderingContext2D, time: number) => {
    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background (Optional, transparent or white?)
    // Let's make it transparent or light gray for visibility if needed, but requirements say "Meme Tool", usually white or transparent.
    // Let's fill white to ensure GIF looks good everywhere.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Animation Calculations ---
    let scale = 1;
    let offsetY = 0;
    let rotation = 0; // Radians
    let slideX = 0;

    const t = time / 1000; // seconds

    switch (config.animationType) {
      case 'breathe':
        // Scale between 0.95 and 1.05
        scale = 1 + 0.05 * Math.sin(t * 3);
        break;
      case 'bounce':
        // Jump up and down
        offsetY = -10 * Math.abs(Math.sin(t * 4));
        break;
      case 'wave':
        // Rotate slightly
        rotation = 0.05 * Math.sin(t * 3);
        break;
      case 'slide':
        // Slide in from left (0 to 1)
        // We want a loop? Or just entry?
        // Let's do a loop: slide in, stay, reset.
        // Cycle: 3 seconds. 0-0.5s slide in, 0.5-2.5s stay, 2.5-3s fade/reset?
        // Let's simple slide in based on sine for smooth entry
        // map sin(-PI/2 to PI/2) -> -1 to 1.
        // Let's just use a continuous sine wave for position to keep it simple and "loopable"
        // slideX = -50 + 50 * sin(t)
        slideX = 20 * Math.sin(t * 2); 
        break;
    }

    // --- Draw Content ---
    
    // Save context for global transformations (if any)
    ctx.save();
    
    // We can animate the WHOLE thing or just the bubble? 
    // Usually "Meme" animations animate the character or the text.
    // The prompt says "Animation effects...".
    // Let's apply animation to the AVATAR and BUBBLE group? Or just separate?
    // Let's apply to the AVATAR (it's the character).
    // But "Wave, Breathe..." might apply to the emotion.
    // Let's apply to the AVATAR.
    
    // Avatar Position (Bottom Left)
    const avatarSize = 120;
    const avatarX = 50 + slideX;
    const avatarY = CANVAS_HEIGHT - 50 - avatarSize + offsetY;

    ctx.translate(avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.translate(-(avatarX + avatarSize / 2), -(avatarY + avatarSize / 2));

    if (avatarImageRef.current) {
      ctx.save();
      // Shape
      if (config.avatarShape === 'circle') {
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else {
         // Rounded rect for square? Or just sharp?
         // Tailwind "rounded-3xl" implies soft UI, let's give the square some radius.
         const r = 20;
         ctx.beginPath();
         ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, r);
         ctx.clip();
      }

      // Draw Image
      // Cover fit
      const img = avatarImageRef.current;
      const aspect = img.width / img.height;
      let drawW = avatarSize;
      let drawH = avatarSize;
      let dx = 0;
      let dy = 0;
      
      if (aspect > 1) {
          drawH = avatarSize / aspect;
          dy = (avatarSize - drawH) / 2;
      } else {
          drawW = avatarSize * aspect;
          dx = (avatarSize - drawW) / 2;
      }
      
      // Actually we want "cover", so we scale UP
       if (aspect > 1) {
          drawH = avatarSize;
          drawW = avatarSize * aspect;
          dx = (avatarSize - drawW) / 2;
      } else {
          drawW = avatarSize;
          drawH = avatarSize / aspect;
          dy = (avatarSize - drawH) / 2;
      }

      ctx.drawImage(img, avatarX + dx, avatarY + dy, drawW, drawH);
      ctx.restore();

      // Border
      if (config.showAvatarBorder) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#333';
        if (config.avatarShape === 'circle') {
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
             const r = 20;
             ctx.beginPath();
             ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, r);
             ctx.stroke();
        }
      }

    } else {
        // Placeholder
        ctx.fillStyle = '#eee';
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ccc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '14px sans-serif';
        ctx.fillText('No Image', avatarX + avatarSize / 2, avatarY + avatarSize / 2);
    }

    ctx.restore(); // End Avatar transform

    // --- Bubble ---
    // Bubble Position (Top Right-ish)
    // It should point to the avatar.
    const bubbleX = 180;
    const bubbleY = 40;
    const bubbleW = 380;
    const bubbleH = 220;

    // Draw Bubble Tail
    ctx.fillStyle = config.bubbleBgColor;
    ctx.strokeStyle = '#e5e7eb'; // Gray-200
    // Actually typically memes have simple borders or shadows.
    // Let's use shadow for "Apple style" depth.
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 30);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Reset shadow for text
    ctx.restore();

    // Little triangle pointing to avatar
    // Only if we want a speech bubble style.
    // Let's add a small one.
    ctx.beginPath();
    ctx.moveTo(bubbleX + 20, bubbleY + bubbleH);
    ctx.lineTo(bubbleX + 40, bubbleY + bubbleH + 20);
    ctx.lineTo(bubbleX + 60, bubbleY + bubbleH);
    ctx.fillStyle = config.bubbleBgColor;
    ctx.fill();

    // --- Text ---
    // Widget Text (Top Right)
    if (config.showWidget) {
        ctx.font = 'bold 16px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.textAlign = 'right';
        ctx.fillText(config.widgetText, bubbleX + bubbleW - 20, bubbleY + 30);
    }

    // Main Text (Center)
    ctx.fillStyle = config.textColor || '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif';
    
    // Simple text wrapping
    wrapText(ctx, config.bubbleText, bubbleX + bubbleW / 2, bubbleY + bubbleH / 2, bubbleW - 40, 40);

  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(''); // Char by char for CJK
      let line = '';
      const lines = [];

      // Naive CJK wrapping
      // Better: split by natural words for English, chars for CJK. 
      // For simplicity in this demo, we assume mixed but treating chars works okay for short meme text.
      // But let's try to be slightly smarter: split by space first?
      // User input might be "Hello World" or "你好世界".
      // Let's split by chars to be safe for mixed content wrapping without complex logic.
      
      for(let n = 0; n < text.length; n++) {
        const testLine = line + text[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = text[n];
        } else {
            line = testLine;
        }
      }
      lines.push(line);

      // Center vertically
      const totalHeight = lines.length * lineHeight;
      let startY = y - totalHeight / 2 + lineHeight / 2;

      for(let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], x, startY + (i * lineHeight));
      }
  };

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      draw(ctx, time);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [config]);


  // Export Logic
  useImperativeHandle(ref, () => ({
    exportGif: () => {
      return new Promise((resolve, reject) => {
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          workerScript: '/gif.worker.js', // Important: Path to worker
        });

        // Create an offscreen canvas for rendering frames
        const offCanvas = document.createElement('canvas');
        offCanvas.width = CANVAS_WIDTH;
        offCanvas.height = CANVAS_HEIGHT;
        const ctx = offCanvas.getContext('2d');

        if (!ctx) {
            reject('No context');
            return;
        }

        // Capture 2 seconds (approx loop time for our animations)
        // 20 fps = 40 frames
        const duration = 2000; // ms
        const fps = 20;
        const frames = duration / 1000 * fps;
        const step = 1000 / fps; // ms per frame

        for (let i = 0; i < frames; i++) {
            const time = i * step;
            draw(ctx, time);
            gif.addFrame(ctx, { copy: true, delay: step });
        }

        gif.on('finished', (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            resolve(url);
        });

        gif.render();
      });
    }
  }));

  return (
    <div className="w-full flex justify-center items-center p-4 bg-gray-100/50 rounded-3xl backdrop-blur-sm border border-white/50 shadow-inner">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full h-auto rounded-xl shadow-lg bg-white"
        style={{ maxHeight: '400px' }} // Constraint height for desktop
      />
    </div>
  );
});

CanvasPreview.displayName = 'CanvasPreview';

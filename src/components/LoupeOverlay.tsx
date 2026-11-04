import React, { useEffect, useRef } from 'react';

interface LoupeOverlayProps {
  sourceCanvas: HTMLCanvasElement | null;
  cursorX: number; // canvas-relative pixel x
  cursorY: number; // canvas-relative pixel y
  canvasRect: DOMRect | null;
  visible: boolean;
  onClose: () => void;
}

export const LoupeOverlay: React.FC<LoupeOverlayProps> = ({
  sourceCanvas,
  cursorX,
  cursorY,
  canvasRect,
  visible,
  onClose,
}) => {
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180; // Diameter of the magnifying lens in px
  const zoom = 4.0; // 4x magnification

  useEffect(() => {
    if (!visible || !sourceCanvas || !loupeCanvasRef.current) return;
    const lCanvas = loupeCanvasRef.current;
    const lCtx = lCanvas.getContext('2d');
    if (!lCtx) return;

    lCanvas.width = size;
    lCanvas.height = size;

    // Clear
    lCtx.clearRect(0, 0, size, size);

    // Save state for circular clipping
    lCtx.save();
    lCtx.beginPath();
    lCtx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    lCtx.clip();

    // Source coordinates to sample from
    const sampleW = size / zoom;
    const sampleH = size / zoom;
    const sx = Math.max(0, Math.min(sourceCanvas.width - sampleW, cursorX - sampleW / 2));
    const sy = Math.max(0, Math.min(sourceCanvas.height - sampleH, cursorY - sampleH / 2));

    // Disable image smoothing for crisp physical halftone dots
    lCtx.imageSmoothingEnabled = false;

    // Draw magnified slice of the print canvas
    lCtx.drawImage(
      sourceCanvas,
      sx,
      sy,
      sampleW,
      sampleH,
      0,
      0,
      size,
      size
    );

    // Subtle optical glass lens reflection / gradient
    const glassGrad = lCtx.createRadialGradient(
      size * 0.35,
      size * 0.35,
      10,
      size / 2,
      size / 2,
      size / 2
    );
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    glassGrad.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
    lCtx.fillStyle = glassGrad;
    lCtx.fillRect(0, 0, size, size);

    // Precision reticle / crosshairs
    lCtx.strokeStyle = 'rgba(200, 30, 80, 0.4)';
    lCtx.lineWidth = 1;
    lCtx.beginPath();
    // Center ring
    lCtx.arc(size / 2, size / 2, 12, 0, Math.PI * 2);
    // Crosshairs with gap
    lCtx.moveTo(size / 2 - 28, size / 2);
    lCtx.lineTo(size / 2 - 12, size / 2);
    lCtx.moveTo(size / 2 + 12, size / 2);
    lCtx.lineTo(size / 2 + 28, size / 2);
    lCtx.moveTo(size / 2, size / 2 - 28);
    lCtx.lineTo(size / 2, size / 2 - 12);
    lCtx.moveTo(size / 2, size / 2 + 12);
    lCtx.lineTo(size / 2, size / 2 + 28);
    lCtx.stroke();

    lCtx.restore();

    // Brass/Gunmetal Loupe Rim
    lCtx.save();
    lCtx.strokeStyle = '#D4AF37';
    lCtx.lineWidth = 4;
    lCtx.beginPath();
    lCtx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    lCtx.stroke();

    lCtx.strokeStyle = '#1C1917';
    lCtx.lineWidth = 2;
    lCtx.beginPath();
    lCtx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    lCtx.stroke();
    lCtx.restore();
  }, [visible, sourceCanvas, cursorX, cursorY]);

  if (!visible || !canvasRect) return null;

  // Calculate viewport screen position of loupe relative to parent container
  const screenX = cursorX;
  const screenY = cursorY;

  return (
    <div
      className="absolute pointer-events-none z-40 transition-transform duration-75 ease-out select-none"
      style={{
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative drop-shadow-2xl">
        <canvas
          ref={loupeCanvasRef}
          width={size}
          height={size}
          className="rounded-full shadow-2xl"
        />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-stone-900/90 border border-stone-700 text-[10px] font-mono-code text-stone-200 px-2 py-0.5 rounded-full shadow whitespace-nowrap">
          4× Halftone Proof
        </div>
      </div>
    </div>
  );
};

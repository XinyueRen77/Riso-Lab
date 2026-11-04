import { CompositionItem, DotType, DrumConfig, PaperStock, SeparationMethod, StudioState } from '../types/riso';
import { RISO_INKS, PAPER_STOCKS } from '../constants/risoInks';

// Bayer 8x8 dither matrix for gritty zine punk look
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/**
 * Converts hex color string to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Draws procedural paper background with grain, tooth and fiber flecks
 */
export function drawPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stock: PaperStock,
  grainIntensity: number
) {
  // Fill solid paper tone
  ctx.fillStyle = stock.hex;
  ctx.fillRect(0, 0, width, height);

  if (grainIntensity <= 0) return;

  // Generate subtle tactile paper fiber noise
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 180;
  grainCanvas.height = 180;
  const gCtx = grainCanvas.getContext('2d');
  if (!gCtx) return;

  const imgData = gCtx.createImageData(180, 180);
  const data = imgData.data;
  const grainRgb = hexToRgb(stock.grainColor);
  const factor = (grainIntensity / 100) * 0.28;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 50;
    data[i] = Math.min(255, Math.max(0, grainRgb.r + noise));
    data[i + 1] = Math.min(255, Math.max(0, grainRgb.g + noise));
    data[i + 2] = Math.min(255, Math.max(0, grainRgb.b + noise));
    data[i + 3] = Math.floor(Math.random() * 40 * factor * 255);
  }
  gCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalAlpha = Math.min(1, (grainIntensity / 100) * 0.65);
  const pattern = ctx.createPattern(grainCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }

  // Recycled fiber flecks for speckletone / kraft stocks
  if (stock.id === 'speckletone-fleck' || stock.id === 'french-kraft') {
    const fleckCount = Math.floor((width * height) / 14000);
    ctx.fillStyle = stock.grainColor;
    for (let f = 0; f < fleckCount; f++) {
      const fx = Math.random() * width;
      const fy = Math.random() * height;
      const len = 1 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI;
      ctx.globalAlpha = 0.2 + Math.random() * 0.35;
      ctx.beginPath();
      ctx.ellipse(fx, fy, len, 0.8, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Renders vector composition items for a given drum onto a grayscale master canvas.
 * 0 = no ink (white), 255 = 100% ink (black).
 */
export function renderCompositionToStencil(
  items: CompositionItem[],
  drumNumber: 1 | 2 | 3,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Initialize white (no ink)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const drumKey = `drum${drumNumber}` as const;

  // Filter items that target this drum or are marked 'overprint'
  const activeItems = items
    .filter(it => it.drum === drumKey || it.drum === 'overprint')
    .sort((a, b) => a.zIndex - b.zIndex);

  for (const item of activeItems) {
    ctx.save();

    // Map percentage coordinates (0-100) to pixels
    const cx = (item.x / 100) * width;
    const cy = (item.y / 100) * height;
    const itemW = (item.width / 100) * width;
    const itemH = (item.height / 100) * height;

    ctx.translate(cx, cy);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    const tintVal = Math.min(100, Math.max(0, item.tint ?? 100)) / 100;
    // Ink intensity: 100% tint -> black (#000000), 50% tint -> gray (#808080)
    const grayVal = Math.round(255 * (1 - tintVal));
    const inkColor = `rgb(${grayVal}, ${grayVal}, ${grayVal})`;

    ctx.fillStyle = inkColor;
    ctx.strokeStyle = inkColor;

    if (item.type === 'text' && item.text) {
      const fontSizePx = ((item.fontSize || 32) / 1000) * Math.min(width, height) * 2.2;
      const weight = item.fontWeight === '800' ? '800' : item.fontWeight === 'bold' ? 'bold' : 'normal';
      const family = item.fontFamily || 'Bricolage Grotesque';
      ctx.font = `${weight} ${fontSizePx}px "${family}", sans-serif`;
      ctx.textAlign = (item.textAlign || 'center') as CanvasTextAlign;
      ctx.textBaseline = 'middle';

      // Letter spacing support
      if (item.letterSpacing && 'letterSpacing' in ctx) {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = `${item.letterSpacing}px`;
      }

      ctx.fillText(item.text, 0, 0);
    } else if (item.type === 'shape' && item.shapeType) {
      drawShape(ctx, item.shapeType, itemW, itemH, item.filled !== false, item.strokeWidth || 3);
    }

    ctx.restore();
  }

  return canvas;
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shapeType: string,
  w: number,
  h: number,
  filled: boolean,
  strokeW: number
) {
  const hw = w / 2;
  const hh = h / 2;
  ctx.lineWidth = strokeW;

  ctx.beginPath();

  switch (shapeType) {
    case 'circle': {
      ctx.arc(0, 0, Math.min(hw, hh), 0, Math.PI * 2);
      break;
    }
    case 'rectangle': {
      ctx.rect(-hw, -hh, w, h);
      break;
    }
    case 'triangle': {
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      break;
    }
    case 'arch': {
      const radius = hw;
      ctx.moveTo(-hw, hh);
      ctx.lineTo(-hw, -hh + radius);
      ctx.arc(0, -hh + radius, radius, Math.PI, 0, false);
      ctx.lineTo(hw, hh);
      ctx.closePath();
      break;
    }
    case 'star': {
      const points = 5;
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.42;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'sunburst': {
      const rays = 16;
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.7;
      for (let i = 0; i < rays * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / rays;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'badge': {
      const teeth = 24;
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.88;
      for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / teeth;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'stamp': {
      // Postage stamp serrated frame
      ctx.rect(-hw, -hh, w, h);
      break;
    }
    case 'wave': {
      const waves = 4;
      ctx.moveTo(-hw, 0);
      for (let i = 0; i < waves; i++) {
        const startX = -hw + (i * w) / waves;
        const midX = startX + w / (waves * 2);
        const endX = startX + w / waves;
        const cpY1 = i % 2 === 0 ? -hh : hh;
        const cpY2 = i % 2 === 0 ? hh : -hh;
        ctx.bezierCurveTo(startX + w / (waves * 4), cpY1, midX + w / (waves * 4), cpY2, endX, 0);
      }
      if (filled) {
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
      }
      break;
    }
    case 'halftone-cluster': {
      // Geometric halftone dot grid
      const cols = 8;
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = -hw + (c * w) / (cols - 1);
          const dy = -hh + (r * h) / (rows - 1);
          const dotRadius = Math.max(1, (1 - c / cols) * (w / 18));
          ctx.moveTo(dx + dotRadius, dy);
          ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
        }
      }
      break;
    }
    case 'grid': {
      const step = Math.min(w, h) / 6;
      for (let x = -hw; x <= hw; x += step) {
        ctx.moveTo(x, -hh);
        ctx.lineTo(x, hh);
      }
      for (let y = -hh; y <= hh; y += step) {
        ctx.moveTo(-hw, y);
        ctx.lineTo(hw, y);
      }
      break;
    }
  }

  if (filled && shapeType !== 'grid') {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

/**
 * Separates an image into 2 or 3 grayscale stencil canvases
 */
export function separatePhotoToStencils(
  img: HTMLImageElement,
  method: SeparationMethod,
  drumCount: 2 | 3,
  drums: [DrumConfig, DrumConfig, DrumConfig],
  balance: number,
  brightness: number,
  contrast: number,
  invert: boolean,
  width: number,
  height: number
): [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement | null] {
  // Source canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) {
    const empty = document.createElement('canvas');
    return [empty, empty, null];
  }

  // Draw image scaled to cover canvas
  const imgAspect = img.width / img.height;
  const canvasAspect = width / height;
  let renderW = width;
  let renderH = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > canvasAspect) {
    renderW = height * imgAspect;
    offsetX = (width - renderW) / 2;
  } else {
    renderH = width / imgAspect;
    offsetY = (height - renderH) / 2;
  }

  srcCtx.drawImage(img, offsetX, offsetY, renderW, renderH);
  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const pixels = srcImgData.data;

  // Create stencil canvases for Drum 1, Drum 2, and Drum 3
  const drum1Canvas = document.createElement('canvas');
  drum1Canvas.width = width;
  drum1Canvas.height = height;
  const d1Ctx = drum1Canvas.getContext('2d')!;
  const d1Data = d1Ctx.createImageData(width, height);

  const drum2Canvas = document.createElement('canvas');
  drum2Canvas.width = width;
  drum2Canvas.height = height;
  const d2Ctx = drum2Canvas.getContext('2d')!;
  const d2Data = d2Ctx.createImageData(width, height);

  let drum3Canvas: HTMLCanvasElement | null = null;
  let d3Ctx: CanvasRenderingContext2D | null = null;
  let d3Data: ImageData | null = null;

  if (drumCount === 3) {
    drum3Canvas = document.createElement('canvas');
    drum3Canvas.width = width;
    drum3Canvas.height = height;
    d3Ctx = drum3Canvas.getContext('2d')!;
    d3Data = d3Ctx.createImageData(width, height);
  }

  // Contrast / Brightness adjustments
  const contrastFactor = Math.max(0.2, (contrast / 100));
  const brightnessOffset = (brightness / 100) * 255;
  const bal = balance / 100; // 0.0 to 1.0 (defaults to ~0.5)

  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];

    // Apply brightness & contrast
    r = Math.min(255, Math.max(0, (r - 128) * contrastFactor + 128 + brightnessOffset));
    g = Math.min(255, Math.max(0, (g - 128) * contrastFactor + 128 + brightnessOffset));
    b = Math.min(255, Math.max(0, (b - 128) * contrastFactor + 128 + brightnessOffset));

    // Luminance: 0 = dark, 255 = bright
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (invert) {
      lum = 255 - lum;
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // Default stencil ink intensities (0 = white/no ink, 255 = black/full ink)
    let ink1 = 0;
    let ink2 = 0;
    let ink3 = 0;

    if (method === 'luminance-split') {
      // Split tonal spectrum across 2 or 3 drums
      const normLum = lum / 255; // 0 (shadow) to 1 (highlight)
      const shadowInk = 1 - normLum; // 1 (shadow) to 0 (highlight)

      if (drumCount === 2) {
        // Drum 1: Highlights & Midtones (gentle wash)
        const t1 = Math.sin(normLum * Math.PI); // peaks in midtones
        ink1 = Math.min(255, Math.max(0, (t1 * 1.4 * bal + shadowInk * (1 - bal) * 0.4) * 255));

        // Drum 2: Shadows & Deep Details
        const threshold = 0.65 * bal + 0.2;
        const t2 = Math.max(0, (threshold - normLum) / threshold);
        ink2 = Math.min(255, Math.max(0, Math.pow(t2, 1.2) * 255));
      } else {
        // 3 Drums: Highlights, Midtones, Shadows
        // Drum 1: Light midtones & highlights (e.g. Yellow / Pink)
        const d1Peak = 0.7 * bal + 0.15;
        const dist1 = Math.abs(normLum - d1Peak);
        ink1 = Math.min(255, Math.max(0, (1 - dist1 * 2) * 255));

        // Drum 2: True midtones (e.g. Teal / Blue)
        const d2Peak = 0.4 * bal + 0.1;
        const dist2 = Math.abs(normLum - d2Peak);
        ink2 = Math.min(255, Math.max(0, (1 - dist2 * 2.2) * 255));

        // Drum 3: Deep shadows & line work (e.g. Black / Burgundy)
        const shadowThreshold = 0.45;
        if (normLum < shadowThreshold) {
          ink3 = Math.min(255, Math.max(0, ((shadowThreshold - normLum) / shadowThreshold) * 255));
        }
      }
    } else if (method === 'spectral-cmy') {
      // Subtractive CMY separation
      const c = 1 - r / 255;
      const m = 1 - g / 255;
      const y = 1 - b / 255;

      if (drumCount === 2) {
        ink1 = Math.min(255, Math.max(0, (m * bal + y * (1 - bal)) * 255));
        ink2 = Math.min(255, Math.max(0, (c * 0.85 + (1 - lum / 255) * 0.4) * 255));
      } else {
        ink1 = Math.min(255, Math.max(0, m * 255));
        ink2 = Math.min(255, Math.max(0, c * 255));
        ink3 = Math.min(255, Math.max(0, (y * 0.7 + (1 - lum / 255) * 0.5) * 255));
      }
    } else if (method === 'posterize') {
      // High-impact graphic posterize thresholds
      const steps = drumCount === 2 ? 3 : 4;
      const stepped = Math.floor((lum / 255) * steps) / steps;
      if (drumCount === 2) {
        ink1 = stepped < 0.7 ? 200 : 0;
        ink2 = stepped < 0.35 ? 255 : 0;
      } else {
        ink1 = stepped < 0.8 ? 160 : 0;
        ink2 = stepped < 0.55 ? 210 : 0;
        ink3 = stepped < 0.28 ? 255 : 0;
      }
    } else {
      // Duotone / Tritone smooth ramp
      const invLum = 255 - lum;
      if (drumCount === 2) {
        ink1 = Math.min(255, Math.max(0, invLum * 0.75));
        ink2 = Math.min(255, Math.max(0, Math.pow(invLum / 255, 1.6) * 255));
      } else {
        ink1 = Math.min(255, Math.max(0, Math.sin((lum / 255) * Math.PI) * 230));
        ink2 = Math.min(255, Math.max(0, invLum * 0.85));
        ink3 = Math.min(255, Math.max(0, Math.pow(invLum / 255, 2.2) * 255));
      }
    }

    // In Risograph stencils, 0 = white (no ink on master), 255 = full black (ink through perforations)
    // dData pixels are stored in RGBA, where white is rgb(255,255,255) and black is rgb(0,0,0)
    const val1 = 255 - ink1;
    d1Data.data[i] = val1;
    d1Data.data[i + 1] = val1;
    d1Data.data[i + 2] = val1;
    d1Data.data[i + 3] = 255;

    const val2 = 255 - ink2;
    d2Data.data[i] = val2;
    d2Data.data[i + 1] = val2;
    d2Data.data[i + 2] = val2;
    d2Data.data[i + 3] = 255;

    if (d3Data) {
      const val3 = 255 - ink3;
      d3Data.data[i] = val3;
      d3Data.data[i + 1] = val3;
      d3Data.data[i + 2] = val3;
      d3Data.data[i + 3] = 255;
    }
  }

  d1Ctx.putImageData(d1Data, 0, 0);
  d2Ctx.putImageData(d2Data, 0, 0);
  if (d3Ctx && d3Data && drum3Canvas) {
    d3Ctx.putImageData(d3Data, 0, 0);
  }

  return [drum1Canvas, drum2Canvas, drum3Canvas];
}

/**
 * Halftone Screening Engine:
 * Transforms continuous grayscale stencil into Risograph halftone dots or dither
 */
export function applyHalftoneScreen(
  stencilCanvas: HTMLCanvasElement,
  angleDeg: number,
  frequency: number,
  dotType: DotType
): HTMLCanvasElement {
  const width = stencilCanvas.width;
  const height = stencilCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return outCanvas;

  // Clear to white
  outCtx.fillStyle = '#FFFFFF';
  outCtx.fillRect(0, 0, width, height);

  const stencilCtx = stencilCanvas.getContext('2d');
  if (!stencilCtx) return outCanvas;
  const srcImgData = stencilCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  // Calculate cell size based on frequency (LPI)
  // frequency 10 = coarse large poster dots (~18px), 40 = fine book dots (~4px)
  const cellSize = Math.max(3, Math.round((Math.min(width, height) / (frequency * 7.5))));

  if (dotType === 'dither') {
    // 8x8 Bayer ordered dither matrix (gritty zine punk aesthetic)
    const outImgData = outCtx.createImageData(width, height);
    const outData = outImgData.data;

    for (let y = 0; y < height; y++) {
      const matrixY = y % 8;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // In stencil: 0 = full black (100% ink), 255 = white (no ink)
        const gray = srcData[idx]; // 0 to 255
        const inkDensity = (255 - gray) / 255; // 0 to 1

        const matrixX = x % 8;
        const threshold = BAYER_8X8[matrixY][matrixX] / 64;

        const isDotted = inkDensity > threshold;
        const dotColor = isDotted ? 0 : 255;

        outData[idx] = dotColor;
        outData[idx + 1] = dotColor;
        outData[idx + 2] = dotColor;
        outData[idx + 3] = 255;
      }
    }
    outCtx.putImageData(outImgData, 0, 0);
    return outCanvas;
  }

  // Trigonometric transformation for screen angle
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Determine rotated bounding box to ensure coverage
  const diag = Math.sqrt(width * width + height * height);
  const startX = -diag;
  const endX = diag;
  const startY = -diag;
  const endY = diag;

  outCtx.fillStyle = '#000000';
  outCtx.strokeStyle = '#000000';

  for (let gridY = startY; gridY < endY; gridY += cellSize) {
    for (let gridX = startX; gridX < endX; gridX += cellSize) {
      // Rotate back to image coordinates
      const imgX = Math.round(width / 2 + (gridX * cos - gridY * sin));
      const imgY = Math.round(height / 2 + (gridX * sin + gridY * cos));

      if (imgX < 0 || imgX >= width || imgY < 0 || imgY >= height) continue;

      const idx = (imgY * width + imgX) * 4;
      const gray = srcData[idx];
      const inkDensity = (255 - gray) / 255; // 0.0 to 1.0

      if (inkDensity <= 0.02) continue; // Skip nearly white areas

      if (dotType === 'line') {
        // Line screen / Woodcut style
        const lineThickness = inkDensity * cellSize * 1.1;
        outCtx.save();
        outCtx.translate(imgX, imgY);
        outCtx.rotate(rad);
        outCtx.lineWidth = lineThickness;
        outCtx.beginPath();
        outCtx.moveTo(-cellSize / 2, 0);
        outCtx.lineTo(cellSize / 2, 0);
        outCtx.stroke();
        outCtx.restore();
      } else if (dotType === 'diamond') {
        // Diamond screen
        const maxR = (cellSize / 2) * 1.35;
        const radius = Math.sqrt(inkDensity) * maxR;
        outCtx.save();
        outCtx.translate(imgX, imgY);
        outCtx.rotate(rad + Math.PI / 4);
        outCtx.fillRect(-radius, -radius, radius * 2, radius * 2);
        outCtx.restore();
      } else {
        // Classic circular AM halftone dot
        const maxR = (cellSize / 2) * 1.42; // slight dot gain
        const radius = Math.sqrt(inkDensity) * maxR;
        outCtx.beginPath();
        outCtx.arc(imgX, imgY, radius, 0, Math.PI * 2);
        outCtx.fill();
      }
    }
  }

  return outCanvas;
}

/**
 * Composites the Risograph print layers onto the target canvas
 * using authentic translucent soy-ink subtractive multiplication.
 */
export function compositeRisoPrint(
  targetCanvas: HTMLCanvasElement,
  state: StudioState,
  stencils: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement | null],
  renderScale = 1.0
) {
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const paperStock = PAPER_STOCKS.find(p => p.id === state.paperStockId) || PAPER_STOCKS[0];

  // 1. Render Paper Stock Background
  drawPaper(ctx, width, height, paperStock, state.paperGrain);

  // 2. Prepare Drum Halftone Masters
  const drums = state.drums;
  const activeDrumCount = state.drumCount;

  // Check if we are in solo view mode
  const isSoloDrum1 = state.activeView === 'drum1';
  const isSoloDrum2 = state.activeView === 'drum2';
  const isSoloDrum3 = state.activeView === 'drum3';
  const isCombined = state.activeView === 'combined' || state.activeView === 'masters';

  const drumsToRender: {
    drum: DrumConfig;
    stencil: HTMLCanvasElement;
    inkHex: string;
  }[] = [];

  // Drum 1
  if ((isCombined || isSoloDrum1) && drums[0].visible && stencils[0]) {
    const ink = RISO_INKS.find(i => i.id === drums[0].inkId) || RISO_INKS[0];
    drumsToRender.push({ drum: drums[0], stencil: stencils[0], inkHex: ink.hex });
  }

  // Drum 2
  if ((isCombined || isSoloDrum2) && drums[1].visible && stencils[1]) {
    const ink = RISO_INKS.find(i => i.id === drums[1].inkId) || RISO_INKS[1];
    drumsToRender.push({ drum: drums[1], stencil: stencils[1], inkHex: ink.hex });
  }

  // Drum 3 (if 3-drum mode active)
  if (activeDrumCount === 3 && (isCombined || isSoloDrum3) && drums[2].visible && stencils[2]) {
    const ink = RISO_INKS.find(i => i.id === drums[2].inkId) || RISO_INKS[2];
    drumsToRender.push({ drum: drums[2], stencil: stencils[2], inkHex: ink.hex });
  }

  // 3. Render Each Ink Drum Layer with Registration Offset & Multiply Blend Mode
  for (const item of drumsToRender) {
    const drum = item.drum;

    // Apply halftone screening to stencil
    const halftonedStencil = applyHalftoneScreen(
      item.stencil,
      drum.angle,
      drum.screenFrequency,
      drum.dotType
    );

    // Colorize halftoned stencil: black dots become ink color, white becomes transparent
    const coloredLayer = colorizeStencil(halftonedStencil, item.inkHex, drum.opacity / 100);

    ctx.save();

    // Multiply blend mode simulates translucent soy emulsion ink absorbing into paper fibers!
    ctx.globalCompositeOperation = 'multiply';

    // Registration Misalignment Offset & Rotational Drift
    const offX = drum.offsetX * renderScale;
    const offY = drum.offsetY * renderScale;
    const rot = (drum.rotation * Math.PI) / 180;

    if (offX !== 0 || offY !== 0 || rot !== 0) {
      ctx.translate(width / 2 + offX, height / 2 + offY);
      if (rot !== 0) ctx.rotate(rot);
      ctx.drawImage(coloredLayer, -width / 2, -height / 2);
    } else {
      ctx.drawImage(coloredLayer, 0, 0);
    }

    ctx.restore();
  }

  // 4. Authentic Risograph Artifacts (Roller Track & Registration Crosshairs)
  if (state.feedRollerMarks) {
    drawRollerMarks(ctx, width, height);
  }

  if (state.registrationMarks) {
    drawRegistrationMarks(ctx, width, height, state.drums, state.drumCount);
  }
}

/**
 * Converts black-and-white halftone stencil into transparent colored soy ink
 */
function colorizeStencil(
  halftoneCanvas: HTMLCanvasElement,
  hexColor: string,
  opacity: number
): HTMLCanvasElement {
  const width = halftoneCanvas.width;
  const height = halftoneCanvas.height;

  const coloredCanvas = document.createElement('canvas');
  coloredCanvas.width = width;
  coloredCanvas.height = height;
  const cCtx = coloredCanvas.getContext('2d');
  if (!cCtx) return coloredCanvas;

  const hCtx = halftoneCanvas.getContext('2d')!;
  const hData = hCtx.getImageData(0, 0, width, height);
  const src = hData.data;

  const outData = cCtx.createImageData(width, height);
  const dst = outData.data;
  const rgb = hexToRgb(hexColor);

  for (let i = 0; i < src.length; i += 4) {
    const gray = src[i]; // 0 = dot (full ink), 255 = no dot
    const dotAlpha = (255 - gray) / 255;

    if (dotAlpha > 0.05) {
      dst[i] = rgb.r;
      dst[i + 1] = rgb.g;
      dst[i + 2] = rgb.b;
      dst[i + 3] = Math.round(dotAlpha * opacity * 255);
    } else {
      dst[i + 3] = 0;
    }
  }

  cCtx.putImageData(outData, 0, 0);
  return coloredCanvas;
}

/**
 * Draws iconic faint Riso paper-feed roller tire track
 */
function drawRollerMarks(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#222222';

  // Roller streak runs along paper feed direction (e.g. 15% from left edge)
  const trackX = width * 0.14;
  const trackW = Math.max(12, width * 0.016);
  ctx.fillRect(trackX, 0, trackW, height);

  // Subtle ribbing / tire tread pattern along the streak
  for (let y = 0; y < height; y += 14) {
    ctx.fillRect(trackX - 2, y, trackW + 4, 3);
  }

  ctx.restore();
}

/**
 * Draws registration crosshairs and color control patches on paper margin
 */
function drawRegistrationMarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  drums: [DrumConfig, DrumConfig, DrumConfig],
  drumCount: 2 | 3
) {
  ctx.save();
  const margin = Math.min(width, height) * 0.035;

  const corners = [
    { x: margin, y: margin },
    { x: width - margin, y: margin },
    { x: margin, y: height - margin },
    { x: width - margin, y: height - margin },
  ];

  ctx.lineWidth = 1;

  for (const c of corners) {
    // Crosshairs
    ctx.strokeStyle = '#222222';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(c.x - 14, c.y);
    ctx.lineTo(c.x + 14, c.y);
    ctx.moveTo(c.x, c.y - 14);
    ctx.lineTo(c.x, c.y + 14);
    ctx.stroke();
  }

  // Color test patch strip at bottom center
  const swatchW = 16;
  const swatchH = 8;
  const totalW = drumCount * (swatchW + 4);
  const startX = (width - totalW) / 2;
  const patchY = height - margin * 0.9;

  for (let d = 0; d < drumCount; d++) {
    const ink = RISO_INKS.find(i => i.id === drums[d].inkId);
    if (ink) {
      ctx.fillStyle = ink.hex;
      ctx.fillRect(startX + d * (swatchW + 4), patchY, swatchW, swatchH);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(startX + d * (swatchW + 4), patchY, swatchW, swatchH);
    }
  }

  ctx.restore();
}

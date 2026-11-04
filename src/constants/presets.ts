import { CompositionItem } from '../types/riso';

export interface PosterPreset {
  id: string;
  title: string;
  category: 'zine' | 'poster' | 'botanical' | 'geometric';
  drumCount: 2 | 3;
  drum1: string;
  drum2: string;
  drum3: string;
  paperStockId: string;
  items: CompositionItem[];
}

export const POSTER_PRESETS: PosterPreset[] = [
  {
    id: 'zine-tokyo',
    title: 'ZINE NO. 07 // TOKYO METRO',
    category: 'zine',
    drumCount: 3,
    drum1: 'fluo-pink',
    drum2: 'aqua',
    drum3: 'black',
    paperStockId: 'warm-newsprint',
    items: [
      {
        id: 'item-bg-frame',
        type: 'shape',
        shapeType: 'rectangle',
        x: 50,
        y: 50,
        width: 86,
        height: 90,
        rotation: 0,
        zIndex: 1,
        drum: 'drum2',
        tint: 100,
        filled: false,
        strokeWidth: 4,
      },
      {
        id: 'item-arch',
        type: 'shape',
        shapeType: 'arch',
        x: 50,
        y: 42,
        width: 60,
        height: 48,
        rotation: 0,
        zIndex: 2,
        drum: 'drum1',
        tint: 90,
        filled: true,
      },
      {
        id: 'item-sunburst',
        type: 'shape',
        shapeType: 'sunburst',
        x: 50,
        y: 36,
        width: 38,
        height: 38,
        rotation: 15,
        zIndex: 3,
        drum: 'drum2',
        tint: 85,
        filled: true,
      },
      {
        id: 'item-center-circle',
        type: 'shape',
        shapeType: 'circle',
        x: 50,
        y: 36,
        width: 22,
        height: 22,
        rotation: 0,
        zIndex: 4,
        drum: 'drum3',
        tint: 100,
        filled: true,
      },
      {
        id: 'item-halftone-grid',
        type: 'shape',
        shapeType: 'halftone-cluster',
        x: 50,
        y: 65,
        width: 72,
        height: 18,
        rotation: 0,
        zIndex: 5,
        drum: 'drum1',
        tint: 70,
        filled: true,
      },
      {
        id: 'item-txt-title',
        type: 'text',
        text: 'SHIBUYA SOUNDS',
        fontFamily: 'Bricolage Grotesque',
        fontSize: 38,
        fontWeight: '800',
        letterSpacing: 2,
        textAlign: 'center',
        x: 50,
        y: 16,
        width: 80,
        height: 12,
        rotation: 0,
        zIndex: 10,
        drum: 'drum3',
        tint: 100,
      },
      {
        id: 'item-txt-sub',
        type: 'text',
        text: 'UNDERGROUND CASSETTE ARCHIVE // VOL. 04',
        fontFamily: 'Space Mono',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 3,
        textAlign: 'center',
        x: 50,
        y: 22,
        width: 80,
        height: 6,
        rotation: 0,
        zIndex: 11,
        drum: 'drum1',
        tint: 100,
      },
      {
        id: 'item-txt-date',
        type: 'text',
        text: 'NIGHT RUN // 02:00 AM // ALL ACCESS',
        fontFamily: 'Space Mono',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
        x: 50,
        y: 78,
        width: 76,
        height: 8,
        rotation: 0,
        zIndex: 12,
        drum: 'drum2',
        tint: 100,
      },
      {
        id: 'item-badge',
        type: 'shape',
        shapeType: 'badge',
        x: 24,
        y: 78,
        width: 16,
        height: 16,
        rotation: -10,
        zIndex: 13,
        drum: 'drum1',
        tint: 100,
        filled: true,
      },
      {
        id: 'item-stamp',
        type: 'shape',
        shapeType: 'stamp',
        x: 76,
        y: 78,
        width: 16,
        height: 16,
        rotation: 12,
        zIndex: 14,
        drum: 'drum3',
        tint: 100,
        filled: false,
        strokeWidth: 3,
      },
    ],
  },
  {
    id: 'botanica-flora',
    title: 'BOTANICA // FERNS & FLORA',
    category: 'botanical',
    drumCount: 3,
    drum1: 'kelly-green',
    drum2: 'fluo-pink',
    drum3: 'flat-gold',
    paperStockId: 'speckletone-fleck',
    items: [
      {
        id: 'bot-arch-1',
        type: 'shape',
        shapeType: 'arch',
        x: 36,
        y: 44,
        width: 44,
        height: 54,
        rotation: -6,
        zIndex: 1,
        drum: 'drum1',
        tint: 85,
        filled: true,
      },
      {
        id: 'bot-circle-sun',
        type: 'shape',
        shapeType: 'circle',
        x: 64,
        y: 38,
        width: 40,
        height: 40,
        rotation: 0,
        zIndex: 2,
        drum: 'drum3',
        tint: 90,
        filled: true,
      },
      {
        id: 'bot-wave',
        type: 'shape',
        shapeType: 'wave',
        x: 50,
        y: 66,
        width: 78,
        height: 20,
        rotation: 0,
        zIndex: 3,
        drum: 'drum2',
        tint: 90,
        filled: true,
      },
      {
        id: 'bot-txt-kicker',
        type: 'text',
        text: 'HERBARIUM HORTICULTURALIS',
        fontFamily: 'Space Mono',
        fontSize: 12,
        fontWeight: 'normal',
        letterSpacing: 4,
        textAlign: 'center',
        x: 50,
        y: 12,
        width: 80,
        height: 6,
        rotation: 0,
        zIndex: 10,
        drum: 'drum3',
        tint: 100,
      },
      {
        id: 'bot-txt-main',
        type: 'text',
        text: 'WILD FOLIAGE',
        fontFamily: 'Bricolage Grotesque',
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
        textAlign: 'center',
        x: 50,
        y: 18,
        width: 80,
        height: 12,
        rotation: 0,
        zIndex: 11,
        drum: 'drum1',
        tint: 100,
      },
      {
        id: 'bot-txt-specimen',
        type: 'text',
        text: 'SPECIMEN № 184 / DRYOPTERIS FILIX-MAS',
        fontFamily: 'Space Mono',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
        x: 50,
        y: 84,
        width: 80,
        height: 6,
        rotation: 0,
        zIndex: 12,
        drum: 'drum2',
        tint: 100,
      },
    ],
  },
  {
    id: 'bauhaus-grid',
    title: 'CONSTRUCTIVIST // METRIC NO. 3',
    category: 'geometric',
    drumCount: 2,
    drum1: 'medium-blue',
    drum2: 'bright-red',
    drum3: 'sunflower',
    paperStockId: 'french-kraft',
    items: [
      {
        id: 'geo-grid-1',
        type: 'shape',
        shapeType: 'grid',
        x: 50,
        y: 46,
        width: 74,
        height: 52,
        rotation: 0,
        zIndex: 1,
        drum: 'drum1',
        tint: 80,
        filled: false,
        strokeWidth: 3,
      },
      {
        id: 'geo-triangle-1',
        type: 'shape',
        shapeType: 'triangle',
        x: 42,
        y: 42,
        width: 48,
        height: 48,
        rotation: 30,
        zIndex: 2,
        drum: 'drum2',
        tint: 100,
        filled: true,
      },
      {
        id: 'geo-circle-1',
        type: 'shape',
        shapeType: 'circle',
        x: 62,
        y: 48,
        width: 36,
        height: 36,
        rotation: 0,
        zIndex: 3,
        drum: 'drum1',
        tint: 90,
        filled: true,
      },
      {
        id: 'geo-txt-top',
        type: 'text',
        text: 'FORM & FUNCTION',
        fontFamily: 'Bricolage Grotesque',
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: 1,
        textAlign: 'center',
        x: 50,
        y: 14,
        width: 80,
        height: 10,
        rotation: 0,
        zIndex: 10,
        drum: 'drum2',
        tint: 100,
      },
      {
        id: 'geo-txt-btm',
        type: 'text',
        text: '1926 WORKSHOP MONOGRAPH // ROTATION 45°',
        fontFamily: 'Space Mono',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
        x: 50,
        y: 80,
        width: 76,
        height: 8,
        rotation: 0,
        zIndex: 11,
        drum: 'drum1',
        tint: 100,
      },
    ],
  },
  {
    id: 'jazz-session',
    title: 'MIDNIGHT IMPROV // CELLAR JAZZ',
    category: 'poster',
    drumCount: 2,
    drum1: 'orange',
    drum2: 'teal',
    drum3: 'sunflower',
    paperStockId: 'warm-newsprint',
    items: [
      {
        id: 'jazz-star-1',
        type: 'shape',
        shapeType: 'star',
        x: 28,
        y: 28,
        width: 28,
        height: 28,
        rotation: 12,
        zIndex: 1,
        drum: 'drum1',
        tint: 100,
        filled: true,
      },
      {
        id: 'jazz-circle-moon',
        type: 'shape',
        shapeType: 'circle',
        x: 70,
        y: 35,
        width: 44,
        height: 44,
        rotation: 0,
        zIndex: 2,
        drum: 'drum2',
        tint: 90,
        filled: true,
      },
      {
        id: 'jazz-wave-bottom',
        type: 'shape',
        shapeType: 'wave',
        x: 50,
        y: 60,
        width: 76,
        height: 22,
        rotation: 0,
        zIndex: 3,
        drum: 'drum1',
        tint: 85,
        filled: true,
      },
      {
        id: 'jazz-txt-title',
        type: 'text',
        text: 'BLUE NOTE VIBE',
        fontFamily: 'Bricolage Grotesque',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
        x: 50,
        y: 15,
        width: 80,
        height: 12,
        rotation: -2,
        zIndex: 10,
        drum: 'drum2',
        tint: 100,
      },
      {
        id: 'jazz-txt-venue',
        type: 'text',
        text: 'LIVE AT CELLAR 49 • FRIDAY 10PM • TICKET $10',
        fontFamily: 'Space Mono',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
        x: 50,
        y: 78,
        width: 76,
        height: 6,
        rotation: 0,
        zIndex: 11,
        drum: 'drum1',
        tint: 100,
      },
    ],
  },
];

/**
 * Creates high-contrast curated sample photo canvases procedurally.
 * This guarantees pristine, zero-broken-image, high-contrast subjects
 * tailored specifically for risograph halftone test proofing!
 */
export function createSamplePhoto(type: 'architecture' | 'botanical' | 'portrait'): string {
  const width = 800;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, width, height);

  if (type === 'architecture') {
    // Stylized high-contrast brutalist / Bauhaus building facade
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f2f2f2');
    grad.addColorStop(1, '#d5d5d5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Deep architectural shadow diagonal
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(width, 400);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = '#222222';
    ctx.fill();

    // Secondary midtone facade
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(width - 50, 320);
    ctx.lineTo(width - 50, height - 100);
    ctx.lineTo(150, height - 100);
    ctx.closePath();
    ctx.fillStyle = '#777777';
    ctx.fill();

    // Repetitive rhythmic windows with stark highlights
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = 220 + col * 110;
        const wy = 360 + row * 85;
        // Window shadow
        ctx.fillStyle = '#111111';
        ctx.fillRect(wx, wy, 80, 60);
        // Window glare/reflection
        ctx.fillStyle = '#e5e5e5';
        ctx.beginPath();
        ctx.moveTo(wx + 10, wy + 60);
        ctx.lineTo(wx + 50, wy);
        ctx.lineTo(wx + 75, wy);
        ctx.lineTo(wx + 35, wy + 60);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Street light silhouette & cantilever
    ctx.fillStyle = '#050505';
    ctx.fillRect(80, 480, 24, 520);
    ctx.beginPath();
    ctx.arc(92, 470, 42, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'botanical') {
    // Rich contrast monstera & fern botanical silhouettes with gradient depth
    const grad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 600);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#b0b0b0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Deep shadow foliage (layer 1)
    ctx.fillStyle = '#111111';
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI - 0.2;
      const rx = width / 2 + Math.cos(angle) * 220;
      const ry = height / 2 + 100 + Math.sin(angle) * 220;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(angle + 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Midtone foliage (layer 2)
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI + 0.1;
      const rx = width / 2 + Math.cos(angle) * 140;
      const ry = height / 2 - 20 + Math.sin(angle) * 140;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 120, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Delicate fern leaves / fronds
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(120, height);
    ctx.quadraticCurveTo(width / 2 - 50, height / 2, width - 120, 180);
    ctx.stroke();

    for (let step = 0; step < 26; step++) {
      const t = step / 26;
      const px = Math.pow(1 - t, 2) * 120 + 2 * (1 - t) * t * (width / 2 - 50) + t * t * (width - 120);
      const py = Math.pow(1 - t, 2) * height + 2 * (1 - t) * t * (height / 2) + t * t * 180;
      ctx.fillStyle = step % 2 === 0 ? '#111111' : '#444444';
      ctx.beginPath();
      ctx.ellipse(px + (step % 2 === 0 ? 30 : -30), py - 10, 36, 12, step * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Elegant high-contrast studio portrait profile
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#ececec');
    grad.addColorStop(0.5, '#cccccc');
    grad.addColorStop(1, '#888888');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Head profile silhouette
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.moveTo(250, height);
    ctx.lineTo(260, 680); // neck back
    ctx.quadraticCurveTo(240, 480, 310, 320); // cranium back
    ctx.quadraticCurveTo(390, 200, 520, 220); // crown
    ctx.quadraticCurveTo(590, 240, 610, 320); // forehead
    ctx.lineTo(600, 360); // brow
    ctx.lineTo(645, 410); // nose tip
    ctx.lineTo(595, 435); // beneath nose
    ctx.lineTo(615, 460); // upper lip
    ctx.lineTo(590, 480); // mouth cleft
    ctx.lineTo(615, 505); // lower lip
    ctx.lineTo(580, 540); // chin indent
    ctx.quadraticCurveTo(610, 580, 590, 610); // chin
    ctx.lineTo(540, 680); // jawline
    ctx.lineTo(550, height); // neck front
    ctx.closePath();
    ctx.fill();

    // Expressive hair highlights & rim lighting
    ctx.fillStyle = '#7a7a7a';
    ctx.beginPath();
    ctx.arc(380, 360, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dddddd';
    ctx.beginPath();
    ctx.ellipse(390, 330, 60, 35, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Bold glasses or accessory in stark contrast
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 14;
    ctx.strokeRect(480, 360, 110, 85);
    ctx.beginPath();
    ctx.moveTo(480, 400);
    ctx.lineTo(360, 385);
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

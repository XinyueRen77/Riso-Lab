import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CompositionItem, StudioState } from '../types/riso';
import { LoupeOverlay } from './LoupeOverlay';
import { Trash2, Copy, ArrowUp, ArrowDown, Move, Upload } from 'lucide-react';
import { RISO_INKS } from '../constants/risoInks';

interface CanvasViewProps {
  state: StudioState;
  renderCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  zoom: number;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<CompositionItem>) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onReorderItem: (id: string, dir: 'up' | 'down') => void;
  onUploadPhoto: (file: File) => void;
  isRendering: boolean;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  state,
  renderCanvasRef,
  zoom,
  onSelectItem,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onReorderItem,
  onUploadPhoto,
  isRendering,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dragging composition items on canvas
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; itemX: number; itemY: number }>({
    x: 0,
    y: 0,
    itemX: 0,
    itemY: 0,
  });

  const selectedItem = state.items.find(it => it.id === state.selectedItemId);

  // Update canvas bounds on resize / zoom
  useEffect(() => {
    if (renderCanvasRef.current) {
      setCanvasRect(renderCanvasRef.current.getBoundingClientRect());
    }
  }, [zoom, isRendering]);

  // Mouse move handler for loupe and item dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!renderCanvasRef.current) return;
      const rect = renderCanvasRef.current.getBoundingClientRect();
      setCanvasRect(rect);

      // Pixel coordinate inside the canvas
      const x = ((e.clientX - rect.left) / rect.width) * renderCanvasRef.current.width;
      const y = ((e.clientY - rect.top) / rect.height) * renderCanvasRef.current.height;
      setCursorPos({ x, y });

      // Handle item dragging in compose mode
      if (draggingId && state.mode === 'compose') {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const deltaXPercent = (dx / rect.width) * 100;
        const deltaYPercent = (dy / rect.height) * 100;

        const newX = Math.round(Math.max(5, Math.min(95, dragStart.itemX + deltaXPercent)));
        const newY = Math.round(Math.max(5, Math.min(95, dragStart.itemY + deltaYPercent)));

        onUpdateItem(draggingId, { x: newX, y: newY });
      }
    },
    [draggingId, dragStart, onUpdateItem, renderCanvasRef, state.mode]
  );

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleStartDragItem = (e: React.MouseEvent, item: CompositionItem) => {
    if (state.loupeActive) return; // Loupe mode takes precedence
    e.stopPropagation();
    onSelectItem(item.id);
    setDraggingId(item.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      itemX: item.x,
      itemY: item.y,
    });
  };

  // Drag and drop photo upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUploadPhoto(file);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelectItem(null)}
      className="relative flex-1 h-full overflow-auto bg-stone-950 flex items-center justify-center p-6 sm:p-10 select-none cursor-default"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px, 64px 64px, 64px 64px',
      }}
    >
      {/* Paper Sheet Container with Natural Shadow and Matte Elevation */}
      <div
        className="relative transition-transform duration-150 ease-out origin-center"
        style={{
          transform: `scale(${zoom})`,
        }}
      >
        {/* Physical Paper Shadow */}
        <div className="relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_10px_20px_-5px_rgba(0,0,0,0.4)] border border-stone-800/60 rounded-xs overflow-hidden bg-white">
          <canvas
            ref={renderCanvasRef as React.RefObject<HTMLCanvasElement>}
            width={900}
            height={1200}
            className="block max-w-[85vw] max-h-[75vh] w-auto h-auto object-contain cursor-crosshair"
          />

          {/* Interactive Composition Overlays (Only visible in Compose mode when Loupe is off) */}
          {state.mode === 'compose' && !state.loupeActive && (
            <div className="absolute inset-0 pointer-events-none">
              {state.items.map(item => {
                const isSelected = item.id === state.selectedItemId;
                return (
                  <div
                    key={item.id}
                    onMouseDown={e => handleStartDragItem(e, item)}
                    className={`absolute pointer-events-auto cursor-move transition-shadow ${
                      isSelected
                        ? 'ring-2 ring-pink-500 ring-offset-1 ring-offset-stone-900 bg-pink-500/10'
                        : 'hover:ring-1 hover:ring-pink-400/50'
                    }`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      width: `${item.width}%`,
                      height: `${item.height}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                      zIndex: item.zIndex,
                    }}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-white text-[10px] shadow">
                        <Move className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Rendering Activity Indicator */}
          {isRendering && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-mono-code text-stone-300 border border-stone-700/60 shadow">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span>Inking...</span>
            </div>
          )}
        </div>

        {/* Selected Item Floating HUD / Fast Controls */}
        {state.mode === 'compose' && selectedItem && !state.loupeActive && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-stone-900/95 border border-stone-700/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-2xl text-xs text-stone-200 z-30"
          >
            <span className="text-[11px] font-mono-code text-stone-400">
              {selectedItem.type === 'text' ? 'Text' : selectedItem.shapeType}
            </span>

            <div className="w-px h-4 bg-stone-700" />

            {/* Drum Assignment Quick Selector */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateItem(selectedItem.id, { drum: 'drum1' })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-code cursor-pointer ${
                  selectedItem.drum === 'drum1'
                    ? 'bg-pink-600 text-white font-bold'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Assign to Drum 1"
              >
                D1
              </button>
              <button
                onClick={() => onUpdateItem(selectedItem.id, { drum: 'drum2' })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-code cursor-pointer ${
                  selectedItem.drum === 'drum2'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Assign to Drum 2"
              >
                D2
              </button>
              {state.drumCount === 3 && (
                <button
                  onClick={() => onUpdateItem(selectedItem.id, { drum: 'drum3' })}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono-code cursor-pointer ${
                    selectedItem.drum === 'drum3'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Assign to Drum 3"
                >
                  D3
                </button>
              )}
              <button
                onClick={() => onUpdateItem(selectedItem.id, { drum: 'overprint' })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-code cursor-pointer ${
                  selectedItem.drum === 'overprint'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Overprint (Hits all drums)"
              >
                Blend
              </button>
            </div>

            <div className="w-px h-4 bg-stone-700" />

            {/* Tint Slider */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-stone-400">Tint:</span>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={selectedItem.tint ?? 100}
                onChange={e =>
                  onUpdateItem(selectedItem.id, { tint: parseInt(e.target.value, 10) })
                }
                className="w-16 accent-pink-500 h-1 bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="font-mono-code text-stone-300 tabular-nums w-8">
                {selectedItem.tint ?? 100}%
              </span>
            </div>

            <div className="w-px h-4 bg-stone-700" />

            {/* Layer controls: Reorder, Duplicate, Delete */}
            <button
              onClick={() => onReorderItem(selectedItem.id, 'up')}
              className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
              title="Bring Forward"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onReorderItem(selectedItem.id, 'down')}
              className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
              title="Send Backward"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDuplicateItem(selectedItem.id)}
              className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteItem(selectedItem.id)}
              className="p-1 hover:bg-rose-900/40 rounded text-rose-400 hover:text-rose-300 cursor-pointer"
              title="Delete Item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Drag & drop visual dropzone indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-xs border-4 border-dashed border-pink-500/80 flex flex-col items-center justify-center gap-3 z-50">
          <Upload className="w-12 h-12 text-pink-400 animate-bounce" />
          <p className="font-display font-bold text-xl text-stone-100">Drop Photo to Separate</p>
          <p className="text-xs text-stone-400">RISO LAB will extract 2 or 3 spot ink color channels</p>
        </div>
      )}

      {/* Magnifying Loupe Overlay */}
      <LoupeOverlay
        sourceCanvas={renderCanvasRef.current}
        cursorX={cursorPos.x}
        cursorY={cursorPos.y}
        canvasRect={canvasRect}
        visible={state.loupeActive}
        onClose={() => {}}
      />
    </div>
  );
};

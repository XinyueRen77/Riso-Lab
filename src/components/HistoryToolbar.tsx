import React from 'react';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Search,
  Shuffle,
  Eye,
  Maximize2,
  Minus,
  Plus,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';
import { StudioMode, ViewMode, DrumConfig } from '../types/riso';
import { RISO_INKS } from '../constants/risoInks';

interface HistoryToolbarProps {
  mode: StudioMode;
  onSetMode: (mode: StudioMode) => void;
  drumCount: 2 | 3;
  onSetDrumCount: (count: 2 | 3) => void;
  activeView: ViewMode;
  onSetView: (view: ViewMode) => void;
  drums: [DrumConfig, DrumConfig, DrumConfig];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  loupeActive: boolean;
  onToggleLoupe: () => void;
  onJiggleRegistration: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const HistoryToolbar: React.FC<HistoryToolbarProps> = ({
  mode,
  onSetMode,
  drumCount,
  onSetDrumCount,
  activeView,
  onSetView,
  drums,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  loupeActive,
  onToggleLoupe,
  onJiggleRegistration,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  const ink1 = RISO_INKS.find(i => i.id === drums[0].inkId);
  const ink2 = RISO_INKS.find(i => i.id === drums[1].inkId);
  const ink3 = RISO_INKS.find(i => i.id === drums[2].inkId);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-stone-900 border-b border-stone-800 text-xs text-stone-300 shrink-0">
      {/* Left zone: Mode toggle & Drum count */}
      <div className="flex items-center gap-3">
        {/* Studio Mode Segmented Button */}
        <div className="flex items-center p-0.5 bg-stone-950 rounded-lg border border-stone-800">
          <button
            onClick={() => onSetMode('compose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'compose'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-pink-400" />
            <span>Compose</span>
          </button>
          <button
            onClick={() => onSetMode('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'photo'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Photo Separation</span>
          </button>
        </div>

        {/* Drum Count: 2 vs 3 */}
        <div className="flex items-center p-0.5 bg-stone-950 rounded-lg border border-stone-800">
          <button
            onClick={() => onSetDrumCount(2)}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              drumCount === 2
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            2 Inks
          </button>
          <button
            onClick={() => onSetDrumCount(3)}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              drumCount === 3
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            3 Inks
          </button>
        </div>
      </div>

      {/* Center zone: View mode selector (Combined vs Solo Drums) */}
      <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
        <span className="text-[11px] text-stone-400 font-mono-code px-2">View:</span>
        <button
          onClick={() => onSetView('combined')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'combined'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Combined</span>
        </button>

        {/* Drum 1 Solo */}
        <button
          onClick={() => onSetView('drum1')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'drum1'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title={`Solo Drum 1 (${ink1?.name})`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-black/40"
            style={{ backgroundColor: ink1?.hex }}
          />
          <span>D1</span>
        </button>

        {/* Drum 2 Solo */}
        <button
          onClick={() => onSetView('drum2')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'drum2'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title={`Solo Drum 2 (${ink2?.name})`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-black/40"
            style={{ backgroundColor: ink2?.hex }}
          />
          <span>D2</span>
        </button>

        {/* Drum 3 Solo */}
        {drumCount === 3 && (
          <button
            onClick={() => onSetView('drum3')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeView === 'drum3'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title={`Solo Drum 3 (${ink3?.name})`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/40"
              style={{ backgroundColor: ink3?.hex }}
            />
            <span>D3</span>
          </button>
        )}
      </div>

      {/* Right zone: Tactile tools & Undo/Redo */}
      <div className="flex items-center gap-2">
        {/* Loupe Toggle */}
        <button
          onClick={onToggleLoupe}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
            loupeActive
              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
              : 'bg-stone-950 border-stone-800 text-stone-300 hover:text-stone-100'
          }`}
          title="Interactive 4x Halftone Loupe"
        >
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Loupe</span>
        </button>

        {/* Jiggle Misalignment */}
        <button
          onClick={onJiggleRegistration}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-stone-950 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700 transition-colors cursor-pointer"
          title="Nudge / Jiggle Drum Registration"
        >
          <Shuffle className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden sm:inline">Nudge</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center bg-stone-950 border border-stone-800 rounded-md">
          <button
            onClick={onZoomOut}
            className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={onZoomReset}
            className="px-1.5 py-1 text-[11px] font-mono-code text-stone-300 hover:text-white transition-colors cursor-pointer tabular-nums"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-stone-800" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onReset}
            className="p-1.5 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:text-rose-400 hover:border-rose-900 transition-colors cursor-pointer"
            title="Reset Studio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

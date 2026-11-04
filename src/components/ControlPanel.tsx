import React, { useState } from 'react';
import {
  CompositionItem,
  DotType,
  DrumConfig,
  SeparationMethod,
  ShapeType,
  StudioState,
} from '../types/riso';
import { RISO_INKS, PAPER_STOCKS, COLORWAY_PRESETS } from '../constants/risoInks';
import { POSTER_PRESETS, createSamplePhoto } from '../constants/presets';
import {
  Palette,
  Sliders,
  Layers,
  Sparkles,
  Type,
  Shapes,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Shuffle,
  Contrast,
  Sun,
  Flame,
  Check,
} from 'lucide-react';

interface ControlPanelProps {
  state: StudioState;
  onUpdateDrum: (drumId: 1 | 2 | 3, updates: Partial<DrumConfig>) => void;
  onApplyColorway: (presetName: string) => void;
  onSetPaperStock: (stockId: string) => void;
  onSetPaperGrain: (grain: number) => void;
  onToggleRollerMarks: () => void;
  onToggleRegistrationMarks: () => void;
  onJiggleRegistration: () => void;
  onSetSeparationMethod: (method: SeparationMethod) => void;
  onSetSeparationBalance: (bal: number) => void;
  onSetPhotoBrightness: (b: number) => void;
  onSetPhotoContrast: (c: number) => void;
  onTogglePhotoInvert: () => void;
  onUploadPhotoFile: (file: File) => void;
  onLoadSamplePhoto: (type: 'architecture' | 'botanical' | 'portrait') => void;
  onAddTextItem: () => void;
  onAddShapeItem: (shapeType: ShapeType) => void;
  onApplyPreset: (presetId: string) => void;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<CompositionItem>) => void;
  onDeleteItem: (id: string) => void;
}

type TabType = 'inks' | 'halftone' | 'registration' | 'source';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  state,
  onUpdateDrum,
  onApplyColorway,
  onSetPaperStock,
  onSetPaperGrain,
  onToggleRollerMarks,
  onToggleRegistrationMarks,
  onJiggleRegistration,
  onSetSeparationMethod,
  onSetSeparationBalance,
  onSetPhotoBrightness,
  onSetPhotoContrast,
  onTogglePhotoInvert,
  onUploadPhotoFile,
  onLoadSamplePhoto,
  onAddTextItem,
  onAddShapeItem,
  onApplyPreset,
  onSelectItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(state.mode === 'photo' ? 'source' : 'inks');
  const [editingDrum, setEditingDrum] = useState<1 | 2 | 3>(1);

  const currentDrum = state.drums[editingDrum - 1];
  const activePaper = PAPER_STOCKS.find(p => p.id === state.paperStockId) || PAPER_STOCKS[0];

  const selectedItem = state.items.find(it => it.id === state.selectedItemId);

  return (
    <aside className="w-80 sm:w-96 bg-stone-900 border-l border-stone-800 flex flex-col h-full shrink-0 z-20">
      {/* Tab Navigation */}
      <div className="flex items-center p-1 bg-stone-950 border-b border-stone-800 shrink-0">
        <button
          onClick={() => setActiveTab('inks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'inks'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span>Inks</span>
        </button>

        <button
          onClick={() => setActiveTab('halftone')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'halftone'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Halftone</span>
        </button>

        <button
          onClick={() => setActiveTab('registration')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'registration'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Paper & Shift</span>
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeTab === 'source'
              ? 'bg-stone-800 text-stone-100 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{state.mode === 'photo' ? 'Photo' : 'Layers'}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-stone-200 text-xs">
        {/* ================= INKS TAB ================= */}
        {activeTab === 'inks' && (
          <div className="space-y-6">
            {/* Drum Cylinder Shelf */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-300">Ink Drums</span>
                <span className="text-[11px] font-mono-code text-stone-400">
                  Select drum to swap ink
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {state.drums.slice(0, state.drumCount).map(drum => {
                  const ink = RISO_INKS.find(i => i.id === drum.inkId) || RISO_INKS[0];
                  const isSelected = editingDrum === drum.id;
                  return (
                    <button
                      key={drum.id}
                      onClick={() => setEditingDrum(drum.id)}
                      className={`relative flex flex-col items-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-stone-800/90 border-pink-500/80 shadow-md ring-1 ring-pink-500/50'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {/* Drum Ink Cylinder Pill */}
                      <div
                        className="w-10 h-10 rounded-full border-2 border-stone-800 shadow-inner mb-2 flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: ink.hex }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/30" />
                        <span className="font-mono-code font-bold text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          D{drum.id}
                        </span>
                      </div>
                      <span className="font-semibold text-stone-100 text-[11px] leading-tight truncate w-full">
                        {ink.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono-code mt-0.5">
                        {drum.angle}° · {drum.screenFrequency} LPI
                      </span>

                      {/* Drum Visibility Toggle */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onUpdateDrum(drum.id, { visible: !drum.visible });
                        }}
                        className={`mt-2 text-[10px] px-2 py-0.5 rounded font-mono-code ${
                          drum.visible
                            ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                            : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        {drum.visible ? 'Active' : 'Muted'}
                      </button>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ink Swatches Palette for Selected Drum */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-300">
                  Swatches for Drum {editingDrum}
                </span>
                <span className="text-[11px] font-mono-code text-pink-400">
                  {RISO_INKS.find(i => i.id === currentDrum.inkId)?.pantone}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {RISO_INKS.map(ink => {
                  const isCurrent = currentDrum.inkId === ink.id;
                  return (
                    <button
                      key={ink.id}
                      onClick={() => onUpdateDrum(editingDrum, { inkId: ink.id })}
                      className={`group relative aspect-square rounded-md border p-0.5 transition-transform hover:scale-105 cursor-pointer ${
                        isCurrent
                          ? 'border-white ring-2 ring-pink-500 shadow-md'
                          : 'border-stone-800 hover:border-stone-600'
                      }`}
                      style={{ backgroundColor: ink.hex }}
                      title={`${ink.name} (${ink.pantone})`}
                    >
                      {isCurrent && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Ink Details Description */}
              <div className="mt-3 p-3 bg-stone-950 rounded-lg border border-stone-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-stone-200">
                    {RISO_INKS.find(i => i.id === currentDrum.inkId)?.name}
                  </span>
                  <span className="font-mono-code text-[11px] text-stone-400">
                    {RISO_INKS.find(i => i.id === currentDrum.inkId)?.hex}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {RISO_INKS.find(i => i.id === currentDrum.inkId)?.description}
                </p>
              </div>
            </div>

            {/* Curated Colorway Presets */}
            <div>
              <span className="font-semibold text-stone-300 block mb-2">
                Curated Colorway Duos & Trios
              </span>
              <div className="grid grid-cols-2 gap-2">
                {COLORWAY_PRESETS.filter(p => p.count === state.drumCount).map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => onApplyColorway(preset.name)}
                    className="p-2.5 bg-stone-950 hover:bg-stone-800/80 border border-stone-800 rounded-lg text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/40 inline-block"
                        style={{
                          backgroundColor: RISO_INKS.find(i => i.id === preset.drum1)?.hex,
                        }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/40 inline-block"
                        style={{
                          backgroundColor: RISO_INKS.find(i => i.id === preset.drum2)?.hex,
                        }}
                      />
                      {preset.drum3 && (
                        <span
                          className="w-3 h-3 rounded-full border border-black/40 inline-block"
                          style={{
                            backgroundColor: RISO_INKS.find(i => i.id === preset.drum3)?.hex,
                          }}
                        />
                      )}
                    </div>
                    <span className="font-semibold text-[11px] text-stone-200 group-hover:text-pink-300 block">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-stone-400 line-clamp-1">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= HALFTONE TAB ================= */}
        {activeTab === 'halftone' && (
          <div className="space-y-6">
            {/* Halftone Screen Pattern Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-300">Dot Pattern</span>
                <span className="text-[11px] font-mono-code text-stone-400">
                  Drum {editingDrum}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
                {(['circle', 'line', 'dither', 'diamond'] as DotType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => onUpdateDrum(editingDrum, { dotType: type })}
                    className={`py-1.5 text-center rounded text-xs font-medium capitalize transition-colors cursor-pointer ${
                      currentDrum.dotType === type
                        ? 'bg-stone-800 text-stone-100 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Halftone Dot Frequency (LPI / Size) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-300">Halftone Size / Frequency</span>
                <span className="font-mono-code text-[11px] text-blue-400 tabular-nums">
                  {currentDrum.screenFrequency} LPI
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={48}
                step={2}
                value={currentDrum.screenFrequency}
                onChange={e =>
                  onUpdateDrum(editingDrum, { screenFrequency: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-500 h-1.5 bg-stone-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono-code">
                <span>Coarse Poster Dots (8 LPI)</span>
                <span>Fine Book (48 LPI)</span>
              </div>
            </div>

            {/* Screen Angles per Drum (Crucial for authentic Riso rosette pattern) */}
            <div className="space-y-3 p-3.5 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200">Screen Angles</span>
                <button
                  onClick={() => {
                    onUpdateDrum(1, { angle: 15 });
                    onUpdateDrum(2, { angle: 75 });
                    if (state.drumCount === 3) onUpdateDrum(3, { angle: 45 });
                  }}
                  className="text-[11px] text-pink-400 hover:text-pink-300 font-mono-code cursor-pointer"
                >
                  Reset Rosette (15°/75°/45°)
                </button>
              </div>

              {state.drums.slice(0, state.drumCount).map(d => (
                <div key={d.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Drum {d.id} Angle:</span>
                    <span className="font-mono-code text-stone-200 tabular-nums">{d.angle}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={d.angle}
                    onChange={e => onUpdateDrum(d.id, { angle: parseInt(e.target.value, 10) })}
                    className="w-full accent-stone-400 h-1 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Ink Opacity / Bleed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-300">Ink Translucency & Bleed</span>
                <span className="font-mono-code text-[11px] text-stone-400 tabular-nums">
                  {currentDrum.opacity}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={currentDrum.opacity}
                onChange={e =>
                  onUpdateDrum(editingDrum, { opacity: parseInt(e.target.value, 10) })
                }
                className="w-full accent-pink-500 h-1.5 bg-stone-950 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-stone-400 block">
                Simulates soy ink emulsion saturation and translucency over paper.
              </span>
            </div>
          </div>
        )}

        {/* ================= REGISTRATION & PAPER TAB ================= */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            {/* Paper Stock Selection */}
            <div>
              <span className="font-semibold text-stone-300 block mb-2">Paper Stock</span>
              <div className="grid grid-cols-2 gap-2">
                {PAPER_STOCKS.map(stock => {
                  const isSelected = state.paperStockId === stock.id;
                  return (
                    <button
                      key={stock.id}
                      onClick={() => onSetPaperStock(stock.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-stone-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-stone-600 inline-block"
                          style={{ backgroundColor: stock.hex }}
                        />
                        <span className="font-semibold text-[11px] text-stone-200">
                          {stock.name.split(' (')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block line-clamp-1">
                        {stock.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paper Grain Intensity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-300">Paper Grain & Fiber Tooth</span>
                <span className="font-mono-code text-[11px] text-amber-400 tabular-nums">
                  {state.paperGrain}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={state.paperGrain}
                onChange={e => onSetPaperGrain(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-1.5 bg-stone-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Layer Misalignment / Registration Offset */}
            <div className="space-y-4 p-3.5 bg-stone-950 rounded-lg border border-stone-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200">Layer Misalignment</span>
                <button
                  onClick={onJiggleRegistration}
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-mono-code cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Jiggle Shift</span>
                </button>
              </div>

              {/* Drum 2 Shift */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-300">Drum 2 Shift (X / Y)</span>
                  <span className="font-mono-code text-stone-400 tabular-nums">
                    {state.drums[1].offsetX}px, {state.drums[1].offsetY}px
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    value={state.drums[1].offsetX}
                    onChange={e =>
                      onUpdateDrum(2, { offsetX: parseInt(e.target.value, 10) })
                    }
                    className="accent-teal-500 h-1 bg-stone-800 rounded cursor-pointer"
                    title="X Offset"
                  />
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    value={state.drums[1].offsetY}
                    onChange={e =>
                      onUpdateDrum(2, { offsetY: parseInt(e.target.value, 10) })
                    }
                    className="accent-teal-500 h-1 bg-stone-800 rounded cursor-pointer"
                    title="Y Offset"
                  />
                </div>
              </div>

              {/* Drum 3 Shift (if active) */}
              {state.drumCount === 3 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-300">Drum 3 Shift (X / Y)</span>
                    <span className="font-mono-code text-stone-400 tabular-nums">
                      {state.drums[2].offsetX}px, {state.drums[2].offsetY}px
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      value={state.drums[2].offsetX}
                      onChange={e =>
                        onUpdateDrum(3, { offsetX: parseInt(e.target.value, 10) })
                      }
                      className="accent-teal-500 h-1 bg-stone-800 rounded cursor-pointer"
                      title="X Offset"
                    />
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      value={state.drums[2].offsetY}
                      onChange={e =>
                        onUpdateDrum(3, { offsetY: parseInt(e.target.value, 10) })
                      }
                      className="accent-teal-500 h-1 bg-stone-800 rounded cursor-pointer"
                      title="Y Offset"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Print Flaws & Artifacts */}
            <div className="space-y-3 p-3.5 bg-stone-950 rounded-lg border border-stone-800">
              <span className="font-semibold text-stone-200 block">Mechanical Print Flaws</span>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-stone-300 block">Feed Roller Track</span>
                  <span className="text-[10px] text-stone-400">
                    Iconic faint rubber tire compression line along edge
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={state.feedRollerMarks}
                  onChange={onToggleRollerMarks}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-stone-300 block">Registration Crosshairs</span>
                  <span className="text-[10px] text-stone-400">
                    Corner alignment targets and color check strip
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={state.registrationMarks}
                  onChange={onToggleRegistrationMarks}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* ================= SOURCE / CONTENT TAB ================= */}
        {activeTab === 'source' && (
          <div className="space-y-6">
            {state.mode === 'photo' ? (
              /* Photo Separation Controls */
              <div className="space-y-5">
                {/* File Upload Zone */}
                <div>
                  <span className="font-semibold text-stone-300 block mb-2">Upload Photo</span>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-700 hover:border-pink-500/80 rounded-lg bg-stone-950 cursor-pointer transition-colors group">
                    <Upload className="w-6 h-6 text-stone-400 group-hover:text-pink-400 mb-1.5 transition-colors" />
                    <span className="font-medium text-stone-200 group-hover:text-white">
                      Click to choose photo or drop here
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      JPG, PNG, WebP supported
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          onUploadPhotoFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Built-in Sample Photos for Immediate Testing */}
                <div>
                  <span className="font-semibold text-stone-300 block mb-2">
                    Curated High-Contrast Test Photos
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onLoadSamplePhoto('architecture')}
                      className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-center transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[11px] text-stone-200 block">
                        Architecture
                      </span>
                      <span className="text-[9px] text-stone-400">Bauhaus Facade</span>
                    </button>
                    <button
                      onClick={() => onLoadSamplePhoto('botanical')}
                      className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-center transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[11px] text-stone-200 block">
                        Botanical
                      </span>
                      <span className="text-[9px] text-stone-400">Monstera & Fern</span>
                    </button>
                    <button
                      onClick={() => onLoadSamplePhoto('portrait')}
                      className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-center transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[11px] text-stone-200 block">
                        Portrait
                      </span>
                      <span className="text-[9px] text-stone-400">Rimlight Silhouette</span>
                    </button>
                  </div>
                </div>

                {/* Separation Method */}
                <div>
                  <span className="font-semibold text-stone-300 block mb-2">
                    Separation Algorithm
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'luminance-split', label: 'Tonal Bands' },
                        { id: 'spectral-cmy', label: 'Subtractive CMY' },
                        { id: 'posterize', label: 'Graphic Poster' },
                        { id: 'duotone', label: 'Duotone Ramp' },
                      ] as { id: SeparationMethod; label: string }[]
                    ).map(m => (
                      <button
                        key={m.id}
                        onClick={() => onSetSeparationMethod(m.id)}
                        className={`p-2 rounded-lg border text-left font-medium transition-colors cursor-pointer ${
                          state.separationMethod === m.id
                            ? 'bg-stone-800 border-emerald-500/80 text-emerald-300 shadow-sm'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Separation Balance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-300">Separation Balance</span>
                    <span className="font-mono-code text-[11px] text-stone-400 tabular-nums">
                      {state.separationBalance}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={state.separationBalance}
                    onChange={e => onSetSeparationBalance(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 h-1.5 bg-stone-950 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono-code">
                    <span>Shift to Drum 1</span>
                    <span>Shift to Drum {state.drumCount}</span>
                  </div>
                </div>

                {/* Photo Tone: Contrast & Brightness */}
                <div className="space-y-3 p-3.5 bg-stone-950 rounded-lg border border-stone-800">
                  <span className="font-semibold text-stone-200 block">Photo Tone Adjustments</span>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-stone-400">
                        <Contrast className="w-3 h-3" />
                        <span>Contrast</span>
                      </span>
                      <span className="font-mono-code text-stone-300 tabular-nums">
                        {state.photoContrast}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      step={5}
                      value={state.photoContrast}
                      onChange={e => onSetPhotoContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-stone-300 h-1 bg-stone-800 rounded cursor-pointer"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-stone-400">
                        <Sun className="w-3 h-3" />
                        <span>Brightness</span>
                      </span>
                      <span className="font-mono-code text-stone-300 tabular-nums">
                        {state.photoBrightness > 0 ? `+${state.photoBrightness}` : state.photoBrightness}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      step={5}
                      value={state.photoBrightness}
                      onChange={e => onSetPhotoBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-stone-300 h-1 bg-stone-800 rounded cursor-pointer"
                    />
                  </div>

                  {/* Invert */}
                  <label className="flex items-center justify-between pt-1 cursor-pointer">
                    <span className="text-stone-300">Invert Black & White</span>
                    <input
                      type="checkbox"
                      checked={state.photoInvert}
                      onChange={onTogglePhotoInvert}
                      className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            ) : (
              /* Vector Composition & Layer Controls */
              <div className="space-y-6">
                {/* Poster Presets */}
                <div>
                  <span className="font-semibold text-stone-300 block mb-2">Preset Layouts</span>
                  <div className="grid grid-cols-2 gap-2">
                    {POSTER_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => onApplyPreset(preset.id)}
                        className="p-2.5 bg-stone-950 hover:bg-stone-800/90 border border-stone-800 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <span className="font-semibold text-[11px] text-stone-200 group-hover:text-pink-300 block truncate">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {preset.category} · {preset.drumCount} Inks
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Content Buttons */}
                <div>
                  <span className="font-semibold text-stone-300 block mb-2">Add Elements</span>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={onAddTextItem}
                      className="flex items-center justify-center gap-1.5 p-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg font-semibold text-stone-200 transition-colors cursor-pointer"
                    >
                      <Type className="w-3.5 h-3.5 text-pink-400" />
                      <span>Add Text</span>
                    </button>
                    <button
                      onClick={() => onAddShapeItem('circle')}
                      className="flex items-center justify-center gap-1.5 p-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg font-semibold text-stone-200 transition-colors cursor-pointer"
                    >
                      <Shapes className="w-3.5 h-3.5 text-blue-400" />
                      <span>Add Circle</span>
                    </button>
                  </div>

                  {/* Quick Shapes Palette */}
                  <div className="grid grid-cols-4 gap-1.5 bg-stone-950 p-1.5 rounded-lg border border-stone-800">
                    {(
                      [
                        { id: 'rectangle', label: 'Box' },
                        { id: 'star', label: 'Star' },
                        { id: 'sunburst', label: 'Burst' },
                        { id: 'arch', label: 'Arch' },
                        { id: 'wave', label: 'Wave' },
                        { id: 'badge', label: 'Badge' },
                        { id: 'stamp', label: 'Stamp' },
                        { id: 'grid', label: 'Grid' },
                      ] as { id: ShapeType; label: string }[]
                    ).map(s => (
                      <button
                        key={s.id}
                        onClick={() => onAddShapeItem(s.id)}
                        className="py-1 px-1.5 text-center rounded bg-stone-900 hover:bg-stone-800 text-[11px] text-stone-300 font-medium transition-colors cursor-pointer"
                      >
                        +{s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Item Editor (Inline) */}
                {selectedItem && (
                  <div className="p-3.5 bg-stone-950 rounded-lg border border-pink-500/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-pink-400">
                        Editing {selectedItem.type === 'text' ? 'Text' : selectedItem.shapeType}
                      </span>
                      <button
                        onClick={() => onDeleteItem(selectedItem.id)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Delete Element"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {selectedItem.type === 'text' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-stone-400 block">Text Content</label>
                        <input
                          type="text"
                          value={selectedItem.text || ''}
                          onChange={e => onUpdateItem(selectedItem.id, { text: e.target.value })}
                          className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-stone-100 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] text-stone-400 block">Font</label>
                            <select
                              value={selectedItem.fontFamily || 'Bricolage Grotesque'}
                              onChange={e =>
                                onUpdateItem(selectedItem.id, { fontFamily: e.target.value })
                              }
                              className="w-full bg-stone-900 border border-stone-700 rounded px-1.5 py-1 text-stone-200 text-[11px]"
                            >
                              <option value="Bricolage Grotesque">Bricolage Grotesque</option>
                              <option value="Space Mono">Space Mono</option>
                              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 block">Size</label>
                            <input
                              type="range"
                              min={12}
                              max={64}
                              value={selectedItem.fontSize || 32}
                              onChange={e =>
                                onUpdateItem(selectedItem.id, {
                                  fontSize: parseInt(e.target.value, 10),
                                })
                              }
                              className="w-full accent-pink-500 h-1 bg-stone-800 rounded cursor-pointer mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rotation slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>Rotation</span>
                        <span className="font-mono-code tabular-nums">
                          {selectedItem.rotation || 0}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={5}
                        value={selectedItem.rotation || 0}
                        onChange={e =>
                          onUpdateItem(selectedItem.id, {
                            rotation: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-stone-400 h-1 bg-stone-800 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Layer Stack */}
                <div className="space-y-2">
                  <span className="font-semibold text-stone-300 block">
                    Layers ({state.items.length})
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {state.items.map((item, idx) => {
                      const isSelected = item.id === state.selectedItemId;
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectItem(item.id)}
                          className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-stone-800 border-pink-500/80 text-stone-100'
                              : 'bg-stone-950 border-stone-800/80 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono-code text-stone-400">
                              #{idx + 1}
                            </span>
                            <span className="truncate font-medium text-[11px]">
                              {item.type === 'text' ? `"${item.text}"` : item.shapeType}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono-code px-1.5 py-0.5 rounded font-bold ${
                              item.drum === 'drum1'
                                ? 'bg-pink-900/60 text-pink-300'
                                : item.drum === 'drum2'
                                ? 'bg-blue-900/60 text-blue-300'
                                : item.drum === 'drum3'
                                ? 'bg-amber-900/60 text-amber-300'
                                : 'bg-purple-900/60 text-purple-300'
                            }`}
                          >
                            {item.drum.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

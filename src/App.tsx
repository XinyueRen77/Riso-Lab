/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CompositionItem,
  DrumConfig,
  SeparationMethod,
  ShapeType,
  StudioMode,
  StudioState,
  ViewMode,
} from './types/riso';
import { RISO_INKS, PAPER_STOCKS, COLORWAY_PRESETS } from './constants/risoInks';
import { POSTER_PRESETS, createSamplePhoto } from './constants/presets';
import {
  compositeRisoPrint,
  renderCompositionToStencil,
  separatePhotoToStencils,
} from './utils/risoEngine';
import { Header } from './components/Header';
import { HistoryToolbar } from './components/HistoryToolbar';
import { CanvasView } from './components/CanvasView';
import { ControlPanel } from './components/ControlPanel';
import { ExportModal } from './components/ExportModal';
import { MasterStencilsModal } from './components/MasterStencilsModal';
import { ShortcutsModal } from './components/ShortcutsModal';

const INITIAL_STATE: StudioState = {
  mode: 'compose',
  drumCount: 3,
  drums: [
    {
      id: 1,
      inkId: 'fluo-pink',
      angle: 15,
      screenFrequency: 22,
      dotType: 'circle',
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      threshold: 50,
      contrast: 100,
      invert: false,
      opacity: 92,
      visible: true,
    },
    {
      id: 2,
      inkId: 'aqua',
      angle: 75,
      screenFrequency: 22,
      dotType: 'circle',
      offsetX: 4,
      offsetY: -3,
      rotation: 0.2,
      threshold: 50,
      contrast: 100,
      invert: false,
      opacity: 92,
      visible: true,
    },
    {
      id: 3,
      inkId: 'black',
      angle: 45,
      screenFrequency: 22,
      dotType: 'circle',
      offsetX: -2,
      offsetY: 2,
      rotation: -0.1,
      threshold: 50,
      contrast: 100,
      invert: false,
      opacity: 95,
      visible: true,
    },
  ],
  paperStockId: 'warm-newsprint',
  paperGrain: 45,
  feedRollerMarks: false,
  registrationMarks: true,
  activeView: 'combined',
  loupeActive: false,
  separationMethod: 'luminance-split',
  separationBalance: 50,
  photoDataUrl: null,
  photoBrightness: 0,
  photoContrast: 100,
  photoInvert: false,
  items: POSTER_PRESETS[0].items,
  selectedItemId: null,
};

export default function App() {
  const [state, setState] = useState<StudioState>(INITIAL_STATE);
  const [history, setHistory] = useState<StudioState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [zoom, setZoom] = useState(1.0);
  const [isRendering, setIsRendering] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMastersOpen, setIsMastersOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Canvas Refs
  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stencilsRef = useRef<[HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement | null]>([
    document.createElement('canvas'),
    document.createElement('canvas'),
    document.createElement('canvas'),
  ]);

  // Push new state to undo/redo history
  const updateState = useCallback(
    (updater: (prev: StudioState) => StudioState, recordHistory = true) => {
      setState(prev => {
        const next = updater(prev);
        if (recordHistory) {
          setHistory(h => {
            const trimmed = h.slice(0, historyIndex + 1);
            return [...trimmed, next].slice(-30); // keep max 30 snapshots
          });
          setHistoryIndex(i => Math.min(i + 1, 29));
        }
        return next;
      });
    },
    [historyIndex]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setState(history[targetIndex]);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setState(history[targetIndex]);
    }
  }, [history, historyIndex]);

  // Reset
  const handleReset = useCallback(() => {
    if (window.confirm('Reset studio to default layout and settings?')) {
      updateState(() => INITIAL_STATE);
    }
  }, [updateState]);

  // Renders the print canvas
  const renderStudio = useCallback(() => {
    if (!renderCanvasRef.current) return;
    const canvas = renderCanvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    setIsRendering(true);

    if (state.mode === 'compose') {
      // 1. Generate grayscale stencils from vector composition items
      const s1 = renderCompositionToStencil(state.items, 1, width, height);
      const s2 = renderCompositionToStencil(state.items, 2, width, height);
      const s3 =
        state.drumCount === 3
          ? renderCompositionToStencil(state.items, 3, width, height)
          : null;

      stencilsRef.current = [s1, s2, s3];
      compositeRisoPrint(canvas, state, [s1, s2, s3]);
      setIsRendering(false);
    } else {
      // 2. Photo separation mode
      const processPhoto = (img: HTMLImageElement) => {
        const [s1, s2, s3] = separatePhotoToStencils(
          img,
          state.separationMethod,
          state.drumCount,
          state.drums,
          state.separationBalance,
          state.photoBrightness,
          state.photoContrast,
          state.photoInvert,
          width,
          height
        );
        stencilsRef.current = [s1, s2, s3];
        compositeRisoPrint(canvas, state, [s1, s2, s3]);
        setIsRendering(false);
      };

      if (state.photoDataUrl) {
        const img = new Image();
        img.onload = () => processPhoto(img);
        img.src = state.photoDataUrl;
      } else {
        // Fallback to sample photo if no photo uploaded
        const sampleUrl = createSamplePhoto('architecture');
        const img = new Image();
        img.onload = () => processPhoto(img);
        img.src = sampleUrl;
      }
    }
  }, [state]);

  // Render whenever state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      renderStudio();
    }, 16);
    return () => clearTimeout(timer);
  }, [renderStudio]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl + Y
      else if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Loupe: L
      else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        updateState(s => ({ ...s, loupeActive: !s.loupeActive }), false);
      }
      // Jiggle Misalignment: J
      else if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handleJiggleRegistration();
      }
      // Views: 0, 1, 2, 3
      else if (e.key === '0' || e.key.toLowerCase() === 'c') {
        updateState(s => ({ ...s, activeView: 'combined' }), false);
      } else if (e.key === '1') {
        updateState(s => ({ ...s, activeView: 'drum1' }), false);
      } else if (e.key === '2') {
        updateState(s => ({ ...s, activeView: 'drum2' }), false);
      } else if (e.key === '3' && state.drumCount === 3) {
        updateState(s => ({ ...s, activeView: 'drum3' }), false);
      }
      // Delete selected item
      else if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedItemId) {
        e.preventDefault();
        handleDeleteItem(state.selectedItemId);
      }
      // Zoom + / -
      else if (e.key === '=' || e.key === '+') {
        setZoom(z => Math.min(2.5, z + 0.1));
      } else if (e.key === '-') {
        setZoom(z => Math.max(0.5, z - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, state.drumCount, state.selectedItemId, updateState]);

  // Handlers for controls
  const handleUpdateDrum = (drumId: 1 | 2 | 3, updates: Partial<DrumConfig>) => {
    updateState(prev => {
      const nextDrums = [...prev.drums] as [DrumConfig, DrumConfig, DrumConfig];
      nextDrums[drumId - 1] = { ...nextDrums[drumId - 1], ...updates };
      return { ...prev, drums: nextDrums };
    });
  };

  const handleApplyColorway = (presetName: string) => {
    const preset = COLORWAY_PRESETS.find(p => p.name === presetName);
    if (!preset) return;
    updateState(prev => {
      const nextDrums = [...prev.drums] as [DrumConfig, DrumConfig, DrumConfig];
      nextDrums[0] = { ...nextDrums[0], inkId: preset.drum1 };
      nextDrums[1] = { ...nextDrums[1], inkId: preset.drum2 };
      if (preset.drum3) {
        nextDrums[2] = { ...nextDrums[2], inkId: preset.drum3 };
      }
      return { ...prev, drums: nextDrums, drumCount: preset.count };
    });
  };

  const handleJiggleRegistration = () => {
    updateState(prev => {
      const nextDrums = [...prev.drums] as [DrumConfig, DrumConfig, DrumConfig];
      // Random authentic mechanical misalignment
      nextDrums[1] = {
        ...nextDrums[1],
        offsetX: Math.round((Math.random() - 0.5) * 16),
        offsetY: Math.round((Math.random() - 0.5) * 16),
        rotation: Number(((Math.random() - 0.5) * 0.8).toFixed(1)),
      };
      if (prev.drumCount === 3) {
        nextDrums[2] = {
          ...nextDrums[2],
          offsetX: Math.round((Math.random() - 0.5) * 18),
          offsetY: Math.round((Math.random() - 0.5) * 18),
          rotation: Number(((Math.random() - 0.5) * 0.8).toFixed(1)),
        };
      }
      return { ...prev, drums: nextDrums };
    });
  };

  // Upload photo
  const handleUploadPhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        updateState(prev => ({
          ...prev,
          mode: 'photo',
          photoDataUrl: dataUrl,
          activeView: 'combined',
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Load sample photo
  const handleLoadSamplePhoto = (type: 'architecture' | 'botanical' | 'portrait') => {
    const dataUrl = createSamplePhoto(type);
    updateState(prev => ({
      ...prev,
      mode: 'photo',
      photoDataUrl: dataUrl,
      activeView: 'combined',
    }));
  };

  // Apply preset poster layout
  const handleApplyPreset = (presetId: string) => {
    const preset = POSTER_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    updateState(prev => {
      const nextDrums = [...prev.drums] as [DrumConfig, DrumConfig, DrumConfig];
      nextDrums[0] = { ...nextDrums[0], inkId: preset.drum1 };
      nextDrums[1] = { ...nextDrums[1], inkId: preset.drum2 };
      nextDrums[2] = { ...nextDrums[2], inkId: preset.drum3 };

      return {
        ...prev,
        mode: 'compose',
        drumCount: preset.drumCount,
        paperStockId: preset.paperStockId,
        drums: nextDrums,
        items: preset.items,
        selectedItemId: null,
      };
    });
  };

  // Composition Item Handlers
  const handleAddTextItem = () => {
    const newItem: CompositionItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'PRINT CULTURE',
      fontFamily: 'Bricolage Grotesque',
      fontSize: 34,
      fontWeight: '800',
      letterSpacing: 1,
      textAlign: 'center',
      x: 50,
      y: 50,
      width: 80,
      height: 12,
      rotation: 0,
      zIndex: state.items.length + 1,
      drum: 'drum1',
      tint: 100,
    };
    updateState(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      selectedItemId: newItem.id,
    }));
  };

  const handleAddShapeItem = (shapeType: ShapeType) => {
    const newItem: CompositionItem = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 50,
      y: 50,
      width: 36,
      height: 36,
      rotation: 0,
      zIndex: state.items.length + 1,
      drum: state.drumCount === 3 ? 'drum2' : 'drum1',
      tint: 100,
      filled: true,
      strokeWidth: 3,
    };
    updateState(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      selectedItemId: newItem.id,
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<CompositionItem>) => {
    updateState(prev => ({
      ...prev,
      items: prev.items.map(it => (it.id === id ? { ...it, ...updates } : it)),
    }));
  };

  const handleDeleteItem = (id: string) => {
    updateState(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id),
      selectedItemId: prev.selectedItemId === id ? null : prev.selectedItemId,
    }));
  };

  const handleDuplicateItem = (id: string) => {
    const item = state.items.find(it => it.id === id);
    if (!item) return;
    const duplicated: CompositionItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      x: Math.min(90, item.x + 5),
      y: Math.min(90, item.y + 5),
      zIndex: state.items.length + 1,
    };
    updateState(prev => ({
      ...prev,
      items: [...prev.items, duplicated],
      selectedItemId: duplicated.id,
    }));
  };

  const handleReorderItem = (id: string, dir: 'up' | 'down') => {
    updateState(prev => {
      const idx = prev.items.findIndex(it => it.id === id);
      if (idx === -1) return prev;
      const targetIdx = dir === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.items.length) return prev;

      const newItems = [...prev.items];
      const temp = newItems[idx];
      newItems[idx] = newItems[targetIdx];
      newItems[targetIdx] = temp;

      return {
        ...prev,
        items: newItems.map((it, i) => ({ ...it, zIndex: i + 1 })),
      };
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 font-sans select-none">
      {/* Top Bar Navigation */}
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenMasters={() => setIsMastersOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        drumCount={state.drumCount}
        onSelectPresetsTab={() => {
          updateState(prev => ({ ...prev, mode: 'compose' }), false);
        }}
      />

      {/* Action and History Toolbar */}
      <HistoryToolbar
        mode={state.mode}
        onSetMode={m => updateState(s => ({ ...s, mode: m }))}
        drumCount={state.drumCount}
        onSetDrumCount={c => updateState(s => ({ ...s, drumCount: c }))}
        activeView={state.activeView}
        onSetView={v => updateState(s => ({ ...s, activeView: v }), false)}
        drums={state.drums}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        loupeActive={state.loupeActive}
        onToggleLoupe={() =>
          updateState(s => ({ ...s, loupeActive: !s.loupeActive }), false)
        }
        onJiggleRegistration={handleJiggleRegistration}
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(2.5, z + 0.1))}
        onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))}
        onZoomReset={() => setZoom(1.0)}
      />

      {/* Main Studio Workspace Split */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Large Tactile Print Canvas Bed */}
        <CanvasView
          state={state}
          renderCanvasRef={renderCanvasRef}
          zoom={zoom}
          onSelectItem={id => updateState(s => ({ ...s, selectedItemId: id }), false)}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onDuplicateItem={handleDuplicateItem}
          onReorderItem={handleReorderItem}
          onUploadPhoto={handleUploadPhotoFile}
          isRendering={isRendering}
        />

        {/* Studio Controls Sidebar */}
        <ControlPanel
          state={state}
          onUpdateDrum={handleUpdateDrum}
          onApplyColorway={handleApplyColorway}
          onSetPaperStock={stockId => updateState(s => ({ ...s, paperStockId: stockId }))}
          onSetPaperGrain={grain => updateState(s => ({ ...s, paperGrain: grain }))}
          onToggleRollerMarks={() =>
            updateState(s => ({ ...s, feedRollerMarks: !s.feedRollerMarks }))
          }
          onToggleRegistrationMarks={() =>
            updateState(s => ({ ...s, registrationMarks: !s.registrationMarks }))
          }
          onJiggleRegistration={handleJiggleRegistration}
          onSetSeparationMethod={method =>
            updateState(s => ({ ...s, separationMethod: method }))
          }
          onSetSeparationBalance={bal =>
            updateState(s => ({ ...s, separationBalance: bal }))
          }
          onSetPhotoBrightness={b => updateState(s => ({ ...s, photoBrightness: b }))}
          onSetPhotoContrast={c => updateState(s => ({ ...s, photoContrast: c }))}
          onTogglePhotoInvert={() =>
            updateState(s => ({ ...s, photoInvert: !s.photoInvert }))
          }
          onUploadPhotoFile={handleUploadPhotoFile}
          onLoadSamplePhoto={handleLoadSamplePhoto}
          onAddTextItem={handleAddTextItem}
          onAddShapeItem={handleAddShapeItem}
          onApplyPreset={handleApplyPreset}
          onSelectItem={id => updateState(s => ({ ...s, selectedItemId: id }), false)}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      </div>

      {/* Export Print Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        renderCanvas={renderCanvasRef.current}
        stencils={stencilsRef.current}
        state={state}
      />

      {/* Monochrome Master Stencils Modal */}
      <MasterStencilsModal
        isOpen={isMastersOpen}
        onClose={() => setIsMastersOpen(false)}
        stencils={stencilsRef.current}
        state={state}
      />

      {/* Guide and Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

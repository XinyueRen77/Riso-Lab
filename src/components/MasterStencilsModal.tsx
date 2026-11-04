import React from 'react';
import { X, Download, Layers } from 'lucide-react';
import { StudioState } from '../types/riso';
import { RISO_INKS } from '../constants/risoInks';

interface MasterStencilsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stencils: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement | null];
  state: StudioState;
}

export const MasterStencilsModal: React.FC<MasterStencilsModalProps> = ({
  isOpen,
  onClose,
  stencils,
  state,
}) => {
  if (!isOpen) return null;

  const handleDownloadStencil = (drumNum: 1 | 2 | 3) => {
    const stencilCanvas = stencils[drumNum - 1];
    if (!stencilCanvas) return;
    const drum = state.drums[drumNum - 1];
    const ink = RISO_INKS.find(i => i.id === drum.inkId);
    const inkName = ink?.name.toLowerCase().replace(/\s+/g, '_') || `drum${drumNum}`;

    const link = document.createElement('a');
    link.download = `riso_stencil_drum${drumNum}_${inkName}.png`;
    link.href = stencilCanvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-display font-bold text-lg text-stone-100">
                Monochrome Master Stencils
              </h3>
              <p className="text-xs text-stone-400">
                Inspect the grayscale thermal master sheets before ink drum application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plates Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {state.drums.slice(0, state.drumCount).map(drum => {
              const ink = RISO_INKS.find(i => i.id === drum.inkId);
              const stencil = stencils[drum.id - 1];
              return (
                <div
                  key={drum.id}
                  className="bg-stone-950 p-4 rounded-lg border border-stone-800 flex flex-col items-center"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: ink?.hex }}
                      />
                      <span className="font-semibold text-xs text-stone-200">
                        Drum {drum.id}: {ink?.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono-code text-stone-400">
                      {drum.angle}° · {drum.screenFrequency} LPI
                    </span>
                  </div>

                  {/* Stencil Image */}
                  <div className="w-full aspect-[3/4] bg-white rounded border border-stone-700/60 overflow-hidden flex items-center justify-center shadow-inner mb-3">
                    {stencil ? (
                      <img
                        src={stencil.toDataURL()}
                        alt={`Master Stencil Drum ${drum.id}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-stone-500">Empty Plate</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownloadStencil(drum.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium text-xs rounded border border-stone-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master Plate</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Download, Copy, Check, Layers, Image as ImageIcon } from 'lucide-react';
import { DrumConfig, StudioState } from '../types/riso';
import { RISO_INKS } from '../constants/risoInks';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  renderCanvas: HTMLCanvasElement | null;
  stencils: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement | null];
  state: StudioState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  renderCanvas,
  stencils,
  state,
}) => {
  const [resolution, setResolution] = useState<'standard' | 'high'>('high');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !renderCanvas) return null;

  // Download combined print PNG
  const handleDownloadCombined = () => {
    setIsExporting(true);
    const link = document.createElement('a');
    link.download = `risograph_print_${Date.now()}.png`;
    link.href = renderCanvas.toDataURL('image/png', 1.0);
    link.click();
    setIsExporting(false);
  };

  // Copy composite to clipboard
  const handleCopyToClipboard = async () => {
    try {
      renderCanvas.toBlob(async blob => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  // Download individual drum master stencil
  const handleDownloadStencil = (drumNum: 1 | 2 | 3) => {
    const stencilCanvas = stencils[drumNum - 1];
    if (!stencilCanvas) return;
    const drum = state.drums[drumNum - 1];
    const ink = RISO_INKS.find(i => i.id === drum.inkId);
    const inkName = ink?.name.toLowerCase().replace(/\s+/g, '_') || `drum${drumNum}`;

    const link = document.createElement('a');
    link.download = `riso_master_drum${drumNum}_${inkName}_${drum.angle}deg_${drum.screenFrequency}lpi.png`;
    link.href = stencilCanvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Download all drum master stencils together
  const handleDownloadAllStencils = () => {
    handleDownloadStencil(1);
    setTimeout(() => handleDownloadStencil(2), 200);
    if (state.drumCount === 3 && stencils[2]) {
      setTimeout(() => handleDownloadStencil(3), 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <div>
            <h3 className="font-display font-bold text-lg text-stone-100">Export Risograph Print</h3>
            <p className="text-xs text-stone-400">
              Download merged artistic proof or color-separated B&W master plates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preview Image */}
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-48 h-64 shrink-0 bg-stone-950 border border-stone-800 rounded shadow-md overflow-hidden flex items-center justify-center">
              <img
                src={renderCanvas.toDataURL()}
                alt="Riso Print Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <span className="font-semibold text-stone-200 block text-sm">
                  Full Composite Print (PNG)
                </span>
                <p className="text-xs text-stone-400 mt-1">
                  High-fidelity output featuring paper fiber tooth, halftone screening rosettes,
                  and translucent soy-ink multiply overprints.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleDownloadCombined}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-white text-stone-950 font-semibold text-xs rounded-lg transition-all shadow cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 text-stone-900" />
                  <span>Download Full Print PNG</span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs rounded-lg border border-stone-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-stone-200 block text-sm">
                  Riso Drum Master Stencils (Separation Sheets)
                </span>
                <p className="text-xs text-stone-400 mt-0.5">
                  Black-and-white master files ready to burn onto thermal master sheets for real Risograph machines
                </p>
              </div>
              <button
                onClick={handleDownloadAllStencils}
                className="text-xs text-pink-400 hover:text-pink-300 font-mono-code cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Plates</span>
              </button>
            </div>

            {/* Master plates list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {state.drums.slice(0, state.drumCount).map(drum => {
                const ink = RISO_INKS.find(i => i.id === drum.inkId);
                const stencilCanvas = stencils[drum.id - 1];
                return (
                  <div
                    key={drum.id}
                    className="p-3 bg-stone-950 rounded-lg border border-stone-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: ink?.hex }}
                        />
                        <span className="font-semibold text-xs text-stone-200">
                          Drum {drum.id}: {ink?.name}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono-code text-stone-400 space-y-0.5 mb-3">
                        <div>Angle: {drum.angle}°</div>
                        <div>LPI: {drum.screenFrequency}</div>
                        <div>Pattern: {drum.dotType}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadStencil(drum.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded text-xs border border-stone-800 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Plate {drum.id} PNG</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

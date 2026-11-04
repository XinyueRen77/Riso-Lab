import React from 'react';
import { X, Keyboard, HelpCircle } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'L', description: 'Toggle 4× Halftone Proofing Loupe' },
    { key: 'J', description: 'Nudge & Jiggle Layer Misalignment' },
    { key: 'Ctrl/Cmd + Z', description: 'Undo last change' },
    { key: 'Ctrl/Cmd + Shift + Z', description: 'Redo' },
    { key: '1 / 2 / 3', description: 'Solo Drum 1, 2, or 3 color pass' },
    { key: '0 / C', description: 'Combined Overprint View' },
    { key: 'Delete / Backspace', description: 'Delete selected layer in compose mode' },
    { key: '+ / -', description: 'Zoom In / Out on print bed' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-lg text-stone-100">
                Risograph Studio Guide
              </h3>
              <p className="text-xs text-stone-400">
                Printmaking physics & handy keyboard shortcuts
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-stone-300 overflow-y-auto">
          {/* Quick Riso Intro */}
          <div className="p-3.5 bg-stone-950 rounded-lg border border-stone-800 space-y-2">
            <h4 className="font-semibold text-stone-100">How Risograph Printing Works</h4>
            <p className="text-stone-400 leading-relaxed">
              Invented by the Riso Kagaku Corporation in Japan, the Risograph uses physical drum cylinders
              and soy-oil or rice-bran ink to print one color pass at a time through fine perforated master stencils.
              Because the translucent ink absorbs into the uncoated paper fibers, colors multiply into secondary
              tones (e.g. Fluorescent Pink + Sunflower Yellow = Vivid Neon Orange).
            </p>
          </div>

          {/* Keyboard Shortcuts List */}
          <div>
            <span className="font-semibold text-stone-200 block mb-3 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-pink-400" />
              <span>Keyboard Shortcuts</span>
            </span>

            <div className="space-y-2">
              {shortcuts.map(s => (
                <div
                  key={s.key}
                  className="flex items-center justify-between p-2 rounded bg-stone-950 border border-stone-800/80"
                >
                  <span className="text-stone-300">{s.description}</span>
                  <kbd className="px-2 py-0.5 bg-stone-800 text-stone-200 font-mono-code text-[11px] rounded border border-stone-700 shadow-xs">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

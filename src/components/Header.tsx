import React from 'react';
import { Download, Layers, Palette, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenMasters: () => void;
  onOpenShortcuts: () => void;
  drumCount: 2 | 3;
  onSelectPresetsTab: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenMasters,
  onOpenShortcuts,
  drumCount,
  onSelectPresetsTab,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-stone-950 border-b border-stone-800 shrink-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-sm bg-gradient-to-tr from-[#FF48B0] via-[#FFB511] to-[#0078BF] p-0.5 shadow-sm group-hover:rotate-6 transition-transform">
            <div className="w-full h-full bg-stone-950 flex items-center justify-center">
              <span className="font-display font-black text-xs text-white">R</span>
            </div>
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight text-stone-100 whitespace-nowrap">
            RISO LAB
          </span>
        </a>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-800 text-xs text-stone-400 font-mono-code">
          <span>DIY Studio</span>
          <span aria-hidden="true">·</span>
          <span>{drumCount}-Drum Press</span>
        </div>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
        <button
          onClick={onSelectPresetsTab}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-stone-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Presets</span>
        </button>
        <button
          onClick={onOpenMasters}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-stone-300"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Master Plates</span>
        </button>
        <button
          onClick={onOpenShortcuts}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 text-stone-400 hover:text-stone-200"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-white active:scale-95 rounded-md transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-stone-900" />
          <span>Export Print</span>
        </button>
      </div>
    </header>
  );
};

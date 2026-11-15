import React from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';

interface ReceptionActionBarProps {
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isDisabled: boolean;
}

export const ReceptionActionBar: React.FC<ReceptionActionBarProps> = ({
  onReset,
  onSubmit,
  submitting,
  isDisabled,
}) => {
  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-6 z-30 shadow-2xl flex items-center justify-between gap-4 transition-all">
      <button
        type="button"
        onClick={onReset}
        className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 text-xs border border-slate-300 transition shadow-xs active:scale-95 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset</span>
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || isDisabled}
        className="bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-7 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm transition shadow-lg shadow-red-600/25 disabled:opacity-50 active:scale-95 cursor-pointer"
      >
        <span>{submitting ? 'Menyimpan Work Order...' : 'Simpan Work Order'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
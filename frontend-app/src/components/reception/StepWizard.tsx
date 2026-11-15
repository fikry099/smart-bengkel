import React from 'react';
import { Check } from 'lucide-react';

interface StepWizardProps {
  isStep1Complete: boolean;
  isStep2Complete: boolean;
}

export const StepWizard: React.FC<StepWizardProps> = ({ isStep1Complete, isStep2Complete }) => {
  const steps = [
    { id: 1, label: 'Cari Pelat', isDone: isStep1Complete, isActive: !isStep1Complete },
    { id: 2, label: 'Lengkapi Data', isDone: isStep2Complete, isActive: isStep1Complete && !isStep2Complete },
    { id: 3, label: 'Simpan WO', isDone: false, isActive: isStep2Complete },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
      <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
        Tahapan Registrasi
      </h3>

      <div className="flex items-center justify-between relative px-1">
        {/* Line Connector Background */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step) => {
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              {/* Circle Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-xs ${
                  step.isDone
                    ? 'bg-red-600 text-white border-2 border-red-600'
                    : step.isActive
                    ? 'bg-slate-900 text-white border-2 border-slate-900 ring-4 ring-red-100'
                    : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                }`}
              >
                {step.isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold text-center whitespace-nowrap ${
                  step.isDone || step.isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
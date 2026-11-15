import React from 'react';
import { UserCheck, Clock, Car } from 'lucide-react';

interface Props {
  queueType: 'onsite' | 'drop_off';
  setQueueType: (type: 'onsite' | 'drop_off') => void;
}

export const AssignmentCard: React.FC<Props> = ({ queueType, setQueueType }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <UserCheck className="w-4 h-4 text-red-600" />
        <h3 className="font-bold text-slate-900 text-sm">Antrean & Kedatangan</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">Pilihan Kedatangan Servis</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setQueueType('onsite')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border cursor-pointer ${
              queueType === 'onsite'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-[#F4F5F3] text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Ditunggu</span>
          </button>

          <button
            type="button"
            onClick={() => setQueueType('drop_off')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border cursor-pointer ${
              queueType === 'drop_off'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-[#F4F5F3] text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Ditinggal</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 italic leading-relaxed">
        Penugasan mekanik dapat disesuaikan secara fleksibel di area Service Workshop.
      </p>
    </div>
  );
};
import React from 'react';

interface WorkshopQueueCardProps {
  order: any;
  isSelected: boolean;
  onSelect: () => void;
}

export const WorkshopQueueCard: React.FC<WorkshopQueueCardProps> = ({ order, isSelected, onSelect }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">ANTRE</span>;
      case 'INSPECTING':
        return <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded">DIAGNOSA</span>;
      case 'WAITING_ACC':
        return <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">WAITING ACC</span>;
      case 'IN_PROGRESS':
        return <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">DIKERJAKAN</span>;
      case 'READY':
        return <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">SELESAI</span>;
      default:
        return <span className="bg-slate-400 text-white text-[10px] font-bold px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
        isSelected
          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
          : 'bg-[#F4F5F3] hover:bg-slate-200/70 text-slate-900 border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className={`text-xs font-extrabold tracking-wider ${isSelected ? 'text-red-500' : 'text-slate-900'}`}>
          {order.plate_number}
        </span>
        {getStatusBadge(order.status)}
      </div>

      <div className="text-xs font-medium">
        <p className={isSelected ? 'text-slate-200' : 'text-slate-700'}>
          {order.vehicle?.brand_model} • <span className="font-bold">{order.customer?.name}</span>
        </p>
      </div>

      <p className={`text-[11px] line-clamp-1 italic ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
        Keluhan: {order.initial_complaint}
      </p>
    </div>
  );
};
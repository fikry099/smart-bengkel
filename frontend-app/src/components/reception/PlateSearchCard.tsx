import React from 'react';
import { Search, Car, CheckCircle2 } from 'lucide-react';

interface PlateSearchCardProps {
  plateNumber: string;
  setPlateNumber: (val: string) => void;
  handleSearchPlate: (e?: React.FormEvent) => void;
  searching: boolean;
  isMemberFound: boolean;
  customerName: string;
  vehicleBrandModel: string;
  historyLength: number;
}

export const PlateSearchCard: React.FC<PlateSearchCardProps> = ({
  plateNumber,
  setPlateNumber,
  handleSearchPlate,
  searching,
  isMemberFound,
  customerName,
  vehicleBrandModel,
  historyLength,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Mulai dari nomor pelat</h2>
        <p className="text-xs text-slate-500">Cari kendaraan untuk membedakan member lama dan pelanggan baru.</p>
      </div>

      <form onSubmit={handleSearchPlate} className="flex gap-2">
        <div className="relative flex-1">
          <Car className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            placeholder="AB 1234 BK"
            className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-3 pl-10 pr-12 text-xs font-bold uppercase text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="bg-red-600 hover:bg-red-700 text-white px-5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>{searching ? 'Mencari...' : 'Cek pelat'}</span>
        </button>
      </form>

      {isMemberFound && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-emerald-900">Member lama ditemukan • {customerName}</p>
            <p className="text-emerald-700">{vehicleBrandModel} • {historyLength} kunjungan sebelumnya. Data pelanggan terisi dari catatan kendaraan.</p>
          </div>
        </div>
      )}
    </div>
  );
};
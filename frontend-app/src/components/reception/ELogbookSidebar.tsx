import React from 'react';
import { History, Car, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

interface ELogbookSidebarProps {
  isMemberFound: boolean;
  serviceHistory: any[];
  customerName: string;
  plateNumber: string;
}

export const ELogbookSidebar: React.FC<ELogbookSidebarProps> = ({
  isMemberFound,
  serviceHistory,
  customerName,
  plateNumber,
}) => {
  return (
    <div className="space-y-4">
      {/* CARD RIWAYAT E-LOGBOOK */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-slate-900 text-sm">Riwayat langsung tersedia</h3>
        </div>

        {isMemberFound && serviceHistory.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#F4F5F3] p-3 rounded-xl">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">{customerName}</h4>
                <p className="text-[10px] text-slate-500">Member • {plateNumber}</p>
              </div>
              <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">
                {serviceHistory.length} kunjungan sebelumnya
              </span>
            </div>

            {serviceHistory.slice(0, 2).map((hist, idx) => (
              <div key={idx} className="space-y-1.5 text-xs border-b border-slate-100 pb-3">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{hist.date || '15 Agustus 2026'}</span>
                  <span className="text-red-600">{hist.mileage || '123.180 KM'}</span>
                </div>
                <p className="text-slate-700 font-semibold">{hist.title || 'Ganti oli mesin & filter oli'}</p>
                <p className="text-slate-500 text-[11px] line-clamp-2">{hist.initial_complaint}</p>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                Swal.fire('E-Logbook', 'Membuka seluruh riwayat rekam jejak servis kendaraan.', 'info');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition text-center cursor-pointer"
            >
              Buka seluruh riwayat
            </button>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Car className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-medium">
              {plateNumber ? 'Kendaraan baru, belum ada riwayat servis.' : 'Ketik nomor pelat & klik "Cek pelat" untuk melihat riwayat.'}
            </p>
          </div>
        )}
      </div>

      {/* INFO CARD: KELUHAN BERULANG */}
      <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Periksa keluhan berulang</span>
        </div>
        <p className="text-[11px] text-red-800 leading-relaxed">
          Gunakan riwayat diagnosis dan tindakan saat pelanggan kembali dengan keluhan pasca-servis.
        </p>
      </div>
    </div>
  );
};
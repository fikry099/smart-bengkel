import React from 'react';
import { Wrench, Bell, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import { showToast } from '../../utils/swalHelper';

interface Props {
  badge?: string;
  onLogout?: () => void;
}

export const CustomerHeader: React.FC<Props> = ({ badge = 'PORTAL PELANGGAN', onLogout }) => {
  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar Portal?',
      text: 'Apakah Anda yakin ingin keluar dari portal pelanggan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#212624',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('info', 'Berhasil Keluar', 'Anda telah keluar dari portal pelanggan.');

        if (onLogout) {
          onLogout();
        } else {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_user');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 1000);
        }
      }
    });
  };

  return (
    <header className="p-4 md:px-8 md:py-5 bg-white border-b border-slate-200/90 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-9 h-9 bg-[#E5C158] rounded-xl flex items-center justify-center shadow-sm">
          <Wrench className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm tracking-tight uppercase leading-none text-slate-900">Bekti Auto</h1>
          <p className="text-[9px] text-slate-400 font-medium tracking-wide">SOLUTION</p>
        </div>
      </div>

      <div className="hidden md:block">
        <h2 className="font-extrabold text-base text-slate-900">Bengkel Mobil Injeksi Spesialis Nissan & Umum</h2>
        <p className="text-xs text-slate-400">Pantau progres, estimasi, dan riwayat perbaikan Anda</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-block bg-[#FFF8E7] text-amber-900 border border-amber-200/80 text-[10px] font-bold px-2.5 py-1 rounded-md">
          {badge}
        </span>
        <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition relative">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-amber-500 rounded-full absolute top-1.5 right-1.5"></span>
        </button>

        <button
          onClick={handleLogout}
          title="Keluar Portal"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
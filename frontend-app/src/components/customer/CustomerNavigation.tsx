import React from 'react';
import { Home, Wrench, History, User, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';
import { showToast } from '../../utils/swalHelper';

interface Props {
  activeTab: 'home' | 'service' | 'history' | 'account';
  setActiveTab: (tab: 'home' | 'service' | 'history' | 'account') => void;
  onLogout?: () => void;
}

export const CustomerNavigation: React.FC<Props> = ({ activeTab, setActiveTab, onLogout }) => {
  const tabs = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'service', label: 'Servis Saya', icon: Wrench },
    { id: 'history', label: 'Riwayat & Nota', icon: History },
    { id: 'account', label: 'Akun Saya', icon: User },
  ] as const;

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
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        sessionStorage.clear();

        showToast('info', 'Berhasil Keluar', 'Anda telah keluar dari portal pelanggan.');

        if (onLogout) {
          onLogout();
        } else {
          setTimeout(() => {
            window.location.href = '/customer/login';
          }, 1000);
        }
      }
    });
  };

  return (
    <>
      {/* 1. SIDEBAR NAVIGASI (DESKTOP) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/90 flex-col justify-between p-6 sticky top-0 h-screen z-40">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E5C158] rounded-xl flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none uppercase text-slate-900">Bekti Auto</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">SOLUTION</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-900 bg-[#FFF8E7] border border-amber-200 px-2.5 py-1 rounded-md tracking-wider uppercase block w-max mb-3">
              PORTAL PELANGGAN
            </span>
            <p className="text-xs text-slate-400 font-medium px-2">Menu Utama</p>
          </div>

          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition ${
                    isActive
                      ? 'bg-[#E5C158] text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. BOTTOM BAR NAVIGASI (MOBILE) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-4 flex justify-around items-center z-50 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
                isActive ? 'text-[#E5C158] scale-105' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </nav>
    </>
  );
};
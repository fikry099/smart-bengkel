import React from 'react';
import { User, MessageCircle, Shield, ChevronRight, LogOut } from 'lucide-react';

export const CustomerAccountPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900">Halo, Pak Arif.</h2>
        <p className="text-xs text-slate-500">Kelola profil dan kendaraan Anda di sini.</p>
      </div>

      {/* Grid 2-Kolom di Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Kolom Kiri: Profil & Kendaraan */}
        <div className="space-y-5">
          {/* Card Profil User */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFF8E7] text-amber-900 font-black text-xl rounded-2xl flex items-center justify-center border border-amber-200">
              A
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Arif</h3>
              <p className="text-xs text-slate-500 font-mono">WhatsApp: +62 812 •••• 1234</p>
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kendaraan saya</h3>
            <div className="bg-[#212624] text-white p-5 rounded-2xl space-y-2 shadow-sm">
              <h4 className="font-extrabold text-base">Nissan Grand Livina 2014</h4>
              <p className="text-xs text-slate-400 font-mono">AB 1234 BK • 128.450 KM</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Akun & Logout */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100 text-xs font-bold text-slate-800 shadow-sm">
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-slate-500" /> Ubah profil</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
              <span className="flex items-center gap-3"><MessageCircle className="w-4 h-4 text-slate-500" /> Nomor WhatsApp</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
              <span className="flex items-center gap-3"><Shield className="w-4 h-4 text-slate-500" /> Privasi akun</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <button 
            onClick={() => (window.location.href = '/')}
            className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3.5 rounded-xl text-xs border border-red-200 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>

      </div>
    </div>
  );
};
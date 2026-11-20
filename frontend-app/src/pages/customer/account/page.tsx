import React, { useEffect, useState } from 'react';
import { User, MessageCircle, Shield, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetchCustomerProfile } from '../../../services/customer';
import type { CustomerProfile } from '../../../services/customer';

export const CustomerAccountPage: React.FC = () => {
  const { customerUser, logoutCustomer } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerProfile()
      .then(setProfile)
      .catch(() => setError('Data akun belum dapat dimuat. Silakan coba kembali.'));
  }, []);

  const customerName = profile?.name || customerUser?.name || 'Pelanggan';
  const phoneDigits = (profile?.whatsapp_number || customerUser?.whatsapp_number || '').replace(/\D/g, '');
  const localPhone = phoneDigits.startsWith('62') ? phoneDigits.slice(2) : phoneDigits.replace(/^0/, '');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900">Halo, {customerName}.</h2>
        <p className="text-xs text-slate-500">Kelola profil dan kendaraan Anda di sini.</p>
      </div>

      {/* Grid 2-Kolom di Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Kolom Kiri: Profil & Kendaraan */}
        <div className="space-y-5">
          {/* Card Profil User */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFF8E7] text-amber-900 font-black text-xl rounded-2xl flex items-center justify-center border border-amber-200">
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">{customerName}</h3>
              <p className="text-xs text-slate-500 font-mono">WhatsApp: +62 {localPhone || '-'}</p>
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kendaraan saya</h3>
            {error ? (
              <p role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</p>
            ) : !profile ? (
              <p className="bg-white rounded-xl p-4 text-sm text-slate-500">Memuat data akun...</p>
            ) : profile.vehicles.length === 0 ? (
              <p className="bg-white rounded-xl p-4 text-sm text-slate-500">Belum ada kendaraan terdaftar.</p>
            ) : (
              profile.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-[#212624] text-white p-5 rounded-2xl space-y-2 shadow-sm">
                  <h4 className="font-extrabold text-base">{vehicle.brand_model}</h4>
                  <p className="text-xs text-slate-400 font-mono">{vehicle.plate_number}</p>
                </div>
              ))
            )}
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
            onClick={logoutCustomer}
            className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3.5 rounded-xl text-xs border border-red-200 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>

      </div>
    </div>
  );
};
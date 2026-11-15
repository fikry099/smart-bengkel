import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Bell } from 'lucide-react';
import Swal from 'sweetalert2';
import API from '../../services/api';

interface HeaderNavbarProps {
  user: any;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar area profil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Anda harus login kembali untuk mengakses panel POS Admin.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#212624',
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.post('/logout');
        } catch (err) {
          // Abaikan error jika token kadaluarsa
        } finally {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Kiri: Status & Info System */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-block text-xs font-semibold text-slate-400">
          Internal Workshop Suite
        </span>
      </div>

      {/* Kanan: Lonceng Notifikasi & Dropdown Profil */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-red-500 font-black text-xs flex items-center justify-center shadow-xs border border-slate-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                {user?.name || 'Owner - Bekti Auto'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 capitalize">
                {user?.role || 'Administrator'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Popover Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-extrabold text-slate-900">{user?.name || 'Owner - Bekti Auto'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'admin@bektiauto.com'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    Swal.fire('Profil Admin', 'Fitur edit profil siap dihubungkan.', 'info');
                  }}
                  className="w-full px-4 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Akun</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Keluar Sistem (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
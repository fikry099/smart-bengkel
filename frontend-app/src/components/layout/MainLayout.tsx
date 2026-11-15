import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HeaderNavbar } from './HeaderNavbar';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen w-screen bg-[#F4F5F3] flex font-sans selection:bg-[#E5C158] overflow-hidden">
      {/* 1. Sidebar Kiri (Elemen Flexbox Pertama, Lebar 64) */}
      <Sidebar />

      {/* 2. Main Container (Elemen Flexbox Kedua - Hapus md:pl-64 agar tidak double space) */}
      <div className="flex-1 flex flex-col min-w-0 h-full transition-all">
        {/* Header Top Navbar */}
        <HeaderNavbar user={user} />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 w-full overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
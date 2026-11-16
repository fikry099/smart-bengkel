import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Package,
  DollarSign,
  History,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: externalIsCollapsed,
  onToggle,
}) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const location = useLocation();

  const isCollapsed = externalIsCollapsed ?? internalIsCollapsed;
  const isHistoryActive =
    location.pathname === '/admin/workshop/history' ||
    new URLSearchParams(location.search).get('stage') === 'history';
  const isWorkshopActive =
    location.pathname.startsWith('/admin/workshop') && !isHistoryActive;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsCollapsed((prev) => !prev);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'reception', label: 'Reception & Check-in', icon: ClipboardList, path: '/admin/reception' },
    { id: 'workshop', label: 'Service Workshop', icon: Wrench, path: '/admin/workshop?stage=diagnosis' },
    { id: 'history', label: 'Riwayat Workshop', icon: History, path: '/admin/workshop/history' },
    { id: 'inventory', label: 'Inventory & Katalog', icon: Package, path: '/admin/inventory' },
    { id: 'finance', label: 'Laporan Keuangan', icon: DollarSign, path: '/admin/finance' },
  ];

  return (
    <aside
      className={`h-full flex-shrink-0 bg-[#1A1D20] text-slate-300 flex flex-col justify-between p-3 border-r border-slate-800 relative transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-6">
        {/* Logo sekaligus Tombol Toggle Klik */}
        <div className="flex items-center justify-center py-2 border-b border-slate-800/80">
          <button
            type="button"
            onClick={handleToggle}
            title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
            className="group flex items-center justify-center p-1.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer active:scale-95"
          >
            <img
              src="/BASnobg.png"
              alt="Bekti Auto Solution Logo"
              className="h-10 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-xs font-bold transition-all ${
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
                  } ${
                    (item.id === 'workshop' ? isWorkshopActive : item.id === 'history' ? isHistoryActive : isActive)
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap animate-in fade-in duration-200">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer: Branding Text & System Version */}
      <div className={`py-3 border-t border-slate-800/80 transition-all space-y-2 ${isCollapsed ? 'text-center' : 'px-2'}`}>
        {!isCollapsed ? (
          <div className="animate-in fade-in duration-200 space-y-1">
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
              <p className="font-bold text-slate-400">Bekti POS v1.0.0</p>
              <p>System Operating Standard</p>
            </div>
          </div>
        ) : (
          <p className="font-bold text-slate-400 text-[9px]" title="Bekti POS v1.0.0">v1.0</p>
        )}
      </div>
    </aside>
  );
};
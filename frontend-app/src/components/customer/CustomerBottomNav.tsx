import React from 'react';
import { Home, Wrench, History, User } from 'lucide-react';

interface Props {
  activeTab: 'home' | 'service' | 'history' | 'account';
  setActiveTab: (tab: 'home' | 'service' | 'history' | 'account') => void;
}

export const CustomerBottomNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'service', label: 'Servis', icon: Wrench },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'account', label: 'Akun', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-6 flex justify-between items-center z-50 shadow-lg">
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
    </nav>
  );
};
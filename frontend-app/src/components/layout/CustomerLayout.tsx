import React, { useState } from 'react';
import { CustomerHeader } from '../customer/CustomerHeader';
import { CustomerNavigation } from '../customer/CustomerNavigation';
import { CustomerHomePage } from '../../pages/customer/home/page';
import { CustomerServicePage } from '../../pages/customer/service/page';
import { CustomerHistoryPage } from '../../pages/customer/history/page';
import { CustomerAccountPage } from '../../pages/customer/account/page';

export const CustomerLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'service' | 'history' | 'account'>('home');

  return (
    <div className="min-h-screen bg-[#F4F5F3] text-slate-900 font-sans selection:bg-[#E5C158]">
      {/* Buang max-w-6xl agar tata letak memenuhi seluruh lebar layar desktop */}
      <div className="w-full min-h-screen bg-[#F4F5F3] flex flex-col md:flex-row relative">
        
        {/* Sidebar Navigasi (Desktop) / Bottom Nav (Mobile) */}
        <CustomerNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Area Konten Utama melempar ke kanan secara penuh */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
          <CustomerHeader />

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {/* Buang max-w-3xl agar card & form membentang penuh sesuai lebar viewport */}
            <div className="w-full space-y-6">
              {activeTab === 'home' && <CustomerHomePage onNavigateTab={setActiveTab} />}
              {activeTab === 'service' && <CustomerServicePage />}
              {activeTab === 'history' && <CustomerHistoryPage />}
              {activeTab === 'account' && <CustomerAccountPage />}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};
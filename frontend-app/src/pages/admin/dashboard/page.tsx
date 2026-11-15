import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Package, 
  DollarSign, 
  Car, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayCheckIns: 4,
    activeServices: 3,
    lowStockAlerts: 2,
    todayRevenue: 2450000,
  });

  // Mock Data untuk Chart Pendapatan Mingguan (7 Hari Terakhir)
  const revenueChartData = [
    { day: 'Sen', amount: 1800000, height: '45%' },
    { day: 'Sel', amount: 2200000, height: '55%' },
    { day: 'Rab', amount: 1500000, height: '38%' },
    { day: 'Kam', amount: 3100000, height: '78%' },
    { day: 'Jum', amount: 2800000, height: '70%' },
    { day: 'Sab', amount: 4000000, height: '100%' },
    { day: 'Ming', amount: 2450000, height: '62%' },
  ];

  // Mock Data Antrean Terbaru
  const recentVehicles = [
    { id: 1, plate: 'AB 1421 YK', model: 'Nissan Grand Livina', status: 'In Progress', mechanic: 'Mekanik Agus', time: '09:30' },
    { id: 2, plate: 'B 8920 UJH', model: 'Nissan X-Trail T31', status: 'Pending', mechanic: 'Belum Ditugaskan', time: '10:15' },
    { id: 3, plate: 'AB 9081 BK', model: 'Toyota Avanza', status: 'In Progress', mechanic: 'Mekanik Budi', time: '11:00' },
    { id: 4, plate: 'AD 4412 DA', model: 'Nissan March', status: 'Completed', mechanic: 'Mekanik Agus', time: '13:20' },
  ];

  // Mock Data Stok Kritis
  const lowStockItems = [
    { name: 'Oli Mesin Shell Helix 10W-40', stock: 2, min: 5, unit: 'Liter' },
    { name: 'Filter Oli Nissan Grand Livina', stock: 1, min: 4, unit: 'Pcs' },
  ];

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      setLoading(true);
      try {
        const response = await API.get('/dashboard/summary');
        if (response.data) {
          setStats({
            todayCheckIns: response.data.today_checkins || stats.todayCheckIns,
            activeServices: response.data.active_services || stats.activeServices,
            lowStockAlerts: response.data.low_stock_count || stats.lowStockAlerts,
            todayRevenue: response.data.today_revenue || stats.todayRevenue,
          });
        }
      } catch (err) {
        console.log('Menggunakan data ringkasan dashboard analitik default');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, []);

  return (
    <div className="space-y-6 w-full pb-12">
      
      {/* 1. Header Banner Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 bg-red-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase text-white border border-red-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> EXECUTIVE DASHBOARD
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Ringkasan Operasional Bengkel
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Pantau statistik kendaraan, progres meja kerja mekanik, omset harian, dan alert inventori secara real-time.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/reception')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
          >
            <Car className="w-4 h-4" />
            <span>Penerimaan (Check-in)</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu KPI Utama (4 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kedatangan Hari Ini</p>
            <h3 className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${stats.todayCheckIns} Unit`}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Transaksi reception aktif
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Servis Dikerjakan</p>
            <h3 className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${stats.activeServices} Unit`}
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">Progres Meja Mekanik</span>
          </div>
          <div className="p-3 bg-slate-900 text-white rounded-2xl">
            <Wrench className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alert Stok Minimum</p>
            <h3 className="text-2xl font-black text-amber-600">
              {loading ? '...' : `${stats.lowStockAlerts} Item`}
            </h3>
            <span className="text-[10px] font-bold text-amber-600">Perlu restok segera</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Kas Hari Ini</p>
            <h3 className="text-2xl font-black text-emerald-600">
              {loading ? '...' : `Rp ${stats.todayRevenue.toLocaleString('id-ID')}`}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-700">Estimasi Total WO</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Section Chart Analitik & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Bar Chart Tren Pendapatan Mingguan (8 Kolom) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Grafik Omset 7 Hari Terakhir</h2>
                <p className="text-[11px] text-slate-500">Estimasi total transaksi servis & sparepart minggu ini</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
              Minggu Ini
            </span>
          </div>

          {/* Visual Bar Chart Native */}
          <div className="h-52 flex items-end justify-between gap-2 pt-6 px-2">
            {revenueChartData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {(item.amount / 1000000).toFixed(1)}M
                </span>
                <div 
                  style={{ height: item.height }} 
                  className="w-full bg-slate-100 group-hover:bg-red-600 rounded-t-lg transition-all duration-300 relative min-h-[15px]"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-red-600 rounded-t-lg group-hover:bg-red-700" />
                </div>
                <span className="text-xs font-bold text-slate-600">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Ringkasan Status Servis Workshop (4 Kolom) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieChart className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Status Penanganan</h2>
              <p className="text-[11px] text-slate-500">Distribusi unit di meja servis</p>
            </div>
          </div>

          <div className="space-y-3 my-auto">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Menunggu Dikerjakan
                </span>
                <span className="text-slate-900">1 Unit (25%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[25%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-red-600" /> Sedang Servis (Mekanik)
                </span>
                <span className="text-slate-900">2 Unit (50%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[50%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai / Siap Ambil
                </span>
                <span className="text-slate-900">1 Unit (25%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[25%]" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/workshop')}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-2.5 rounded-xl text-xs border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Buka Meja Workshop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 4. Tabel Ringkas Antrean Terakhir & Widget Stok Kritis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TABEL ANTREAN TERBARU (8 Kolom) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-red-600" />
              <span>Antrean Kendaraan Terkini</span>
            </h2>
            <button 
              onClick={() => navigate('/admin/reception')}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-2">Jam</th>
                  <th className="py-2.5 px-2">Nomor Pelat</th>
                  <th className="py-2.5 px-2">Model Kendaraan</th>
                  <th className="py-2.5 px-2">Penugasan</th>
                  <th className="py-2.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {recentVehicles.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-2 font-mono text-slate-500">{item.time}</td>
                    <td className="py-3 px-2 font-extrabold text-slate-900">{item.plate}</td>
                    <td className="py-3 px-2">{item.model}</td>
                    <td className="py-3 px-2 text-slate-600">{item.mechanic}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'In Progress' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* WIDGET STOK KRITIS (4 Kolom) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Peringatan Stok Kritis</span>
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {lowStockItems.length} Item
              </span>
            </div>

            <div className="space-y-2.5">
              {lowStockItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-1">
                  <p className="font-extrabold text-slate-900 text-xs">{item.name}</p>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-amber-800 font-bold">Sisa Stok: {item.stock} {item.unit}</span>
                    <span className="text-slate-400">Min. {item.min} {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/inventory')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Package className="w-4 h-4 text-red-500" />
            <span>Kelola Inventori & Restok</span>
          </button>
        </div>

      </div>

    </div>
  );
};
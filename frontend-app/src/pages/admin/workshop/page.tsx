import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

import { WorkshopTable } from '../../../components/workshop/WorkshopTable';
import { getWorkshopStage, WORKSHOP_STAGES } from '../../../components/workshop/workshopStages';

export const WorkshopPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeStage = getWorkshopStage(searchParams.get('stage') || 'diagnosis');
  const workflowStages = WORKSHOP_STAGES.filter((stage) => !['all', 'history'].includes(stage.id));
  const historyStage = getWorkshopStage('history');

  // Ambil data antrean dari backend
  const fetchWorkshopOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/workshop/orders');
      const orders = response.data?.orders || response.data || [];
      setServiceOrders(Array.isArray(orders) ? orders : []);
    } catch (err: any) {
      showToast('error', 'Gagal', 'Gagal mengambil data antrean dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshopOrders();
  }, []);

  const getStageCount = (stage: ReturnType<typeof getWorkshopStage>) =>
    stage.id === 'all'
      ? serviceOrders.length
      : serviceOrders.filter((order) => stage.statuses.includes(order?.status)).length;

  const filteredOrders = serviceOrders.filter((order) => {
    if (!order) return false;
    const matchStatus = activeStage.id === 'all' || activeStage.statuses.includes(order.status);
    const plate = (order.plate_number || '').toLowerCase();
    const code = (order.order_code || '').toLowerCase();
    const custName = (order.customer?.name || '').toLowerCase();
    const searchLower = search.toLowerCase();

    return matchStatus && (plate.includes(searchLower) || code.includes(searchLower) || custName.includes(searchLower));
  });

  // Navigasi ke halaman detail pengerjaan
  const handleSelectOrder = (order: any) => {
    navigate(`/admin/workshop/${order.id}?stage=${activeStage.id}`);
  };

  const handlePrimaryAction = (order: any) => {
    if (order.status === 'QUEUED') {
      API.patch(`/workshop/orders/${order.id}/status`, { status: 'INSPECTING' })
        .then(() => navigate(`/admin/workshop/${order.id}?stage=diagnosis`))
        .catch((err: any) => {
          showToast(
            'error',
            'Gagal Memulai Diagnosa',
            err.response?.data?.message || 'Tidak dapat memulai diagnosa untuk order ini.'
          );
        });
      return;
    }

    if (['PENDING_ACC', 'WAITING_ACC'].includes(order.status)) {
      navigate(`/admin/workshop/${order.id}/approval?stage=waiting_acc`);
      return;
    }

    handleSelectOrder(order);
  };

  const handleStageSelect = (stageId: string) => {
    setSearchParams({ stage: stageId });
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Workshop</h1>
          <p className="text-xs text-slate-600">
            Kelola diagnosa, persetujuan pelanggan, pengerjaan servis, dan informasi kendaraan selesai.
          </p>
        </div>

        <button
          onClick={fetchWorkshopOrders}
          className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs border border-slate-200 transition shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Order</span>
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            {workflowStages.some((stage) => stage.id === activeStage.id) && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Tahap {workflowStages.findIndex((stage) => stage.id === activeStage.id) + 1} dari {workflowStages.length}
              </span>
            )}
            <h2 className="text-lg font-black text-slate-900">{activeStage.label}</h2>
            <p className="text-xs text-slate-500">{activeStage.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStageSelect('all')}
              className={`px-3 py-2 rounded-lg text-[11px] font-bold transition ${
                activeStage.id === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Order ({getStageCount(getWorkshopStage('all'))})
            </button>
            <button
              type="button"
              onClick={() => handleStageSelect('history')}
              className={`px-3 py-2 rounded-lg text-[11px] font-bold transition ${
                activeStage.id === 'history'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Riwayat ({getStageCount(historyStage)})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowStages.map((stage, index) => {
            const isActive = activeStage.id === stage.id;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageSelect(stage.id)}
                aria-current={isActive ? 'step' : undefined}
                className={`min-h-36 rounded-2xl border bg-white p-5 text-left shadow-xs space-y-3 flex flex-col justify-between transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 ${
                  isActive
                    ? 'border-red-600 ring-1 ring-red-600/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-xs font-semibold ${isActive ? 'text-red-600' : 'text-slate-400'}`}>
                    {stage.label}
                  </p>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                    isActive ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                <h3 className={`text-3xl font-black tracking-tight ${
                  isActive ? 'text-red-600' : 'text-slate-900'
                }`}>
                  {getStageCount(stage)} <span className="text-lg font-bold text-slate-700">order</span>
                </h3>

                <p className="text-[11px] font-medium text-slate-400">
                  {stage.summary}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full">
            <h2 className="text-sm font-bold text-slate-900">Daftar Order</h2>
            <p className="text-[11px] text-slate-500">{filteredOrders.length} order ditampilkan</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Pelat, Kode WO, Pelanggan..."
              className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
            />
          </div>
        </div>

        <WorkshopTable
          orders={filteredOrders}
          loading={loading}
          onSelectOrder={handleSelectOrder}
          onPrimaryAction={handlePrimaryAction}
        />
      </div>
    </div>
  );
};
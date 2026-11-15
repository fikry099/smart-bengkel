import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Package,
  Wrench,
  FileText,
  User,
  Phone,
  Loader2,
  CarFront,
  Gauge,
  MapPin,
  ClipboardCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

interface DurationOption {
  label: string;
  hours: number;
}

const PRESET_OPTIONS: DurationOption[] = [
  { label: '2 Jam', hours: 2 },
  { label: '4 Jam', hours: 4 },
  { label: '1 Hari', hours: 24 },
  { label: '3 Hari', hours: 72 },
  { label: '1 Minggu', hours: 168 },
  { label: '1 Bulan', hours: 720 },
];

export const ServiceApprovalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnStage = searchParams.get('stage') || 'waiting_acc';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Checklist Item ACC & Estimasi Waktu (dalam Jam)
  const [itemsState, setItemsState] = useState<
    { id: number; name: string; type: string; price: number; quantity: number; isApproved: boolean }[]
  >([]);
  const [userAccNotes, setUserAccNotes] = useState('');
  const [selectedHours, setSelectedHours] = useState<number>(24); // Default 1 Hari (24 Jam)

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/workshop/orders/${id}`);
        const data = res.data?.order || res.data?.data || res.data;
        setOrder(data);

        const orderItems = data?.items || data?.details || data?.order_items || [];
        if (orderItems.length > 0) {
          setItemsState(
            orderItems.map((it: any) => ({
              id: it.id,
              name: it.item_name || it.name,
              type: it.item_type || it.type || 'sparepart',
              price: parseFloat(it.price || it.cost || 0),
              quantity: parseInt(it.quantity || it.qty || 1),
              isApproved: true,
            }))
          );
        }
        setUserAccNotes(data?.user_acc_notes || '');
        if (data?.estimated_days) {
          setSelectedHours(parseInt(data.estimated_days) * 24);
        }
      } catch (err) {
        console.error('Gagal mengambil detail order:', err);
        showToast('error', 'Gagal', 'Terjadi kesalahan saat memuat data servis.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrderDetail();
  }, [id]);

  const toggleItemApproval = (itemId: number) => {
    setItemsState((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, isApproved: !it.isApproved } : it))
    );
  };

  const handleQtyChange = (itemId: number, qty: number) => {
    if (qty < 1) return;
    setItemsState((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: qty } : it))
    );
  };

  // Logika Kalkulasi Display Target Selesai (Jam / Hari)
  const getFormattedTargetDisplay = (hours: number) => {
    const now = new Date();
    const targetDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    // Jika di bawah 24 jam, tampilkan jam estimasi selesai di hari ini/besok
    if (hours < 24) {
      const isToday = now.getDate() === targetDate.getDate();
      const timeStr = targetDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return isToday ? `Hari ini, s/d ${timeStr} WIB` : `Besok, s/d ${timeStr} WIB`;
    }

    // Jika >= 24 jam (Hari / Minggu / Bulan), tampilkan rentang tanggal
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = now.toLocaleDateString('id-ID', options);
    const endStr = targetDate.toLocaleDateString('id-ID', { ...options, year: 'numeric' });

    return `${startStr} - ${endStr}`;
  };

  const approvedTotal =
    itemsState
      .filter((it) => it.isApproved)
      .reduce((acc, it) => acc + it.price * it.quantity, 0) +
    parseFloat(order?.additional_cost || order?.difficulty_surcharge || 0);

  const handleSubmitACC = async (actionStatus: 'IN_PROGRESS' | 'CANCELLED') => {
    try {
      setSubmitting(true);

      const payload = {
        status: actionStatus,
        user_acc_notes: userAccNotes,
        estimated_hours: selectedHours,
        approved_items: itemsState.map((it) => ({
          id: it.id,
          is_approved: actionStatus === 'CANCELLED' ? false : it.isApproved,
          quantity: it.quantity,
        })),
      };

      await API.post(`/workshop/orders/${id}/submit-acc`, payload);

      if (actionStatus === 'IN_PROGRESS') {
        showToast('success', 'ACC Disimpan!', 'Pengerjaan servis dimulai.');
      } else {
        showToast('warning', 'Dibatalkan', 'Servis telah ditandai dibatalkan.');
      }

      navigate(`/admin/workshop?stage=${actionStatus === 'IN_PROGRESS' ? 'in_progress' : 'history'}`);
    } catch (err) {
      console.error('Gagal menyimpan ACC:', err);
      const errorData = isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(err)
        ? err.response?.data
        : undefined;
      const validationErrors = Object.values(errorData?.errors || {}).flat();
      showToast(
        'error',
        'Gagal',
        validationErrors.join(' ') || errorData?.message || 'Gagal memproses persetujuan pelanggan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 font-medium flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-red-600" />
        <span>Memuat data persetujuan servis...</span>
      </div>
    );
  }

  if (!order) return null;

  const extraCostVal = parseFloat(order.additional_cost || order.difficulty_surcharge || 0);

  return (
    <div className="space-y-5 w-full pb-16 font-sans">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/workshop?stage=${returnStage}`)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition shadow-2xs flex items-center justify-center group cursor-pointer"
            title="Kembali ke Daftar Workshop"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Persetujuan Pelanggan (ACC) <span className="text-red-600">•</span> {order.plate_number}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">{order.order_code}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-400">Status:</span>
          <span className="bg-amber-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider font-mono shadow-2xs">
            {order.status || 'PENDING_ACC'}
          </span>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 space-y-5">
          {/* Informasi pelanggan & kendaraan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="bg-slate-900 px-5 py-2.5 text-white flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 font-bold tracking-wide">
                <CarFront className="w-4 h-4 text-red-500" />
                <span>IDENTITAS UNIT & PELANGGAN</span>
              </div>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-slate-700">
                {order.queue_type === 'drop_off' ? 'Drop-Off' : 'Onsite'}
              </span>
            </div>

            <div className="p-4 space-y-3 bg-slate-50/40">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Spesifikasi Unit</span>
                  <strong className="text-slate-900 font-bold block text-xs truncate">
                    {order.vehicle?.brand_model || order.vehicle_brand_model || '-'}
                  </strong>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> Pemilik / Pelanggan
                  </span>
                  <strong className="text-slate-900 font-bold block text-xs truncate">
                    {order.customer?.name || order.customer_name || '-'}
                  </strong>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> WhatsApp
                  </span>
                  <strong className="text-slate-900 font-mono font-bold block text-xs truncate">
                    {order.customer?.whatsapp_number || order.whatsapp_number || order.customer?.phone || '-'}
                  </strong>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400" /> Odometer
                  </span>
                  <strong className="text-slate-900 font-mono font-bold block text-xs truncate">
                    {order.current_mileage_km ? `${Number(order.current_mileage_km).toLocaleString('id-ID')} KM` : '-'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-4 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Alamat Pelanggan</span>
                    <span className="text-slate-800 text-xs font-medium leading-relaxed block break-words">
                      {order.customer_address || order.customer?.address || '-'}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-8 bg-red-50/60 border border-red-100 p-3 rounded-xl shadow-2xs flex items-start gap-2.5 overflow-hidden">
                  <FileText className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 w-full min-w-0">
                    <span className="text-[10px] font-bold text-red-700 uppercase block tracking-wider">
                      Keluhan Awal Pelanggan:
                    </span>
                    <p className="text-slate-900 text-xs font-medium leading-relaxed italic break-all whitespace-pre-wrap">
                      "{order.initial_complaint || 'Pemeriksaan & perawatan rutin.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Item Persetujuan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                Checklist Item Dikerjakan
              </h2>
              <p className="text-[10px] text-slate-500">
                Centang item yang disetujui pelanggan via WhatsApp / Konfirmasi langsung.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg self-start sm:self-auto">
              Item Disetujui: <strong className="text-emerald-600">{itemsState.filter((i) => i.isApproved).length}</strong> / {itemsState.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {itemsState.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
                  item.isApproved
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.isApproved}
                    onChange={() => toggleItemApproval(item.id)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                  />
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                    {item.type === 'service' || item.type === 'jasa' ? (
                      <Wrench className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Package className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      Rp {item.price.toLocaleString('id-ID')} / unit
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      disabled={!item.isApproved}
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center text-xs font-bold text-slate-900 focus:outline-hidden disabled:opacity-50"
                    />
                  </div>

                  <span className="text-xs font-black text-slate-900 font-mono min-w-[90px] text-right">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {extraCostVal > 0 && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex justify-between items-center text-xs shadow-2xs">
              <span className="font-bold text-amber-900">
                Biaya Tambahan Khusus ({order?.additional_cost_reason || 'Pengerjaan Rumit'})
              </span>
              <span className="font-black text-amber-900 font-mono">
                Rp {extraCostVal.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
        </div>

        {/* Estimasi Waktu (Variatif: Jam / Hari / Minggu / Bulan) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-900">
                {selectedHours < 24 ? (
                  <Clock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Calendar className="w-4 h-4 text-emerald-600" />
                )}
                <span>Estimasi Waktu Pengerjaan</span>
              </label>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-md">
                Target: {getFormattedTargetDisplay(selectedHours)}
              </span>
            </div>

            {/* Grid Preset Option (Variasi Jam, Hari, Minggu, Bulan) */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {PRESET_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedHours(opt.hours)}
                    className={`py-2.5 px-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                      selectedHours === opt.hours
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom Input (Dalam Hari) */}
              <div className="pt-1 flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-600">Durasi Custom (Hari):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={Math.ceil(selectedHours / 24)}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setSelectedHours(val * 24);
                    }}
                    className="w-14 bg-white border border-slate-300 rounded-lg p-1 text-center text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-600"
                  />
                  <span className="text-xs font-bold text-slate-600">Hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Catatan Kesepakatan Pelanggan */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Catatan Instruksi & Kesepakatan Pelanggan</span>
            </label>
            <textarea
              rows={3}
              value={userAccNotes}
              onChange={(e) => setUserAccNotes(e.target.value)}
              placeholder="Contoh: Pelanggan setuju ganti oli & tune up saja. Kampas rem ditunda bulan depan."
              className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white resize-none transition"
            />
          </div>

          {/* Card Ringkasan Total & Action Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500">Total Biaya ACC Disetujui:</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                Rp {approvedTotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitACC('IN_PROGRESS')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Simpan ACC & Mulai Pengerjaan</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitACC('CANCELLED')}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xs transition cursor-pointer disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                <span>Batalkan Seluruh Servis</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
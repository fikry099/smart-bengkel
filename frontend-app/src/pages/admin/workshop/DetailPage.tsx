import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, FileText, Gauge, MapPin, 
  ClipboardEdit, MessageSquareCheck, CarFront, Wrench, Package,
  Clock, ShieldCheck, Calendar, Sparkles
} from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

import { ItemDiagnosisForm } from '../../../components/workshop/ItemDiagnosisForm';
import { WorkshopActionFooter } from '../../../components/workshop/WorkshopActionFooter';
import { WorkshopProcessStepper } from '../../../components/workshop/WorkshopProcessStepper';
import {
  getWorkshopStatusLabel,
  getWorkshopWorkflowStageId,
  getWorkshopWorkflowStageIdFromQuery,
} from '../../../components/workshop/workshopStages';

export const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnStage = searchParams.get('stage') || 'all';
  const viewedStage = getWorkshopWorkflowStageIdFromQuery(searchParams.get('viewStage'));

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Catatan Kerusakan Tambahan
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load detail order berdasarkan ID dari URL
  const fetchOrderDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await API.get(`/workshop/orders/${id}`);
      const orderData = response.data?.order || response.data?.data || response.data;

      if (orderData) {
        setSelectedOrder(orderData);
        setAdditionalNotes(orderData.additional_notes || orderData.inspection_notes || '');
      } else {
        showToast('error', 'Tidak Ditemukan', 'Data antrean tidak ditemukan.');
        navigate('/admin/workshop');
      }
    } catch (err: any) {
      try {
        const resList = await API.get('/workshop/orders');
        const orders = resList.data?.orders || resList.data?.data || resList.data || [];
        const found = orders.find((o: any) => String(o.id) === String(id));

        if (found) {
          setSelectedOrder(found);
          setAdditionalNotes(found.additional_notes || found.inspection_notes || '');
        } else {
          showToast('error', 'Tidak Ditemukan', 'Data antrean tidak ditemukan.');
          navigate('/admin/workshop');
        }
      } catch (e) {
        showToast('error', 'Gagal', 'Gagal memuat detail antrean servis.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  // Auto-Save Catatan Mekanik dengan Debounce (800ms)
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAdditionalNotes(value);

    if (selectedOrder?.status === 'READY_FOR_PICKUP' || selectedOrder?.status === 'COMPLETED') {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSavingNotes(true);
        await API.patch(`/workshop/orders/${selectedOrder.id}/notes`, {
          additional_notes: value,
        });
      } catch (err: any) {
        showToast('error', 'Gagal', 'Gagal menyimpan otomatis catatan kerusakan.');
      } finally {
        setIsSavingNotes(false);
      }
    }, 800);
  };

  const handleAddItem = async (itemData: { name: string; price: number; type: string; product_id?: number }) => {
    if (!selectedOrder) return;

    const existingItems = selectedOrder.items || selectedOrder.details || selectedOrder.order_items || [];
    const existingItem = existingItems.find((it: any) => {
      if (itemData.product_id && it.product_id) {
        return Number(it.product_id) === Number(itemData.product_id);
      }
      const existingName = (it.item_name || it.name || '').toLowerCase().trim();
      const newName = (itemData.name || '').toLowerCase().trim();
      const existingType = (it.item_type || it.type || '').toLowerCase().trim();
      const newType = (itemData.type || '').toLowerCase().trim();
      return existingName === newName && existingType === newType;
    });

    try {
      let response;
      if (existingItem) {
        const newQty = parseInt(existingItem.quantity || existingItem.qty || 1) + 1;
        response = await API.put(`/workshop/orders/${selectedOrder.id}/items/${existingItem.id}`, {
          quantity: newQty,
          item_name: itemData.name,
          cost: itemData.price,
          price: itemData.price,
          item_type: itemData.type,
          product_id: itemData.product_id || null,
        });
      } else {
        response = await API.post(`/workshop/orders/${selectedOrder.id}/items`, {
          item_name: itemData.name,
          cost: itemData.price,
          price: itemData.price,
          quantity: 1,
          item_type: itemData.type,
          product_id: itemData.product_id || null,
        });
      }

      const updatedOrder = response.data?.order || response.data;
      if (updatedOrder && updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      } else {
        await fetchOrderDetail();
      }

      showToast(
        'success', 
        'Berhasil!', 
        existingItem ? `Kuantitas ${itemData.name} berhasil bertambah.` : `${itemData.name} berhasil ditambahkan.`
      );
    } catch (err: any) {
      const validationErrors = Object.values(err.response?.data?.errors || {}).flat();
      showToast(
        'error',
        'Gagal',
        validationErrors.join(' ') || err.response?.data?.message || 'Tidak dapat memperbarui item perbaikan.'
      );
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedOrder) return;

    try {
      const response = await API.delete(`/workshop/orders/${selectedOrder.id}/items/${itemId}`);
      const updatedOrder = response.data?.order || response.data;

      if (updatedOrder && updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      } else {
        await fetchOrderDetail();
      }

      showToast('success', 'Terhapus!', 'Item berhasil dihapus.');
    } catch (err: any) {
      showToast('error', 'Gagal', 'Tidak dapat menghapus item.');
    }
  };

  const handleSaveAdditionalCost = async (cost: number, reason: string) => {
    if (!selectedOrder) return;

    try {
      const response = await API.patch(`/workshop/orders/${selectedOrder.id}/additional-cost`, {
        additional_cost: cost,
        additional_cost_reason: reason,
      });
      const updatedOrder = response.data?.order || response.data;

      if (updatedOrder && updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      } else {
        await fetchOrderDetail();
      }

      showToast('success', 'Tersimpan!', 'Biaya tambahan khusus berhasil diperbarui.');
    } catch (err: any) {
      showToast('error', 'Gagal', 'Gagal memperbarui biaya tambahan.');
    }
  };

  const handleAdvanceStatus = async (nextStatus: string, msg: string) => {
    if (!selectedOrder) return;

    try {
      const response = await API.patch(`/workshop/orders/${selectedOrder.id}/status`, {
        status: nextStatus,
      });
      const updatedOrder = response.data?.order || response.data;

      if (updatedOrder && updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      } else {
        await fetchOrderDetail();
      }

      showToast('success', 'Status Berubah!', msg);
      if (nextStatus === 'PENDING_ACC') {
        navigate('/admin/workshop?stage=waiting_acc');
      }
    } catch (err: any) {
      showToast('error', 'Gagal', 'Tidak dapat memperbarui status pengerjaan.');
    }
  };

  const generateWhatsAppMessage = () => {
    if (!selectedOrder) return '';

    const itemList = selectedOrder.items || selectedOrder.details || selectedOrder.order_items || [];
    const itemDetailsText = itemList.length > 0
      ? itemList
          .map((it: any, i: number) => {
            const name = it.item_name || it.name || 'Item Servis';
            const price = parseFloat(it.price || it.cost || 0);
            const qty = parseInt(it.quantity || it.qty || 1);
            const total = price * qty;
            return `${i + 1}. *${name}* (${qty}x) - Rp ${total.toLocaleString('id-ID')}`;
          })
          .join('\n')
      : '*(Belum ada pergantian sparepart/jasa)*';

    const extraCost = parseFloat(selectedOrder.additional_cost || selectedOrder.difficulty_surcharge || 0);
    const extraReason = selectedOrder.additional_cost_reason ? ` (${selectedOrder.additional_cost_reason})` : '';

    const notesText = additionalNotes ? `\n\n*Catatan Inspeksi Mekanik:*\n${additionalNotes}` : '';
    const extraCostText = extraCost > 0 ? `\n\n*Biaya Tambahan${extraReason}:*\nRp ${extraCost.toLocaleString('id-ID')}` : '';

    const totalAmount = parseFloat(selectedOrder.total_amount || 0);

    return `Halo Kak *${selectedOrder.customer?.name || selectedOrder.customer_name || 'Pelanggan'}*, berikut rincian diagnosa & estimasi biaya servis kendaraan *${selectedOrder.plate_number}* (${selectedOrder.vehicle?.brand_model || selectedOrder.vehicle_brand_model || 'Mobil'}) di Bekti Auto Solution:\n\n*Rincian Component & Jasa:*\n${itemDetailsText}${notesText}${extraCostText}\n\n*Total Estimasi Biaya: Rp ${totalAmount.toLocaleString('id-ID')}*\n\nMohon konfirmasi balasan *ACC* untuk memulai pengerjaan. Terima kasih!`;
  };

  const handleSendWhatsAppEstimate = () => {
    if (!selectedOrder) return;

    const rawWa = selectedOrder.customer?.whatsapp_number || selectedOrder.whatsapp_number || '';
    const waNumber = rawWa.startsWith('0') ? `62${rawWa.slice(1)}` : rawWa;
    const textMsg = encodeURIComponent(generateWhatsAppMessage());

    window.open(`https://wa.me/${waNumber}?text=${textMsg}`, '_blank');
    handleAdvanceStatus('PENDING_ACC', 'Estimasi berhasil terkirim via WhatsApp. Menunggu ACC Pelanggan.');
  };

  const generateCompletionWhatsAppMessage = () => {
    if (!selectedOrder) return '';

    const customerName = selectedOrder.customer?.name || selectedOrder.customer_name || 'Pelanggan';
    const vehicle = selectedOrder.vehicle?.brand_model || selectedOrder.vehicle_brand_model || 'kendaraan';

    return `Halo Kak *${customerName}*, kami informasikan pengerjaan servis kendaraan *${selectedOrder.plate_number}* (${vehicle}) dengan nomor order *${selectedOrder.order_code}* di Bekti Auto Solution telah selesai.\n\nKendaraan sudah siap untuk diambil. Terima kasih!`;
  };

  const handleCompleteAndNotifyWhatsApp = async () => {
    if (!selectedOrder) return;

    const rawWa = selectedOrder.customer?.whatsapp_number || selectedOrder.whatsapp_number || '';
    const digits = rawWa.replace(/\D/g, '');
    const waNumber = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;

    if (!waNumber) {
      showToast('error', 'Nomor WhatsApp Tidak Ada', 'Nomor WhatsApp pelanggan belum terdaftar pada order ini.');
      return;
    }

    const textMsg = encodeURIComponent(generateCompletionWhatsAppMessage());
    const whatsappWindow = window.open('about:blank', '_blank');

    if (!whatsappWindow) {
      showToast('error', 'WhatsApp Tidak Terbuka', 'Izinkan pop-up browser, lalu coba kembali. Status order belum diubah.');
      return;
    }

    whatsappWindow.opener = null;

    try {
      await API.patch(`/workshop/orders/${selectedOrder.id}/status`, {
        status: 'READY_FOR_PICKUP',
      });
      whatsappWindow.location.href = `https://wa.me/${waNumber}?text=${textMsg}`;
      showToast('success', 'Pengerjaan Selesai', 'Draft WhatsApp dibuka dan order dipindahkan ke Menunggu Pembayaran.');
    } catch (err: any) {
      whatsappWindow.close();
      showToast(
        'error',
        'Gagal Menyelesaikan Order',
        err.response?.data?.message || 'Status order tidak berhasil diperbarui.'
      );
      return;
    }

    navigate('/admin/workshop?stage=ready');
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400 font-medium">
        Memuat detail pengerjaan...
      </div>
    );
  }

  if (!selectedOrder) return null;

  const orderItemsList = selectedOrder.items || selectedOrder.details || selectedOrder.order_items || [];
  const extraCostVal = parseFloat(selectedOrder.additional_cost || selectedOrder.difficulty_surcharge || 0);
  const currentStage = getWorkshopWorkflowStageId(selectedOrder.status);
  const isTerminalOrder = ['COMPLETED', 'CANCELLED'].includes(selectedOrder.status);
  const isReadOnlyView = isTerminalOrder || (viewedStage !== undefined && viewedStage !== currentStage);
  const isViewingDiagnosis = isReadOnlyView && viewedStage === 'diagnosis';
  const approvalHistory = Array.isArray(selectedOrder.approved_items)
    ? selectedOrder.approved_items
    : [];
  const diagnosisItemsList =
    isViewingDiagnosis && approvalHistory.length > 0
      ? approvalHistory.map((snapshot: any) => ({
          ...orderItemsList.find((item: any) => String(item.id) === String(snapshot.id)),
          ...snapshot,
        }))
      : orderItemsList;

  const isPostApprovalState = !isViewingDiagnosis && [
    'IN_PROGRESS',
    'READY_FOR_PICKUP',
    'READY',
    'COMPLETED',
    'CANCELLED',
  ].includes(selectedOrder.status);
  const progressMessage =
    selectedOrder.status === 'CANCELLED'
      ? 'Order ini dibatalkan. Rincian yang tersimpan ditampilkan sebagai catatan riwayat.'
      : selectedOrder.status === 'COMPLETED'
        ? 'Pembayaran telah dicatat lunas. Order selesai dan tersimpan di riwayat.'
        : isReadOnlyView && viewedStage === 'in_progress'
          ? `Tahap pengerjaan ditampilkan kembali. Status order saat ini ${getWorkshopStatusLabel(selectedOrder.status)}.`
          : ['READY_FOR_PICKUP', 'READY'].includes(selectedOrder.status)
            ? 'Pengerjaan servis telah selesai. Kendaraan siap untuk diambil.'
            : 'Unit kendaraan sedang dalam tahap pengerjaan fisik oleh tim mekanik sesuai instruksi & komponen yang telah disetujui.';

  // Format Tampilan Status Rentang / Target Selesai
  const formatCompletionBadge = () => {
    if (!selectedOrder.estimated_completion_date) return 'Belum Ditentukan';

    const startDate = new Date(selectedOrder.created_at || Date.now());
    const endDate = new Date(selectedOrder.estimated_completion_date);

    const diffHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

    // Jika di bawah 24 jam dan tanggal sama
    if (diffHours < 24 && startDate.getDate() === endDate.getDate()) {
      return `Hari Ini, s/d Jam ${endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    }

    // Jika rentang hari
    const startStr = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const endStr = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return `${startStr}  ⟶  ${endStr}`;
  };

  const renderIdentityCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="bg-slate-900 px-5 py-2.5 text-white flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 font-bold tracking-wide">
          <CarFront className="w-4 h-4 text-red-500" />
          <span>IDENTITAS UNIT & PELANGGAN</span>
        </div>
        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-slate-700">
          {selectedOrder.queue_type === 'drop_off' ? 'Drop-Off' : 'Onsite'}
        </span>
      </div>

      <div className="p-4 space-y-3 bg-slate-50/40">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Spesifikasi Unit</span>
            <strong className="text-slate-900 font-bold block text-xs truncate">
              {selectedOrder.vehicle?.brand_model || selectedOrder.vehicle_brand_model || '-'}
            </strong>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> Pemilik / Pelanggan
            </span>
            <strong className="text-slate-900 font-bold block text-xs truncate">
              {selectedOrder.customer?.name || selectedOrder.customer_name || '-'}
            </strong>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" /> WhatsApp
            </span>
            <strong className="text-slate-900 font-mono font-bold block text-xs truncate">
              {selectedOrder.customer?.whatsapp_number || selectedOrder.whatsapp_number || '-'}
            </strong>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" /> Odometer
            </span>
            <strong className="text-slate-900 font-mono font-bold block text-xs truncate">
              {selectedOrder.current_mileage_km ? `${Number(selectedOrder.current_mileage_km).toLocaleString('id-ID')} KM` : '-'}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-4 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Alamat Pelanggan</span>
              <span className="text-slate-800 text-xs font-medium leading-relaxed block break-words">
                {selectedOrder.customer_address || selectedOrder.customer?.address || '-'}
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
                "{selectedOrder.initial_complaint || 'Pemeriksaan & perawatan rutin.'}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 w-full pb-16 font-sans">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              returnStage === 'history'
                ? navigate('/admin/workshop/history')
                : navigate(`/admin/workshop?stage=${returnStage}`)
            }
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition shadow-2xs flex items-center justify-center group cursor-pointer"
            title={returnStage === 'history' ? 'Kembali ke Riwayat Workshop' : 'Kembali ke Daftar Workshop'}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Pengerjaan Servis <span className="text-red-600">•</span> {selectedOrder.plate_number}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">{selectedOrder.order_code}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-400">Status:</span>
          <span
            className={`text-white text-[11px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider font-mono shadow-2xs ${
              selectedOrder.status === 'CANCELLED'
                ? 'bg-red-500'
                : isPostApprovalState
                  ? 'bg-emerald-600'
                  : 'bg-red-500'
            }`}
          >
            {getWorkshopStatusLabel(selectedOrder.status)}
          </span>
        </div>
      </div>

      <WorkshopProcessStepper
        orderId={selectedOrder.id}
        currentStage={currentStage}
        viewedStage={viewedStage}
        isCompleted={selectedOrder.status === 'COMPLETED'}
        isCancelled={selectedOrder.status === 'CANCELLED'}
        returnStage={returnStage}
      />

      {/* 2. MAIN WORKSPACE GRID */}
      {isPostApprovalState ? (
        /* MODE RINGKASAN PENGERJAAN WORK ORDER (SETELAH ACC / IN_PROGRESS) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-5">
            {renderIdentityCard()}

            {/* Daftar ringkasan item disetujui (Fixed Scope) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Rincian Komponen & Jasa Disetujui (ACC)
                  </h2>
                  <p className="text-[10px] text-slate-500">Item perbaikan final yang disepakati pelanggan</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-lg">
                Total: {orderItemsList.length} Item
              </span>
            </div>

            <div className="space-y-2.5">
              {orderItemsList.map((item: any, idx: number) => {
                const price = parseFloat(item.price || item.cost || 0);
                const qty = parseInt(item.quantity || item.qty || 1);
                const total = price * qty;
                const isService = (item.item_type || item.type || '').toLowerCase() === 'service' || (item.item_type || item.type || '').toLowerCase() === 'jasa';

                return (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        {isService ? (
                          <Wrench className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Package className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.item_name || item.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500">
                          Rp {price.toLocaleString('id-ID')} x {qty}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900">
                      Rp {total.toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
            </div>

            {extraCostVal > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex justify-between items-center text-xs shadow-2xs">
                <span className="font-bold text-amber-900">
                  Biaya Tambahan Khusus ({selectedOrder.additional_cost_reason || 'Pengerjaan Rumit'})
                </span>
                <span className="font-black text-amber-900 font-mono">
                  Rp {extraCostVal.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Total Biaya Pengerjaan ACC:</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                Rp {parseFloat(selectedOrder.total_amount || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          </div>

          {/* KOLOM KANAN (5 KOLOM): Status Monitoring & Catatan ACC */}
          <div className="lg:col-span-5 space-y-5">
            {/* Widget Hero Status Monitoring Unit */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden border border-slate-700/80">
              {/* Pattern Hiasan Akses Merah BAS */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute right-12 top-2 w-20 h-20 bg-red-500/15 rounded-full blur-lg pointer-events-none" />

              {/* Header Monitoring */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30">
                    <Clock className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5 text-slate-100">
                    Monitoring Progress <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </span>
                </div>
              </div>

              {/* Card Estimasi Selesai (Sangat Terlihat / Hero Visual) */}
              {selectedOrder.estimated_completion_date && (
                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 space-y-2 relative z-10 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      Estimasi Target Selesai
                    </span>
                    {selectedOrder.estimated_days && (
                      <span className="text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-md shadow-2xs font-mono">
                        {selectedOrder.estimated_days} Hari Pengerjaan
                      </span>
                    )}
                  </div>

                  <div className="text-base sm:text-lg font-black text-white tracking-tight font-mono bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-700/60 text-center text-emerald-400 shadow-2xs">
                    {formatCompletionBadge()}
                  </div>
                </div>
              )}

              {/* Keterangan Singkat Progress */}
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium relative z-10 opacity-90">
                {progressMessage}
              </p>
            </div>

            {selectedOrder.status === 'IN_PROGRESS' && (
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xs p-4 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Draft WhatsApp: Pengerjaan Selesai</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Pesan akan dibuka di WhatsApp sebagai draft dan belum terkirim.
                  </p>
                </div>
                <p className="bg-[#E7F3EF] border border-emerald-200/60 p-3 rounded-xl text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generateCompletionWhatsAppMessage()}
                </p>
              </div>
            )}

            {additionalNotes && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
                  Catatan Inspeksi Mekanik:
                </span>
                <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  "{additionalNotes}"
                </p>
              </div>
            )}

            {selectedOrder.user_acc_notes && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block border-b border-slate-100 pb-2">
                  Catatan Instruksi Pelanggan (ACC):
                </span>
                <p className="text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100/80 whitespace-pre-wrap">
                  "{selectedOrder.user_acc_notes}"
                </p>
              </div>
            )}

            {selectedOrder.status === 'COMPLETED' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Rincian Pembayaran
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-[10px] font-bold text-slate-400">Metode</span>
                    <span className="font-bold text-slate-800">
                      {selectedOrder.payment_method === 'CASH'
                        ? 'Tunai'
                        : selectedOrder.payment_method === 'TRANSFER'
                          ? 'Transfer Bank'
                          : selectedOrder.payment_method === 'QRIS'
                            ? 'QRIS'
                            : '-'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-[10px] font-bold text-slate-400">Waktu Pembayaran</span>
                    <span className="font-bold text-slate-800">
                      {selectedOrder.paid_at
                        ? new Date(selectedOrder.paid_at).toLocaleString('id-ID')
                        : '-'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-[10px] font-bold text-slate-400">Uang Diterima</span>
                    <span className="font-bold text-slate-800">
                      Rp {Number(selectedOrder.amount_received || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-[10px] font-bold text-slate-400">Kembalian</span>
                    <span className="font-bold text-slate-800">
                      Rp {Number(selectedOrder.change_amount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {selectedOrder.payment_reference && (
                    <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                      <span className="block text-[10px] font-bold text-slate-400">Referensi</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedOrder.payment_reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isReadOnlyView && <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
              {/* Garis pemisah atas card tindakan dihilangkan */}
              <WorkshopActionFooter
                status={selectedOrder.status}
                orderId={selectedOrder.id}
                totalAmount={parseFloat(selectedOrder.total_amount || 0)}
                onAdvanceStatus={handleAdvanceStatus}
                onSendWhatsApp={handleSendWhatsAppEstimate}
                onCompleteAndNotifyWhatsApp={handleCompleteAndNotifyWhatsApp}
              />
            </div>}
          </div>
        </div>
      ) : (
        /* MODE EDITOR DIAGNOSA & INSPEKSI (SEBELUM ACC / QUEUED / INSPECTING / PENDING_ACC) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6 space-y-5">
            {renderIdentityCard()}

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ClipboardEdit className="w-4 h-4 text-red-600" />
                  Catatan Inspeksi / Kerusakan Tambahan Mekanik
                </h3>
                <span className="text-[10px] font-medium text-slate-400 italic">
                  {isSavingNotes ? 'Menyimpan...' : 'Tersimpan'}
                </span>
              </div>

              <div>
                <textarea
                  value={additionalNotes}
                  onChange={handleNotesChange}
                  disabled={isReadOnlyView}
                  placeholder="Tuliskan temuan fisik pembongkaran atau part aus tambahan..."
                  rows={4}
                  className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white resize-none transition disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <MessageSquareCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Format Chat Estimasi WhatsApp</h3>
                    <p className="text-[10px] text-slate-500">Preview pesan otomatis sebelum dikirim ke pelanggan</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md">
                  Live Preview
                </span>
              </div>

              <div className="bg-[#E7F3EF] border border-emerald-200/60 p-4 rounded-2xl rounded-tl-xs text-[11px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed shadow-inner">
                {generateWhatsAppMessage()}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rincian Diagnosa & Komponen Perbaikan
              </h2>
              <span className="text-xs font-medium text-slate-500">
                Total Item: <strong className="text-slate-900">{diagnosisItemsList.length + (extraCostVal > 0 ? 1 : 0)}</strong>
              </span>
            </div>

            <ItemDiagnosisForm
              items={diagnosisItemsList}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              additionalCost={extraCostVal}
              additionalCostReason={selectedOrder.additional_cost_reason || ''}
              onSaveAdditionalCost={handleSaveAdditionalCost}
              isReadOnly={isReadOnlyView}
            />

            {!isReadOnlyView && (
              <WorkshopActionFooter
                status={selectedOrder.status}
                orderId={selectedOrder.id}
                totalAmount={parseFloat(selectedOrder.total_amount || 0)}
                onAdvanceStatus={handleAdvanceStatus}
                onSendWhatsApp={handleSendWhatsAppEstimate}
                onCompleteAndNotifyWhatsApp={handleCompleteAndNotifyWhatsApp}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
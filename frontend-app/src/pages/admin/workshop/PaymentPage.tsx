import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Banknote, CarFront, CheckCircle, CreditCard, Loader2, QrCode, User } from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';
import { WorkshopProcessStepper } from '../../../components/workshop/WorkshopProcessStepper';
import { getWorkshopWorkflowStageIdFromQuery } from '../../../components/workshop/workshopStages';

type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS';

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'CASH', label: 'Tunai', description: 'Catat uang yang diterima', icon: Banknote },
  { value: 'TRANSFER', label: 'Transfer Bank', description: 'Catat referensi transaksi', icon: CreditCard },
  { value: 'QRIS', label: 'QRIS', description: 'Konfirmasi pembayaran QRIS', icon: QrCode },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

export const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnStage = searchParams.get('stage') || 'ready';
  const viewedStage = getWorkshopWorkflowStageIdFromQuery(searchParams.get('viewStage'));
  const returnToList =
    returnStage === 'history' ? '/admin/workshop/history' : '/admin/workshop?stage=ready';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      if (!id) {
        showToast('error', 'Order Tidak Ditemukan', 'ID order pembayaran tidak tersedia.');
        navigate(returnToList, { replace: true });
        return;
      }

      try {
        setLoading(true);
        const response = await API.get(`/workshop/orders/${id}`);
        const loadedOrder = response.data?.order || response.data?.data || response.data;

        if (!loadedOrder) {
          showToast('error', 'Order Tidak Ditemukan', 'Data order tidak ditemukan.');
          navigate(returnToList, { replace: true });
          return;
        }

        const isCompletedHistoryView =
          loadedOrder.status === 'COMPLETED' && viewedStage === 'ready';
        if (!['READY_FOR_PICKUP', 'READY'].includes(loadedOrder.status) && !isCompletedHistoryView) {
          showToast('error', 'Order Belum Siap Dibayar', 'Pilih order pada tahap Menunggu Pembayaran.');
          navigate(returnToList, { replace: true });
          return;
        }

        if (active) {
          setOrder(loadedOrder);
          setAmountReceived(String(Number(loadedOrder.total_amount || 0)));
        }
      } catch (err: any) {
        showToast(
          'error',
          'Gagal Memuat Order',
          err.response?.data?.message || 'Data pembayaran tidak dapat dimuat.'
        );
        navigate(returnToList, { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [id, navigate, returnToList, viewedStage]);

  const isPaidHistoryView = order?.status === 'COMPLETED' && viewedStage === 'ready';
  const amountDue = Number(order?.total_amount || 0);
  const receivedAmount = Number(amountReceived || 0);
  const changeAmount = Math.max(0, receivedAmount - amountDue);
  const items = order?.items || order?.details || order?.order_items || [];
  const paidAt = order?.paid_at ? new Date(order.paid_at) : null;
  const paymentMethodLabel =
    order?.payment_method === 'CASH'
      ? 'Tunai'
      : order?.payment_method === 'TRANSFER'
        ? 'Transfer Bank'
        : order?.payment_method === 'QRIS'
          ? 'QRIS'
          : '-';
  const canSubmit = !submitting && (
    paymentMethod !== 'CASH' || (amountReceived !== '' && receivedAmount >= amountDue)
  );

  const handleSubmitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order || !id || submitting) return;

    if (paymentMethod === 'CASH' && receivedAmount < amountDue) {
      showToast('error', 'Nominal Kurang', 'Uang yang diterima harus minimal sama dengan total pembayaran.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/workshop/orders/${id}/payment`, {
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'CASH' ? receivedAmount : amountDue,
        payment_reference: paymentMethod === 'CASH' ? null : paymentReference.trim() || null,
      });

      showToast('success', 'Pembayaran Berhasil', 'Order telah lunas dan masuk ke riwayat.');
      navigate('/admin/workshop/history');
    } catch (err: any) {
      const validationErrors = Object.values(err.response?.data?.errors || {}).flat();
      showToast(
        'error',
        'Pembayaran Gagal',
        validationErrors.join(' ') || err.response?.data?.message || 'Pembayaran tidak dapat disimpan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-xs font-medium text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-red-600" />
        Memuat detail pembayaran...
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="w-full space-y-5 pb-12">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => navigate(returnToList)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
          title={isPaidHistoryView ? 'Kembali ke Riwayat Workshop' : 'Kembali ke Menunggu Pembayaran'}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
            {isPaidHistoryView ? 'Pembayaran Selesai' : 'Menunggu Pembayaran'}
          </p>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            {isPaidHistoryView ? 'Riwayat Pembayaran' : 'Proses Pembayaran'}
          </h1>
          <p className="text-xs text-slate-500">{order.order_code} · {order.plate_number}</p>
        </div>
      </header>

      <WorkshopProcessStepper
        orderId={order.id}
        currentStage="ready"
        viewedStage={viewedStage}
        isCompleted={isPaidHistoryView}
        returnStage={returnStage}
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Ringkasan Order</h2>
              <p className="text-[11px] text-slate-500">
                {isPaidHistoryView
                  ? 'Rincian order saat pembayaran berhasil dicatat.'
                  : 'Pastikan rincian servis sesuai sebelum menerima pembayaran.'}
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              {isPaidHistoryView ? 'Lunas' : 'Menunggu Pembayaran'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <User className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400">Pelanggan</p>
                <p className="text-xs font-bold text-slate-900">
                  {order.customer?.name || order.customer_name || '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <CarFront className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400">Kendaraan</p>
                <p className="text-xs font-bold text-slate-900">
                  {order.vehicle?.brand_model || order.vehicle_brand_model || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F3] text-slate-600">
                <tr>
                  <th className="px-3 py-2.5 font-bold">Item Disetujui</th>
                  <th className="px-3 py-2.5 text-center font-bold">Jumlah</th>
                  <th className="px-3 py-2.5 text-right font-bold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, index: number) => {
                  const quantity = Number(item.quantity || item.qty || 1);
                  const unitPrice = Number(item.price || item.cost || 0);

                  return (
                    <tr key={item.id || index}>
                      <td className="px-3 py-3 font-semibold text-slate-800">{item.item_name || item.name || '-'}</td>
                      <td className="px-3 py-3 text-center text-slate-600">{quantity}</td>
                      <td className="px-3 py-3 text-right font-bold text-slate-800">
                        {formatCurrency(unitPrice * quantity)}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                      Tidak ada rincian item pada order ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {Number(order.additional_cost || order.difficulty_surcharge || 0) > 0 && (
            <div className="flex justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs">
              <span className="font-semibold text-amber-900">
                Biaya tambahan {order.additional_cost_reason ? `(${order.additional_cost_reason})` : ''}
              </span>
              <span className="font-bold text-amber-900">
                {formatCurrency(Number(order.additional_cost || order.difficulty_surcharge))}
              </span>
            </div>
          )}

          <div className="flex items-end justify-between border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-500">
              {isPaidHistoryView ? 'Total pembayaran' : 'Total yang harus dibayar'}
            </span>
            <span className="text-2xl font-black tracking-tight text-emerald-700">{formatCurrency(amountDue)}</span>
          </div>
        </section>

        {isPaidHistoryView ? (
          <section className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">Pembayaran Tercatat</h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Transaksi ini sudah lunas dan tidak dapat diubah dari riwayat.
                </p>
              </div>
              <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">
                Lunas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-500">Metode Pembayaran</p>
                <p className="mt-1 text-sm font-black text-slate-900">{paymentMethodLabel}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-500">Waktu Pembayaran</p>
                <p className="mt-1 text-xs font-bold text-slate-900">
                  {paidAt && !Number.isNaN(paidAt.getTime()) ? paidAt.toLocaleString('id-ID') : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-500">Uang Diterima</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {order.amount_received == null
                    ? '-'
                    : formatCurrency(Number(order.amount_received))}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-500">Kembalian</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {order.change_amount == null
                    ? '-'
                    : formatCurrency(Number(order.change_amount))}
                </p>
              </div>
              {order.payment_reference && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold text-slate-500">Referensi Transaksi</p>
                  <p className="mt-1 break-all font-mono text-xs font-bold text-slate-900">
                    {order.payment_reference}
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
        <form
          onSubmit={handleSubmitPayment}
          className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-5"
        >
          <div>
            <h2 className="text-sm font-black text-slate-900">Metode Pembayaran</h2>
            <p className="mt-1 text-[11px] text-slate-500">Pembayaran harus lunas untuk menyelesaikan order.</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {paymentMethods.map(({ value, label, description, icon: Icon }) => {
              const isSelected = paymentMethod === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'border-red-600 bg-red-50 ring-1 ring-red-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-900">{label}</span>
                    <span className="block text-[10px] text-slate-500">{description}</span>
                  </span>
                  {isSelected && <CheckCircle className="h-4 w-4 text-red-600" />}
                </button>
              );
            })}
          </div>

          {paymentMethod === 'CASH' ? (
            <div className="space-y-2">
              <label htmlFor="amount-received" className="text-xs font-bold text-slate-700">
                Uang diterima
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-[#F4F5F3] transition focus-within:border-red-600 focus-within:bg-white">
                <span className="shrink-0 pl-3 text-xs font-bold text-slate-400">Rp</span>
                <input
                  id="amount-received"
                  type="number"
                  min={amountDue}
                  step="0.01"
                  value={amountReceived}
                  onChange={(event) => setAmountReceived(event.target.value)}
                  className="w-full min-w-0 bg-transparent py-2.5 pl-2 pr-3 text-sm font-bold text-slate-900 outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                <span className="text-xs font-semibold text-emerald-800">Kembalian</span>
                <span className="text-sm font-black text-emerald-800">{formatCurrency(changeAmount)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-500">Nominal pembayaran penuh</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatCurrency(amountDue)}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="payment-reference" className="text-xs font-bold text-slate-700">
                  Nomor referensi transaksi <span className="font-medium text-slate-400">(opsional)</span>
                </label>
                <input
                  id="payment-reference"
                  type="text"
                  maxLength={100}
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder="Masukkan nomor referensi"
                  className="w-full rounded-xl border border-slate-300 bg-[#F4F5F3] px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition focus:border-red-600 focus:bg-white"
                />
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Pastikan transfer atau pembayaran QRIS sudah diterima sebelum menyimpan.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-extrabold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {submitting ? 'Menyimpan Pembayaran...' : 'Simpan Pembayaran & Selesaikan Order'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, ReceiptText, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

type FinanceSummary = {
  total_income: number;
  total_hpp: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
};

type FinancePayment = {
  id: number;
  order_code: string;
  plate_number: string;
  total_amount: string | number;
  payment_method: 'CASH' | 'TRANSFER' | 'QRIS';
  amount_received: string | number | null;
  change_amount: string | number | null;
  paid_at: string;
};

type FinanceExpense = {
  id: number;
  title: string;
  category: string | null;
  amount: string | number;
  expense_date: string;
  notes: string | null;
};

type FinanceReport = {
  summary: FinanceSummary;
  payments: FinancePayment[];
  expenses: FinanceExpense[];
};

const emptySummary: FinanceSummary = {
  total_income: 0,
  total_hpp: 0,
  total_expenses: 0,
  gross_profit: 0,
  net_profit: 0,
};

const localDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatCurrency = (amount: number | string | null | undefined) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-';

const paymentMethodLabel = (method: FinancePayment['payment_method']) => {
  if (method === 'CASH') return 'Tunai';
  if (method === 'TRANSFER') return 'Transfer';
  return 'QRIS';
};

export const FinancePage: React.FC = () => {
  const [report, setReport] = useState<FinanceReport>({
    summary: emptySummary,
    payments: [],
    expenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(localDate);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let active = true;

    const fetchReport = async () => {
      try {
        const response = await API.get('/finance/report');
        if (active) {
          setReport({
            summary: { ...emptySummary, ...response.data?.summary },
            payments: response.data?.payments || [],
            expenses: response.data?.expenses || [],
          });
        }
      } catch (error: any) {
        showToast(
          'error',
          'Gagal Memuat Laporan',
          error.response?.data?.message || 'Data laporan keuangan tidak dapat dimuat.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmitExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await API.post('/finance/expenses', {
        title: title.trim(),
        category: category.trim() || null,
        amount,
        expense_date: expenseDate,
        notes: notes.trim() || null,
      });
      const newExpense: FinanceExpense = response.data.expense;
      const expenseAmount = Number(newExpense.amount);

      setReport((current) => ({
        ...current,
        summary: {
          ...current.summary,
          total_expenses: current.summary.total_expenses + expenseAmount,
          net_profit: current.summary.net_profit - expenseAmount,
        },
        expenses: [newExpense, ...current.expenses].slice(0, 100),
      }));
      setTitle('');
      setCategory('');
      setAmount('');
      setExpenseDate(localDate());
      setNotes('');
      showToast('success', 'Pengeluaran Tercatat', 'Pengeluaran berhasil disimpan.');
    } catch (error: any) {
      const validationErrors = Object.values(error.response?.data?.errors || {}).flat();
      showToast(
        'error',
        'Gagal Mencatat Pengeluaran',
        validationErrors.join(' ') || error.response?.data?.message || 'Pengeluaran tidak dapat disimpan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const summaryCards = [
    {
      label: 'Total Uang Masuk (Lunas)',
      amount: report.summary.total_income,
      icon: Wallet,
      cardClass: 'border-slate-200/90 bg-white',
      labelClass: 'text-slate-400',
      amountClass: 'text-slate-900',
      iconClass: 'text-emerald-600',
    },
    {
      label: 'HPP Sparepart',
      amount: report.summary.total_hpp,
      icon: TrendingDown,
      cardClass: 'border-slate-200/90 bg-white',
      labelClass: 'text-slate-400',
      amountClass: 'text-slate-700',
      iconClass: 'text-slate-500',
    },
    {
      label: 'Total Pengeluaran',
      amount: report.summary.total_expenses,
      icon: ReceiptText,
      cardClass: 'border-slate-200/90 bg-white',
      labelClass: 'text-slate-400',
      amountClass: 'text-red-700',
      iconClass: 'text-red-600',
    },
    {
      label: 'Estimasi Laba Bersih',
      amount: report.summary.net_profit,
      icon: TrendingUp,
      cardClass: 'border-amber-200/90 bg-[#FFF8E7]',
      labelClass: 'text-amber-900',
      amountClass: 'text-amber-950',
      iconClass: 'text-amber-800',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <span className="bg-[#FFF8E7] text-amber-900 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
          Laporan Keuangan
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Keuangan & Audit Trail</h1>
        <p className="text-xs text-slate-500">
          Omzet dari order lunas, estimasi HPP sparepart, pengeluaran, dan laba bersih bengkel.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, amount: value, icon: Icon, cardClass, labelClass, amountClass, iconClass }) => (
          <div key={label} className={`space-y-2 rounded-2xl border p-5 shadow-sm ${cardClass}`}>
            <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${labelClass}`}>
              <Icon className={`h-4 w-4 ${iconClass}`} />
              {label}
            </p>
            <h3 className={`text-xl font-extrabold ${amountClass}`}>
              {loading ? <span className="text-sm font-semibold text-slate-400">Memuat...</span> : formatCurrency(value)}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <form
          onSubmit={handleSubmitExpense}
          className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm xl:col-span-4"
        >
          <div>
            <h2 className="text-sm font-black text-slate-900">Catat Pengeluaran</h2>
            <p className="mt-1 text-[11px] text-slate-500">Simpan biaya operasional atau pengeluaran bengkel lainnya.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="expense-title" className="text-xs font-bold text-slate-700">Nama pengeluaran</label>
            <input
              id="expense-title"
              required
              maxLength={255}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Listrik bengkel"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-red-600 focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="expense-category" className="text-xs font-bold text-slate-700">Kategori (opsional)</label>
              <input
                id="expense-category"
                maxLength={100}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Operasional"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="expense-date" className="text-xs font-bold text-slate-700">Tanggal</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="expense-date"
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-2 text-xs outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="text-xs font-bold text-slate-700">Nominal pengeluaran</label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 focus-within:border-red-600 focus-within:bg-white">
              <span className="pl-3 text-xs font-bold text-slate-400">Rp</span>
              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="w-full min-w-0 bg-transparent py-2.5 pl-2 pr-3 text-xs outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="expense-notes" className="text-xs font-bold text-slate-700">Catatan (opsional)</label>
            <textarea
              id="expense-notes"
              maxLength={2000}
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Keterangan tambahan"
              className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-red-600 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {submitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm xl:col-span-8">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-black text-slate-900">Riwayat Pengeluaran</h2>
            <p className="mt-1 text-[11px] text-slate-500">Maksimal 100 pencatatan terbaru.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Tanggal</th>
                  <th className="px-4 py-3 font-bold">Pengeluaran</th>
                  <th className="px-4 py-3 font-bold">Kategori</th>
                  <th className="px-4 py-3 text-right font-bold">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(expense.expense_date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{expense.title}</p>
                      {expense.notes && <p className="mt-0.5 text-[10px] text-slate-500">{expense.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{expense.category || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-red-700">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
                {!loading && report.expenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                      Belum ada pengeluaran yang dicatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-black text-slate-900">Pembayaran Order</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Hanya order yang sudah lunas dihitung sebagai omzet. Maksimal 100 transaksi terbaru.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Waktu Lunas</th>
                <th className="px-4 py-3 font-bold">Order / Kendaraan</th>
                <th className="px-4 py-3 font-bold">Metode</th>
                <th className="px-4 py-3 text-right font-bold">Total Dibayar</th>
                <th className="px-4 py-3 text-right font-bold">Diterima / Kembalian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(payment.paid_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{payment.order_code}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{payment.plate_number}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">
                      {paymentMethodLabel(payment.payment_method)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-800">
                    {formatCurrency(payment.total_amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                    {formatCurrency(payment.amount_received)} / {formatCurrency(payment.change_amount)}
                  </td>
                </tr>
              ))}
              {!loading && report.payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    Belum ada pembayaran order yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

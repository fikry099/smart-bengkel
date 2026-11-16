import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FilterX,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';
import {
  getWorkshopStatusLabel,
  getWorkshopWorkflowStageId,
  WORKSHOP_STAGES,
} from '../../../components/workshop/workshopStages';

interface DashboardOrder {
  id: number | string;
  orderCode: string;
  plateNumber: string;
  customerName: string;
  vehicleModel: string;
  status: string;
  createdAt: string | null;
  paidAt: string | null;
  totalAmount: number;
}

interface DashboardProduct {
  id: number | string;
  name: string;
  type: string;
  stock: number;
  minStock: number;
}

interface DashboardInventory {
  products: DashboardProduct[];
  lowStockCount: number;
}

type DashboardRange = 7 | 14 | 30;
type DashboardChartSource = 'revenue' | 'check-in';

interface DashboardDay {
  key: string;
  label: string;
  dateLabel: string;
  revenue: number;
  checkIns: number;
}

interface KpiItem {
  label: string;
  value: string;
  subtext: string;
  highlight?: 'warning' | 'positive';
  onClick?: () => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringValue = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const toNumberValue = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNullableDateString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const mapDashboardOrder = (value: unknown): DashboardOrder | null => {
  if (!isRecord(value) || typeof value.status !== 'string') return null;
  if (typeof value.id !== 'string' && typeof value.id !== 'number') return null;

  const customer = isRecord(value.customer) ? value.customer : {};
  const vehicle = isRecord(value.vehicle) ? value.vehicle : {};

  return {
    id: value.id,
    orderCode: toStringValue(value.order_code),
    plateNumber: toStringValue(value.plate_number),
    customerName: toStringValue(customer.name) || toStringValue(value.customer_name) || '-',
    vehicleModel:
      toStringValue(vehicle.brand_model) || toStringValue(value.vehicle_brand_model) || '-',
    status: value.status,
    createdAt: toNullableDateString(value.created_at),
    paidAt: toNullableDateString(value.paid_at),
    totalAmount: toNumberValue(value.total_amount),
  };
};

const mapDashboardProduct = (value: unknown): DashboardProduct | null => {
  if (!isRecord(value) || (typeof value.id !== 'string' && typeof value.id !== 'number')) {
    return null;
  }

  return {
    id: value.id,
    name: toStringValue(value.name) || 'Item tanpa nama',
    type: toStringValue(value.type),
    stock: toNumberValue(value.stock),
    minStock: toNumberValue(value.min_stock),
  };
};

const loadDashboardOrders = async (): Promise<DashboardOrder[]> => {
  const response = await API.get('/workshop/orders');
  const payload: unknown = response.data;
  const record = isRecord(payload) ? payload : null;
  const rows = record?.orders ?? record?.data ?? payload;

  if (!Array.isArray(rows)) {
    throw new Error('Format data order dari server tidak sesuai.');
  }

  return rows.map(mapDashboardOrder).filter((order): order is DashboardOrder => order !== null);
};

const loadDashboardInventory = async (): Promise<DashboardInventory> => {
  const response = await API.get('/products', { params: { page: 1, per_page: 1000 } });
  const payload: unknown = response.data;
  const record = isRecord(payload) ? payload : null;
  const rows = record?.products;

  if (!Array.isArray(rows)) {
    throw new Error('Format data inventori dari server tidak sesuai.');
  }

  const products = rows
    .map(mapDashboardProduct)
    .filter((product): product is DashboardProduct => product !== null);
  const stats = isRecord(record?.stats) ? record.stats : null;
  const lowStockCount =
    stats?.low_stock_count == null
      ? products.filter(
          (product) => product.type === 'sparepart' && product.stock <= product.minStock
        ).length
      : toNumberValue(stats.low_stock_count);

  return { products, lowStockCount };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const getDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getDateKeyFromValue = (value: string | null): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : getDateKey(parsed);
};

const buildDashboardTrend = (
  orders: DashboardOrder[],
  range: DashboardRange
): DashboardDay[] => {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const days = Array.from({ length: range }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(date.getDate() - (range - index - 1));
    const key = getDateKey(date);
    const dateLabel = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    return {
      key,
      label:
        range === 7
          ? date.toLocaleDateString('id-ID', { weekday: 'short' })
          : dateLabel,
      dateLabel,
      revenue: 0,
      checkIns: 0,
    };
  });
  const dayByKey = new Map(days.map((day) => [day.key, day]));

  orders.forEach((order) => {
    const checkInDay = getDateKeyFromValue(order.createdAt);
    const paidDay = getDateKeyFromValue(order.paidAt);

    if (checkInDay) {
      const day = dayByKey.get(checkInDay);
      if (day) day.checkIns += 1;
    }

    if (order.status === 'COMPLETED' && paidDay) {
      const day = dayByKey.get(paidDay);
      if (day) day.revenue += order.totalAmount;
    }
  });

  return days;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}rb`;
  return String(amount);
};

const formatDateTime = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'QUEUED':
      return 'bg-slate-100 text-slate-700';
    case 'INSPECTING':
    case 'INSPECTED':
      return 'bg-amber-50 text-amber-700';
    case 'PENDING_ACC':
    case 'WAITING_ACC':
      return 'bg-blue-50 text-blue-700';
    case 'IN_PROGRESS':
      return 'bg-indigo-50 text-indigo-700';
    case 'READY_FOR_PICKUP':
    case 'READY':
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const CustomChartTooltip = ({ active, payload, mode }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data: DashboardDay = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-medium text-slate-500">{data.dateLabel}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">
        {mode === 'revenue' ? formatCurrency(data.revenue) : `${data.checkIns} unit`}
      </p>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DashboardOrder[] | null>(null);
  const [products, setProducts] = useState<DashboardProduct[] | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartRange, setChartRange] = useState<DashboardRange>(7);
  const [activeMetricTab, setActiveMetricTab] = useState<DashboardChartSource>('revenue');
  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null);
  const [selectedChartSource, setSelectedChartSource] = useState<DashboardChartSource | null>(null);
  const [hiddenStageIds, setHiddenStageIds] = useState<string[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setOrdersError(null);
    setInventoryError(null);

    const [ordersResult, inventoryResult] = await Promise.allSettled([
      loadDashboardOrders(),
      loadDashboardInventory(),
    ]);

    if (ordersResult.status === 'fulfilled') {
      setOrders(ordersResult.value);
    } else {
      const message = getErrorMessage(ordersResult.reason, 'Gagal memuat data order workshop.');
      setOrders(null);
      setOrdersError(message);
      showToast('error', 'Dashboard Order', message);
    }

    if (inventoryResult.status === 'fulfilled') {
      setProducts(inventoryResult.value.products);
      setLowStockCount(inventoryResult.value.lowStockCount);
    } else {
      const message = getErrorMessage(inventoryResult.reason, 'Gagal memuat data inventori.');
      setProducts(null);
      setLowStockCount(null);
      setInventoryError(message);
      showToast('error', 'Dashboard Inventori', message);
    }

    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const today = new Date();
  const todayKey = getDateKey(today);
  const todayCheckIns =
    orders?.filter((order) => getDateKeyFromValue(order.createdAt) === todayKey).length ?? null;
  const servicesInProgress =
    orders?.filter((order) => order.status === 'IN_PROGRESS').length ?? null;
  const todayRevenue =
    orders
      ?.filter(
        (order) =>
          order.status === 'COMPLETED' && getDateKeyFromValue(order.paidAt) === todayKey
      )
      .reduce((total, order) => total + order.totalAmount, 0) ?? null;

  const trendDays = useMemo(
    () => buildDashboardTrend(orders ?? [], chartRange),
    [orders, chartRange]
  );

  const periodTotalRevenue = useMemo(
    () => trendDays.reduce((sum, day) => sum + day.revenue, 0),
    [trendDays]
  );
  const periodTotalCheckIns = useMemo(
    () => trendDays.reduce((sum, day) => sum + day.checkIns, 0),
    [trendDays]
  );

  const recentOrders = useMemo(() => {
    const sortedOrders = [...(orders ?? [])].sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
    });
    const filteredOrders = selectedChartDay
      ? sortedOrders.filter(
          (order) =>
            getDateKeyFromValue(
              selectedChartSource === 'revenue' ? order.paidAt : order.createdAt
            ) === selectedChartDay
        )
      : sortedOrders;

    return filteredOrders.slice(0, 7);
  }, [orders, selectedChartDay, selectedChartSource]);

  const lowStockItems = useMemo(
    () =>
      (products ?? [])
        .filter((product) => product.type === 'sparepart' && product.stock <= product.minStock)
        .sort((left, right) => left.stock - right.stock || left.name.localeCompare(right.name))
        .slice(0, 6),
    [products]
  );

  const stageRows = WORKSHOP_STAGES.filter((stage) => !['all', 'history'].includes(stage.id));
  const getStageCount = (statuses: string[]) =>
    orders?.filter((order) => statuses.includes(order.status)).length ?? null;
  const stageColors = ['#f59e0b', '#3b82f6', '#6366f1', '#10b981'];
  const stageSlices = stageRows.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    count: getStageCount(stage.statuses) ?? 0,
    color: stageColors[index] ?? '#64748b',
  }));
  const statusTotal = stageSlices.reduce((total, stage) => total + stage.count, 0);
  const visibleStageSlices = stageSlices.filter(
    (stage) => !hiddenStageIds.includes(stage.id) && stage.count > 0
  );
  const visibleStatusTotal = visibleStageSlices.reduce((total, stage) => total + stage.count, 0);

  const selectChartDay = (dayKey: string, source: DashboardChartSource) => {
    if (selectedChartDay === dayKey && selectedChartSource === source) {
      setSelectedChartDay(null);
      setSelectedChartSource(null);
      return;
    }
    setSelectedChartDay(dayKey);
    setSelectedChartSource(source);
  };

  const selectChartRange = (range: DashboardRange) => {
    setChartRange(range);
    setSelectedChartDay(null);
    setSelectedChartSource(null);
  };

  const toggleStageVisibility = (stageId: string) => {
    setHiddenStageIds((currentStages) =>
      currentStages.includes(stageId)
        ? currentStages.filter((id) => id !== stageId)
        : [...currentStages, stageId]
    );
  };

  const selectedChartDateLabel =
    trendDays.find((day) => day.key === selectedChartDay)?.dateLabel ?? null;

  const openOrder = (order: DashboardOrder) => {
    if (['PENDING_ACC', 'WAITING_ACC'].includes(order.status)) {
      navigate(`/admin/workshop/${order.id}/approval?stage=waiting_acc`);
      return;
    }
    if (['READY_FOR_PICKUP', 'READY'].includes(order.status)) {
      navigate(`/admin/workshop/${order.id}/payment`);
      return;
    }
    if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
      navigate(`/admin/workshop/${order.id}?stage=history`);
      return;
    }
    navigate(`/admin/workshop/${order.id}?stage=${getWorkshopWorkflowStageId(order.status)}`);
  };

  const kpiItems: KpiItem[] = [
    {
      label: 'Kedatangan Hari Ini',
      value: loading ? '…' : todayCheckIns === null ? '—' : `${todayCheckIns} unit`,
      subtext: 'Check-in masuk hari ini',
      onClick: () => navigate('/admin/workshop?stage=diagnosis'),
    },
    {
      label: 'Sedang Dikerjakan',
      value: loading ? '…' : servicesInProgress === null ? '—' : `${servicesInProgress} unit`,
      subtext: 'Dalam proses servis',
      onClick: () => navigate('/admin/workshop?stage=in_progress'),
    },
    {
      label: 'Stok Perlu Dicek',
      value: loading ? '…' : lowStockCount === null ? '—' : `${lowStockCount} item`,
      subtext: 'Di bawah batas minimum',
      highlight: lowStockCount && lowStockCount > 0 ? 'warning' : undefined,
      onClick: () => navigate('/admin/inventory'),
    },
    {
      label: 'Pendapatan Hari Ini',
      value: loading ? '…' : todayRevenue === null ? '—' : formatCurrency(todayRevenue),
      subtext: 'Transaksi selesai & lunas',
      highlight: 'positive',
      onClick: () => navigate('/admin/finance'),
    },
  ];

  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. PAGE HEADER BERSIH */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Ringkasan Operasional
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {formattedDate}
            {lastUpdated && (
              <span className="ml-2 text-slate-400">
                • Diperbarui{' '}
                {lastUpdated.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void fetchDashboardData()}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Check-in Unit
          </button>
        </div>
      </header>

      {/* 2. KPI SUMMARY STRIP */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiItems.map((item) => (
          <div
            key={item.label}
            onClick={item.onClick}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-600" />
            </div>
            <p
              className={`mt-2 text-2xl font-bold tracking-tight ${
                item.highlight === 'warning'
                  ? 'text-amber-600'
                  : item.highlight === 'positive'
                  ? 'text-slate-900'
                  : 'text-slate-900'
              }`}
            >
              {item.value}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{item.subtext}</p>
          </div>
        ))}
      </section>

      {/* 3. GRAFIK TREN (7 KOLOM) & STATUS PENANGANAN (5 KOLOM) */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* GRAFIK PENDAPATAN / CHECK-IN */}
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {activeMetricTab === 'revenue' ? 'Tren Pendapatan' : 'Tren Kedatangan Unit'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Total {chartRange} hari terakhir:{' '}
                <span className="font-semibold text-slate-800">
                  {activeMetricTab === 'revenue'
                    ? formatCurrency(periodTotalRevenue)
                    : `${periodTotalCheckIns} unit`}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('revenue')}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    activeMetricTab === 'revenue'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pendapatan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('check-in')}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    activeMetricTab === 'check-in'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Check-in
                </button>
              </div>

              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {([7, 14, 30] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => selectChartRange(range)}
                    className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition ${
                      chartRange === range
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {range}H
                  </button>
                ))}
              </div>
            </div>
          </div>

          {ordersError ? (
            <p className="rounded-lg bg-red-50 p-3.5 text-xs text-red-700">{ordersError}</p>
          ) : loading && !orders ? (
            <div className="flex h-60 items-center justify-center text-xs text-slate-400">
              Memuat grafik…
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetricTab === 'revenue' ? (
                  <AreaChart
                    data={trendDays}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    onClick={(state) => {
                      if (state?.activePayload?.[0]) {
                        const clickedDay: DashboardDay = state.activePayload[0].payload;
                        selectChartDay(clickedDay.key, 'revenue');
                      }
                    }}
                  >
                    <defs>
                      <linearGradient id="revenueCleanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.14} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatCompactCurrency}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      content={<CustomChartTooltip mode="revenue" />}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#dc2626"
                      strokeWidth={2}
                      fill="url(#revenueCleanGrad)"
                      activeDot={{
                        r: 5,
                        fill: '#dc2626',
                        stroke: '#ffffff',
                        strokeWidth: 2,
                        className: 'cursor-pointer',
                      }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={trendDays}
                    margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                    onClick={(state) => {
                      if (state?.activePayload?.[0]) {
                        const clickedDay: DashboardDay = state.activePayload[0].payload;
                        selectChartDay(clickedDay.key, 'check-in');
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      content={<CustomChartTooltip mode="check-in" />}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar
                      dataKey="checkIns"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      className="cursor-pointer"
                    >
                      {trendDays.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={
                            selectedChartDay === entry.key && selectedChartSource === 'check-in'
                              ? '#1e293b'
                              : '#475569'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </article>

        {/* STATUS PENANGANAN */}
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Status Penanganan</h2>
                <p className="mt-0.5 text-xs text-slate-500">Order aktif di workshop</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{statusTotal} unit</span>
            </div>

            {ordersError ? (
              <p className="mt-4 rounded-lg bg-red-50 p-3.5 text-xs text-red-700">{ordersError}</p>
            ) : loading && !orders ? (
              <div className="flex h-52 items-center justify-center text-xs text-slate-400">
                Memuat status…
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
                <div className="relative h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          visibleStatusTotal > 0
                            ? visibleStageSlices
                            : [{ id: 'empty', label: 'Kosong', count: 1, color: '#e2e8f0' }]
                        }
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={visibleStatusTotal > 0 ? 3 : 0}
                        stroke="none"
                      >
                        {visibleStatusTotal > 0 ? (
                          visibleStageSlices.map((stage) => (
                            <Cell key={stage.id} fill={stage.color} />
                          ))
                        ) : (
                          <Cell fill="#e2e8f0" />
                        )}
                      </Pie>
                      {visibleStatusTotal > 0 && (
                        <Tooltip
                          formatter={(value: any, name: any) => [`${value} unit`, name]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            borderRadius: '8px',
                            color: '#0f172a',
                            fontSize: '12px',
                          }}
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">{visibleStatusTotal}</span>
                    <span className="text-[11px] text-slate-400">Aktif</span>
                  </div>
                </div>

                <div className="w-full flex-1 space-y-1.5">
                  {stageSlices.map((stage) => {
                    const percentage =
                      statusTotal > 0 ? Math.round((stage.count / statusTotal) * 100) : 0;
                    const isVisible = !hiddenStageIds.includes(stage.id);

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => toggleStageVisibility(stage.id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-slate-50 ${
                          isVisible ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2 text-slate-700">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="truncate font-medium">{stage.label}</span>
                        </span>
                        <span className="shrink-0 font-medium text-slate-900">
                          {stage.count}{' '}
                          <span className="text-[11px] text-slate-400">({percentage}%)</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => navigate('/admin/workshop?stage=diagnosis')}
              className="inline-flex w-full cursor-pointer items-center justify-between text-xs font-medium text-slate-600 transition hover:text-slate-900"
            >
              <span>Lihat antrean service workshop</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </article>
      </section>

      {/* 4. ORDER TERBARU (8 KOLOM) & STOK PERLU DICEK (4 KOLOM) */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* TABEL ORDER TERBARU */}
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Order Terbaru</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedChartDateLabel
                  ? selectedChartSource === 'revenue'
                    ? `Menampilkan transaksi lunas pada ${selectedChartDateLabel}`
                    : `Menampilkan unit masuk pada ${selectedChartDateLabel}`
                  : 'Klik baris untuk membuka detail pengerjaan'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedChartDay && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChartDay(null);
                    setSelectedChartSource(null);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  <FilterX className="h-3 w-3" />
                  Hapus filter ({selectedChartDateLabel})
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/admin/workshop?stage=all')}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
              >
                Semua order
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400">
                  <th className="py-2.5 pr-3">No. Polisi</th>
                  <th className="px-3 py-2.5">Pelanggan</th>
                  <th className="px-3 py-2.5">Masuk</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersError ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-red-600">
                      Tidak dapat memuat data order.
                    </td>
                  </tr>
                ) : loading && !orders ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Memuat daftar order…
                    </td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => openOrder(order)}
                      className="group cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="py-3 pr-3">
                        <span className="block font-semibold text-slate-900 group-hover:text-red-600">
                          {order.plateNumber || '-'}
                        </span>
                        <span className="text-[11px] text-slate-400">{order.orderCode || '-'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="block font-medium text-slate-800">{order.customerName}</span>
                        <span className="text-[11px] text-slate-500">{order.vehicleModel}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{formatDateTime(order.createdAt)}</td>
                      <td className="py-3 pl-3 text-right">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {getWorkshopStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      {selectedChartDay
                        ? selectedChartSource === 'revenue'
                          ? `Tidak ada transaksi lunas pada ${selectedChartDateLabel ?? 'tanggal ini'}.`
                          : `Tidak ada unit masuk pada ${selectedChartDateLabel ?? 'tanggal ini'}.`
                        : 'Belum ada data order.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* STOK PERLU DICEK */}
        <article className="flex min-w-0 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Stok Perlu Dicek</h2>
                <p className="mt-0.5 text-xs text-slate-500">Di bawah batas minimum</p>
              </div>
              {lowStockCount !== null && lowStockCount > 0 && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {lowStockCount}
                </span>
              )}
            </div>

            {inventoryError ? (
              <p className="rounded-lg bg-red-50 p-3.5 text-xs text-red-700">{inventoryError}</p>
            ) : loading && !products ? (
              <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                Memuat inventori…
              </div>
            ) : lowStockItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {lowStockItems.map((product) => {
                  const isOut = product.stock === 0;
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span className="truncate text-xs font-medium text-slate-800">
                        {product.name}
                      </span>
                      <span
                        className={`shrink-0 text-xs font-semibold ${
                          isOut ? 'text-red-600' : 'text-amber-600'
                        }`}
                      >
                        {product.stock} / {product.minStock}
                      </span>
                    </div>
                  );
                })}
                {lowStockCount !== null && lowStockCount > lowStockItems.length && (
                  <p className="pt-2.5 text-[11px] text-slate-400">
                    +{lowStockCount - lowStockItems.length} item lainnya
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <p className="mt-2 text-xs font-medium text-slate-700">Semua stok mencukupi</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Tidak ada item di bawah batas minimum.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => navigate('/admin/inventory')}
              className="inline-flex w-full cursor-pointer items-center justify-between text-xs font-medium text-slate-600 transition hover:text-slate-900"
            >
              <span>Kelola stok inventori</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};
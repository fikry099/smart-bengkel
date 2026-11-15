import React, { useState } from 'react';
import { Search, Car } from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

import { StepWizard } from '../../../components/reception/StepWizard';
import { ReceptionItemSelector } from '../../../components/reception/ReceptionItemSelector';
import { SummaryCostCard } from '../../../components/reception/SummaryCostCard';
import { ReceptionActionBar } from '../../../components/reception/ReceptionActionBar';

export const ReceptionPage: React.FC = () => {
  const [plateNumber, setPlateNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); // State Alamat Pelanggan
  const [vehicleBrandModel, setVehicleBrandModel] = useState('');
  const [currentMileageKm, setCurrentMileageKm] = useState('');
  const [initialComplaint, setInitialComplaint] = useState('');
  const [initialItems, setInitialItems] = useState<any[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState(todayStr);

  const [queueType, setQueueType] = useState<'onsite' | 'drop_off'>('onsite');
  const [searching, setSearching] = useState(false);
  const [isMemberFound, setIsMemberFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStep1Complete = plateNumber.trim().length >= 3;
  const isStep2Complete =
    isStep1Complete &&
    customerName.trim() !== '' &&
    whatsappNumber.trim() !== '' &&
    initialComplaint.trim() !== '';

  const handleSearchPlate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!plateNumber.trim()) return;

    setSearching(true);
    try {
      const response = await API.get(`/vehicles/search/${encodeURIComponent(plateNumber)}`);
      const data = response.data;

      if (data && data.found && data.vehicle) {
        setIsMemberFound(true);
        setVehicleBrandModel(data.vehicle.brand_model || '');
        setCustomerName(data.vehicle.customer?.name || '');
        setWhatsappNumber(data.vehicle.customer?.whatsapp_number || '');
        setCustomerAddress(data.vehicle.customer?.address || ''); // Populate alamat jika ditemukan
        showToast('success', 'Member Ditemukan!', 'Data pelanggan & alamat dimuat otomatis.');
      } else {
        setIsMemberFound(false);
        showToast('info', 'Kendaraan Baru', 'Silakan lengkapi data pelanggan.');
      }
    } catch (err: any) {
      setIsMemberFound(false);
    } finally {
      setSearching(false);
    }
  };

  const handleResetForm = () => {
    setPlateNumber('');
    setCustomerName('');
    setWhatsappNumber('');
    setCustomerAddress('');
    setVehicleBrandModel('');
    setCurrentMileageKm('');
    setInitialComplaint('');
    setCheckInDate(todayStr);
    setInitialItems([]);
    setIsMemberFound(false);
    showToast('info', 'Direset', 'Form penerimaan telah dikosongkan.');
  };

  const handleSubmitWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const calculatedTotal = initialItems.reduce((acc, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        return acc + itemPrice * itemQty;
      }, 0);

      const payload = {
        plate_number: plateNumber.toUpperCase(),
        customer_name: customerName,
        whatsapp_number: whatsappNumber,
        customer_address: customerAddress, // Sertakan alamat dalam payload
        vehicle_brand_model: vehicleBrandModel,
        current_mileage_km: currentMileageKm ? parseInt(currentMileageKm) : null,
        initial_complaint: initialComplaint,
        check_in_date: checkInDate,
        queue_type: queueType,
        initial_items: initialItems,
        total_amount: calculatedTotal,
        estimated_cost: calculatedTotal,
      };

      const response = await API.post('/reception/check-in', payload);
      const orderCode = response.data.order_code || 'BAS-20261031-R9UH';

      showToast('success', 'Work Order Disimpan!', `Kode: ${orderCode}`);

      setTimeout(() => {
        window.location.href = '/admin/workshop';
      }, 1500);
    } catch (err: any) {
      const validationErrors = Object.values(err.response?.data?.errors || {}).flat();
      showToast(
        'error',
        'Gagal Menyimpan',
        validationErrors.join(' ') || err.response?.data?.message || 'Terjadi kesalahan sistem.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-24 relative">
      {/* Top Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Penerimaan Kendaraan (Check-in)</h1>
        <p className="text-xs text-slate-600">
          Registrasi kedatangan pelanggan, pencatatan keluhan, dan estimasi barang/jasa awal.
        </p>
      </div>

      {/* Grid Layout Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KANVAS KIRI: FORM REGISTRASI UNIFIED (8 Kolom) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Data Utama Pelanggan & Kendaraan */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-red-600" />
                <span>Identitas Kendaraan & Pelanggan</span>
              </h2>
              {isMemberFound && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Member Terdaftar
                </span>
              )}
            </div>

            {/* Input Pelat & Quick Search */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="Masukkan Pelat Nomor (Misal: AB 1234 BK)..."
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white uppercase transition"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchPlate}
                disabled={searching || !plateNumber.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {searching ? 'Cek...' : 'Cek Pelat'}
              </button>
            </div>

            {/* Grid Form Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama pemilik"
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="0812••••••••"
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Merek / Model Mobil</label>
                <input
                  type="text"
                  value={vehicleBrandModel}
                  onChange={(e) => setVehicleBrandModel(e.target.value)}
                  placeholder="Nissan Grand Livina 2014"
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kilometer (KM)</label>
                <input
                  type="number"
                  value={currentMileageKm}
                  onChange={(e) => setCurrentMileageKm(e.target.value)}
                  placeholder="128450"
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Kedatangan</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Input Alamat Pelanggan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Alamat Pelanggan</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Jl. Merdeka No. 45, Sewon, Bantul..."
                className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
              />
            </div>

            {/* Textarea Keluhan Utama */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Keluhan Utama *</label>
              <textarea
                value={initialComplaint}
                onChange={(e) => setInitialComplaint(e.target.value)}
                placeholder="Tuliskan gejala / keluhan utama yang disampaikan pelanggan..."
                rows={3}
                className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white resize-none transition"
              />
            </div>
          </div>

          {/* Card 2: Permintaan Sparepart & Jasa */}
          <ReceptionItemSelector selectedItems={initialItems} setSelectedItems={setInitialItems} />
        </div>

        {/* KANVAS KANAN: PANEL STICKY (4 Kolom) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6 h-fit self-start z-10">
          {/* 1. Step Wizard */}
          <StepWizard isStep1Complete={isStep1Complete} isStep2Complete={isStep2Complete} />

          {/* 2. Status Penanganan Kendaraan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Status Penanganan Kendaraan</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQueueType('onsite')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                  queueType === 'onsite'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-[#F4F5F3] text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Ditunggu
              </button>
              <button
                type="button"
                onClick={() => setQueueType('drop_off')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                  queueType === 'drop_off'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-[#F4F5F3] text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Ditinggal
              </button>
            </div>
          </div>

          {/* 3. Card Summary Biaya Awal */}
          <SummaryCostCard selectedItems={initialItems} />
        </div>
      </div>

      {/* Global Bottom Action Bar */}
      <ReceptionActionBar
        onReset={handleResetForm}
        onSubmit={handleSubmitWorkOrder}
        submitting={submitting}
        isDisabled={!isStep2Complete}
      />
    </div>
  );
};
import React, { useState } from 'react';
import API from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Lock, Mail, ArrowLeft, KeyRound, ClipboardList, Package, Receipt } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAdmin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/login', { email, password });
      
      // Simpan Token & User ke Context & LocalStorage
      loginAdmin(response.data.token, response.data.user);

      // Redirect ke modul reception admin
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal, periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col lg:flex-row selection:bg-red-600 selection:text-white">
      
      {/* SISI KIRI: BRANDING INTERNAL SYSTEM & WORKSHOP BACKGROUND (60% RASIO) */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 text-white p-10 xl:p-12 pb-12 xl:pb-14 flex-col justify-between overflow-hidden">
        {/* Gambar Latar Bengkel dari /bgLoginAdmin.png */}
        <img
          src="/bgLoginAdmin.png"
          alt="Bekti Auto Solution Workshop"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Vignette Overlay Vertikal (Bawah ke Atas) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60" />

        {/* Overlay Gelap Kiri ke Kanan (Horizontal Gradient Shadow) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

        {/* 1. TOP BAR: Tombol Kembali & Badge POS */}
        <div className="relative z-10 flex items-center justify-between">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#343A40]/80 hover:bg-[#212529] backdrop-blur-md px-4 py-2 rounded-full border border-white/15 transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white" /> Halaman Utama
          </a>

          <span className="bg-red-600/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-red-500/30">
            INTERNAL WORKSHOP POS
          </span>
        </div>

        {/* 2. AREA TENGAH: LOGO BESAR & TEKS (POSISI PAS DI TENGAH) */}
        <div className="relative z-10 my-auto py-6 space-y-5">
          
          {/* Logo BAS Besar Menonjol di Tengah */}
          <div>
            <img 
              src="/BASnobg.png" 
              alt="Bekti Auto Solution Logo" 
              className="h-24 xl:h-32 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Teks Judul & Deskripsi di Bawah Logo */}
          <div className="space-y-2 max-w-lg">
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
              Kelola operasional <br />
              <span className="text-red-500">bengkel secara presisi.</span>
            </h2>
            <p className="text-xs xl:text-sm text-slate-200 leading-relaxed max-w-md drop-shadow-md font-medium">
              Sistem manajemen terpadu reception, work order mekanik, inventori sparepart, dan laporan keuangan bengkel.
            </p>
          </div>
        </div>

        {/* 3. FOOTER KIRI: Hak Akses & Badges Fitur Internal */}
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-6 pb-2 mb-2 border-t border-white/15">
          
          {/* Information Hak Akses */}
          <div className="flex items-center gap-3 max-w-xs">
            <div className="w-1.5 h-8 bg-red-600 rounded-full flex-shrink-0 shadow-xs" />
            <p className="text-xs text-slate-200 font-semibold leading-snug drop-shadow-xs">
              Hak akses terbatas khusus admin, reception, dan mekanik.
            </p>
          </div>

          {/* 3 Badges Fitur Manajemen Internal */}
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-[11px] text-slate-200 shadow-sm">
              <ClipboardList className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="leading-none font-semibold whitespace-nowrap">Reception & Work Order</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-[11px] text-slate-200 shadow-sm">
              <Package className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="leading-none font-semibold whitespace-nowrap">Stok Sparepart Real-Time</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-[11px] text-slate-200 shadow-sm">
              <Receipt className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="leading-none font-semibold whitespace-nowrap">Kasir & Laporan</span>
            </div>
          </div>

        </div>
      </div>

      {/* SISI KANAN: FORM LOGIN ADMIN (40% RASIO) */}
      <div className="flex-1 lg:w-[40%] p-6 md:p-12 lg:p-16 flex flex-col justify-between items-center my-auto min-h-screen lg:min-h-0">
        
        {/* Mobile Header */}
        <div className="w-full max-w-md flex justify-between items-center lg:hidden mb-6">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-red-600 transition">
            <ArrowLeft className="w-4 h-4" /> Halaman Utama
          </a>

          <img 
            src="/BASnobg.png" 
            alt="Bekti Auto Solution Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 my-auto">
          
          {/* Dynamic Header Text */}
          <div className="text-center space-y-2">
            <span className="inline-block bg-slate-200/80 text-slate-700 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-1">
              SISTEM INTERNAL PENGELOLA
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Masuk POS Bengkel
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Silakan masukkan kredensial akun internal Anda untuk membuka dashboard pengelola.
            </p>
          </div>

          {/* Alert Message Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Card Form Input */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xl space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Field Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Admin / Staf</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@bektiauto.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>
              </div>

              {/* Field Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm transition shadow-lg shadow-red-600/25 disabled:opacity-50 cursor-pointer pt-3.5 mt-2"
              >
                <KeyRound className="w-4 h-4 text-white" />
                {loading ? 'Memverifikasi...' : 'Masuk ke POS Bengkel'}
              </button>
            </form>
          </div>

          {/* Navigasi Alih Ke Portal Pelanggan */}
          <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
            <span>Login sebagai pelanggan?</span>
            <a href="/auth" className="font-bold text-slate-800 hover:text-red-600 hover:underline transition">
              Portal PWA Pelanggan
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
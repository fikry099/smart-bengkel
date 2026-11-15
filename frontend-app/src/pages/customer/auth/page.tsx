import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Headphones, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

export const CustomerAuthPage: React.FC = () => {
  const navigate = useNavigate();

  // State Form & Loading
  const [step, setStep] = useState<'wa' | 'otp'>('wa');
  const [waNumber, setWaNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // State Multi-Tap Logo (Akses Rahasia Login Admin)
  const [tapCount, setTapCount] = useState(0);

  // Handler Secret Multi-Tap (5x Ketuk)
  const handleSecretAdminTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 5) {
      setTapCount(0);
      navigate('/login-admin');
    }
  };

  // 1. Handlers Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await API.post('/customer/request-otp', {
        whatsapp_number: waNumber,
      });

      if (response.data.debug_otp) {
        setDebugOtp(response.data.debug_otp);
      }

      showToast('success', 'OTP Terkirim!', 'Silakan cek pesan WhatsApp Anda.');
      setStep('otp');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengirimkan kode OTP. Pastikan nomor WhatsApp benar.';
      setErrorMessage(msg);
      showToast('error', 'Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handlers OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  // 3. Handlers Verify OTP & Submit Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const fullOtpCode = otp.join('');
    if (fullOtpCode.length < 6) {
      setErrorMessage('Masukkan 6 digit kode OTP secara lengkap.');
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/customer/verify-otp', {
        whatsapp_number: waNumber,
        otp_code: fullOtpCode,
      });

      // Simpan Token & User Data
      localStorage.setItem('customer_token', response.data.token);
      localStorage.setItem('customer_user', JSON.stringify(response.data.customer));

      showToast('success', 'Berhasil Masuk!', 'Mengalihkan ke Portal Pelanggan...');

      // Hard Redirect ke Portal Pelanggan
      setTimeout(() => {
        window.location.href = '/customer';
      }, 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verifikasi OTP gagal. Silakan periksa kembali kode Anda.';
      setErrorMessage(msg);
      showToast('error', 'Gagal Verifikasi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col lg:flex-row selection:bg-red-600 selection:text-white">
      
      {/* SISI KIRI: BRANDING & BACKGROUND GAMBAR WORKSHOP (60% RASIO) */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 text-white p-10 xl:p-12 pb-12 xl:pb-14 flex-col justify-between overflow-hidden">
        {/* Gambar Latar Bengkel dari /bgLogin.png */}
        <img
          src="/bgLogin.png"
          alt="Bekti Auto Solution Workshop"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Soft Overlay Vertikal (Bawah ke Atas) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

        {/* Overlay Gelap Kiri ke Kanan (Diselaraskan Persis dengan Admin Login) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Header Kiri: Tombol Kembali, Logo, Tagline, & Judul Utama */}
        <div className="relative z-10 space-y-4">
          
          {/* Top Bar: Tombol Kembali & Badge Spesialis */}
          <div className="flex items-center justify-between">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#343A40]/80 hover:bg-[#212529] backdrop-blur-md px-4 py-2 rounded-full border border-white/15 transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" /> Kembali ke website
            </a>

            <span className="bg-red-600/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30">
              Spesialis Nissan & Umum
            </span>
          </div>

          {/* Logo Desktop dengan Multi-Tap Trigger (5x Ketuk untuk Admin) */}
          <div className="pt-1">
            <div 
              onClick={handleSecretAdminTap}
              className="cursor-pointer select-none active:scale-95 transition-transform inline-block"
              title="Bekti Auto Solution"
            >
              <img 
                src="/BASnobg.png" 
                alt="Bekti Auto Solution Logo" 
                className="h-24 xl:h-28 w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Judul Utama Diposisikan Ringkas & Standout */}
          <div className="space-y-2 pt-1 max-w-lg">
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-snug text-white drop-shadow-lg">
              Satu bengkel. <br />
              <span className="text-slate-100">Akses yang tepat untuk Anda.</span>
            </h2>
          </div>
        </div>

        {/* Footer Kiri: Teks Solusi Perawatan & Badges Fitur */}
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-6 pb-2 mb-2 border-t border-white/15">
          
          {/* Tagline Utama Bawah */}
          <div className="flex items-center gap-3 max-w-xs">
            <div className="w-1.5 h-8 bg-red-600 rounded-full flex-shrink-0 shadow-xs" />
            <p className="text-xs text-slate-200 font-semibold leading-snug drop-shadow-xs">
              Solusi perawatan kendaraan Anda bersama Bekti Auto Solution.
            </p>
          </div>

          {/* 3 Badges Informasi Berada di Samping Kanan Teks */}
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-[11px] text-slate-200 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="leading-none font-semibold whitespace-nowrap">Diagnostik Injeksi</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-[11px] text-slate-200 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="leading-none font-semibold whitespace-nowrap">Estimasi Biaya Transparan</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-[11px] text-slate-200 shadow-sm">
              <Wrench className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="leading-none font-semibold whitespace-nowrap">Pantau Progres Online</span>
            </div>
          </div>

        </div>
      </div>

      {/* SISI KANAN: FORM LOGIN OTP (40% RASIO) */}
      <div className="flex-1 lg:w-[40%] p-6 md:p-12 lg:p-16 flex flex-col justify-between items-center my-auto min-h-screen lg:min-h-0">
        
        {/* Mobile Header (Navigasi Kembali & Logo Mobile) */}
        <div className="w-full max-w-md flex justify-between items-center lg:hidden mb-6">
          {step === 'wa' ? (
            <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-red-600 transition">
              <ArrowLeft className="w-4 h-4" /> Kembali ke website
            </a>
          ) : (
            <button 
              onClick={() => setStep('wa')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-red-600 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          )}

          <div 
            onClick={handleSecretAdminTap}
            className="cursor-pointer select-none active:scale-95 transition-transform"
          >
            <img 
              src="/BASnobg.png" 
              alt="Bekti Auto Solution Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 my-auto">
          
          {/* Dynamic Header Text (Tengah/Center Align) */}
          <div className="text-center space-y-2">
            <span className="inline-block bg-slate-200/80 text-slate-700 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-1">
              PORTAL PELANGGAN
            </span>
            
            {step === 'wa' ? (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Masuk dengan WhatsApp
                </h2>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Gunakan nomor WhatsApp yang terdaftar di bengkel untuk mengakses layanan kami.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Periksa WhatsApp Anda
                </h2>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Masukkan kode 6 digit dari WhatsApp untuk melanjutkan ke portal pelanggan.
                </p>
                <div className="flex justify-center items-center gap-2 pt-1 text-xs">
                  <span className="font-bold text-slate-900">+62 {waNumber}</span>
                  <button onClick={() => setStep('wa')} className="font-bold text-red-600 hover:underline">
                    Ubah nomor
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Alert Error */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Dev Mode Debug OTP */}
          {debugOtp && step === 'otp' && (
            <div className="bg-slate-100 border border-slate-300 text-slate-900 p-3 rounded-xl text-xs font-mono text-center">
              💡 <strong>[Dev Mode Debug]</strong> Kode OTP: <strong>{debugOtp}</strong>
            </div>
          )}

          {/* Card Form Input Dibungkus dengan Shadow & Border Rapi */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xl space-y-5">
            {step === 'wa' ? (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">Nomor WhatsApp</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 transition">
                    <span className="text-sm font-bold text-slate-900 mr-3 border-r pr-3 border-slate-200">+62</span>
                    <input
                      type="text"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="812 •••• 1234"
                      required
                      className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm transition shadow-lg shadow-red-600/25 disabled:opacity-50 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                  {loading ? 'Mengirim kode...' : 'Kirim kode OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2 text-center">Kode OTP (6 digit)</label>
                  <div className="flex gap-1.5 md:gap-2 justify-between">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-10 h-12 md:w-11 md:h-13 text-center font-bold text-lg bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs md:text-sm transition shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi & masuk'}
                </button>
              </form>
            )}
          </div>

          {/* CS Help Link */}
          <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Headphones className="w-4 h-4 text-slate-600" />
            <span>Butuh bantuan? <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="font-bold text-slate-800 hover:text-red-600 hover:underline">Hubungi Customer Service kami.</a></span>
          </div>

        </div>

      </div>

    </div>
  );
};
import React, { useState } from 'react';
import { 
  Menu, X, MessageCircle, Check, ArrowUpRight, 
  Scan, Droplet, Disc, Clock, ShieldCheck, MapPin, ArrowRight, Wrench 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <header className="bg-white text-slate-900 px-5 md:px-12 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Logo Resmi dari public/LOGO.jpeg */}
          <img 
            src="/BASaja.png" 
            alt="Bekti Auto Solution Logo" 
            className="h-10 w-auto object-contain rounded-lg"
          />
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none uppercase text-slate-900">Bekti Auto</h1>
            <p className="text-[10px] text-red-600 font-bold tracking-wide">SOLUTION</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-700">
          <a href="#layanan" className="hover:text-red-600 transition">Layanan</a>
          <a href="#katalog" className="hover:text-red-600 transition">Katalog</a>
          <a href="#alur-servis" className="hover:text-red-600 transition">Alur servis</a>
          <a href="#lokasi" className="hover:text-red-600 transition">Tentang & lokasi</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/auth"
            className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs transition border border-slate-300 flex items-center gap-1.5 shadow-xs"
          >
            Masuk portal <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
          </a>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="text-slate-800 md:hidden p-1 focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3 text-sm font-bold text-slate-800 animate-in slide-in-from-top duration-200 shadow-md">
          <a href="#layanan" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-red-600">Layanan</a>
          <a href="#katalog" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-red-600">Katalog</a>
          <a href="#alur-servis" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-red-600">Alur servis</a>
          <a href="#lokasi" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-red-600">Tentang & lokasi</a>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section className="bg-[#121417] text-white px-5 md:px-12 py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-white/10 text-white px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border border-white/20">
                Spesialis Nissan & Mobil Umum
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black leading-[1.12] tracking-tight text-white">
              Mobil kembali prima. Anda tetap tenang.
            </h2>

            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-lg">
              Bengkel mobil injeksi dengan pemeriksaan yang jelas, estimasi terbuka, dan pengerjaan sesuai persetujuan Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm transition shadow-lg shadow-red-600/20"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                Konsultasi via WhatsApp
              </a>
              <a
                href="#layanan"
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold py-3 px-5 rounded-xl flex items-center justify-center text-xs md:text-sm transition border border-slate-700"
              >
                Jelajahi layanan
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-300 text-[11px] md:text-xs font-medium pt-1">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-500 stroke-[3]" /> Diagnosis lebih dulu</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-red-500 stroke-[3]" /> ACC sebelum dikerjakan</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
              <img
                src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
                alt="Bekti Auto Solution Workshop"
                className="w-full h-64 md:h-84 object-cover group-hover:scale-102 transition duration-500"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 flex justify-between items-center text-slate-900 shadow-xl">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Bekti Auto Solution</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Bengkel Mobil Injeksi Spesialis Nissan dan Umum</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-700 flex-shrink-0" />
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 text-center font-medium pt-1">
              Bengkel Mobil Injeksi Spesialis Nissan dan Umum
            </p>
          </div>

        </div>
      </section>

      {/* 3. BENGKEL STATS SECTION */}
      <section className="bg-[#F1F3F5] border-y border-slate-200/80 px-5 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Kenal mobil Anda. Pahami kebutuhannya.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fokus pada Nissan, terbuka untuk berbagai mobil umum. Rencana perawatan disesuaikan dengan kondisi kendaraan, bukan sekadar mengganti komponen.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <h4 className="text-2xl md:text-3xl font-black text-slate-900">4 mekanik tetap</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Didukung 3 siswa PKL</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LAYANAN BENGKEL SECTION */}
      <section id="layanan" className="px-5 md:px-12 py-14 max-w-6xl mx-auto space-y-8">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">LAYANAN BENGKEL</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Dari perawatan rutin hingga cari sumber masalah.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                <Scan className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Injeksi & diagnostik</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Telusuri keluhan mesin dengan pemeriksaan dan pemindaian sistem.
              </p>
            </div>
            <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-red-600 transition">
              Konsultasikan kebutuhan <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                <Droplet className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Oli & pelumasan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penggantian oli dan filter sesuai kebutuhan kendaraan.
              </p>
            </div>
            <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-red-600 transition">
              Konsultasikan kebutuhan <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                <Disc className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Rem & kaki-kaki</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pemeriksaan pengereman, bunyi, bearing, dan kenyamanan berkendara.
              </p>
            </div>
            <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-red-600 transition">
              Konsultasikan kebutuhan <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                <Wrench className="w-5 h-5 text-slate-800" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Servis berkala</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengecekan terarah untuk menjaga mobil siap digunakan.
              </p>
            </div>
            <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-red-600 transition">
              Konsultasikan kebutuhan <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. ALUR SERVIS SECTION */}
      <section id="alur-servis" className="bg-[#F1F3F5]/70 border-y border-slate-200/80 px-5 md:px-12 py-14">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">TRANSPARAN DI SETIAP LANGKAH</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Anda yang memberi lampu hijau.
            </h2>
            <p className="text-xs text-slate-600">Setujui semua atau sebagian sesuai anggaran. Temuan tambahan selalu dikonfirmasi kembali.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 01 */}
            <div className="space-y-2">
              <span className="text-xl font-black text-red-600 block">01</span>
              <h3 className="font-extrabold text-base text-slate-900">Ceritakan keluhan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Admin mencatat kendaraan, kilometer, dan kebutuhan servis.</p>
            </div>

            {/* Step 02 */}
            <div className="space-y-2">
              <span className="text-xl font-black text-red-600 block">02</span>
              <h3 className="font-extrabold text-base text-slate-900">Periksa & estimasikan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Mekanik memeriksa; admin menyiapkan diagnosis, solusi, dan biaya.</p>
            </div>

            {/* Step 03 */}
            <div className="space-y-2">
              <span className="text-xl font-black text-red-600 block">03</span>
              <h3 className="font-extrabold text-base text-slate-900">Tinjau & setujui</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Pilih pekerjaan yang disetujui. Biaya tambahan perlu ACC baru.</p>
            </div>

            {/* Step 04 */}
            <div className="space-y-2">
              <span className="text-xl font-black text-red-600 block">04</span>
              <h3 className="font-extrabold text-base text-slate-900">Kerjakan & serahkan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Lihat progres, terima nota, dan pilih cara pembayaran.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600 shadow-xs">
            <Clock className="w-5 h-5 text-slate-700 flex-shrink-0" />
            <span>Servis oli ringan sekitar 1–2 jam. Perbaikan besar dapat memerlukan beberapa hari; estimasi diperbarui setelah pemeriksaan.</span>
          </div>
        </div>
      </section>

      {/* 6. KATALOG SPAREPART SECTION */}
      <section id="katalog" className="px-5 md:px-12 py-14 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">KATALOG SPAREPART</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Pilihan yang sesuai. Harga yang jelas.
            </h2>
          </div>
          <button className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-xs">
            Lihat katalog <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Item 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs p-3.5 space-y-3 hover:border-slate-300 transition">
            <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=400&q=80" alt="Busi standar" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Aftermarket</span>
              <span>4 unit</span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Busi standar</h4>
              <p className="text-[11px] text-slate-500">Nissan / Umum</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Rp75.000</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs p-3.5 space-y-3 hover:border-slate-300 transition">
            <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=400&q=80" alt="Oli mesin 4 L" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Aftermarket</span>
              <span>12 botol</span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Oli mesin 4 L</h4>
              <p className="text-[11px] text-slate-500">Sesuai spesifikasi mesin</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Rp320.000</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs p-3.5 space-y-3 hover:border-slate-300 transition">
            <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80" alt="Filter oli" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Aftermarket</span>
              <span>8 unit</span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Filter oli</h4>
              <p className="text-[11px] text-slate-500">Nissan • cek tipe</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Rp80.000</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs p-3.5 space-y-3 hover:border-slate-300 transition">
            <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80" alt="Drive belt" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Aftermarket</span>
              <span>3 unit</span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Drive belt</h4>
              <p className="text-[11px] text-slate-500">Nissan • cek tipe</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Rp220.000</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-1">
          Contoh produk & harga. Kecocokan, ketersediaan, dan jenis original/aftermarket dikonfirmasi admin. Kode OEM belum diverifikasi.
        </p>
      </section>

      {/* 7. GARANSI BANNER */}
      <section className="bg-[#121417] text-white px-5 md:px-12 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="w-9 h-9 bg-red-600/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-500">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Garansi yang jelas sejak awal.
            </h3>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h4 className="font-extrabold text-sm text-white">Garansi berlaku untuk sparepart yang dibeli langsung dari bengkel.</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sparepart yang dibawa sendiri dari luar tidak mendapat garansi bengkel. Tanyakan ketentuan sesuai komponen dan pekerjaan kepada admin sebelum menyetujui servis.
            </p>
          </div>
        </div>
      </section>

      {/* 8. PORTAL PELANGGAN PREVIEW SECTION */}
      <section className="px-5 md:px-12 py-14 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">PORTAL PELANGGAN</span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Kabar servis, tanpa menebak-nebak.
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Satu tempat untuk melihat progres kendaraan, meninjau estimasi, dan membuka kembali riwayat servis Anda.
          </p>
          <a
            href="/auth"
            className="inline-flex bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs md:text-sm transition shadow-md shadow-red-600/20 items-center gap-2"
          >
            Masuk dengan WhatsApp <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Card Sample Display */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
            <div>
              <h4 className="font-extrabold text-base text-slate-900">Nissan Grand Livina</h4>
              <p className="text-[11px] text-slate-400 font-mono">AB 1234 BK • Contoh tampilan portal</p>
            </div>
            <span className="bg-slate-100 text-slate-800 border border-slate-300 text-[10px] px-2.5 py-1 rounded-md font-bold">
              Menunggu ACC
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-slate-900 mt-0.5 flex-shrink-0" />
              <span><strong>Tinjau estimasi:</strong> Pilih pekerjaan sesuai anggaran Anda.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-slate-900 mt-0.5 flex-shrink-0" />
              <span><strong>Pantau tahapan servis:</strong> Dari pemeriksaan hingga siap diambil.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-slate-900 mt-0.5 flex-shrink-0" />
              <span><strong>Simpan riwayat & nota:</strong> Detail perawatan mudah dibuka kembali.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. HUBUNGI & LOKASI MAPS SECTION */}
      <section id="lokasi" className="bg-[#F1F3F5] border-t border-slate-200/80 px-5 md:px-12 py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase">MARI BICARAKAN MOBIL ANDA</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Keluhan kecil? Jangan tunggu jadi besar.
            </h2>
            <p className="text-xs md:text-sm text-slate-600">
              Hubungi admin untuk konsultasi kebutuhan, antrean, dan estimasi kunjungan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-5 rounded-xl text-xs transition shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                Hubungi WhatsApp Business
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-5 rounded-xl text-xs border border-slate-300 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MapPin className="w-4 h-4 text-slate-700" /> Lihat lokasi di Google Maps
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-base">Lokasi bengkel</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gunakan tautan Google Maps untuk melihat petunjuk lokasi. Konfirmasikan jadwal kunjungan kepada admin.
            </p>
            <p className="text-[10px] text-slate-400 font-mono">maps.app.goo.gl/4TZF9fenNZFafqgY8</p>
          </div>

        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#121417] text-white px-5 md:px-12 py-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Logo Resmi dari public/LOGO.jpeg */}
              <img 
                src="/BASaja.png" 
                alt="Bekti Auto Solution Logo" 
                className="h-9 w-auto object-contain rounded-lg"
              />
              <div>
                <h2 className="font-extrabold text-sm tracking-tight leading-none uppercase text-white">Bekti Auto</h2>
                <p className="text-[9px] text-red-500 font-bold tracking-wide">SOLUTION</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Bengkel Mobil Injeksi Spesialis Nissan dan Umum</p>
            <div className="flex gap-6 text-xs text-slate-300 font-bold">
              <a href="#layanan" className="hover:text-red-500 transition">Layanan</a>
              <a href="#katalog" className="hover:text-red-500 transition">Katalog</a>
              <a href="#alur-servis" className="hover:text-red-500 transition">Masuk portal</a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
            <p>© 2026 Bengkel Bekti Auto Solution</p>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-slate-400">Privasi pelanggan</a>
              <a href="/login-admin" className="hover:text-slate-400">Akses admin</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
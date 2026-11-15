import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Wrench, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import API from '../../../services/api';
import { showToast } from '../../../utils/swalHelper';

import { InventoryStatsCard } from '../../../components/inventory/InventoryStatsCard';
import { SparepartTable } from '../../../components/inventory/SparepartTable';
import { ServiceTable } from '../../../components/inventory/ServiceTable';
import { ProductModalForm } from '../../../components/inventory/ProductModalForm';
import { RestockModal } from '../../../components/inventory/RestockModal';

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [stats, setStats] = useState({
    total_items: 0,
    total_sparepart: 0,
    total_service: 0,
    low_stock_count: 0,
  });

  // State Pagination Backend
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sparepart' | 'service'>('sparepart');
  const [loading, setLoading] = useState(true);

  // Modal State Form Produk
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Modal State Restock
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);

  // Fetch Daftar Kategori berdasarkan Tab yang sedang aktif
  const fetchCategories = async (type: string) => {
    try {
      const response = await API.get('/categories', { params: { type } });
      const resData = response.data;

      let extractedCategories: any[] = [];
      if (Array.isArray(resData)) {
        extractedCategories = resData;
      } else if (Array.isArray(resData?.categories)) {
        extractedCategories = resData.categories;
      } else if (Array.isArray(resData?.data)) {
        extractedCategories = resData.data;
      }

      setCategories(extractedCategories);
    } catch (err) {
      console.error('Gagal mengambil daftar kategori:', err);
    }
  };

  // Ambil data produk dari Backend API dengan Server-side Pagination & Filter Kategori
  const fetchProducts = async (page = 1, limit = pagination.per_page) => {
    try {
      setLoading(true);
      const params: any = { page, per_page: limit };
      if (search) params.search = search;
      if (filterType !== 'all') params.type = filterType;
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await API.get('/products', { params });
      setProducts(response.data.products || []);

      if (response.data.stats) {
        setStats(response.data.stats);
      }

      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Gagal mengambil data katalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(filterType);
  }, [filterType]);

  useEffect(() => {
    fetchProducts(1, pagination.per_page);
  }, [search, filterType, selectedCategory]);

  const handleTabChange = (type: 'sparepart' | 'service') => {
    setFilterType(type);
    setSelectedCategory(''); // Reset filter kategori ke 'Semua' saat berganti tab
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, pagination.per_page);
  };

  const handleLimitChange = (newLimit: number) => {
    fetchProducts(1, newLimit);
  };

  // Handler Simpan / Update Produk
  const handleSaveProduct = async (formData: any) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, formData);
        showToast('success', 'Berhasil!', 'Data katalog berhasil diperbarui.');
      } else {
        await API.post('/products', formData);
        showToast('success', 'Berhasil!', 'Item baru berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts(pagination.current_page, pagination.per_page);
    } catch (err: any) {
      showToast('error', 'Gagal', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Eksekusi Restock Stok Sparepart
  const handleExecuteRestock = async (productId: number, additionalStock: number) => {
    setSubmitting(true);
    try {
      await API.patch(`/products/${productId}/restock`, { additional_stock: additionalStock });
      showToast('success', 'Stok Ditambahkan!', 'Jumlah stok fisik berhasil diperbarui.');
      setIsRestockOpen(false);
      setSelectedRestockItem(null);
      fetchProducts(pagination.current_page, pagination.per_page);
    } catch (err: any) {
      showToast('error', 'Gagal', err.response?.data?.message || 'Gagal menambah stok.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Hapus Produk
  const handleDeleteProduct = (id: number, name: string) => {
    Swal.fire({
      title: 'Hapus Item?',
      text: `Apakah Anda yakin ingin menghapus "${name}" dari katalog?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#212624',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl font-sans text-xs',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/products/${id}`);
          showToast('success', 'Terhapus!', 'Item berhasil dihapus dari sistem.');
          fetchProducts(pagination.current_page, pagination.per_page);
        } catch (err) {
          showToast('error', 'Gagal', 'Tidak dapat menghapus produk.');
        }
      }
    });
  };

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory & Katalog</h1>
          <p className="text-xs text-slate-600">
            Kelola stok sparepart, oli, lokasi rak, serta tarif jasa perbaikan bengkel.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-xs transition shadow-md shadow-red-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Item Katalog</span>
        </button>
      </div>

      {/* Stats Bar */}
      <InventoryStatsCard stats={stats} />

      {/* Tabel & Filter Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        
        {/* Filter Bar Utama: Tab Type & Input Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleTabChange('sparepart')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                filterType === 'sparepart'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-[#F4F5F3] text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sparepart & Barang ({stats.total_sparepart})</span>
            </button>

            <button
              onClick={() => handleTabChange('service')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                filterType === 'service'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-[#F4F5F3] text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Jasa Perbaikan ({stats.total_service})</span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari SKU, Nama, Kategori..."
              className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-red-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* TAB FILTER KATEGORI (PILL BUTTONS HORIZONTAL) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3 h-3" /> Kategori:
          </span>

          {/* Tombol Kategori: Semua */}
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kategori
          </button>

          {/* Daftar Kategori Dinamis */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === String(cat.id)
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Render Tabel Berdasarkan Tab Aktif */}
        {filterType === 'sparepart' ? (
          <SparepartTable
            products={products}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onEdit={(item) => {
              setEditingProduct(item);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteProduct}
            onRestock={(item) => {
              setSelectedRestockItem(item);
              setIsRestockOpen(true);
            }}
          />
        ) : (
          <ServiceTable
            services={products}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onEdit={(item) => {
              setEditingProduct(item);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      {/* Modal Form Tambah / Edit Katalog */}
      <ProductModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        editingProduct={editingProduct}
        submitting={submitting}
      />

      {/* Modal Form Restock Stok Sparepart */}
      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        product={selectedRestockItem}
        onSubmit={handleExecuteRestock}
        submitting={submitting}
      />
    </div>
  );
};
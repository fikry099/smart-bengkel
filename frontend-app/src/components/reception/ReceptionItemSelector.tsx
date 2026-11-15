import React, { useState, useEffect } from 'react';
import {
  Package,
  Wrench,
  Search,
  Trash2,
  X,
  Info,
  Layers,
  MapPin,
  Tag,
  Loader2,
  Check,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
} from 'lucide-react';
import API from '../../services/api';
import { showToast } from '../../utils/swalHelper';

interface SelectedItem {
  id: number;
  product_id?: number;
  name: string;
  type: 'sparepart' | 'service';
  price: number;
  quantity: number;
  stock_status?: string;
  sku?: string;
  category?: any;
  location_rack?: string;
  cost_price?: number;
  stock?: number;
  image_url?: string;
  description?: string;
}

interface Props {
  selectedItems: SelectedItem[];
  setSelectedItems: React.Dispatch<React.SetStateAction<SelectedItem[]>>;
}

export const ReceptionItemSelector: React.FC<Props> = ({ selectedItems, setSelectedItems }) => {
  const [categories, setCategories] = useState<any[]>([]);

  const [sparepartCategory, setSparepartCategory] = useState<any | null>(null);
  const [serviceCategory, setServiceCategory] = useState<any | null>(null);

  const [isSparepartCatModalOpen, setIsSparepartCatModalOpen] = useState(false);
  const [isServiceCatModalOpen, setIsServiceCatModalOpen] = useState(false);

  const [sparepartCatSearchKeyword, setSparepartCatSearchKeyword] = useState('');
  const [serviceCatSearchKeyword, setServiceCatSearchKeyword] = useState('');

  const [searchModalType, setSearchModalType] = useState<'sparepart' | 'service' | null>(null);
  const [modalSearchKeyword, setModalSearchKeyword] = useState('');
  const [modalSearchResults, setModalSearchResults] = useState<any[]>([]);
  const [loadingModalSearch, setLoadingModalSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getCategoryName = (categoryData: any): string => {
    if (!categoryData) return 'Umum';
    if (typeof categoryData === 'object') return categoryData.name || 'Umum';
    return String(categoryData);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        const resData = response.data;
        let data: any[] = [];
        if (Array.isArray(resData)) data = resData;
        else if (Array.isArray(resData?.categories)) data = resData.categories;
        else if (Array.isArray(resData?.data)) data = resData.data;

        setCategories(data);
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      }
    };
    fetchCategories();
  }, []);

  const sparepartCategories = categories.filter((c) => !c.name.toLowerCase().includes('jasa'));
  const serviceCategories = categories.filter((c) => c.name.toLowerCase().includes('jasa'));

  useEffect(() => {
    setCurrentPage(1);
  }, [modalSearchKeyword, searchModalType, sparepartCategory, serviceCategory]);

  useEffect(() => {
    if (!searchModalType) return;

    const timer = setTimeout(async () => {
      try {
        setLoadingModalSearch(true);
        const activeCategory = searchModalType === 'sparepart' ? sparepartCategory : serviceCategory;

        const params: any = {
          type: searchModalType,
          page: currentPage,
          per_page: itemsPerPage,
          limit: itemsPerPage,
        };
        if (modalSearchKeyword.trim()) params.search = modalSearchKeyword;
        if (activeCategory) params.category_id = activeCategory.id;

        const response = await API.get('/products', { params });
        const resData = response.data;

        const dataList = resData?.products || resData?.data || (Array.isArray(resData) ? resData : []);
        setModalSearchResults(Array.isArray(dataList) ? dataList : []);

        const pag = resData?.pagination;
        const total = pag?.total ?? resData?.total ?? (Array.isArray(dataList) ? dataList.length : 0);
        const lastPage = pag?.last_page ?? resData?.last_page ?? (Math.ceil(total / itemsPerPage) || 1);
        const from = pag?.from ?? (total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0);
        const to = pag?.to ?? Math.min(currentPage * itemsPerPage, total);

        setPaginationMeta({
          current_page: pag?.current_page ?? currentPage,
          last_page: lastPage,
          per_page: pag?.per_page ?? itemsPerPage,
          total: total,
          from: from,
          to: to,
        });
      } catch (err) {
        console.error('Gagal mencari item:', err);
      } finally {
        setLoadingModalSearch(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [modalSearchKeyword, searchModalType, sparepartCategory, serviceCategory, currentPage, itemsPerPage]);

  const getItemPrice = (item: any): number => {
    const rawPrice =
      item.selling_price ??
      item.harga_jual ??
      item.sell_price ??
      item.price ??
      item.tariff ??
      item.cost_price ??
      0;
    return parseFloat(rawPrice) || 0;
  };

  const handleAddItem = (item: any, type: 'sparepart' | 'service') => {
    const stock = Number(item.stock ?? 0);
    if (type === 'sparepart' && stock <= 0) {
      showToast('warning', 'Stok Habis', `Sparepart ${item.name} tidak dapat ditambahkan karena stok kosong.`);
      return;
    }

    const existingIndex = selectedItems.findIndex(
      (it) => it.product_id === item.id && it.type === type
    );
    const finalPrice = getItemPrice(item);
    const itemName = item.name || item.product_name || item.service_name || 'Item Tanpa Nama';

    if (existingIndex !== -1) {
      const newQuantity = selectedItems[existingIndex].quantity + 1;
      if (type === 'sparepart' && newQuantity > stock) {
        showToast(
          'warning',
          'Stok Tidak Cukup',
          `Stok ${itemName} tersedia ${stock}, tidak cukup untuk jumlah ${newQuantity}.`
        );
        return;
      }

      const updated = [...selectedItems];
      updated[existingIndex].quantity = newQuantity;
      setSelectedItems(updated);
    } else {
      const newItem: SelectedItem = {
        id: Date.now(),
        product_id: item.id,
        name: itemName,
        type: type,
        price: finalPrice,
        quantity: 1,
        stock_status: (item.stock ?? 0) > 0 ? 'Stok tersedia' : 'Stok habis',
        sku: item.sku || '-',
        category: getCategoryName(item.category),
        location_rack: item.location_rack || '-',
        cost_price: parseFloat(item.cost_price) || 0,
        stock: item.stock ?? 0,
        image_url: item.image || item.image_url || item.photo_url || null,
        description: item.description || 'Tidak ada deskripsi tambahan.',
      };
      setSelectedItems((prev) => [...prev, newItem]);
    }

    setSearchModalType(null);
    showToast('success', 'Berhasil!', `${itemName} berhasil ditambahkan.`);
  };

  const handleOpenDetail = (item: SelectedItem) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQtyChange = (id: number, qty: number) => {
    if (qty < 1) return;
    const selectedItem = selectedItems.find((item) => item.id === id);
    if (selectedItem?.type === 'sparepart' && qty > Number(selectedItem.stock ?? 0)) {
      showToast(
        'warning',
        'Stok Tidak Cukup',
        `Stok ${selectedItem.name} tersedia ${selectedItem.stock ?? 0}, tidak cukup untuk jumlah ${qty}.`
      );
      return;
    }

    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const sparepartItems = selectedItems.filter((i) => i.type === 'sparepart');
  const serviceItems = selectedItems.filter((i) => i.type === 'service');

  const subtotalSparepart = sparepartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const subtotalService = serviceItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const filteredSparepartCats = sparepartCategories.filter((cat) =>
    cat.name.toLowerCase().includes(sparepartCatSearchKeyword.toLowerCase().trim())
  );

  const filteredServiceCats = serviceCategories.filter((cat) =>
    cat.name.toLowerCase().includes(serviceCatSearchKeyword.toLowerCase().trim())
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 font-sans">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
          <Package className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-900">Permintaan Sparepart & Jasa</h2>
          <p className="text-[11px] text-slate-500">Pilih suku cadang dan jasa servis via tombol filter & pencarian modal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KOLOM KIRI: SPAREPART */}
        <div className="bg-[#FFFDFD] border border-red-100 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900">Sparepart & Barang</h3>
              </div>
              {sparepartCategory && (
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  {sparepartCategory.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSparepartCatModalOpen(true);
                  setSparepartCatSearchKeyword('');
                }}
                className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:border-red-500 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-red-600" />
                <span className="truncate">
                  {sparepartCategory ? sparepartCategory.name : 'Pilih Kategori'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchModalType('sparepart');
                  setModalSearchKeyword('');
                }}
                className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari Sparepart</span>
              </button>
            </div>

            <div className="divide-y divide-red-100 bg-white border border-red-100 rounded-lg px-3 py-1">
              {sparepartItems.length > 0 ? (
                sparepartItems.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div 
                      onClick={() => handleOpenDetail(item)}
                      className="min-w-0 flex-1 cursor-pointer group"
                      title="Klik untuk melihat detail item"
                    >
                      <span className="font-bold text-slate-900 block truncate text-xs group-hover:text-red-600 transition flex items-center gap-1">
                        {item.name}
                        <Info className="w-3 h-3 text-slate-400 group-hover:text-red-600 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Rp {item.price.toLocaleString('id-ID')} / pcs
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-xs px-1.5 py-0.5">
                        <span className="text-[10px] text-slate-400">x</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-8 text-center bg-transparent font-bold text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <span className="font-bold text-slate-900 min-w-[70px] text-right text-xs">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[11px] text-slate-400 italic">
                  Belum ada sparepart dipilih.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-red-100 pt-2.5 mt-2">
            <span className="text-xs font-bold text-slate-600">Subtotal Sparepart</span>
            <span className="text-xs font-black text-slate-900">
              Rp {subtotalSparepart.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* KOLOM KANAN: JASA */}
        <div className="bg-[#F8FAFC] border border-blue-200/80 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-900">Jasa Perbaikan</h3>
              </div>
              {serviceCategory && (
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {serviceCategory.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsServiceCatModalOpen(true);
                  setServiceCatSearchKeyword('');
                }}
                className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate">
                  {serviceCategory ? serviceCategory.name : 'Pilih Kategori'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchModalType('service');
                  setModalSearchKeyword('');
                }}
                className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari Jasa Servis</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 bg-white border border-slate-200/80 rounded-lg px-3 py-1">
              {serviceItems.length > 0 ? (
                serviceItems.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div 
                      onClick={() => handleOpenDetail(item)}
                      className="min-w-0 flex-1 cursor-pointer group"
                      title="Klik untuk melihat detail item"
                    >
                      <span className="font-bold text-slate-900 block truncate text-xs group-hover:text-blue-600 transition flex items-center gap-1">
                        {item.name}
                        <Info className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Rp {item.price.toLocaleString('id-ID')} / layanan
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-xs px-1.5 py-0.5">
                        <span className="text-[10px] text-slate-400">x</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-8 text-center bg-transparent font-bold text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <span className="font-bold text-slate-900 min-w-[70px] text-right text-xs">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[11px] text-slate-400 italic">
                  Belum ada jasa dipilih.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200/80 pt-2.5 mt-2">
            <span className="text-xs font-bold text-slate-600">Subtotal Jasa</span>
            <span className="text-xs font-black text-slate-900">
              Rp {subtotalService.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: PILIH KATEGORI SPAREPART (STYLE KONSISTEN) */}
      {isSparepartCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#F8FAFC] border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Kategori Sparepart & Barang</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Pilih kategori untuk mempersempit daftar sparepart</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSparepartCatModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={sparepartCatSearchKeyword}
                  onChange={(e) => setSparepartCatSearchKeyword(e.target.value)}
                  placeholder="Cari nama kategori sparepart..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-xs"
                />
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-[#F8FAFC]">
              {(!sparepartCatSearchKeyword.trim() || 'semua kategori sparepart'.includes(sparepartCatSearchKeyword.toLowerCase())) && (
                <button
                  type="button"
                  onClick={() => {
                    setSparepartCategory(null);
                    setIsSparepartCatModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition flex justify-between items-center cursor-pointer shadow-xs ${
                    sparepartCategory === null
                      ? 'bg-red-50/80 border-red-300 text-red-700 ring-1 ring-red-300'
                      : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-sm text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      sparepartCategory === null ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <span>Semua Kategori Sparepart</span>
                  </div>
                  {sparepartCategory === null && <Check className="w-4 h-4 text-red-600" />}
                </button>
              )}

              {filteredSparepartCats.length > 0 ? (
                filteredSparepartCats.map((cat) => {
                  const isSelected = sparepartCategory?.id === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSparepartCategory(cat);
                        setIsSparepartCatModalOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition flex justify-between items-center cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-red-50/80 border-red-300 text-red-700 ring-1 ring-red-300'
                          : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-sm text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada kategori yang cocok dengan pencarian.
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
              <span className="font-medium flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                Tersedia <strong className="text-slate-900">{sparepartCategories.length}</strong> kategori sparepart
              </span>

              <button
                type="button"
                onClick={() => setIsSparepartCatModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PILIH KATEGORI JASA (STYLE KONSISTEN) */}
      {isServiceCatModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#F8FAFC] border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Kategori Jasa Perbaikan</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Pilih kategori untuk mempersempit daftar jasa servis</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsServiceCatModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={serviceCatSearchKeyword}
                  onChange={(e) => setServiceCatSearchKeyword(e.target.value)}
                  placeholder="Cari nama kategori jasa..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
                />
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-[#F8FAFC]">
              {(!serviceCatSearchKeyword.trim() || 'semua kategori jasa'.includes(serviceCatSearchKeyword.toLowerCase())) && (
                <button
                  type="button"
                  onClick={() => {
                    setServiceCategory(null);
                    setIsServiceCatModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition flex justify-between items-center cursor-pointer shadow-xs ${
                    serviceCategory === null
                      ? 'bg-blue-50/80 border-blue-300 text-blue-700 ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      serviceCategory === null ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <span>Semua Kategori Jasa</span>
                  </div>
                  {serviceCategory === null && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              )}

              {filteredServiceCats.length > 0 ? (
                filteredServiceCats.map((cat) => {
                  const isSelected = serviceCategory?.id === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setServiceCategory(cat);
                        setIsServiceCatModalOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition flex justify-between items-center cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 text-blue-700 ring-1 ring-blue-300'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <span>{cat.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ada kategori yang cocok dengan pencarian.
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
              <span className="font-medium flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                Tersedia <strong className="text-slate-900">{serviceCategories.length}</strong> kategori jasa
              </span>

              <button
                type="button"
                onClick={() => setIsServiceCatModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SEARCH & SELECT ITEM */}
      {searchModalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#F8FAFC] border-b border-slate-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  value={modalSearchKeyword}
                  onChange={(e) => setModalSearchKeyword(e.target.value)}
                  placeholder={
                    searchModalType === 'sparepart'
                      ? 'Ketik nama sparepart atau kode SKU...'
                      : 'Ketik nama perbaikan / perataan...'
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-xs"
                />
                {loadingModalSearch && (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-3" />
                )}
              </div>

              {(searchModalType === 'sparepart' ? sparepartCategory : serviceCategory) && (
                <div className="flex items-center justify-between text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-bold">
                  <span>
                    Kategori Aktif: {(searchModalType === 'sparepart' ? sparepartCategory : serviceCategory)?.name}
                  </span>
                  <button
                    onClick={() => {
                      if (searchModalType === 'sparepart') setSparepartCategory(null);
                      else setServiceCategory(null);
                    }}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Hapus Filter
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 bg-[#F8FAFC]">
              {loadingModalSearch ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Memuat item katalog...
                </div>
              ) : modalSearchResults.length > 0 ? (
                modalSearchResults.map((item) => {
                  const stockNum = Number(item.stock ?? 0);
                  const isStockAvailable = stockNum > 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-red-400 hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          {searchModalType === 'service' ? (
                            <Wrench className="w-5 h-5 text-slate-600" />
                          ) : (
                            <Settings className="w-5 h-5 text-slate-600" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs leading-snug truncate">
                            {item.name}
                          </h4>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span className="font-mono text-slate-400">{item.sku || '-'}</span>
                            <span>•</span>
                            <span>{getCategoryName(item.category)}</span>
                            {searchModalType === 'sparepart' && (
                              <>
                                <span>•</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    isStockAvailable
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {isStockAvailable ? `Stok: ${stockNum}` : 'Stok Habis'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-black text-slate-900 text-sm">
                          Rp {getItemPrice(item).toLocaleString('id-ID')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddItem(item, searchModalType)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer shadow-xs"
                        >
                          <span>+ Tambah</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Tidak ada item ditemukan. Cobalah dengan kata kunci lain.
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span>
                  Menampilkan <strong className="text-slate-900">{paginationMeta.from}</strong> -{' '}
                  <strong className="text-slate-900">{paginationMeta.to}</strong> dari{' '}
                  <strong className="text-slate-900">{paginationMeta.total}</strong> item
                </span>

                <div className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                  <span className="text-slate-500">Tampilkan:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || loadingModalSearch}
                  title="Halaman Pertama"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loadingModalSearch}
                  title="Halaman Sebelumnya"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-bold text-slate-800">
                  {paginationMeta.current_page} / {paginationMeta.last_page}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationMeta.last_page))}
                  disabled={currentPage >= paginationMeta.last_page || loadingModalSearch}
                  title="Halaman Selanjutnya"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(paginationMeta.last_page)}
                  disabled={currentPage >= paginationMeta.last_page || loadingModalSearch}
                  title="Halaman Terakhir"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSearchModalType(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL ITEM POP-UP */}
      {isDetailOpen && detailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                {detailItem.type === 'service' ? (
                  <Wrench className="w-4 h-4 text-red-500" />
                ) : (
                  <Package className="w-4 h-4 text-red-500" />
                )}
                <h3 className="font-bold text-sm text-white">Detail Katalog Item</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-5 w-full h-56 md:h-full min-h-[220px] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 relative">
                  {(detailItem.image || detailItem.image_url || detailItem.photo_url) ? (
                    <img
                      src={detailItem.image || detailItem.image_url || detailItem.photo_url}
                      alt={detailItem.name}
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                      {detailItem.type === 'service' ? (
                        <Wrench className="w-12 h-12 stroke-1" />
                      ) : (
                        <Package className="w-12 h-12 stroke-1" />
                      )}
                      <span className="text-[11px] font-medium">Foto produk tidak tersedia</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-snug">{detailItem.name}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-black text-red-600">
                        Rp {detailItem.price?.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ unit</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Tag className="w-3 h-3" /> SKU / Kode
                      </span>
                      <p className="font-mono font-bold text-slate-800">{detailItem.sku || '-'}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Kategori
                      </span>
                      <p className="font-bold text-slate-800">
                        {detailItem.category || 'Umum'}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Lokasi Rak
                      </span>
                      <p className="font-bold text-slate-800">{detailItem.location_rack || '-'}</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Package className="w-3 h-3" /> Stok Fisik
                      </span>
                      <p className="font-bold text-emerald-800">
                        {detailItem.type === 'service' ? '-' : `${detailItem.stock ?? 0} unit`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700">Deskripsi Ringkas</span>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 min-h-[60px]">
                      {detailItem.description || 'Tidak ada deskripsi tambahan.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
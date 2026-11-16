import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Search,
  Wrench,
  Coins,
  Save,
  Layers,
  Loader2,
  Check,
  X,
  Info,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
} from 'lucide-react';
import API from '../../services/api';
import { showToast } from '../../utils/swalHelper';

interface ItemDiagnosisFormProps {
  items: any[];
  onAddItem: (itemData: { name: string; price: number; type: string; product_id?: number }) => void;
  onDeleteItem: (id: number) => void;
  additionalCost: number;
  additionalCostReason: string;
  onSaveAdditionalCost: (cost: number, reason: string) => void;
  isReadOnly: boolean;
}

export const ItemDiagnosisForm: React.FC<ItemDiagnosisFormProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  additionalCost,
  additionalCostReason,
  onSaveAdditionalCost,
  isReadOnly,
}) => {
  const [categories, setCategories] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearchKeyword, setCategorySearchKeyword] = useState('');

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
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

  const [costInput, setCostInput] = useState(additionalCost ? String(additionalCost) : '');
  const [reasonInput, setReasonInput] = useState(additionalCostReason || '');

  useEffect(() => {
    setCostInput(additionalCost ? String(additionalCost) : '');
    setReasonInput(additionalCostReason || '');
  }, [additionalCost, additionalCostReason]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [modalSearchKeyword, selectedCategory]);

  useEffect(() => {
    if (!isSearchModalOpen) return;

    const timer = setTimeout(async () => {
      try {
        setLoadingModalSearch(true);

        const params: any = {
          page: currentPage,
          per_page: itemsPerPage,
          limit: itemsPerPage,
        };
        if (modalSearchKeyword.trim()) params.search = modalSearchKeyword;
        if (selectedCategory) params.category_id = selectedCategory.id;

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
  }, [modalSearchKeyword, isSearchModalOpen, selectedCategory, currentPage, itemsPerPage]);

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

  const handleSelectFromCatalog = (product: any) => {
    const itemType = (product.type || product.item_type || 'sparepart').toLowerCase();
    if (itemType === 'sparepart' && Number(product.stock ?? 0) <= 0) {
      showToast(
        'warning',
        'Stok Habis',
        `Sparepart ${product.name} tidak dapat ditambahkan karena stok kosong.`
      );
      return;
    }

    const parsedPrice = getItemPrice(product);

    onAddItem({
      name: product.name,
      price: parsedPrice,
      type: product.type || product.item_type || 'sparepart',
      product_id: product.id,
    });

    setIsSearchModalOpen(false);
  };

  const handleApplyAdditionalCost = () => {
    const costVal = parseFloat(costInput) || 0;
    onSaveAdditionalCost(costVal, reasonInput);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchKeyword.toLowerCase().trim())
  );

  return (
    <div className="space-y-4 font-sans">
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {isReadOnly && items.some((item) => typeof item.is_approved === 'boolean')
            ? 'RIWAYAT USULAN & STATUS PERSETUJUAN'
            : 'DAFTAR SPAREPART & JASA TERPASANG'}
        </label>

        {(items && items.length > 0) || additionalCost > 0 ? (
          <div className="space-y-2 divide-y-0">
            {items.map((item, idx) => {
              const priceVal = parseFloat(item.price ?? item.cost ?? item.selling_price ?? 0);
              const qtyVal = parseInt(item.quantity ?? item.qty ?? 1);
              const hasPrice = item.price != null || item.cost != null || item.selling_price != null;
              const hasQuantity = item.quantity != null || item.qty != null;
              const subtotal = hasPrice && hasQuantity ? priceVal * qtyVal : null;
              const typeLabel =
                item.item_type ||
                item.type ||
                (isReadOnly && item.is_approved === false ? 'Jenis tidak tersimpan' : 'sparepart');

              return (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.item_name || item.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          typeLabel === 'service' || typeLabel === 'jasa'
                            ? 'bg-blue-100 text-blue-700'
                            : typeLabel === 'Jenis tidak tersimpan'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {typeLabel}
                      </span>
                      {isReadOnly && typeof item.is_approved === 'boolean' && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            item.is_approved
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.is_approved ? 'Disetujui' : 'Tidak disetujui'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {hasPrice
                        ? `Rp ${priceVal.toLocaleString('id-ID')}${hasQuantity ? ` x ${qtyVal}` : ''}`
                        : 'Rincian harga tidak tersimpan'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">
                      {subtotal === null ? 'Rincian tidak tersimpan' : `Rp ${subtotal.toLocaleString('id-ID')}`}
                    </span>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {additionalCost > 0 && (
              <div className="flex justify-between items-center p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-950">
                      Biaya Tambahan: {additionalCostReason || 'Penyesuaian Kerusakan'}
                    </span>
                    <span className="bg-amber-200 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                      Biaya Khusus
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700">Pengerjaan rumit / penyesuaian khusus</span>
                </div>
                <span className="font-black text-amber-900">
                  Rp {additionalCost.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Belum ada sparepart / jasa perbaikan yang diinput.
          </p>
        )}
      </div>

      {!isReadOnly && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-700">
            Pilih Sparepart / Jasa dari Katalog Workshop
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCategoryModalOpen(true);
                setCategorySearchKeyword('');
              }}
              className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:border-red-500 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-red-600" />
              <span className="truncate">
                {selectedCategory ? selectedCategory.name : 'Pilih Kategori'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSearchModalOpen(true);
                setModalSearchKeyword('');
              }}
              className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Katalog Produk</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-600" />
          <h4 className="text-[11px] font-bold text-slate-800">Biaya Tambahan Khusus (Pengerjaan Rumit / Kerusakan Lain)</h4>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            disabled={isReadOnly}
            placeholder="Alasan (contoh: Bubut disc brake)..."
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-red-600 disabled:opacity-60"
          />
          <input
            type="number"
            disabled={isReadOnly}
            placeholder="Nominal (Rp)"
            value={costInput}
            onChange={(e) => setCostInput(e.target.value)}
            className="w-28 bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-red-600 disabled:opacity-60"
          />
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleApplyAdditionalCost}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs shrink-0"
            >
              <Save className="w-3 h-3" />
              <span>Simpan</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL KATEGORI (STYLE IDENTIK DENGAN MODAL SEARCH KATALOG) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Header Modal */}
            <div className="p-4 bg-[#F8FAFC] border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Filter Kategori Workshop</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Pilih kategori untuk mempersempit daftar katalog</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input Cari Kategori Cepat */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={categorySearchKeyword}
                  onChange={(e) => setCategorySearchKeyword(e.target.value)}
                  placeholder="Cari nama kategori..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-xs"
                />
              </div>
            </div>

            {/* List Item Kategori */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-[#F8FAFC]">
              {/* Option: Semua Kategori */}
              {(!categorySearchKeyword.trim() || 'semua kategori'.includes(categorySearchKeyword.toLowerCase())) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsCategoryModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition flex justify-between items-center cursor-pointer shadow-xs ${
                    selectedCategory === null
                      ? 'bg-red-50/80 border-red-300 text-red-700 ring-1 ring-red-300'
                      : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-sm text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedCategory === null ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <span>Semua Kategori</span>
                  </div>
                  {selectedCategory === null && <Check className="w-4 h-4 text-red-600" />}
                </button>
              )}

              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryModalOpen(false);
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

            {/* Footer Modal */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
              <span className="font-medium flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                Tersedia <strong className="text-slate-900">{categories.length}</strong> kategori master
              </span>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SEARCH KATALOG */}
      {isSearchModalOpen && (
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
                  placeholder="Ketik nama sparepart / jasa atau SKU..."
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-xs"
                />
                {loadingModalSearch && (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-3" />
                )}
              </div>

              {selectedCategory && (
                <div className="flex items-center justify-between text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-bold">
                  <span>Kategori Aktif: {selectedCategory.name}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
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
                  const itemType = item.type || item.item_type || 'sparepart';

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-red-400 hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          {itemType === 'service' ? (
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
                            {itemType !== 'service' && (
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
                          onClick={() => handleSelectFromCatalog(item)}
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
                  onClick={() => setIsSearchModalOpen(false)}
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
    </div>
  );
};
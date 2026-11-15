import React from 'react';
import { 
  Edit2, 
  Trash2, 
  PackagePlus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Zap
} from 'lucide-react';

interface SparepartTableProps {
  products: any[];
  loading: boolean;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onEdit: (item: any) => void;
  onDelete: (id: number, name: string) => void;
  onRestock: (item: any) => void;
}

export const SparepartTable: React.FC<SparepartTableProps> = ({
  products,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  onRestock,
}) => {
  const currentPage = pagination?.current_page || 1;
  const totalPages = pagination?.last_page || 1;
  const totalItems = pagination?.total || products.length;
  const startItem = pagination?.from || 0;
  const endItem = pagination?.to || products.length;
  const itemsPerPage = pagination?.per_page || 10;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F4F5F3] text-slate-800 font-bold border-b border-slate-200">
              <th className="py-3 px-4">SKU / Kategori</th>
              <th className="py-3 px-4">Nama Barang & Merk</th>
              <th className="py-3 px-4 text-right">Harga Modal / Beli</th>
              <th className="py-3 px-4 text-right">Harga Jual</th>
              <th className="py-3 px-4 text-center">Stok Fisik</th>
              <th className="py-3 px-4 text-center">Lokasi Rak</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  Memuat data sparepart...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((item) => {
                const isLowStock = item.stock <= item.min_stock;
                const categoryName = typeof item.category === 'object' ? item.category?.name : (item.category || '-');

                return (
                  <tr key={item.id} className="hover:bg-red-50/20 transition font-medium">
                    {/* SKU & Kategori Sistem */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 block">{item.sku}</span>
                        {item.is_fast_moving && (
                          <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Fast Moving Item">
                            <Zap className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                            Fast
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{categoryName}</span>
                    </td>

                    {/* Nama Barang & Merk */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      {item.brand && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold inline-block mt-0.5">
                          {item.brand}
                        </span>
                      )}
                    </td>

                    {/* Harga Modal */}
                    <td className="py-3 px-4 text-right text-slate-500">
                      Rp {Number(item.cost_price).toLocaleString('id-ID')}
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      Rp {Number(item.selling_price).toLocaleString('id-ID')}
                    </td>

                    {/* Stok Fisik */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-lg text-[11px] inline-block ${
                          isLowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {item.stock} unit
                      </span>
                    </td>

                    {/* Lokasi Rak */}
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {item.location_rack || '-'}
                    </td>

                    {/* Tombol Aksi */}
                    <td className="py-3 px-4 text-center space-x-1">
                      <button
                        onClick={() => onRestock(item)}
                        title="Tambah Stok / Restock"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit Item"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id, item.name)}
                        title="Hapus Item"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  Tidak ada data sparepart yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER & SERVER-SIDE PAGINATION CONTROL */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-[#F4F5F3]/50 border-t border-slate-200 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan <strong className="text-slate-900">{startItem}</strong> -{' '}
              <strong className="text-slate-900">{endItem}</strong> dari{' '}
              <strong className="text-slate-900">{totalItems}</strong> sparepart
            </span>
            <div className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
              <span className="text-slate-500">Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-red-600 cursor-pointer"
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
              onClick={() => onPageChange && onPageChange(1)}
              disabled={currentPage === 1}
              title="Halaman Pertama"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Halaman Sebelumnya"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Halaman Selanjutnya"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Halaman Terakhir"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
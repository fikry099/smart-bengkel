import React from 'react';
import { 
  Edit2, 
  Trash2, 
  Wrench,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

interface ServiceTableProps {
  services: any[];
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
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}) => {
  const currentPage = pagination?.current_page || 1;
  const totalPages = pagination?.last_page || 1;
  const totalItems = pagination?.total || services.length;
  const startItem = pagination?.from || 0;
  const endItem = pagination?.to || services.length;
  const itemsPerPage = pagination?.per_page || 10;

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F4F5F3] text-slate-800 font-bold border-b border-slate-200">
              <th className="py-3 px-4">Kode SKU</th>
              <th className="py-3 px-4">Kategori Layanan</th>
              <th className="py-3 px-4">Nama Jasa / Perbaikan</th>
              <th className="py-3 px-4 text-right">Tarif Jasa (Rp)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                  Memuat data jasa servis...
                </td>
              </tr>
            ) : services.length > 0 ? (
              services.map((item) => {
                const categoryName = typeof item.category === 'object' && item.category !== null
                  ? item.category.name
                  : (item.category || 'Jasa Umum');

                return (
                  <tr key={item.id} className="hover:bg-red-50/20 transition font-medium">
                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.sku}
                    </td>

                    {/* Kategori Layanan */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-bold px-2.5 py-0.5 rounded text-[10px] border border-red-100">
                        <Wrench className="w-3 h-3 text-red-600" />
                        {categoryName}
                      </span>
                    </td>

                    {/* Nama Jasa */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>

                    {/* Tarif Jasa */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      Rp {Number(item.selling_price || 0).toLocaleString('id-ID')}
                    </td>

                    {/* Status Aktif */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Aktif Layanan
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center space-x-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Jasa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Hapus Jasa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                  Tidak ada data jasa perbaikan yang ditemukan.
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
              <strong className="text-slate-900">{totalItems}</strong> jasa
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
import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Trash2, Package, Wrench } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  editingProduct?: any;
  submitting: boolean;
}

export const ProductModalForm: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  submitting,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<'sparepart' | 'service'>('sparepart');
  const [category, setCategory] = useState('Oli & Pelumas');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('5');
  const [locationRack, setLocationRack] = useState('A-1');

  useEffect(() => {
    if (editingProduct) {
      setSku(editingProduct.sku || '');
      setName(editingProduct.name || '');
      setImage(editingProduct.image || editingProduct.image_url || null);
      setType(editingProduct.type || 'sparepart');
      setCategory(editingProduct.category || '');
      setCostPrice(editingProduct.cost_price || '');
      setSellingPrice(editingProduct.selling_price || '');
      setStock(editingProduct.stock || '0');
      setMinStock(editingProduct.min_stock || '5');
      setLocationRack(editingProduct.location_rack || '');
    } else {
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setImage(null);
      setType('sparepart');
      setCategory('Oli & Pelumas');
      setCostPrice('');
      setSellingPrice('');
      setStock('10');
      setMinStock('5');
      setLocationRack('A-1');
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sku,
      name,
      image,
      type,
      category,
      cost_price: type === 'sparepart' ? parseFloat(costPrice) || 0 : 0,
      selling_price: parseFloat(sellingPrice) || 0,
      stock: type === 'sparepart' ? parseInt(stock) || 0 : 0,
      min_stock: type === 'sparepart' ? parseInt(minStock) || 0 : 0,
      location_rack: type === 'sparepart' ? locationRack : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-7 space-y-6 shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-lg">
            {editingProduct
              ? `Edit ${type === 'sparepart' ? 'Barang' : 'Jasa'}`
              : `Tambah ${type === 'sparepart' ? 'Barang' : 'Jasa'} Baru`}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Tipe Item */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Tipe Item</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('sparepart');
                  if (!editingProduct) setCategory('Oli & Pelumas');
                }}
                className={`py-3 px-4 rounded-xl font-bold border flex items-center justify-center gap-2 transition cursor-pointer ${
                  type === 'sparepart'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-[#F4F5F3] text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Sparepart / Barang</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('service');
                  if (!editingProduct) setCategory('Jasa Perbaikan');
                }}
                className={`py-3 px-4 rounded-xl font-bold border flex items-center justify-center gap-2 transition cursor-pointer ${
                  type === 'service'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-[#F4F5F3] text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Jasa / Layanan Servis</span>
              </button>
            </div>
          </div>

          {/* Grid Layout 2 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* KIRI: Upload Foto Produk */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block font-bold text-slate-800">
                {type === 'sparepart' ? 'Foto Produk' : 'Foto / Ilustrasi Jasa'}
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-[#F4F5F3] hover:bg-slate-200/50 transition flex flex-col items-center justify-center h-48 text-center group overflow-hidden">
                {image ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden group flex items-center justify-center bg-slate-100">
                    <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-4 w-full h-full">
                    <div className="w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center shadow-xs mb-2 group-hover:text-red-600 transition">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 text-[11px]">Upload Foto</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG up to 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* KANAN: Form Detail */}
            <div className="md:col-span-8 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kode SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    {type === 'sparepart' ? 'Nama Barang' : 'Nama Jasa'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={type === 'sparepart' ? 'Contoh: Oli Mesin Shell Helix 5W-30 1L' : 'Contoh: Gurah Mesin & Tune Up Injeksi'}
                    required
                    className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-medium text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={type === 'sparepart' ? 'Contoh: Oli & Pelumas, Kampas Rem' : 'Contoh: Perbaikan Mesin, AC, Servis Rutin'}
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-medium text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                />
              </div>

              {type === 'sparepart' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Harga Modal / Beli (Rp)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="100000"
                      required
                      className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-medium text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="135000"
                      required
                      className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tarif Jasa (Rp)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="150000"
                    required
                    className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                  />
                </div>
              )}
            </div>
          </div>

          {type === 'sparepart' && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Stok Awal</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Min. Stok</label>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-medium text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Lokasi Rak</label>
                <input
                  type="text"
                  value={locationRack}
                  onChange={(e) => setLocationRack(e.target.value)}
                  placeholder="Rak A-1"
                  className="w-full bg-[#F4F5F3] border border-slate-300 rounded-xl py-2.5 px-3 font-medium text-slate-900 focus:outline-hidden focus:border-red-600 transition"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Project, Gudang, Karyawan, Konstruksi, Inventory, ProgresPekerjaan } from '../types';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'konstruksi' | 'progres' | 'inventory' | 'gudang' | 'supplier' | 'transaksi' | 'pembayaran' | 'fee' | 'karyawan' | 'absensi' | 'absensi_pekerja' | 'lead' | '';
  projects: Project[];
  gudangList: Gudang[];
  karyawanList: Karyawan[];
  konstruksiList: Konstruksi[];
  inventoryList: Inventory[];
  progresList?: ProgresPekerjaan[];
  onSave: (data: any) => void;
}

export default function AddRecordModal({
  isOpen,
  onClose,
  type,
  projects,
  gudangList,
  karyawanList,
  konstruksiList,
  inventoryList,
  progresList = [],
  onSave,
}: AddRecordModalProps) {
  if (!isOpen || !type) return null;

  // Generic state object to capture any form variables dynamically
  const [formData, setFormData] = React.useState<any>({});
  const [errorMsg, setErrorMsg] = React.useState('');

  // Initializing default form fields based on type
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (type === 'konstruksi') {
      setFormData({
        id: '',
        projectId: projects[0]?.id || '',
        projectName: projects[0]?.name || '',
        type: 'Type 45',
        luasTanah: 90,
        luasBangunan: 45,
        statusPembangunan: 'onProgres',
        statusPenjualan: 'tersedia',
        tanggalMulaiBangun: today,
      });
    } else if (type === 'progres') {
      setFormData({
        blokRumah: konstruksiList[0]?.id || 'A-01',
        namaTukang: '',
        noHp: '',
        kategoriPekerjaan: 'struktur',
        itemPekerjaan: '',
        persentasiProgres: 50,
        nilaiPekerjaan: 10000000,
        catatan: '',
      });
    } else if (type === 'inventory') {
      setFormData({
        namaMaterial: '',
        idGudang: gudangList[0]?.id || '',
        jumlahStok: 100,
        satuan: 'Sak',
        minimumStock: 20,
        harga: 75000,
        kategoriMaterial: 'Struktur',
      });
    } else if (type === 'gudang') {
      setFormData({
        namaGudang: '',
        lokasi: '',
      });
    } else if (type === 'supplier') {
      setFormData({
        namaSupplier: '',
        noHp: '',
        alamat: '',
      });
    } else if (type === 'transaksi') {
      setFormData({
        namaMaterial: inventoryList[0]?.namaMaterial || 'Semen Tigaroda 50kg',
        namaGudang: gudangList[0]?.namaGudang || 'Gudang Utama Permata',
        blokRumah: konstruksiList[0]?.id || 'A-02',
        type: 'keluar',
        jumlah: 10,
        tanggal: today,
        catatan: 'Pekerjaan renovasi lantai',
      });
    } else if (type === 'pembayaran') {
      // Find list of active contractor names from progress if available
      setFormData({
        namaTukang: 'Pak Joko Budiman',
        kategoriPekerjaan: 'struktur',
        nilaiPembayaran: 1500000,
        tanggalPembayaran: today,
        namaProjek: projects[0]?.name || 'Permata Hijau Residence',
        namaBlok: konstruksiList[0]?.id || 'A-01',
      });
    } else if (type === 'fee') {
      setFormData({
        namaMarketing: 'Sarah Amalia',
        komisi: 5000000,
        statusPembayaran: 'Belum Bayar',
        tanggalPembayaran: '-',
        noWhatsapp: '',
        namaProjek: projects[0]?.name || 'Permata Hijau Residence',
        namaBlok: konstruksiList[0]?.id || 'A-01',
      });
    } else if (type === 'karyawan') {
      setFormData({
        namaKaryawan: '',
        jabatan: 'Staff Logistik',
        gajiHarian: 4000000,
        tanggalGabung: today,
      });
    } else if (type === 'absensi') {
      setFormData({
        tanggal: today,
        waktuCheckin: '08:00',
        karyawanId: karyawanList[0]?.id || '',
        statusKehadiran: 'Hadir',
      });
    } else if (type === 'absensi_pekerja') {
      const uniqueWorkers = Array.from(new Set(progresList.map(p => p.namaTukang.trim()))).filter(Boolean);
      setFormData({
        tanggal: today,
        namaTukang: uniqueWorkers[0] || '',
        statusKehadiran: 'Hadir',
        keterangan: '',
      });
    } else if (type === 'lead') {
      setFormData({
        namaCustomer: '',
        namaProjek: projects[0]?.name || 'Permata Hijau Residence',
        namaBlok: konstruksiList[0]?.id || 'A-01',
        namaMarketing: 'Sarah Amalia',
        leadStatus: 'booking',
        noWhatsapp: '',
        tanggalInput: new Date().toISOString().split('T')[0],
      });
    }
    setErrorMsg('');
  }, [type, projects, gudangList, karyawanList, konstruksiList, inventoryList, progresList]);

  const handleChange = (key: string, value: any) => {
    let finalValue = value;
    // Safely parse number variables
    if (['luasTanah', 'luasBangunan', 'jumlahStok', 'minimumStock', 'harga', 'jumlah', 'persentasiProgres', 'nilaiPekerjaan', 'nilaiPembayaran', 'komisi', 'gajiHarian'].includes(key)) {
      finalValue = Number(value) || 0;
    }

    // Auto update project name if projectId changes
    if (key === 'projectId' && type === 'konstruksi') {
      const selectedProj = projects.find(p => p.id === value);
      setFormData((prev: any) => ({
        ...prev,
        projectId: value,
        projectName: selectedProj ? selectedProj.name : '',
      }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [key]: finalValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Custom Validation
    if (type === 'konstruksi' && !formData.id) {
       setErrorMsg('Mohon isi Nomor Blok Rumah (misal: A-12)');
       return;
    }
    if (type === 'progres' && (!formData.namaTukang || !formData.itemPekerjaan)) {
       setErrorMsg('Mohon lengkapi nama tukang dan item pekerjaan.');
       return;
    }
    if (type === 'inventory' && !formData.namaMaterial) {
       setErrorMsg('Mohon isi nama material / barang.');
       return;
    }
    if (type === 'gudang' && !formData.namaGudang) {
       setErrorMsg('Mohon isi nama gudang.');
       return;
    }
    if (type === 'supplier' && !formData.namaSupplier) {
      setErrorMsg('Mohon isi nama supplier.');
      return;
    }
    if (type === 'karyawan' && !formData.namaKaryawan) {
      setErrorMsg('Mohon isi nama karyawan.');
      return;
    }
    if (type === 'absensi_pekerja' && !formData.namaTukang) {
      setErrorMsg('Mohon tentukan atau isi nama tukang / pekerja.');
      return;
    }
    if (type === 'lead' && !formData.namaCustomer) {
      setErrorMsg('Mohon isi nama customer lead.');
      return;
    }

    // Pass data back to save handler
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/40 bg-white/85 backdrop-blur-2xl shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/40 px-6 py-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-lg uppercase tracking-wide">
              Tambah Data {type}
            </h3>
            <p className="text-xs text-slate-500">Isi formulir berikut untuk mendaftarkan record baru</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Kofigurasi Konstruksi */}
          {type === 'konstruksi' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nomor Blok (ID)*</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: A-04"
                    value={formData.id || ''}
                    onChange={(e) => handleChange('id', e.target.value.toUpperCase())}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Projek Perumahan</label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tipe Rumah</label>
                <input
                  type="text"
                  placeholder="Contoh: Type 36, Type 45, Type 70"
                  value={formData.type || ''}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Luas Tanah (m²)</label>
                  <input
                    type="number"
                    value={formData.luasTanah || 0}
                    onChange={(e) => handleChange('luasTanah', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Luas Bangunan (m²)</label>
                  <input
                    type="number"
                    value={formData.luasBangunan || 0}
                    onChange={(e) => handleChange('luasBangunan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Konstruksi</label>
                  <select
                    value={formData.statusPembangunan || 'onProgres'}
                    onChange={(e) => handleChange('statusPembangunan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="onProgres">onProgres</option>
                    <option value="terbangun">terbangun</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Penjualan</label>
                  <select
                    value={formData.statusPenjualan || 'tersedia'}
                    onChange={(e) => handleChange('statusPenjualan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="terbooking">Terbooking</option>
                    <option value="terjual">Terjual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Mulai Bangun</label>
                <input
                  type="date"
                  value={formData.tanggalMulaiBangun || ''}
                  onChange={(e) => handleChange('tanggalMulaiBangun', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 2. Progres Pekerjaan */}
          {type === 'progres' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Sasar Blok Rumah</label>
                  <select
                    value={formData.blokRumah || ''}
                    onChange={(e) => handleChange('blokRumah', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {konstruksiList.map((k) => (
                      <option key={k.id} value={k.id}>Blok {k.id} ({k.projectName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Kategori Pekerjaan</label>
                  <select
                    value={formData.kategoriPekerjaan || 'struktur'}
                    onChange={(e) => handleChange('kategoriPekerjaan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="struktur">Struktur Pondasi</option>
                    <option value="plafon">Plafon Gipsum</option>
                    <option value="atap">Atap & Baja Ringan</option>
                    <option value="listrik">Instalasi Listrik & Saklar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Kepala Tukang*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Joko"
                  value={formData.namaTukang || ''}
                  onChange={(e) => handleChange('namaTukang', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Item Detail Pekerjaan*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemasangan keramik teras samping"
                  value={formData.itemPekerjaan || ''}
                  onChange={(e) => handleChange('itemPekerjaan', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Persentasi Progres (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0 - 100"
                    value={formData.persentasiProgres || 0}
                    onChange={(e) => handleChange('persentasiProgres', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nilai Pekerjaan Kontrak (IDR)</label>
                  <input
                    type="number"
                    value={formData.nilaiPekerjaan || 0}
                    onChange={(e) => handleChange('nilaiPekerjaan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Opsional - Catatan pengerjaan lapangan"
                  value={formData.catatan || ''}
                  onChange={(e) => handleChange('catatan', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 3. Inventory */}
          {type === 'inventory' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Material*</label>
                  <input
                    type="text"
                    required
                    placeholder="Semen Gresik, Paku 4 inch"
                    value={formData.namaMaterial || ''}
                    onChange={(e) => handleChange('namaMaterial', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Kategori Material</label>
                  <select
                    value={formData.kategoriMaterial || 'Struktur'}
                    onChange={(e) => handleChange('kategoriMaterial', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="Struktur">Struktur</option>
                    <option value="Plumbing">Plumbing / Air</option>
                    <option value="Atap">Atap & Penutup</option>
                    <option value="Plafon">Plafon & Gypsum</option>
                    <option value="Kelistrikan">Kelistrikan</option>
                    <option value="Finishing">Finishing Cat/Keramik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Awal Stok</label>
                  <input
                    type="number"
                    value={formData.jumlahStok || 0}
                    onChange={(e) => handleChange('jumlahStok', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="Sak, Batang, Kubik, Pcs, Lembar"
                    value={formData.satuan || ''}
                    onChange={(e) => handleChange('satuan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Harga Satuan (IDR)</label>
                  <input
                    type="number"
                    value={formData.harga || 0}
                    onChange={(e) => handleChange('harga', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Batas Minimum Stok</label>
                  <input
                    type="number"
                    value={formData.minimumStock || 0}
                    onChange={(e) => handleChange('minimumStock', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Alokasi Gudang</label>
                <select
                  value={formData.idGudang || ''}
                  onChange={(e) => handleChange('idGudang', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                >
                  {gudangList.map((g) => (
                    <option key={g.id} value={g.id}>{g.namaGudang}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* 4. Gudang */}
          {type === 'gudang' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Gudang*</label>
                <input
                  type="text"
                  required
                  placeholder="Gudang Transit Barat, Gudang B"
                  value={formData.namaGudang || ''}
                  onChange={(e) => handleChange('namaGudang', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Lokasi Konstruksi Gudang</label>
                <input
                  type="text"
                  placeholder="Kavling 24, Sebelah Kantor Pemasaran"
                  value={formData.lokasi || ''}
                  onChange={(e) => handleChange('lokasi', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 5. Supplier */}
          {type === 'supplier' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Supplier Partner*</label>
                <input
                  type="text"
                  required
                  placeholder="PT. Sinar Jaya Distributor"
                  value={formData.namaSupplier || ''}
                  onChange={(e) => handleChange('namaSupplier', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nomor Kontak (HP)</label>
                <input
                  type="text"
                  placeholder="081234..."
                  value={formData.noHp || ''}
                  onChange={(e) => handleChange('noHp', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Alamat Supplier</label>
                <input
                  type="text"
                  placeholder="Jl. Raya Timur No. 12"
                  value={formData.alamat || ''}
                  onChange={(e) => handleChange('alamat', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 6. Transaksi Material */}
          {type === 'transaksi' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Material</label>
                <select
                  value={formData.namaMaterial || ''}
                  onChange={(e) => handleChange('namaMaterial', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                >
                  {inventoryList.map((i) => (
                    <option key={i.id} value={i.namaMaterial}>{i.namaMaterial} (Stok: {i.jumlahStok})</option>
                  ))}
                </select>
              </div>

              <div className={formData.type === 'masuk' ? "grid grid-cols-1" : "grid grid-cols-2 gap-4"}>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Gudang Asal/Tujuan</label>
                  <select
                    value={formData.namaGudang || ''}
                    onChange={(e) => handleChange('namaGudang', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {gudangList.map((g) => (
                      <option key={g.id} value={g.namaGudang}>{g.namaGudang}</option>
                    ))}
                  </select>
                </div>
                {formData.type !== 'masuk' && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Target Blok Rumah</label>
                    <select
                      value={formData.blokRumah || ''}
                      onChange={(e) => handleChange('blokRumah', e.target.value)}
                      className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                    >
                      {konstruksiList.map((k) => (
                        <option key={k.id} value={k.id}>Blok {k.id}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Mutasi Type</label>
                  <select
                    value={formData.type || 'keluar'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="keluar">Keluar (Gudang ke Unit)</option>
                    <option value="masuk">Masuk (Drop ke Gudang)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Kuantitas / Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.jumlah || 1}
                    onChange={(e) => handleChange('jumlah', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Mutasi</label>
                <input
                  type="date"
                  value={formData.tanggal || ''}
                  onChange={(e) => handleChange('tanggal', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              {formData.type !== 'masuk' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Catatan Operasional</label>
                  <input
                    type="text"
                    placeholder="Rincian pemakaian bahan"
                    value={formData.catatan || ''}
                    onChange={(e) => handleChange('catatan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              )}
            </>
          )}

          {/* 7. Catat Pembayaran Gaji Tukang */}
          {type === 'pembayaran' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Tukang</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Joko Budiman"
                    value={formData.namaTukang || ''}
                    onChange={(e) => handleChange('namaTukang', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Kategori Pekerjaan</label>
                  <select
                    value={formData.kategoriPekerjaan || 'struktur'}
                    onChange={(e) => handleChange('kategoriPekerjaan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="struktur">struktur</option>
                    <option value="atap">atap</option>
                    <option value="plafon">plafon</option>
                    <option value="listrik">listrik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Projek Perumahan</label>
                  <select
                    value={formData.namaProjek || ''}
                    onChange={(e) => handleChange('namaProjek', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Blok Rumah</label>
                  <select
                    value={formData.namaBlok || ''}
                    onChange={(e) => handleChange('namaBlok', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {konstruksiList.map((k) => (
                      <option key={k.id} value={k.id}>Blok {k.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Nilai Pembayaran (IDR)*</label>
                <input
                  type="number"
                  required
                  value={formData.nilaiPembayaran || 0}
                  onChange={(e) => handleChange('nilaiPembayaran', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={formData.tanggalPembayaran || ''}
                  onChange={(e) => handleChange('tanggalPembayaran', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 8. Fee Marketing */}
          {type === 'fee' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Marketing Specialist*</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Amalia, Rian Firdaus"
                  value={formData.namaMarketing || ''}
                  onChange={(e) => handleChange('namaMarketing', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nomor WhatsApp Marketing</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={formData.noWhatsapp || ''}
                  onChange={(e) => handleChange('noWhatsapp', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Projek Perumahan Sasar</label>
                  <select
                    value={formData.namaProjek || ''}
                    onChange={(e) => handleChange('namaProjek', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Unit Blok Terikat</label>
                  <select
                    value={formData.namaBlok || ''}
                    onChange={(e) => handleChange('namaBlok', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {konstruksiList.map((k) => (
                      <option key={k.id} value={k.id}>Blok {k.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nilai Komisi / Fee (IDR)</label>
                  <input
                    type="number"
                    value={formData.komisi || 0}
                    onChange={(e) => handleChange('komisi', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Pembayaran</label>
                  <select
                    value={formData.statusPembayaran || 'Belum Bayar'}
                    onChange={(e) => handleChange('statusPembayaran', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
              </div>

              {formData.statusPembayaran === 'Lunas' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Pembayaran Komisi</label>
                  <input
                    type="date"
                    onChange={(e) => handleChange('tanggalPembayaran', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              )}
            </>
          )}

          {/* 9. Data Karyawan */}
          {type === 'karyawan' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap Karyawan*</label>
                <input
                  type="text"
                  required
                  placeholder="Pratama Wijaya"
                  value={formData.namaKaryawan || ''}
                  onChange={(e) => handleChange('namaKaryawan', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jabatan Operasional</label>
                  <input
                    type="text"
                    placeholder="Supervisor Lapangan, HRD"
                    value={formData.jabatan || ''}
                    onChange={(e) => handleChange('jabatan', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Gaji Bulan (IDR)</label>
                  <input
                    type="number"
                    value={formData.gajiHarian || 4000000}
                    onChange={(e) => handleChange('gajiHarian', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Bergabung</label>
                <input
                  type="date"
                  value={formData.tanggalGabung || ''}
                  onChange={(e) => handleChange('tanggalGabung', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 10. Absensi Karyawan */}
          {type === 'absensi' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Karyawan</label>
                <select
                  value={formData.karyawanId || ''}
                  onChange={(e) => handleChange('karyawanId', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                >
                  {karyawanList.map((k) => (
                    <option key={k.id} value={k.id}>{k.namaKaryawan} ({k.jabatan})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Waktu Check-In</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:00"
                    value={formData.waktuCheckin || '08:00'}
                    onChange={(e) => handleChange('waktuCheckin', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Kehadiran</label>
                  <select
                    value={formData.statusKehadiran || 'Hadir'}
                    onChange={(e) => handleChange('statusKehadiran', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit (S/D Surat Dokter)</option>
                    <option value="Izin">Izin Terrencana</option>
                    <option value="Alpa">Alpa / Bolos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Absensi</label>
                <input
                  type="date"
                  value={formData.tanggal || ''}
                  onChange={(e) => handleChange('tanggal', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* Absensi Pekerja */}
          {type === 'absensi_pekerja' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Pekerja Sesuai Progres</label>
                <select
                  value={formData.namaTukang || ''}
                  onChange={(e) => handleChange('namaTukang', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200 mb-2"
                >
                  <option value="">-- Pilih Pekerja Terdaftar --</option>
                  {Array.from(new Set(progresList.map(p => p.namaTukang.trim()))).filter(Boolean).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Pekerja / Tukang (Konfirmasi / Ketik Baru)*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Joko Budiman"
                  value={formData.namaTukang || ''}
                  onChange={(e) => handleChange('namaTukang', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Kehadiran</label>
                  <select
                    value={formData.statusKehadiran || 'Hadir'}
                    onChange={(e) => handleChange('statusKehadiran', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Alpa">Alpa / Bolos</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Absensi</label>
                  <input
                    type="date"
                    value={formData.tanggal || ''}
                    onChange={(e) => handleChange('tanggal', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Keterangan Aktivitas / Detail</label>
                <input
                  type="text"
                  placeholder="Contoh: Melanjutkan pasang kusen / Istirahat sakit"
                  value={formData.keterangan || ''}
                  onChange={(e) => handleChange('keterangan', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* 11. Lead Penjualan */}
          {type === 'lead' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Customer Prospektif*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk Ahmad Santoso"
                  value={formData.namaCustomer || ''}
                  onChange={(e) => handleChange('namaCustomer', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nomor WhatsApp Customer</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={formData.noWhatsapp || ''}
                  onChange={(e) => handleChange('noWhatsapp', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Projek Perumahan Sasar</label>
                  <select
                    value={formData.namaProjek || ''}
                    onChange={(e) => handleChange('namaProjek', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Unit Blok Terikat</label>
                  <select
                    value={formData.namaBlok || ''}
                    onChange={(e) => handleChange('namaBlok', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    {konstruksiList.map((k) => (
                      <option key={k.id} value={k.id}>Blok {k.id}</option>
                    ))}
                  </select>
                </div>
              </div>               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Marketing</label>
                  <input
                    type="text"
                    placeholder="Sarah Amalia, Rian Firdaus"
                    value={formData.namaMarketing || ''}
                    onChange={(e) => handleChange('namaMarketing', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Lead Status Pipeline</label>
                  <select
                    value={formData.leadStatus || 'booking'}
                    onChange={(e) => handleChange('leadStatus', e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                  >
                    <option value="booking">booking (Tanda Jadi)</option>
                    <option value="dp">dp (Down Payment)</option>
                    <option value="pmberkasan">pmberkasan (KPR / Legal)</option>
                    <option value="tunggu akad">tunggu akad</option>
                    <option value="akad">akad (Selesai Lunas)</option>
                    <option value="batal">batal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Lead Diinput*</label>
                <input
                  type="date"
                  required
                  value={formData.tanggalInput || ''}
                  onChange={(e) => handleChange('tanggalInput', e.target.value)}
                  className="w-full text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
                />
              </div>
            </>
          )}

          {/* Footer Save Controls */}
          <div className="flex justify-end gap-3.5 pt-5 border-t border-slate-100 bg-white/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-md cursor-pointer transition"
            >
              <Save size={15} />
              Simpan Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

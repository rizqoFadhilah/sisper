import React from 'react';
import { 
  Package, 
  Warehouse, 
  Truck, 
  ArrowUpDown, 
  Search, 
  PlusCircle, 
  AlertOctagon, 
  Tags, 
  MapPin, 
  Phone,
  TrendingUp,
  TrendingDown,
  Coins
} from 'lucide-react';
import { Inventory, Gudang, Supplier, TransaksiMaterial, Project, Konstruksi } from '../types';

interface LogistikViewProps {
  inventoryList: Inventory[];
  gudangList: Gudang[];
  supplierList: Supplier[];
  transaksiList: TransaksiMaterial[];
  konstruksiList: Konstruksi[];
  projects: Project[];
  onAddInventory: () => void;
  onAddGudang: () => void;
  onAddSupplier: () => void;
  onAddTransaksi: () => void;
}

export default function LogistikView({
  inventoryList,
  gudangList,
  supplierList,
  transaksiList,
  konstruksiList = [],
  projects = [],
  onAddInventory,
  onAddGudang,
  onAddSupplier,
  onAddTransaksi
}: LogistikViewProps) {
  // Helper to determine vibrant, eye-catching category badge styling with diverse colors
  const getCategoryBadgeStyle = (category: string) => {
    const cat = (category || '').toLowerCase().trim();
    
    if (cat.includes('semen') || cat.includes('beton') || cat.includes('paving')) {
      return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/50';
    }
    if (cat.includes('besi') || cat.includes('baja') || cat.includes('metal') || cat.includes('rebar') || cat.includes('paku') || cat.includes('logam')) {
      return 'bg-blue-50 text-blue-700 border-blue-200/50';
    }
    if (cat.includes('pasir') || cat.includes('batu') || cat.includes('kerikil') || cat.includes('tanah') || cat.includes('agregat')) {
      return 'bg-amber-100/70 text-amber-800 border-amber-200/50';
    }
    if (cat.includes('cat') || cat.includes('finishing') || cat.includes('coating') || cat.includes('kuas') || cat.includes('thinner')) {
      return 'bg-pink-50 text-pink-700 border-pink-200/50';
    }
    if (cat.includes('kayu') || cat.includes('bambu') || cat.includes('triplek') || cat.includes('papan')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    }
    if (cat.includes('pipa') || cat.includes('pralon') || cat.includes('fitting')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200/50';
    }
    if (cat.includes('sanitary') || cat.includes('saniter') || cat.includes('kran') || cat.includes('wastafel') || cat.includes('toilet')) {
      return 'bg-teal-50 text-teal-700 border-teal-200/50';
    }
    if (cat.includes('listrik') || cat.includes('kabel') || cat.includes('saklar') || cat.includes('lampu')) {
      return 'bg-violet-50 text-violet-700 border-violet-200/50';
    }
    if (cat.includes('genteng') || cat.includes('atap') || cat.includes('asbes')) {
      return 'bg-rose-50 text-rose-700 border-rose-200/50';
    }
    if (cat.includes('keramik') || cat.includes('ubin') || cat.includes('granit')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    }
    
    // Fallback cycle based on character values
    const colors = [
      'bg-sky-50 text-sky-700 border-sky-200/50',
      'bg-purple-50 text-purple-700 border-purple-200/50',
      'bg-teal-50 text-teal-700 border-teal-200/50',
      'bg-rose-50 text-rose-700 border-rose-200/50',
      'bg-amber-50 text-amber-700 border-amber-200/50'
    ];
    const hash = Array.from(cat).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const [subTab, setSubTab] = React.useState<'inventory' | 'gudang' | 'supplier' | 'transaksi'>('transaksi');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [metricsTimeframe, setMetricsTimeframe] = React.useState<'hari' | 'minggu' | 'bulan'>('hari');
  const [stockStatusFilter, setStockStatusFilter] = React.useState<string>('all');

  // Compute metrics (quantity and value) dynamically based on active timeframe selection
  const metricsData = React.useMemo(() => {
    const today = new Date();
    // format to YYYY-MM-DD in local time
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Helper using mid-day to completely bypass timezone limits
    const parseLocalDate = (dateStr: string) => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const yr = parseInt(parts[0], 10);
      const mth = parseInt(parts[1], 10) - 1;
      const dy = parseInt(parts[2], 10);
      return new Date(yr, mth, dy, 12, 0, 0);
    };

    // Calculate dates bound values
    // Weekly: within current week starting from Sunday 00:00:00 to Saturday 23:59:59
    const startOfWeek = new Date(today);
    const currentDay = today.getDay();
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let filtered = transaksiList;
    if (metricsTimeframe === 'hari') {
      filtered = transaksiList.filter(t => t.tanggal === todayStr);
    } else if (metricsTimeframe === 'minggu') {
      filtered = transaksiList.filter(t => {
        const d = parseLocalDate(t.tanggal);
        return d !== null && d >= startOfWeek && d <= endOfWeek;
      });
    } else if (metricsTimeframe === 'bulan') {
      filtered = transaksiList.filter(t => {
        const d = parseLocalDate(t.tanggal);
        return d !== null && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      });
    }

    let masukQty = 0;
    let keluarQty = 0;
    let keluarCost = 0;

    filtered.forEach(t => {
      const matchedInventory = inventoryList.find(inv => inv.namaMaterial === t.namaMaterial);
      const hargaSatuan = matchedInventory ? matchedInventory.harga : 0;
      const amount = t.jumlah || 0;

      if (t.type === 'masuk') {
        masukQty += amount;
      } else if (t.type === 'keluar') {
        keluarQty += amount;
        keluarCost += (amount * hargaSatuan);
      }
    });

    return {
      masukQty,
      keluarQty,
      keluarCost
    };
  }, [transaksiList, inventoryList, metricsTimeframe]);

  // Currency utility helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper function to resolve Project Name for local inventory items based on their warehouse
  const getProjectNameForInventory = (item: Inventory) => {
    const gd = gudangList.find(g => g.id === item.idGudang);
    const searchStr = (gd ? gd.namaGudang + " " + gd.lokasi : item.idGudang || '').toLowerCase();
    
    // Look for match in projects array names
    const matchedProject = projects.find(p => {
      const pName = p.name.toLowerCase();
      const words = pName.split(' ');
      return words.some(word => word.length > 3 && searchStr.includes(word));
    });
    
    if (matchedProject) return matchedProject.name;
    
    // Specific predefined lookups
    if (searchStr.includes('permata') || item.idGudang === 'gud-01') return 'Permata Hijau Residence';
    if (searchStr.includes('griya') || searchStr.includes('harmony') || item.idGudang === 'gud-02') return 'Griya Harmony Cluster';
    if (searchStr.includes('nirwana') || item.idGudang === 'gud-03') return 'Grand Nirwana Regency';
    
    return projects[0]?.name || '-';
  };

  // Helper function to resolve Project Name for transaction records
  const getProjectNameForTransaksi = (t: TransaksiMaterial) => {
    if (t.type === 'keluar' && t.blokRumah && t.blokRumah !== '-') {
      const k = konstruksiList.find(item => item.id === t.blokRumah);
      if (k) {
        return k.projectName;
      }
    }
    
    // Otherwise fallback to warehouse-based project identification
    const gdName = t.namaGudang ? t.namaGudang.toLowerCase() : '';
    const matchedProject = projects.find(p => {
      const pName = p.name.toLowerCase();
      const words = pName.split(' ');
      return words.some(word => word.length > 3 && gdName.includes(word));
    });
    
    if (matchedProject) return matchedProject.name;
    
    if (gdName.includes('permata')) return 'Permata Hijau Residence';
    if (gdName.includes('griya') || gdName.includes('harmony')) return 'Griya Harmony Cluster';
    if (gdName.includes('nirwana') || gdName.includes('regency')) return 'Grand Nirwana Regency';
    
    return projects[0]?.name || '-';
  };

  // Filters based on active workspace and typing
  const filteredInventory = React.useMemo(() => {
    return inventoryList.filter(item => {
      const matchSearch = item.namaMaterial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategoriMaterial.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (stockStatusFilter === 'all') return true;
      const isLow = item.jumlahStok <= item.minimumStock;
      if (stockStatusFilter === 'aman') return !isLow;
      if (stockStatusFilter === 're-order') return isLow;
      return true;
    });
  }, [inventoryList, searchQuery, stockStatusFilter]);

  const filteredGudang = React.useMemo(() => {
    return gudangList.filter(g => 
      g.namaGudang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gudangList, searchQuery]);

  const filteredSupplier = React.useMemo(() => {
    return supplierList.filter(s => 
      s.namaSupplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.alamat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [supplierList, searchQuery]);

  const filteredTransaksi = React.useMemo(() => {
    return transaksiList.filter(t => 
      t.namaMaterial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.namaGudang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.blokRumah.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transaksiList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 4-way Navigation Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/55 backdrop-blur-md p-2 rounded-2xl border border-white/40">
        <div className="grid grid-cols-2 sm:flex sm:space-x-1 gap-1.5 w-full lg:w-auto p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => { setSubTab('transaksi'); setSearchQuery(''); setStockStatusFilter('all'); }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              subTab === 'transaksi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ArrowUpDown size={14} className="text-violet-500" />
            Transaksi Material
          </button>
          <button
            onClick={() => { setSubTab('inventory'); setSearchQuery(''); setStockStatusFilter('all'); }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              subTab === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package size={14} className="text-indigo-500" />
            Inventory Stok
          </button>
          <button
            onClick={() => { setSubTab('gudang'); setSearchQuery(''); setStockStatusFilter('all'); }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              subTab === 'gudang' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Warehouse size={14} className="text-emerald-500" />
            Gudang
          </button>
          <button
            onClick={() => { setSubTab('supplier'); setSearchQuery(''); setStockStatusFilter('all'); }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              subTab === 'supplier' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck size={14} className="text-amber-500" />
            Supplier
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (subTab === 'inventory') onAddInventory();
            else if (subTab === 'gudang') onAddGudang();
            else if (subTab === 'supplier') onAddSupplier();
            else onAddTransaksi();
          }}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer"
        >
          <PlusCircle size={15} />
          {subTab === 'inventory' && 'Tambah Material'}
          {subTab === 'gudang' && 'Tambah Ruang Gudang'}
          {subTab === 'supplier' && 'Tambah Supplier'}
          {subTab === 'transaksi' && 'Log Mutasi Material'}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 p-1 rounded-xl bg-white/45 backdrop-blur-md border border-white/20">
          <Search className="absolute left-4 top-4 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={`Cari dalam workspace ${subTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-xl pl-11 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {subTab === 'inventory' && (
          <div className="p-1 rounded-xl bg-white/45 backdrop-blur-md border border-white/20 flex items-center min-w-[220px]">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="w-full text-sm rounded-xl px-3 py-2 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="all">Semua Status Stok</option>
              <option value="aman">Status: AMAN</option>
              <option value="re-order">Status: RE-ORDER (Minim)</option>
            </select>
          </div>
        )}
      </div>

      {/* Render selected table */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          {/* Low Stock Watch banner if materials are empty/low */}
          {inventoryList.some(i => i.jumlahStok <= i.minimumStock) && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-500/10 border border-orange-200 text-orange-800 text-xs">
              <AlertOctagon size={18} className="text-orange-500 shrink-0" />
              <div>
                <strong>Perhatian Stok Minim:</strong> Terdapat material bangunan dengan kuantitas di bawah ambang batas aman. Segera hubungi supplier bersangkutan untuk pemesanan tambahan.
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                  <th className="p-4">Material</th>
                  <th className="p-4">Nama Projek & Gudang</th>
                  <th className="p-4 text-right">Stok Fisik & Harga</th>
                  <th className="p-4 text-right">Stok Minimum & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {filteredInventory.map((item) => {
                  const isLow = item.jumlahStok <= item.minimumStock;
                  // Map warehouse id to human readable name
                  const wName = gudangList.find(g => g.id === item.idGudang)?.namaGudang || item.idGudang;
                  return (
                    <tr key={item.id} className="hover:bg-white/40 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{item.namaMaterial}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(item.kategoriMaterial)}`}>
                            <Tags size={9} className="opacity-70" />
                            {item.kategoriMaterial}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 text-xs">
                          {getProjectNameForInventory(item)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{wName}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-mono font-bold text-slate-800 text-sm">
                          {item.jumlahStok} <span className="text-[11px] font-normal text-slate-500">{item.satuan}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-450 font-mono mt-0.5">
                          {formatRupiah(item.harga)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-mono text-slate-500 font-bold text-xs">
                          {item.minimumStock} <span className="text-[11px] font-normal">{item.satuan}</span>
                        </div>
                        <div className="mt-1.5 flex justify-end">
                          <span className={`inline-flex text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                            isLow 
                              ? 'bg-orange-500/15 text-orange-600 border border-orange-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/20'
                          }`}>
                            {isLow ? 'RE-ORDER' : 'AMAN'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'gudang' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGudang.map((g) => (
            <div key={g.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">GUDANG ID: {g.id}</span>
                  <Warehouse className="text-emerald-500" size={18} />
                </div>
                <h3 className="text-md font-display font-bold text-slate-800">{g.namaGudang}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                  <span>{g.lokasi}</span>
                </div>
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Material Tersimpan</span>
                <span className="font-bold text-emerald-600">
                  {inventoryList.filter(i => i.idGudang === g.id).length} Item
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'supplier' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                <th className="p-4">Nama Supplier</th>
                <th className="p-4">Nomor HP/Kontak</th>
                <th className="p-4">Alamat Kantor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSupplier.map((s) => {
                const cleanPhone = s.noHp ? s.noHp.replace(/\D/g, '') : '';
                const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                return (
                  <tr key={s.id} className="hover:bg-white/40 transition">
                    <td className="p-4 font-display font-bold text-slate-900 text-sm">{s.namaSupplier}</td>
                    <td className="p-4">
                      {s.noHp ? (
                        <a 
                          href={`https://wa.me/${waPhone}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all font-sans font-extrabold hover:-translate-y-0.5 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008 0c3.202.001 6.212 1.249 8.477 3.517 2.266 2.268 3.51 5.28 3.51 8.487-.004 6.657-5.34 11.997-11.951 12.003-2.005 0-3.974-.504-5.729-1.465L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.378 0 9.75-4.37 9.754-9.753.002-2.605-1.013-5.053-2.86-6.901C16.48 2.103 14.032.93 11.427.93c-5.385 0-9.76 4.373-9.765 9.758-.002 1.8.48 3.55 1.4 5.1l-.94 3.4 3.5-.92c1.55.85 3.25 1.3 4.9 1.3z" />
                          </svg>
                          <span>{s.noHp}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-sans">Belum terdaftar</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-medium">{s.alamat}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'transaksi' && (
        <div className="space-y-5">
          {/* Metrics Section Header with Timeframe Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/75 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm gap-4">
            <div>
              <h4 className="font-display font-bold text-slate-800 text-sm">Ringkasan Mutasi Material</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Analisis kuantitas material masuk & keluar beserta estimasi pembiayaan</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/40">
              <button
                onClick={() => setMetricsTimeframe('hari')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  metricsTimeframe === 'hari'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setMetricsTimeframe('minggu')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  metricsTimeframe === 'minggu'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setMetricsTimeframe('bulan')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  metricsTimeframe === 'bulan'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Metrics Panel / Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Material Masuk */}
            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-emerald-600/90 uppercase tracking-wider block">Material Masuk</span>
                <span className="font-mono text-2xl font-black text-slate-800 leading-none block mt-1.5">
                  {metricsData.masukQty} <span className="text-xs font-normal text-slate-450">satuan</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {metricsTimeframe === 'hari' ? 'Total masuk hari ini' : metricsTimeframe === 'minggu' ? 'Total masuk minggu ini' : 'Total masuk bulan ini'}
                </span>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-xs">
                <TrendingUp size={18} />
              </div>
            </div>

            {/* Total Material Keluar */}
            <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-rose-600/90 uppercase tracking-wider block">Material Keluar</span>
                <span className="font-mono text-2xl font-black text-slate-800 leading-none block mt-1.5">
                  {metricsData.keluarQty} <span className="text-xs font-normal text-slate-455">satuan</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {metricsTimeframe === 'hari' ? 'Total keluar hari ini' : metricsTimeframe === 'minggu' ? 'Total keluar minggu ini' : 'Total keluar bulan ini'}
                </span>
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shadow-xs">
                <TrendingDown size={18} />
              </div>
            </div>

            {/* Total Biaya Material Keluar */}
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-indigo-600/90 uppercase tracking-wider block">Total Biaya Keluar</span>
                <span className="font-mono text-lg font-extrabold text-slate-800 leading-none block mt-1.5">
                  {formatRupiah(metricsData.keluarCost)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1.5 block">
                  Estimasi nilai material keluar
                </span>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-xs">
                <Coins size={18} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Nama Material</th>
                  <th className="p-4">Projek & Gudang</th>
                  <th className="p-4 text-center">Tipe Transaksi</th>
                  <th className="p-4 text-right">Biaya Material</th>
                  <th className="p-4">Catatan Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredTransaksi.map((t) => {
                  const matchedInventory = inventoryList.find(inv => inv.namaMaterial === t.namaMaterial);
                  const hargaSatuan = matchedInventory ? matchedInventory.harga : 0;
                  const biayaMaterial = t.type === 'keluar' ? t.jumlah * hargaSatuan : null;

                  return (
                    <tr key={t.id} className="hover:bg-white/40 ease-in-out transition">
                      <td className="p-4">
                        <div className="font-mono font-bold text-indigo-600 text-[10px] mb-0.5">
                          {t.type === 'masuk' 
                            ? (t.supplier ? `Supplier: ${t.supplier}` : 'Masuk Gudang') 
                            : (t.blokRumah && t.blokRumah !== '-' ? `Blok ${t.blokRumah}` : '-')}
                        </div>
                        <div className="font-mono text-slate-400">{t.tanggal}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{t.namaMaterial}</td>
                      <td className="p-4">
                        <div className="text-xs font-semibold text-slate-700">{getProjectNameForTransaksi(t)}</div>
                        <div className="text-[10px] text-slate-450 mt-0.5 font-medium">{t.namaGudang}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div>
                          <span className={`inline-flex font-extrabold uppercase px-2 py-0.5 text-[10px] rounded ${
                            t.type === 'masuk' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {t.type}
                          </span>
                        </div>
                        <div className={`mt-1 font-bold font-mono text-xs ${
                          t.type === 'masuk' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === 'masuk' ? '+' : '-'}{t.jumlah}
                        </div>
                      </td>
                      <td className="p-4 text-right font-semibold font-mono text-slate-700">
                        {biayaMaterial !== null ? formatRupiah(biayaMaterial) : '-'}
                      </td>
                      <td className="p-4 italic text-slate-500 text-xs max-w-xs">{t.catatan}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

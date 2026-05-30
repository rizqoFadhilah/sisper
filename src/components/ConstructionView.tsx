import React from 'react';
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  Sliders, 
  PlusCircle, 
  Maximize2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Receipt,
  CreditCard
} from 'lucide-react';
import { Konstruksi, ProgresPekerjaan, TransaksiMaterial, Inventory, RincianPembayaran } from '../types';

interface ConstructionViewProps {
  konstruksiList: Konstruksi[];
  progresList: ProgresPekerjaan[];
  transaksiList?: TransaksiMaterial[];
  inventoryList?: Inventory[];
  pembayaranList: RincianPembayaran[];
  selectedProjectId: string;
  onAddKonstruksi: () => void;
  onAddProgres: () => void;
  onAddPembayaran: () => void;
  onUpdateProgres?: (id: string, newProgress: number, namaTukang?: string, noHp?: string) => void;
  onUpdateKonstruksiStatus?: (id: string, newStatus: Konstruksi['statusPembangunan']) => void;
  onUpdateKonstruksiSaleStatus?: (id: string, newStatus: Konstruksi['statusPenjualan']) => void;
}

export default function ConstructionView({
  konstruksiList,
  progresList,
  transaksiList = [],
  inventoryList = [],
  pembayaranList = [],
  selectedProjectId,
  onAddKonstruksi,
  onAddProgres,
  onAddPembayaran,
  onUpdateProgres,
  onUpdateKonstruksiStatus,
  onUpdateKonstruksiSaleStatus
}: ConstructionViewProps) {
  const [subTab, setSubTab] = React.useState<'blok' | 'progres' | 'opname' | 'rincian'>('blok');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [progresBlokFilter, setProgresBlokFilter] = React.useState('all');
  const [progresKategoriFilter, setProgresKategoriFilter] = React.useState('all');
  const [editingProgresId, setEditingProgresId] = React.useState<string | null>(null);

  // Helper: Format rupiah currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper: Calculate total costs for a block (material + labor)
  const getBiayaBangunForBlock = (blockId: string) => {
    const blockTransactions = transaksiList.filter(
      (t) => t.blokRumah === blockId && t.type === 'keluar'
    );
    const totalMaterialCost = blockTransactions.reduce((sum, t) => {
      const match = inventoryList.find((inv) => inv.namaMaterial === t.namaMaterial);
      const price = match ? match.harga : 0;
      return sum + (t.jumlah * price);
    }, 0);

    const blockProgres = progresList.filter((p) => p.blokRumah === blockId);
    const totalLaborCost = blockProgres.reduce((sum, p) => sum + p.totalNilaiPekerjaan, 0);

    return {
      materialCost: totalMaterialCost,
      laborCost: totalLaborCost,
      totalCost: totalMaterialCost + totalLaborCost
    };
  };

  // Helper logic to calculate average progress percentage of a block ID
  const getAverageBlockProgress = React.useCallback((blockId: string) => {
    const blockProgs = progresList.filter((p) => p.blokRumah === blockId);
    if (blockProgs.length === 0) return 0;
    const sum = blockProgs.reduce((acc, curr) => acc + curr.persentasiProgres, 0);
    return Math.round(sum / blockProgs.length);
  }, [progresList]);

  // Unique block options dynamically computed from progresList
  const uniqueBlokOptions = React.useMemo(() => {
    const bloks = progresList.map((p) => p.blokRumah);
    return Array.from(new Set(bloks)).sort();
  }, [progresList]);

  // Unique categories dynamically computed from progresList
  const uniqueKategoriOptions = React.useMemo(() => {
    const kats = progresList.map((p) => p.kategoriPekerjaan);
    return Array.from(new Set(kats)).sort();
  }, [progresList]);

  // Filters
  const filteredBloks = React.useMemo(() => {
    return konstruksiList.filter((k) => {
      const matchProject = selectedProjectId === 'all' || k.projectId === selectedProjectId;
      const matchSearch = k.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        k.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || k.statusPembangunan === statusFilter || k.statusPenjualan === statusFilter;
      return matchProject && matchSearch && matchStatus;
    });
  }, [konstruksiList, selectedProjectId, searchQuery, statusFilter]);

  const filteredProgres = React.useMemo(() => {
    return progresList.filter((p) => {
      // Find associated project of the block ID
      const associatedBlock = konstruksiList.find(k => k.id === p.blokRumah);
      const matchProject = selectedProjectId === 'all' || (associatedBlock && associatedBlock.projectId === selectedProjectId);
      const matchSearch = p.blokRumah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.namaTukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.itemPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kategoriPekerjaan.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchBlok = progresBlokFilter === 'all' || p.blokRumah === progresBlokFilter;
      const matchKategori = progresKategoriFilter === 'all' || p.kategoriPekerjaan.toLowerCase() === progresKategoriFilter.toLowerCase();
      
      return matchProject && matchSearch && matchBlok && matchKategori;
    });
  }, [progresList, konstruksiList, selectedProjectId, searchQuery, progresBlokFilter, progresKategoriFilter]);

  // Dynamic Opname Tukang Engine
  const opnameTukangList = React.useMemo(() => {
    // Group tasks on ProgresPekerjaan by Tukang name + category
    const tukangGroups: { [key: string]: {
      id: string;
      namaTukang: string;
      noHp: string;
      kategoriPekerjaan: string;
      blokId: string;
      projectId: string;
      totalValue: number;
      tanggalMulai: string;
    }} = {};

    progresList.forEach((prog, index) => {
      const key = `${prog.namaTukang}::${prog.kategoriPekerjaan}`;
      if (!tukangGroups[key]) {
        tukangGroups[key] = {
          id: `opn-${index + 1}`,
          namaTukang: prog.namaTukang,
          noHp: prog.noHp || '',
          kategoriPekerjaan: prog.kategoriPekerjaan,
          blokId: prog.blokRumah,
          projectId: prog.blokRumah.startsWith('A') ? 'prj-01' : prog.blokRumah.startsWith('B') ? 'prj-02' : 'prj-03',
          totalValue: 0,
          tanggalMulai: '2026-02-15' // fallback date
        };
      }
      tukangGroups[key].totalValue += prog.totalNilaiPekerjaan;
    });

    return Object.values(tukangGroups).map((g) => {
      // Find sum of matching payments for this worker + category
      const payments = (pembayaranList || [])
        .filter(p => p.namaTukang.toLowerCase() === g.namaTukang.toLowerCase() && p.kategoriPekerjaan.toLowerCase() === g.kategoriPekerjaan.toLowerCase())
        .reduce((sum, p) => sum + p.nilaiPembayaran, 0);

      const unpaid = Math.max(0, g.totalValue - payments);
      const paidPct = g.totalValue > 0 ? Math.round((payments / g.totalValue) * 100) : 0;

      return {
        id: g.id,
        projectId: g.projectId,
        blokId: g.blokId,
        namaTukang: g.namaTukang,
        noHp: g.noHp,
        kategoriPekerjaan: g.kategoriPekerjaan,
        nilaiTotal: g.totalValue,
        nilaiTerbayar: payments,
        nilaiBelumTerbayar: unpaid,
        persenTerbayar: Math.min(100, paidPct),
        tanggalMulaiPekerjaan: g.tanggalMulai
      };
    });
  }, [progresList, pembayaranList]);

  // Filters based on search
  const filteredOpname = React.useMemo(() => {
    return opnameTukangList.filter(o => {
      const associatedBlock = konstruksiList.find(k => k.id === o.blokId);
      const matchProject = selectedProjectId === 'all' || (associatedBlock && associatedBlock.projectId === selectedProjectId);
      const matchSearch = o.namaTukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.kategoriPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.blokId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProject && matchSearch;
    });
  }, [opnameTukangList, searchQuery, selectedProjectId, konstruksiList]);

  const filteredRincian = React.useMemo(() => {
    return (pembayaranList || []).filter(p => {
      const associatedBlock = konstruksiList.find(k => k.id === p.namaBlok);
      const matchProject = selectedProjectId === 'all' || (associatedBlock && associatedBlock.projectId === selectedProjectId);
      const matchSearch = p.namaTukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kategoriPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.namaBlok || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchProject && matchSearch;
    });
  }, [pembayaranList, searchQuery, selectedProjectId, konstruksiList]);

  return (
    <div className="space-y-6">
      {/* Sub tabs inside Construction */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white/55 backdrop-blur-md p-2 rounded-2xl border border-white/40">
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => { 
              setSubTab('blok'); 
              setSearchQuery(''); 
              setStatusFilter('all');
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              subTab === 'blok'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sliders size={15} />
            Konstruksi (Blok)
          </button>
          <button
            onClick={() => { 
              setSubTab('progres'); 
              setSearchQuery(''); 
              setProgresBlokFilter('all');
              setProgresKategoriFilter('all');
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              subTab === 'progres'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wrench size={15} />
            Progres Pekerja
          </button>
          <button
            onClick={() => { 
              setSubTab('opname'); 
              setSearchQuery(''); 
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              subTab === 'opname'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={15} className="text-indigo-500" />
            Opname Pekerja
          </button>
          <button
            onClick={() => { 
              setSubTab('rincian'); 
              setSearchQuery(''); 
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              subTab === 'rincian'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Receipt size={15} className="text-emerald-500" />
            Rincian Pembayaran
          </button>
        </div>

        {/* Dynamic add / action button */}
        <div className="shrink-0 flex items-center">
          {subTab === 'blok' && (
            <button
              onClick={onAddKonstruksi}
              className="w-full xl:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <PlusCircle size={16} />
              Tambah Unit Blok
            </button>
          )}
          {subTab === 'progres' && (
            <button
              onClick={onAddProgres}
              className="w-full xl:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <PlusCircle size={16} />
              Input Progres Kerja
            </button>
          )}
          {subTab === 'opname' && (
            <button
              onClick={onAddPembayaran}
              className="w-full xl:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <PlusCircle size={15} />
              Tambah Opname Baru
            </button>
          )}
          {subTab === 'rincian' && (
            <button
              onClick={onAddPembayaran}
              className="w-full xl:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <PlusCircle size={15} />
              Catat Pembayaran
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white/40 backdrop-blur-md border border-white/20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={
              subTab === 'blok' ? 'Cari Nomor Blok, tipe rumah, atau projek...' : 
              subTab === 'progres' ? 'Cari id blok, nama pekerja, atau deskripsi item...' :
              subTab === 'opname' ? 'Cari pekerja, kategori pekerjaan, atau nama blok...' :
              'Cari pekerja atau kategori rincian...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-xl pl-10 pr-4 py-2 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {subTab === 'blok' && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-xl px-3 py-2 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="onProgres">Konstruksi: On Progres</option>
              <option value="terbangun">Konstruksi: Terbangun</option>
              <option value="tersedia">Penjualan: Tersedia</option>
              <option value="terbooking">Penjualan: Terbooking</option>
              <option value="terjual">Penjualan: Terjual</option>
            </select>
          </div>
        )}

        {subTab === 'progres' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={progresBlokFilter}
                onChange={(e) => setProgresBlokFilter(e.target.value)}
                className="text-sm rounded-xl px-3 py-2 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 font-medium"
              >
                <option value="all">Semua Blok Rumah</option>
                {uniqueBlokOptions.map((blok) => (
                  <option key={blok} value={blok}>{blok}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-slate-400" />
              <select
                value={progresKategoriFilter}
                onChange={(e) => setProgresKategoriFilter(e.target.value)}
                className="text-sm rounded-xl px-3 py-2 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 font-medium capitalize"
              >
                <option value="all">Semua Kategori</option>
                {uniqueKategoriOptions.map((kat) => (
                  <option key={kat} value={kat} className="capitalize">{kat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Render tables or grids */}
      {subTab === 'blok' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-display font-medium text-[11px] uppercase tracking-wider">
                <th className="p-4">Blok</th>
                <th className="p-4">Spesifikasi Unit</th>
                <th className="p-4">Konstruksi & Status Penjualan</th>
                <th className="p-4">Penyelesaian Rata-rata</th>
                <th className="p-4 text-right">Biaya Bangun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 font-sans text-slate-700">
              {filteredBloks.map((k) => {
                const avgProgVal = getAverageBlockProgress(k.id);
                const costs = getBiayaBangunForBlock(k.id);
                return (
                  <tr key={k.id} className="hover:bg-white/45 transition">
                    <td className="p-4">
                      <div className="font-display font-bold text-indigo-600 text-base">{k.id}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">{k.projectName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{k.type}</div>
                      <div className="text-[11px] text-slate-400">LT: {k.luasTanah} m² / LB: {k.luasBangunan} m²</div>
                    </td>
                    <td className="p-4 space-y-2">
                      <div>
                        <select
                          value={k.statusPembangunan}
                          onChange={(e) => onUpdateKonstruksiStatus?.(k.id, e.target.value as any)}
                          className={`text-[11px] font-extrabold uppercase px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm transition-all ${
                            k.statusPembangunan === 'terbangun'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          <option className="bg-white text-slate-800 font-sans" value="onProgres">ON PROGRES</option>
                          <option className="bg-white text-slate-800 font-sans" value="terbangun">TERBANGUN</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={k.statusPenjualan}
                          onChange={(e) => onUpdateKonstruksiSaleStatus?.(k.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm transition-all uppercase ${
                            k.statusPenjualan === 'tersedia'
                              ? 'bg-cyan-500/10 text-cyan-600 border-cyan-400/20'
                              : k.statusPenjualan === 'terbooking'
                              ? 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-400/20'
                              : 'bg-purple-500/10 text-purple-600 border-purple-400/20'
                          }`}
                        >
                          <option className="bg-white text-slate-800 font-sans" value="tersedia">TERSEDIA</option>
                          <option className="bg-white text-slate-800 font-sans" value="terbooking">TERBOOKING</option>
                          <option className="bg-white text-slate-800 font-sans" value="terjual">TERJUAL</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5 max-w-[120px]">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{avgProgVal}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              avgProgVal === 100 
                                ? 'bg-emerald-500' 
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${avgProgVal}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Mulai: {k.tanggalMulaiBangun}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono">
                      <div className="font-bold text-slate-800 text-sm">
                        {formatRupiah(costs.totalCost)}
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5 mt-1">
                        <div className="flex justify-end gap-1">
                          <span>Mat:</span>
                          <span className="font-medium">{costs.materialCost > 0 ? formatRupiah(costs.materialCost) : '-'}</span>
                        </div>
                        <div className="flex justify-end gap-1">
                          <span>Pekerja:</span>
                          <span className="font-medium">{costs.laborCost > 0 ? formatRupiah(costs.laborCost) : '-'}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBloks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada data unit konstruksi perumahan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'progres' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-display font-medium text-[11px] uppercase tracking-wider">
                <th className="p-4">Rumah Blok</th>
                <th className="p-4">Pekerja & Kategori</th>
                <th className="p-4">Item Pekerjaan</th>
                <th className="p-4">Progres Bar</th>
                <th className="p-4 text-right">Total Realisasi Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-slate-700">
              {filteredProgres.map((p) => {
                const blockInfo = konstruksiList.find(k => k.id === p.blokRumah);
                const projectName = blockInfo ? blockInfo.projectName : (p.blokRumah.startsWith('A') ? 'Permata Hijau' : p.blokRumah.startsWith('B') ? 'Griya Harmony' : 'Grand Nirwana');
                return (
                  <tr key={p.id} className="hover:bg-white/45 transition">
                    <td className="p-4">
                      <div className="font-display font-bold text-slate-800 text-base">{p.blokRumah}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">{projectName}</div>
                    </td>
                    <td className="p-4">
                      {editingProgresId === p.id ? (
                        <div className="space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-1.5 max-w-[150px]">
                          <input
                            type="text"
                            placeholder="Nama Pekerja"
                            value={p.namaTukang === 'Belum Ditunjuk' ? '' : p.namaTukang}
                            onChange={(e) => onUpdateProgres?.(p.id, p.persentasiProgres, e.target.value || 'Belum Ditunjuk', p.noHp)}
                            className="w-full text-xs font-bold rounded border border-slate-200 px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-display"
                          />
                          <input
                            type="text"
                            placeholder="WA: 0812..."
                            value={p.noHp === '-' ? '' : p.noHp || ''}
                            onChange={(e) => onUpdateProgres?.(p.id, p.persentasiProgres, p.namaTukang, e.target.value || '-')}
                            className="w-full text-[10px] rounded border border-slate-200 px-1.5 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-800">{p.namaTukang}</div>
                          {p.noHp && p.noHp !== '-' && (
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.noHp}</div>
                          )}
                        </>
                      )}
                      <div className="mt-1">
                        <span className={`inline-flex text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          p.kategoriPekerjaan === 'struktur' ? 'bg-amber-100 text-amber-700' :
                          p.kategoriPekerjaan === 'atap' ? 'bg-blue-100 text-blue-700' :
                          p.kategoriPekerjaan === 'plafon' ? 'bg-purple-100 text-purple-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {p.kategoriPekerjaan}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-medium text-slate-800 text-xs">{p.itemPekerjaan}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {formatRupiah(p.nilaiPekerjaan)}
                      </div>
                    </td>
                    <td className="p-4 min-w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-indigo-600 font-display text-sm whitespace-nowrap">{p.persentasiProgres}%</span>
                          {editingProgresId === p.id ? (
                            <button
                              onClick={() => setEditingProgresId(null)}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
                              id={`save-prog-${p.id}`}
                            >
                              Simpan
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingProgresId(p.id)}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-slate-100 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-pointer"
                              id={`edit-prog-${p.id}`}
                            >
                              Edit Progres
                            </button>
                          )}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          disabled={editingProgresId !== p.id}
                          value={p.persentasiProgres}
                          onChange={(e) => onUpdateProgres?.(p.id, parseInt(e.target.value, 10))}
                          className={`w-full h-2 rounded-lg appearance-none focus:outline-none transition-all ${
                            editingProgresId === p.id 
                              ? 'cursor-ew-resize accent-indigo-600' 
                              : 'cursor-not-allowed opacity-60'
                          }`}
                          style={{
                            background: editingProgresId === p.id
                              ? `linear-gradient(to right, #6366f1 0%, #6366f1 ${p.persentasiProgres}%, #e2e8f0 ${p.persentasiProgres}%, #e2e8f0 100%)`
                              : `linear-gradient(to right, #94a3b8 0%, #94a3b8 ${p.persentasiProgres}%, #e2e8f0 ${p.persentasiProgres}%, #e2e8f0 100%)`
                          }}
                        />
                        {editingProgresId === p.id && (
                          <div className="text-[9px] text-indigo-500 font-bold animate-pulse">
                            ⚡ Geser untuk mengubah progres kerja
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-xs font-bold text-indigo-600">
                      {formatRupiah(p.totalNilaiPekerjaan)}
                      <div className="text-[10px] text-slate-400 font-normal">({p.persentasiProgres}%)</div>
                    </td>
                  </tr>
                );
              })}
              {filteredProgres.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada riwayat progres pekerjaan terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'opname' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                <th className="p-4">Pekerja</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Blok & Projek</th>
                <th className="p-4 text-right">Nilai Total Progres</th>
                <th className="p-4 text-right">Nilai & Progres Terbayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredOpname.map((opn) => {
                const isDebt = opn.nilaiBelumTerbayar > 0;
                const cleanPhone = opn.noHp ? opn.noHp.replace(/\D/g, '') : '';
                const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                return (
                  <tr key={opn.id} className="hover:bg-white/40 transition">
                    <td className="p-4">
                      <div className="font-display font-bold text-slate-900 text-[15px]">{opn.namaTukang}</div>
                      <div className="mt-1.5 flex items-center">
                        {opn.noHp ? (
                          <a 
                            href={`https://wa.me/${waPhone}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all font-sans font-extrabold hover:-translate-y-0.5 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008 0c3.202.001 6.212 1.249 8.477 3.517 2.266 2.268 3.51 5.28 3.51 8.487-.004 6.657-5.34 11.997-11.951 12.003-2.005 0-3.974-.504-5.729-1.465L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.378 0 9.75-4.37 9.754-9.753.002-2.605-1.013-5.053-2.86-6.901C16.48 2.103 14.032.93 11.427.93c-5.385 0-9.76 4.373-9.765 9.758-.002 1.8.48 3.55 1.4 5.1l-.94 3.4 3.5-.92c1.55.85 3.25 1.3 4.9 1.3z" />
                            </svg>
                            <span>{opn.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-450 italic text-[11px] font-sans">No. HP tidak terdaftar</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="inline-flex text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                          {opn.kategoriPekerjaan}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Mulai: {opn.tanggalMulaiPekerjaan}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">Blok {opn.blokId}</div>
                      <div className="text-[10px] text-slate-400">{opn.projectId === 'prj-01' ? 'Permata Hijau' : opn.projectId === 'prj-02' ? 'Griya Harmony' : 'Grand Nirwana'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-xs text-slate-900 font-bold">{formatRupiah(opn.nilaiTotal)}</div>
                      <div className="flex flex-col items-end mt-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-lg max-w-[155px] ml-auto">
                        <span className={`font-mono text-[11px] font-extrabold ${isDebt ? 'text-rose-600' : 'text-slate-400'}`}>
                          {formatRupiah(opn.nilaiBelumTerbayar)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-mono text-xs text-emerald-600 font-bold">{formatRupiah(opn.nilaiTerbayar)}</div>
                      <div className="flex flex-col items-end mt-1.5">
                        <span className="text-[10px] font-bold text-slate-500 mb-0.5">{opn.persenTerbayar}% Terbayar</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${opn.persenTerbayar}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOpname.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                    Tidak ada catatan opname aktif. Pastikan data "Progres Pekerjaan" telah diinput.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'rincian' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                <th className="p-4">Nilai Pembayaran</th>
                <th className="p-4">Pekerja & Kategori</th>
                <th className="p-4">Blok & Projek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans text-xs">
              {filteredRincian.map((p) => (
                <tr key={p.id} className="hover:bg-white/40 transition">
                  <td className="p-4">
                    <div className="font-mono font-bold text-emerald-600 text-sm">
                      {formatRupiah(p.nilaiPembayaran)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Tgl: {p.tanggalPembayaran}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-display font-semibold text-slate-950 text-sm">{p.namaTukang}</div>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-500">
                        {p.kategoriPekerjaan}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">Blok {p.namaBlok || 'A-01'}</div>
                    <div className="text-[10px] text-slate-400">Projek: {p.namaProjek || 'Permata Hijau Residence'}</div>
                  </td>
                </tr>
              ))}
              {filteredRincian.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 font-sans">
                    Tidak ada catatan pembayaran yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

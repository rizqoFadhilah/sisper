import React from 'react';
import { 
  Users, 
  CalendarDays, 
  TrendingUp, 
  Search, 
  PlusCircle, 
  UserPlus, 
  CheckCircle, 
  XOctagon, 
  AlertCircle,
  FileSpreadsheet,
  Wrench,
  Smartphone
} from 'lucide-react';
import { Karyawan, AbsensiKaryawan, ProgresPekerjaan, AbsensiPekerja, Pekerja } from '../types';

interface OperasionalViewProps {
  karyawanList: Karyawan[];
  absensiList: AbsensiKaryawan[];
  absensiPekerjaList: AbsensiPekerja[];
  progresList: ProgresPekerjaan[];
  pekerjaList: Pekerja[];
  onAddKaryawan: () => void;
  onAddAbsensi: () => void;
  onAddAbsensiPekerja: () => void;
  onAddPekerja?: (pekerja: Omit<Pekerja, 'id'>) => void;
}

export default function OperasionalView({
  karyawanList,
  absensiList,
  absensiPekerjaList,
  progresList,
  pekerjaList = [],
  onAddKaryawan,
  onAddAbsensi,
  onAddAbsensiPekerja,
  onAddPekerja
}: OperasionalViewProps) {
  const [subTab, setSubTab] = React.useState<'karyawan' | 'absensi' | 'absensi_pekerja' | 'pekerja'>('absensi');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Format YYYY-MM into Indo month name, e.g. "2026-05" -> "Mei 2026"
  const formatIndoMonth = React.useCallback((ym: string) => {
    if (!ym) return '';
    const parts = ym.split('-');
    if (parts.length < 2) return ym;
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[month - 1] || 'Bulan ' + month} ${year}`;
  }, []);

  // Extract all unique months from absensiList (format: YYYY-MM)
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    (absensiList || []).forEach(a => {
      if (a.tanggal && a.tanggal.length >= 7) {
        set.add(a.tanggal.slice(0, 7));
      }
    });
    // Add current month if list is empty
    if (set.size === 0) {
      const now = new Date();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      set.add(currentYM);
    }
    return Array.from(set).sort().reverse(); // Latest first
  }, [absensiList]);

  // Selected month for recap, default to latest month
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');

  // Sync selected month
  React.useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyStats = React.useMemo(() => {
    const listInMonth = (absensiList || []).filter(a => a.tanggal && a.tanggal.startsWith(selectedMonth));
    const totalRecords = listInMonth.length;
    const hadir = listInMonth.filter(a => a.statusKehadiran === 'Hadir').length;
    const sakit = listInMonth.filter(a => a.statusKehadiran === 'Sakit').length;
    const izin = listInMonth.filter(a => a.statusKehadiran === 'Izin').length;
    const alpa = listInMonth.filter(a => a.statusKehadiran === 'Alpa').length;
    const productivityRate = totalRecords > 0 ? Math.round((hadir / totalRecords) * 100) : 0;

    return {
      totalRecords,
      hadir,
      sakit,
      izin,
      alpa,
      productivityRate,
    };
  }, [absensiList, selectedMonth]);

  const employeeMonthlyRecap = React.useMemo(() => {
    return karyawanList.map(emp => {
      const empAbsList = (absensiList || []).filter(a => 
        a.karyawanId === emp.id && 
        a.tanggal && 
        a.tanggal.startsWith(selectedMonth)
      );
      
      const total = empAbsList.length;
      const hadir = empAbsList.filter(a => a.statusKehadiran === 'Hadir').length;
      const sakit = empAbsList.filter(a => a.statusKehadiran === 'Sakit').length;
      const izin = empAbsList.filter(a => a.statusKehadiran === 'Izin').length;
      const alpa = empAbsList.filter(a => a.statusKehadiran === 'Alpa').length;
      const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
      
      return {
        id: emp.id,
        namaKaryawan: emp.namaKaryawan,
        jabatan: emp.jabatan,
        hadir,
        sakit,
        izin,
        alpa,
        total,
        rate
      };
    });
  }, [karyawanList, absensiList, selectedMonth]);

  // Currency utility helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Resolve employee name helper
  const getEmployeeName = React.useCallback((id: string) => {
    return karyawanList.find(k => k.id === id)?.namaKaryawan || id;
  }, [karyawanList]);

  // Resolve employee role helper
  const getEmployeeRole = React.useCallback((id: string) => {
    return karyawanList.find(k => k.id === id)?.jabatan || 'Staff';
  }, [karyawanList]);

  // Filters based on active sub tab
  const filteredKaryawan = React.useMemo(() => {
    return karyawanList.filter(k => 
      k.namaKaryawan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [karyawanList, searchQuery]);

  const filteredAbsensi = React.useMemo(() => {
    return absensiList.filter(a => {
      const empName = getEmployeeName(a.karyawanId);
      return empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.statusKehadiran.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [absensiList, searchQuery, getEmployeeName]);

  const filteredAbsensiPekerja = React.useMemo(() => {
    return (absensiPekerjaList || []).filter(a => {
      return a.namaTukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.statusKehadiran.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.keterangan.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [absensiPekerjaList, searchQuery]);

  const [isAddingPekerja, setIsAddingPekerja] = React.useState(false);
  const [newPekerjaName, setNewPekerjaName] = React.useState('');
  const [newPekerjaPhone, setNewPekerjaPhone] = React.useState('');
  const [newPekerjaCategory, setNewPekerjaCategory] = React.useState<'struktur' | 'plafon' | 'atap' | 'listrik' | 'pembersihan'>('struktur');

  const handlePekerjaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPekerjaName.trim() || !newPekerjaPhone.trim()) return;

    onAddPekerja?.({
      namaTukang: newPekerjaName.trim(),
      noHp: newPekerjaPhone.trim(),
      kategoriPekerjaan: newPekerjaCategory,
    });

    setNewPekerjaName('');
    setNewPekerjaPhone('');
    setNewPekerjaCategory('struktur');
    setIsAddingPekerja(false);
  };

  const filteredPekerja = React.useMemo(() => {
    return (pekerjaList || []).filter(p => 
      p.namaTukang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kategoriPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.noHp || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pekerjaList, searchQuery]);

  // Look up worker's job category helper
  const getPekerjaCategory = React.useCallback((namaTukang: string) => {
    const key = namaTukang.trim().toLowerCase();
    const found = (pekerjaList || []).find(p => p.namaTukang.toLowerCase() === key);
    return found ? found.kategoriPekerjaan : null;
  }, [pekerjaList]);

  return (
    <div className="space-y-6">
      {/* Tab select header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/55 backdrop-blur-md p-2 rounded-2xl border border-white/40">
        <div className="flex space-x-1 w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => { setSubTab('absensi'); setSearchQuery(''); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              subTab === 'absensi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays size={15} className="text-emerald-500" />
            Absensi Karyawan
          </button>
          <button
            onClick={() => { setSubTab('absensi_pekerja'); setSearchQuery(''); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              subTab === 'absensi_pekerja' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays size={15} className="text-purple-500" />
            Absensi Pekerja
          </button>
          <button
            onClick={() => { setSubTab('karyawan'); setSearchQuery(''); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              subTab === 'karyawan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={15} className="text-indigo-500" />
            Data Karyawan
          </button>
          <button
            onClick={() => { setSubTab('pekerja'); setSearchQuery(''); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              subTab === 'pekerja' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wrench size={14} className="text-rose-500" />
            Data Pekerja
          </button>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto">
          {subTab === 'karyawan' && (
            <button
               onClick={onAddKaryawan}
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <UserPlus size={15} />
              Tambah Karyawan
            </button>
          )}
          {subTab === 'absensi' && (
            <button
               onClick={onAddAbsensi}
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-750 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <CalendarDays size={15} />
              Input Absensi Hari Ini
            </button>
          )}
          {subTab === 'absensi_pekerja' && (
            <button
               onClick={onAddAbsensiPekerja}
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-750 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer"
            >
              <CalendarDays size={15} />
              Input Absensi Pekerja
            </button>
          )}
          {subTab === 'pekerja' && (
            <button
               onClick={() => setIsAddingPekerja(!isAddingPekerja)}
               className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer ${
                 isAddingPekerja 
                   ? 'bg-slate-600 hover:bg-slate-700' 
                   : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
               }`}
            >
              <UserPlus size={15} />
              {isAddingPekerja ? 'Tutup Form' : 'Tambah Pekerja Baru'}
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="relative p-1 rounded-xl bg-white/45 backdrop-blur-md border border-white/20">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={`Cari dalam ledger operasional ${subTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm rounded-xl pl-11 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Render tables based on selection */}
      {subTab === 'karyawan' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Jabatan/Role</th>
                <th className="p-4 text-right">Gaji Bulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredKaryawan.map((kar) => (
                <tr key={kar.id} className="hover:bg-white/40 transition">
                  <td className="p-4">
                    <div className="font-display font-bold text-slate-900 text-[15px]">{kar.namaKaryawan}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Gabung: {kar.tanggalGabung}</div>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{kar.jabatan}</td>
                  <td className="p-4 text-right font-mono text-xs text-indigo-700 font-bold">
                    {formatRupiah(kar.gajiHarian)}
                  </td>
                </tr>
              ))}
              {filteredKaryawan.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    Tidak ada karyawan yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'absensi' && (
        <div className="space-y-6">
          {/* Header & Month Selector */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-1.5">
                  <FileSpreadsheet className="text-emerald-500" size={18} />
                  Rekap Kehadiran Karyawan Berdasarkan Bulan
                </h3>
                <p className="text-xs text-slate-500 font-medium">Berdasarkan bulan kerja aktivitas terdaftar</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Pilih Bulan Kerja:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatIndoMonth(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabel Rekap Presensi per Staff Karyawan */}
            <div className="overflow-x-auto rounded-xl border border-slate-150 bg-slate-50/50">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-display font-bold">
                    <th className="p-3 pl-4">Staff Karyawan</th>
                    <th className="p-3 text-center">Hadir</th>
                    <th className="p-3 text-center">Sakit</th>
                    <th className="p-3 text-center">Izin</th>
                    <th className="p-3 text-center">Alpa</th>
                    <th className="p-3 text-center">Total Input</th>
                    <th className="p-3 text-right pr-4">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 bg-white/50">
                  {employeeMonthlyRecap.map((recap) => (
                    <tr key={recap.id} className="hover:bg-indigo-50/20 transition">
                      <td className="p-3 pl-4">
                        <div className="font-display font-bold text-slate-800 text-xs sm:text-sm">{recap.namaKaryawan}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{recap.jabatan}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                          {recap.hadir}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                          {recap.sakit}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-150">
                          {recap.izin}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-150">
                          {recap.alpa}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-xs font-medium text-slate-500">
                        {recap.total} Hari
                      </td>
                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-mono text-xs font-extrabold ${
                            recap.rate >= 90 ? 'text-emerald-600' :
                            recap.rate >= 75 ? 'text-indigo-600' :
                            recap.rate > 0 ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {recap.total > 0 ? `${recap.rate}%` : '-'}
                          </span>
                          {recap.total > 0 && (
                            <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full rounded-full ${
                                  recap.rate >= 90 ? 'bg-emerald-500' :
                                  recap.rate >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${recap.rate}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employeeMonthlyRecap.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs italic">
                        Tidak ada data karyawan terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* List Table container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                  <th className="p-4">Tanggal Kerja</th>
                  <th className="p-4">Staff Karyawan</th>
                  <th className="p-4">Waktu Check-in & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAbsensi.map((abs) => {
                  const name = getEmployeeName(abs.karyawanId);
                  const role = getEmployeeRole(abs.karyawanId);
                  return (
                    <tr key={abs.id} className="hover:bg-white/40 transition">
                      <td className="p-4 font-mono font-bold text-slate-400 text-xs">{abs.tanggal}</td>
                      <td className="p-4">
                        <div className="font-display font-bold text-slate-800 text-sm">{name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{role}</div>
                      </td>
                      <td className="p-4">
                        <div className="mb-1">
                          <span className={`inline-flex text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            abs.statusKehadiran === 'Hadir' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : abs.statusKehadiran === 'Sakit'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              : abs.statusKehadiran === 'Izin'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            {abs.statusKehadiran}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-700">{abs.waktuCheckin}</div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAbsensi.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">
                      Tidak ada data absensi karyawan terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'absensi_pekerja' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                <th className="p-4">Tanggal Kerja</th>
                <th className="p-4">Nama Pekerja</th>
                <th className="p-4">Status & Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(filteredAbsensiPekerja || []).map((abs) => {
                const category = getPekerjaCategory(abs.namaTukang);
                return (
                  <tr key={abs.id} className="hover:bg-white/40 transition">
                    <td className="p-4 font-mono font-bold text-slate-400 text-xs">{abs.tanggal}</td>
                    <td className="p-4">
                      <div className="font-display font-bold text-slate-800 text-sm">{abs.namaTukang}</div>
                      {category ? (
                        <div className="mt-1">
                          <span className={`inline-flex font-extrabold uppercase px-1.5 py-0.5 text-[9px] rounded ${
                            category.toLowerCase().includes('struktur') ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            category.toLowerCase().includes('atap') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            category.toLowerCase().includes('plafon') ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {category}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-0.5 italic">Pekerja Umum / Baru</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="mb-1.5">
                        <span className={`inline-flex text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          abs.statusKehadiran === 'Hadir' 
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' 
                            : abs.statusKehadiran === 'Sakit'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : abs.statusKehadiran === 'Izin'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          {abs.statusKehadiran}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 italic">
                        {abs.keterangan || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(filteredAbsensiPekerja || []).length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    Tidak ada data absensi pekerja terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'pekerja' && (
        <>
          {isAddingPekerja && (
            <form onSubmit={handlePekerjaSubmit} className="bg-white/80 border border-slate-200/70 shadow-sm rounded-2xl p-5 mb-6 space-y-4 animate-fade-in max-w-2xl">
              <div className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span>🛠️</span> Tambah Data Pekerja Baru
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Nama Pekerja*</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Supri"
                    value={newPekerjaName}
                    onChange={(e) => setNewPekerjaName(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">No WhatsApp*</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812345678"
                    value={newPekerjaPhone}
                    onChange={(e) => setNewPekerjaPhone(e.target.value)}
                    className="w-full text-xs rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Kategori Spesialis*</label>
                  <select
                    value={newPekerjaCategory}
                    onChange={(e) => setNewPekerjaCategory(e.target.value as any)}
                    className="w-full text-xs rounded-xl px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-semibold text-slate-700"
                  >
                    <option value="struktur">Struktur</option>
                    <option value="plafon">Plafon</option>
                    <option value="atap">Atap</option>
                    <option value="listrik">Listrik</option>
                    <option value="pembersihan">Pembersihan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPekerja(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Pekerja
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/60 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-display font-medium">
                <th className="p-4">Nama Pekerja</th>
                <th className="p-4">No WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPekerja.map((p, idx) => {
                const cleanPhone = p.noHp.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                const waLink = `https://wa.me/${waPhone}`;

                return (
                  <tr key={idx} className="hover:bg-white/40 transition">
                    <td className="p-4">
                      <div className="font-display font-bold text-slate-900 text-[14px]">{p.namaTukang}</div>
                      <div className="mt-1">
                        <span className={`inline-flex font-extrabold uppercase px-2 py-0.5 text-[9px] rounded ${
                          p.kategoriPekerjaan.toLowerCase().includes('struktur') ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          p.kategoriPekerjaan.toLowerCase().includes('atap') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          p.kategoriPekerjaan.toLowerCase().includes('plafon') ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {p.kategoriPekerjaan}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {p.noHp !== '-' && p.noHp ? (
                        <a 
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all font-sans font-extrabold hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.747 1.451 5.436.002 9.851-4.382 9.855-9.764.002-2.607-1.01-5.059-2.85-6.902C16.599 2.097 14.153 1.084 11.55 1.084c-5.438 0-9.853 4.384-9.857 9.767a9.61 9.61 0 0 0 1.488 4.887l-.976 3.566 3.651-.958zM16.14 13.911c-.248-.124-1.472-.729-1.7-.811-.228-.084-.393-.124-.559.124-.166.248-.642.812-.787.977-.145.166-.29.186-.539.063-.248-.124-1.05-.386-2-1.234-.738-.657-1.238-1.472-1.383-1.72-.145-.248-.015-.381.11-.504.111-.11.248-.29.373-.435.124-.145.166-.248.248-.415.083-.166.042-.311-.02-.435-.062-.124-.559-1.349-.766-1.849-.2-.486-.403-.421-.559-.429H8.38c-.166 0-.435.062-.663.311-.228.248-.87.851-.87 2.075 0 1.224.891 2.406.99 2.551.1.145 1.751 2.674 4.243 3.748.592.256 1.055.409 1.414.523.596.19 1.138.163 1.567.099.479-.072 1.472-.601 1.679-1.151.207-.55.207-1.023.145-1.124-.062-.1-.228-.166-.476-.29z"/>
                          </svg>
                          <span>{p.noHp}</span>
                        </a>
                      ) : (
                        <span className="text-slate-450 italic text-[11px] font-sans">Belum terdaftar</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredPekerja.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-slate-400">
                    Tidak ada data pekerja yang cocok atau tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

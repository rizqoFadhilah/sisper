import React from 'react';
import { 
  Building2, 
  Users, 
  Activity, 
  Warehouse, 
  TrendingUp, 
  Home, 
  ShoppingBag, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { Project, Konstruksi, Inventory, ProgresPekerjaan, AbsensiKaryawan, AbsensiPekerja, TransaksiMaterial } from '../types';

interface DashboardViewProps {
  projects: Project[];
  konstruksiList: Konstruksi[];
  inventoryList: Inventory[];
  progresList: ProgresPekerjaan[];
  absensiList: AbsensiKaryawan[];
  absensiPekerjaList: AbsensiPekerja[];
  transaksiList: TransaksiMaterial[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  onNavigate?: (
    tab: 'dashboard' | 'konstruksi' | 'logistik' | 'marketing' | 'operasional', 
    options?: { subTab?: string; search?: string; statusFilter?: string }
  ) => void;
}

interface DonutChartProps {
  value: number;
  title: string;
  subtitle: string;
  colorClass: string;
  strokeColor: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function DonutChartWidget({ value, title, subtitle, strokeColor, icon, onClick }: DonutChartProps) {
  const radius = 36;
  const strokeWidth = 7;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div 
      onClick={onClick} 
      className={`glass-card p-3 xs:p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[180px] xs:min-h-[220px] hover:scale-[1.01] transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md active:scale-95' : ''
      }`}
    >
      <div className="w-full flex justify-between items-center mb-1">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase line-clamp-1">
          {icon}
          {title}
        </span>
      </div>
      
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center my-3">
        <svg height={90} width={90} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={45}
            cy={45}
          />
          {/* Progress circle */}
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            r={normalizedRadius}
            cx={45}
            cy={45}
          />
        </svg>
        {/* Absolute center label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-lg font-black font-display text-slate-800 leading-none">{value}%</span>
        </div>
      </div>

      <div className="w-full text-center mt-1">
        <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase line-clamp-1">{subtitle}</p>
      </div>
    </div>
  );
}

export default function DashboardView({
  projects,
  konstruksiList,
  inventoryList,
  progresList,
  absensiList,
  absensiPekerjaList,
  transaksiList,
  selectedProjectId,
  setSelectedProjectId,
  onNavigate,
}: DashboardViewProps) {

  // 1. Filtered data
  const filteredKonstruksi = konstruksiList.filter(
    (k) => selectedProjectId === 'all' || k.projectId === selectedProjectId
  );

  const totalUnits = filteredKonstruksi.length;

  // Calculate percentages based on today's attendance or latest available date
  
  // A. Employee Attendance Date, Count & Percentage
  const karyawanDateInfo = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = absensiList.some(a => a.tanggal === todayStr);
    if (hasToday) {
      return { date: todayStr, label: 'Hari Ini' };
    }
    // Fallback to latest date in table
    if (absensiList.length > 0) {
      const dates = absensiList.map(a => a.tanggal).sort();
      const latest = dates[dates.length - 1];
      return { date: latest, label: `${latest}` };
    }
    return { date: todayStr, label: 'Hari Ini' };
  }, [absensiList]);

  const employeeAttendancePct = React.useMemo(() => {
    const targetAbs = absensiList.filter(a => a.tanggal === karyawanDateInfo.date);
    if (targetAbs.length === 0) return 0;
    const total = targetAbs.length;
    const hadir = targetAbs.filter(a => a.statusKehadiran === 'Hadir').length;
    return Math.round((hadir / total) * 100);
  }, [absensiList, karyawanDateInfo]);

  const employeeAttendanceCount = React.useMemo(() => {
    const targetAbs = absensiList.filter(a => a.tanggal === karyawanDateInfo.date);
    const hadir = targetAbs.filter(a => a.statusKehadiran === 'Hadir').length;
    return { hadir, total: targetAbs.length };
  }, [absensiList, karyawanDateInfo]);

  // B. Worker ("Tukang") Attendance Date, Count & Percentage
  const pekerjaDateInfo = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = absensiPekerjaList.some(a => a.tanggal === todayStr);
    if (hasToday) {
      return { date: todayStr, label: 'Hari Ini' };
    }
    // Fallback to latest date in table
    if (absensiPekerjaList.length > 0) {
      const dates = absensiPekerjaList.map(a => a.tanggal).sort();
      const latest = dates[dates.length - 1];
      return { date: latest, label: `${latest}` };
    }
    return { date: todayStr, label: 'Hari Ini' };
  }, [absensiPekerjaList]);

  const workerAttendancePct = React.useMemo(() => {
    const targetAbs = absensiPekerjaList.filter(a => a.tanggal === pekerjaDateInfo.date);
    if (targetAbs.length === 0) return 0;
    const total = targetAbs.length;
    const hadir = targetAbs.filter(a => a.statusKehadiran === 'Hadir').length;
    return Math.round((hadir / total) * 100);
  }, [absensiPekerjaList, pekerjaDateInfo]);

  const workerAttendanceCount = React.useMemo(() => {
    const targetAbs = absensiPekerjaList.filter(a => a.tanggal === pekerjaDateInfo.date);
    const hadir = targetAbs.filter(a => a.statusKehadiran === 'Hadir').length;
    return { hadir, total: targetAbs.length };
  }, [absensiPekerjaList, pekerjaDateInfo]);

  // C. Total Terbangun percentage
  const totalTerbangunPct = React.useMemo(() => {
    if (totalUnits === 0) return 0;
    const terbangun = filteredKonstruksi.filter(k => k.statusPembangunan === 'terbangun').length;
    return Math.round((terbangun / totalUnits) * 100);
  }, [filteredKonstruksi, totalUnits]);

  // D. Total Terjual percentage
  const totalTerjualPct = React.useMemo(() => {
    if (totalUnits === 0) return 0;
    const terjual = filteredKonstruksi.filter(k => k.statusPenjualan === 'terjual').length;
    return Math.round((terjual / totalUnits) * 100);
  }, [filteredKonstruksi, totalUnits]);

  // E. Total onProgress percentage
  const totalOnProgresPct = React.useMemo(() => {
    if (totalUnits === 0) return 0;
    const onProgres = filteredKonstruksi.filter(k => k.statusPembangunan === 'onProgres').length;
    return Math.round((onProgres / totalUnits) * 100);
  }, [filteredKonstruksi, totalUnits]);

  // F. Terbangun tapi belum terbooking percentage
  const terbangunBelumTerbookingPct = React.useMemo(() => {
    if (totalUnits === 0) return 0;
    const match = filteredKonstruksi.filter(
      k => k.statusPembangunan === 'terbangun' && k.statusPenjualan === 'tersedia'
    ).length;
    return Math.round((match / totalUnits) * 100);
  }, [filteredKonstruksi, totalUnits]);

  // G. Terbooking tapi belum terbangun percentage
  const terbookingBelumTerbangunPct = React.useMemo(() => {
    if (totalUnits === 0) return 0;
    const match = filteredKonstruksi.filter(
      k => k.statusPenjualan === 'terbooking' && k.statusPembangunan === 'onProgres'
    ).length;
    return Math.round((match / totalUnits) * 100);
  }, [filteredKonstruksi, totalUnits]);

  // H. Stock Value Gudang
  const totalStockValue = React.useMemo(() => {
    return inventoryList.reduce((acc, curr) => acc + (curr.jumlahStok * curr.harga), 0);
  }, [inventoryList]);

  // I. Work project item progress bars (Rata-rata progres bar tiap rumah)
  const homeProgressList = React.useMemo(() => {
    return filteredKonstruksi.map((home) => {
      // Find all progress items matching this block house
      const blockProgs = progresList.filter((p) => p.blokRumah === home.id);
      let avgProgress = 0;
      if (blockProgs.length > 0) {
        const sum = blockProgs.reduce((acc, curr) => acc + curr.persentasiProgres, 0);
        avgProgress = Math.round(sum / blockProgs.length);
      } else {
        avgProgress = home.statusPembangunan === 'terbangun' ? 100 : 0;
      }

      // Calculate total builder costs (material + labor) exactly as done in construction view
      const blockTransactions = transaksiList.filter(
        (t) => t.blokRumah === home.id && t.type === 'keluar'
      );
      const totalMaterialCost = blockTransactions.reduce((sum, t) => {
        const match = inventoryList.find((inv) => inv.namaMaterial === t.namaMaterial);
        const price = match ? match.harga : 0;
        return sum + (t.jumlah * price);
      }, 0);

      const totalLaborCost = blockProgs.reduce((sum, p) => sum + p.totalNilaiPekerjaan, 0);
      const totalBiayaBangun = totalMaterialCost + totalLaborCost;

      return {
        id: home.id,
        type: home.type,
        avgProgress,
        projectName: home.projectName,
        statusPembangunan: home.statusPembangunan,
        statusPenjualan: home.statusPenjualan,
        totalBiayaBangun,
      };
    });
  }, [filteredKonstruksi, progresList, transaksiList, inventoryList]);

  // Format currency helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Welcoming Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/40">
       
        
        {/* Project Selector - Glassmorphic */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Filter Projek:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-sm font-semibold text-indigo-600 bg-white/70 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">Semua Projek Perumahan</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid statistics - Bento layouts with Badges and Donut Charts */}
      <div className="space-y-8">
        
        {/* SECTION A: DISTRIBUSI KAPLING & STATISTIK UNIT (Badge Style cards) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Distribusi Kapling & Progres Lapangan</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            
            {/* 1. Total Kapling Unit Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi')}
              className="glass-card p-3 xs:p-4 sm:p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-[1.01] hover:border-cyan-400 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 shadow-sm">
                  <Home size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-cyan-600 text-white rounded-full shadow-sm">
                  Total Kapling
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Terdaftar</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-slate-800">{totalUnits}</span>
                  <span className="text-xs font-semibold text-cyan-600">Terdaftar</span>
                </div>
              </div>
            </div>

            {/* 2. On Progres Pembangunan Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'onProgres' })}
              className="glass-card p-3 xs:p-4 sm:p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-[1.01] hover:border-violet-400 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 shadow-sm">
                  <Activity size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-violet-600 text-white rounded-full shadow-sm">
                  In Progress
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konstruksi Berjalan</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-slate-800">
                    {filteredKonstruksi.filter(k => k.statusPembangunan === 'onProgres').length}
                  </span>
                  <span className="text-sm font-semibold text-violet-600">Unit</span>
                </div>
              </div>
            </div>

            {/* 3. Terbangun Belum Booking Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'readyStock' })}
              className="glass-card p-3 xs:p-4 sm:p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-[1.01] hover:border-orange-400 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 shadow-sm">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-500 text-white rounded-full shadow-sm">
                  Ready Stock
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terbangun Belum Booking</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-slate-800">
                    {filteredKonstruksi.filter(k => k.statusPembangunan === 'terbangun' && k.statusPenjualan === 'tersedia').length}
                  </span>
                  <span className="text-sm font-semibold text-orange-600">Unit</span>
                </div>
              </div>
            </div>

            {/* 4. Terbooking Belum Terbangun Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'backlog' })}
              className="glass-card p-3 xs:p-4 sm:p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-[1.01] hover:border-fuchsia-400 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 shadow-sm">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-fuchsia-500 text-white rounded-full shadow-sm">
                  Backlog Unit
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terbooking Belum Bangun</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-slate-800">
                    {filteredKonstruksi.filter(k => k.statusPenjualan === 'terbooking' && k.statusPembangunan === 'onProgres').length}
                  </span>
                  <span className="text-sm font-semibold text-fuchsia-600">Unit</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION B: PERSENTASE KINERJA & ABSENSI (Elegant SVG Donut Charts) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Analisis Kinerja & Kehadiran (Donut Charts)</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">

          {/* Donut Chart 3: Kehadiran Karyawan */}
            <DonutChartWidget 
              value={employeeAttendancePct}
              title="Kehadiran Karyawan"
              subtitle={`${employeeAttendanceCount.hadir}/${employeeAttendanceCount.total} Hadir (${karyawanDateInfo.label})`}
              colorClass="text-indigo-500"
              strokeColor="#6366f1"
              icon={<Users size={14} className="text-indigo-500" />}
              onClick={() => onNavigate?.('operasional')}
            />

            {/* Donut Chart 4: Kehadiran Pekerja */}
            <DonutChartWidget 
              value={workerAttendancePct}
              title="Kehadiran Pekerja"
              subtitle={`${workerAttendanceCount.hadir}/${workerAttendanceCount.total} Hadir (${pekerjaDateInfo.label})`}
              colorClass="text-amber-500"
              strokeColor="#f59e0b"
              icon={<Activity size={14} className="text-amber-500" />}
              onClick={() => onNavigate?.('operasional', { subTab: 'absensi_pekerja' })}
            />

            {/* Donut Chart 1: Total Terbangun */}
            <DonutChartWidget 
              value={totalTerbangunPct}
              title="Total Terbangun"
              subtitle={`${filteredKonstruksi.filter(k => k.statusPembangunan === 'terbangun').length} dari ${totalUnits} unit selesai`}
              colorClass="text-emerald-500"
              strokeColor="#10b981"
              icon={<Layers size={14} className="text-emerald-500" />}
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'terbangun' })}
            />

            {/* Donut Chart 2: Total Terjual */}
            <DonutChartWidget 
              value={totalTerjualPct}
              title="Total Terjual"
              subtitle={`${filteredKonstruksi.filter(k => k.statusPenjualan === 'terjual').length} unit lunas/akad`}
              colorClass="text-rose-500"
              strokeColor="#f43f5e"
              icon={<ShoppingBag size={14} className="text-rose-500" />}
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'terjual' })}
            />

            

          </div>
        </div>
      </div>

        

        

       

        

        

        

        

      {/* 10. Progres bar pembangunan rumah (Individual Block Progress List) */}
      <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-md border border-white/40 space-y-4">
        <div>
          <h3 className="text-md font-display font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-indigo-500" size={18} />
            Progres Konstruksi Detail Blok Rumah
          </h3>
          <p className="text-xs text-slate-500">Status rata-rata penyelesaian blok rumah berdasarkan progres pekerjaan detail</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeProgressList.map((home) => (
            <div 
              key={home.id} 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'progres', search: home.id })}
              className="p-4 rounded-xl border border-slate-100 bg-white/70 hover:border-indigo-200 cursor-pointer hover:shadow-md transition active:scale-98 group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-display font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition">Blok {home.id}</h5>
                  <p className="text-[11px] text-slate-400">{home.projectName}</p>
                </div>
                {/* Badges */}
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    home.statusPembangunan === 'terbangun' 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {home.statusPembangunan}
                  </span>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                    home.statusPenjualan === 'tersedia' 
                      ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-400/20'
                      : home.statusPenjualan === 'terbooking'
                      ? 'bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-400/20'
                      : 'bg-purple-500/10 text-purple-600 border border-purple-400/20'
                  }`}>
                    {home.statusPenjualan}
                  </span>
                </div>
              </div>

              {/* Progress & Cost representation */}
              <div className="mt-3.5 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100/60 pt-2">
                  <span>Biaya Bangun</span>
                  <span className="font-semibold text-indigo-600 font-mono text-xs">{formatRupiah(home.totalBiayaBangun)}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Penyelesaian Fisik</span>
                    <span className="text-indigo-600">{home.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        home.avgProgress === 100 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                          : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                      }`}
                      style={{ width: `${home.avgProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {homeProgressList.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm">
              Tidak ada data progres blok untuk projek ini. Silakan tambahkan blok perumahan baru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

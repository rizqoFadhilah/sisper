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
      className={`bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.85)] p-3 xs:p-5 rounded-2xl flex flex-col items-center justify-between text-center min-h-[180px] xs:min-h-[220px] transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-[3px_3px_6px_rgba(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6)]' : ''
      }`}
    >
      <div className="w-full flex justify-between items-center mb-1">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase line-clamp-1">
          {icon}
          {title}
        </span>
      </div>
      
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center my-3 p-2 rounded-full shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.85)]">
        <svg height={90} width={90} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#d1d9e6"
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
          <span className="text-lg font-black font-display text-[#2d3748] leading-none">{value}%</span>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.55),-9px_-9px_16px_rgba(255,255,255,0.85)]">
       
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#e0e5ec] text-indigo-600 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.85)]">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2d3748] tracking-tight">Overview Real-Time</h3>
            <p className="text-[10px] text-slate-500">Pilih projek perumahan untuk memfilter seluruh data operasional</p>
          </div>
        </div>
        
        {/* Project Selector - Neumorphic Inset */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Filter Projek:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-sm font-semibold text-indigo-600 bg-[#e0e5ec] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.55),inset_-3px_-3px_6px_rgba(255,255,255,0.85)] border-none rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
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
        
        {/* SECTION A: DISTRIBUSI KAPLING & STATISTIK UNIT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Distribusi Kapling & Progres Lapangan</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Total Kapling Unit Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi')}
              className="bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.85)] p-4 sm:p-5 rounded-3xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.55),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.65)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-3 rounded-2xl bg-[#e0e5ec] text-cyan-600 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                  <Home size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#e0e5ec] text-cyan-600 shadow-[2px_2px_4px_rgba(163,177,198,0.35),-2px_-2px_4px_rgba(255,255,255,0.85)] rounded-full leading-none">
                  Total Kapling
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Terdaftar</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-[#2d3748]">{totalUnits}</span>
                  <span className="text-xs font-semibold text-cyan-600">Unit</span>
                </div>
              </div>
            </div>

            {/* 2. On Progres Pembangunan Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'onProgres' })}
              className="bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.85)] p-4 sm:p-5 rounded-3xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.55),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.65)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-3 rounded-2xl bg-[#e0e5ec] text-violet-600 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                  <Activity size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#e0e5ec] text-violet-600 shadow-[2px_2px_4px_rgba(163,177,198,0.35),-2px_-2px_4px_rgba(255,255,255,0.85)] rounded-full leading-none">
                  In Progress
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konstruksi Berjalan</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-[#2d3748]">
                    {filteredKonstruksi.filter(k => k.statusPembangunan === 'onProgres').length}
                  </span>
                  <span className="text-sm font-semibold text-violet-600">Unit</span>
                </div>
              </div>
            </div>

            {/* 3. Terbangun Belum Booking Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'readyStock' })}
              className="bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.85)] p-4 sm:p-5 rounded-3xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.55),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.65)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-3 rounded-2xl bg-[#e0e5ec] text-orange-600 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#e0e5ec] text-orange-600 shadow-[2px_2px_4px_rgba(163,177,198,0.35),-2px_-2px_4px_rgba(255,255,255,0.85)] rounded-full leading-none">
                  Ready Stock
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terbangun Belum Booking</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-[#2d3748]">
                    {filteredKonstruksi.filter(k => k.statusPembangunan === 'terbangun' && k.statusPenjualan === 'tersedia').length}
                  </span>
                  <span className="text-sm font-semibold text-orange-600">Unit</span>
                </div>
              </div>
            </div>

            {/* 4. Terbooking Belum Terbangun Badge Card */}
            <div 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'blok', statusFilter: 'backlog' })}
              className="bg-[#e0e5ec] shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.85)] p-4 sm:p-5 rounded-3xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[3px_3px_6px_rgba(163,177,198,0.55),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.65)]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-3 rounded-2xl bg-[#e0e5ec] text-fuchsia-600 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-[#e0e5ec] text-fuchsia-600 shadow-[2px_2px_4px_rgba(163,177,198,0.35),-2px_-2px_4px_rgba(255,255,255,0.85)] rounded-full leading-none">
                  Backlog Unit
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terbooking Belum Bangun</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-display text-[#2d3748]">
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
      <div className="p-6 rounded-3xl bg-[#e0e5ec] shadow-[9px_9px_16px_rgba(163,177,198,0.55),-9px_-9px_16px_rgba(255, 255, 255, 0.85)] space-y-4">
        <div>
          <h3 className="text-md font-display font-bold text-[#2d3748] flex items-center gap-2">
            <Building2 className="text-indigo-500" size={18} />
            Progres Konstruksi Detail Blok Rumah
          </h3>
          <p className="text-xs text-slate-500">Status rata-rata penyelesaian blok rumah berdasarkan progres pekerjaan detail</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeProgressList.map((home) => (
            <div 
              key={home.id} 
              onClick={() => onNavigate?.('konstruksi', { subTab: 'progres', search: home.id })}
              className="p-5 rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.85)] hover:shadow-[3px_3px_6px_rgba(163,177,198,0.55),-3px_-3px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6)] cursor-pointer transition-all duration-150 group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-display font-bold text-[#2d3748] text-sm group-hover:text-indigo-600 transition">Blok {home.id}</h5>
                  <p className="text-[11px] text-slate-400">{home.projectName}</p>
                </div>
                {/* Badges */}
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                    home.statusPembangunan === 'terbangun' 
                      ? 'bg-[#e0e5ec] text-emerald-600 shadow-[2px_2px_4px_rgba(16,185,129,0.2),-2px_-2px_4px_rgba(255,255,255,0.9)] border border-emerald-500/10' 
                      : 'bg-[#e0e5ec] text-amber-600 shadow-[2px_2px_4px_rgba(245,158,11,0.2),-2px_-2px_4px_rgba(255,255,255,0.9)] border border-amber-500/10'
                  }`}>
                    {home.statusPembangunan}
                  </span>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                    home.statusPenjualan === 'tersedia' 
                      ? 'bg-[#e0e5ec] text-cyan-600 shadow-[1px_1px_2px_rgba(6,182,212,0.15),-1px_-1px_2px_rgba(255,255,255,0.9)]'
                      : home.statusPenjualan === 'terbooking'
                      ? 'bg-[#e0e5ec] text-fuchsia-600 shadow-[1px_1px_2px_rgba(217,70,239,0.15),-1px_-1px_2px_rgba(255,255,255,0.9)]'
                      : 'bg-[#e0e5ec] text-purple-600 shadow-[1px_1px_2px_rgba(168,85,247,0.15),-1px_-1px_2px_rgba(255,255,255,0.9)]'
                  }`}>
                    {home.statusPenjualan}
                  </span>
                </div>
              </div>

              {/* Progress & Cost representation */}
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-300/30 pt-2.5">
                  <span>Biaya Bangun</span>
                  <span className="font-semibold text-indigo-600 font-mono text-xs">{formatRupiah(home.totalBiayaBangun)}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Penyelesaian Fisik</span>
                    <span className="text-indigo-600">{home.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-[#e0e5ec] h-3.5 rounded-full p-0.5 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.85)]">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ${
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

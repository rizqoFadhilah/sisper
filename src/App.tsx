import React from 'react';
import { 
  BarChart3, 
  Building, 
  Warehouse, 
  CircleDollarSign, 
  Settings2, 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  Briefcase, 
  BadgeHelp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Wallet,
  Users
} from 'lucide-react';

// Import types
import {
  Project,
  Konstruksi,
  Inventory,
  Gudang,
  Supplier,
  TransaksiMaterial,
  ProgresPekerjaan,
  RincianPembayaran,
  Karyawan,
  AbsensiKaryawan,
  AbsensiPekerja,
  LeadPenjualan,
  FeeMarketing
} from './types';

// Import subcomponents
import DashboardView from './components/DashboardView';
import ConstructionView from './components/ConstructionView';
import LogistikView from './components/LogistikView';
import OperasionalView from './components/OperasionalView';
import MarketingView from './components/MarketingView';
import AddRecordModal from './components/AddRecordModal';

// Import Supabase
import { supabase } from './supabaseClient';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'konstruksi' | 'logistik' | 'marketing' | 'operasional'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('all');
  
  // Rtc Time Tick
  const [currentTime, setCurrentTime] = React.useState('');

  // Core database states (Synchronized with Supabase)
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [gudangList, setGudangList] = React.useState<Gudang[]>([]);
  const [supplierList, setSupplierList] = React.useState<Supplier[]>([]);
  const [inventoryList, setInventoryList] = React.useState<Inventory[]>([]);
  const [konstruksiList, setKonstruksiList] = React.useState<Konstruksi[]>([]);
  const [transaksiList, setTransaksiList] = React.useState<TransaksiMaterial[]>([]);
  const [progresList, setProgresList] = React.useState<ProgresPekerjaan[]>([]);
  const [pembayaranList, setPembayaranList] = React.useState<RincianPembayaran[]>([]);
  const [karyawanList, setKaryawanList] = React.useState<Karyawan[]>([]);
  const [absensiList, setAbsensiList] = React.useState<AbsensiKaryawan[]>([]);
  const [absensiPekerjaList, setAbsensiPekerjaList] = React.useState<AbsensiPekerja[]>([]);
  const [leadList, setLeadList] = React.useState<LeadPenjualan[]>([]);
  const [feeList, setFeeList] = React.useState<FeeMarketing[]>([]);

  // Connection Indicator States
  const [dbStatus, setDbStatus] = React.useState<'local' | 'connecting' | 'connected' | 'error'>('connecting');
  const [dbStatusMessage, setDbStatusMessage] = React.useState<string>('Menghubungkan ke Supabase...');

  // Fetch from Supabase on Mount
  React.useEffect(() => {
    async function loadSupabaseData() {
      try {
        setDbStatus('connecting');
        
        // 1. Perform ping to check if tables exist and are connected
        const { error: pingError } = await supabase.from('projects').select('id').limit(1);
        if (pingError) {
          throw new Error(`Koneksi gagal atau tabel belum ada: ${pingError.message}`);
        }

        // 2. Fetch all collections in parallel
        const [
          resProjects,
          resGudang,
          resSuppliers,
          resInventory,
          resKonstruksi,
          resTransaksi,
          resProgres,
          resPembayaran,
          resKaryawan,
          resAbsensi,
          resAbsensiPekerja,
          resLeads,
          resFee
        ] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('gudang').select('*'),
          supabase.from('suppliers').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('konstruksi').select('*'),
          supabase.from('transaksi_material').select('*'),
          supabase.from('progres_pekerjaan').select('*'),
          supabase.from('rincian_pembayaran').select('*'),
          supabase.from('karyawan').select('*'),
          supabase.from('absensi_karyawan').select('*'),
          supabase.from('absensi_pekerja').select('*'),
          supabase.from('leads_penjualan').select('*'),
          supabase.from('fee_marketing').select('*')
        ]);

        // Error detection
        if (resProjects.error) throw resProjects.error;
        if (resGudang.error) throw resGudang.error;
        if (resSuppliers.error) throw resSuppliers.error;
        if (resInventory.error) throw resInventory.error;
        if (resKonstruksi.error) throw resKonstruksi.error;
        if (resTransaksi.error) throw resTransaksi.error;
        if (resProgres.error) throw resProgres.error;
        if (resPembayaran.error) throw resPembayaran.error;
        if (resKaryawan.error) throw resKaryawan.error;
        if (resAbsensi.error) throw resAbsensi.error;
        if (resAbsensiPekerja.error) throw resAbsensiPekerja.error;
        if (resLeads.error) throw resLeads.error;
        if (resFee.error) throw resFee.error;

        // 3. Populate state if records found, else alert that db is empty but connected
        if (resProjects.data.length === 0) {
          setDbStatus('connected');
          setDbStatusMessage('Connected to Supabase (Database Kosong, Jalankan SQL Seed!)');
          return;
        }

        setProjects(resProjects.data);
        setGudangList(resGudang.data);
        setSupplierList(resSuppliers.data);
        setInventoryList(resInventory.data);
        setKonstruksiList(resKonstruksi.data);
        setTransaksiList(resTransaksi.data);
        setProgresList(resProgres.data);
        setPembayaranList(resPembayaran.data);
        setKaryawanList(resKaryawan.data);
        setAbsensiList(resAbsensi.data);
        setAbsensiPekerjaList(resAbsensiPekerja.data);
        setLeadList(resLeads.data);
        setFeeList(resFee.data);

        setDbStatus('connected');
        setDbStatusMessage('Terhubung dengan Database Supabase!');
      } catch (err: any) {
        console.warn('Gagal memuat data Supabase, mengaktifkan modus offline:', err);
        setDbStatus('local');
        setDbStatusMessage(`Modus Offline: ${err.message || 'Gagal koneksi'}`);
      }
    }

    loadSupabaseData();
  }, []);

  const handleUpdateLeadStatus = React.useCallback((id: string, newStatus: LeadPenjualan['leadStatus']) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setLeadList((prev) =>
      prev.map((l) => (l.id === id ? { ...l, leadStatus: newStatus, tanggalInput: todayStr } : l))
    );
    // Background sync to Supabase
    supabase.from('leads_penjualan')
      .update({ leadStatus: newStatus, tanggalInput: todayStr })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase update failed:', error.message);
      });
  }, []);

  const handleUpdateFeeStatus = React.useCallback((id: string, newStatus: FeeMarketing['statusPembayaran']) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tglBayar = newStatus === 'Lunas' ? todayStr : '-';
    setFeeList((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            statusPembayaran: newStatus,
            tanggalPembayaran: tglBayar,
          };
        }
        return f;
      })
    );
    // Background sync to Supabase
    supabase.from('fee_marketing')
      .update({ statusPembayaran: newStatus, tanggalPembayaran: tglBayar })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase update failed:', error.message);
      });
  }, []);

  const handleUpdateProgres = React.useCallback((id: string, newProgress: number) => {
    let updatedProgres: any = null;
    setProgresList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const persentasiProgres = Math.min(100, Math.max(0, newProgress));
          const totalNilaiPekerjaan = Math.round(p.nilaiPekerjaan * (persentasiProgres / 100));
          const result = {
            ...p,
            persentasiProgres,
            totalNilaiPekerjaan,
          };
          updatedProgres = result;
          return result;
        }
        return p;
      })
    );
    // Background sync to Supabase
    if (updatedProgres) {
      supabase.from('progres_pekerjaan')
        .update({ persentasiProgres: updatedProgres.persentasiProgres, totalNilaiPekerjaan: updatedProgres.totalNilaiPekerjaan })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase update failed:', error.message);
        });
    }
  }, []);

  const handleUpdateKonstruksiStatus = React.useCallback((id: string, newStatus: Konstruksi['statusPembangunan']) => {
    setKonstruksiList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, statusPembangunan: newStatus } : k))
    );
    // Background sync to Supabase
    supabase.from('konstruksi')
      .update({ statusPembangunan: newStatus })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase update failed:', error.message);
      });
  }, []);

  const handleUpdateKonstruksiSaleStatus = React.useCallback((id: string, newStatus: Konstruksi['statusPenjualan']) => {
    setKonstruksiList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, statusPenjualan: newStatus } : k))
    );
    // Background sync to Supabase
    supabase.from('konstruksi')
      .update({ statusPenjualan: newStatus })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase update failed:', error.message);
      });
  }, []);


  // Modal formulation state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<'konstruksi' | 'progres' | 'inventory' | 'gudang' | 'supplier' | 'transaksi' | 'pembayaran' | 'fee' | 'karyawan' | 'absensi' | 'lead' | ''>('');

  // Tick clock effect
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show customized system alert message
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Saved Entry Handlers (Aggregating form results back to states)
  const handleSaveModal = (data: any) => {
    const today = new Date().toISOString().split('T')[0];
    const generatedId = Math.random().toString(36).substr(2, 9).toUpperCase();

    switch (modalType) {
      case 'konstruksi': {
        const selectedProj = projects.find(p => p.id === data.projectId);
        const newKonstruksi: Konstruksi = {
          ...data,
          projectName: selectedProj ? selectedProj.name : 'Unknown Project',
        };
        setKonstruksiList(prev => [newKonstruksi, ...prev]);
        showToast(`Sukses menambahkan Kapling Blok ${newKonstruksi.id}!`);
        
        // Supabase Insert Table
        supabase.from('konstruksi').insert([newKonstruksi]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'progres': {
        const itemValCalculated = data.nilaiPekerjaan * (data.persentasiProgres / 100);
        const newProgres: ProgresPekerjaan = {
          id: `prog-${generatedId}`,
          blokRumah: data.blokRumah,
          namaTukang: data.namaTukang,
          noHp: data.noHp || '0812...',
          kategoriPekerjaan: data.kategoriPekerjaan,
          itemPekerjaan: data.itemPekerjaan,
          persentasiProgres: data.persentasiProgres,
          nilaiPekerjaan: data.nilaiPekerjaan,
          totalNilaiPekerjaan: Math.round(itemValCalculated),
          catatan: data.catatan || 'Di-input via System.',
        };
        setProgresList(prev => [newProgres, ...prev]);
        showToast(`Sukses mencatat progres kerja ${newProgres.namaTukang} di Blok ${newProgres.blokRumah}.`);

        // Supabase Insert Table
        supabase.from('progres_pekerjaan').insert([newProgres]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'inventory': {
        const newInventory: Inventory = {
          id: `mat-${generatedId}`,
          namaMaterial: data.namaMaterial,
          idGudang: data.idGudang,
          jumlahStok: data.jumlahStok,
          satuan: data.satuan,
          minimumStock: data.minimumStock,
          harga: data.harga,
          kategoriMaterial: data.kategoriMaterial,
        };
        setInventoryList(prev => [newInventory, ...prev]);
        showToast(`Sukses menambahkan material baru: ${newInventory.namaMaterial}.`);

        // Supabase Insert Table
        supabase.from('inventory').insert([newInventory]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'gudang': {
        const newGudang: Gudang = {
          id: `gud-${generatedId}`,
          namaGudang: data.namaGudang,
          lokasi: data.lokasi,
        };
        setGudangList(prev => [...prev, newGudang]);
        showToast(`Sukses meresmikan ${newGudang.namaGudang}!`);

        // Supabase Insert Table
        supabase.from('gudang').insert([newGudang]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'supplier': {
        const newSupplier: Supplier = {
          id: `sup-${generatedId}`,
          namaSupplier: data.namaSupplier,
          noHp: data.noHp,
          alamat: data.alamat,
        };
        setSupplierList(prev => [...prev, newSupplier]);
        showToast(`Sukses mendaftarkan Supplier ${newSupplier.namaSupplier}.`);

        // Supabase Insert Table
        supabase.from('suppliers').insert([newSupplier]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'transaksi': {
        const newTx: TransaksiMaterial = {
          id: `tx-${generatedId}`,
          namaMaterial: data.namaMaterial,
          namaGudang: data.namaGudang,
          blokRumah: data.type === 'masuk' ? '-' : data.blokRumah,
          type: data.type,
          jumlah: data.jumlah,
          tanggal: data.tanggal,
          catatan: data.catatan,
        };
        setTransaksiList(prev => [newTx, ...prev]);

        // INTELLIGENT WORKFLOW SIDE EFFECT: Update inventory quantities automatically!
        let updatedQty = 0;
        let matchedMaterialId = '';
        setInventoryList(prevInv => {
          return prevInv.map(inv => {
            if (inv.namaMaterial.toLowerCase() === data.namaMaterial.toLowerCase()) {
              const diff = data.type === 'masuk' ? data.jumlah : -data.jumlah;
              const resultQty = Math.max(0, inv.jumlahStok + diff);
              updatedQty = resultQty;
              matchedMaterialId = inv.id;
              return {
                ...inv,
                jumlahStok: resultQty
              };
            }
            return inv;
          });
        });

        showToast(`Sukses mendaftarkan transaksi mutasi ${data.namaMaterial}: ${data.jumlah} ${data.type}!`);

        // Supabase Insert Table and update matching stock quantity
        supabase.from('transaksi_material').insert([newTx]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });

        if (matchedMaterialId) {
          supabase.from('inventory')
            .update({ jumlahStok: updatedQty })
            .eq('id', matchedMaterialId)
            .then(({ error }) => {
              if (error) console.warn('Supabase inventory sync failed:', error.message);
            });
        }
        break;
      }
      case 'pembayaran': {
        const newPayment: RincianPembayaran = {
          id: `pay-${generatedId}`,
          namaTukang: data.namaTukang,
          kategoriPekerjaan: data.kategoriPekerjaan,
          nilaiPembayaran: data.nilaiPembayaran,
          tanggalPembayaran: data.tanggalPembayaran,
          namaProjek: data.namaProjek,
          namaBlok: data.namaBlok,
        };
        setPembayaranList(prev => [newPayment, ...prev]);
        showToast(`Sukses merilis dana pembayaran Rp${data.nilaiPembayaran.toLocaleString()} ke ${data.namaTukang}.`);

        // Supabase Insert Table
        supabase.from('rincian_pembayaran').insert([newPayment]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'fee': {
        const newFee: FeeMarketing = {
          id: `fee-${generatedId}`,
          namaMarketing: data.namaMarketing,
          komisi: data.komisi,
          statusPembayaran: data.statusPembayaran,
          tanggalPembayaran: data.statusPembayaran === 'Lunas' ? today : '-',
          namaProjek: data.namaProjek,
          namaBlok: data.namaBlok,
        };
        setFeeList(prev => [newFee, ...prev]);
        showToast(`Komisi untuk marketing ${newFee.namaMarketing} dicatat.`);

        // Supabase Insert Table
        supabase.from('fee_marketing').insert([newFee]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'karyawan': {
        const newKar: Karyawan = {
          id: `kar-${generatedId}`,
          namaKaryawan: data.namaKaryawan,
          jabatan: data.jabatan,
          gajiHarian: data.gajiHarian,
          tanggalGabung: data.tanggalGabung,
        };
        setKaryawanList(prev => [...prev, newKar]);
        showToast(`Karyawan baru ${newKar.namaKaryawan} berhasil didaftarkan.`);

        // Supabase Insert Table
        supabase.from('karyawan').insert([newKar]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'absensi': {
        // Add optional/derived properties directly
        const matchedKaryawan = karyawanList.find(k => k.id === data.karyawanId);
        const newAbsWithProps: AbsensiKaryawan = {
          id: `abs-${generatedId}`,
          tanggal: data.tanggal,
          waktuCheckin: data.statusKehadiran === 'Hadir' ? data.waktuCheckin : '-',
          karyawanId: data.karyawanId,
          namaKaryawan: matchedKaryawan ? matchedKaryawan.namaKaryawan : 'Karyawan',
          statusKehadiran: data.statusKehadiran,
        };
        setAbsensiList(prev => [newAbsWithProps, ...prev]);
        showToast(`Absensi dicatat untuk karyawan.`);

        // Supabase Insert Table
        supabase.from('absensi_karyawan').insert([{
          id: newAbsWithProps.id,
          tanggal: newAbsWithProps.tanggal,
          waktuCheckin: newAbsWithProps.waktuCheckin,
          karyawanId: newAbsWithProps.karyawanId,
          statusKehadiran: newAbsWithProps.statusKehadiran
        }]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'absensi_pekerja': {
        const newAbsP: AbsensiPekerja = {
          id: `absp-${generatedId}`,
          tanggal: data.tanggal,
          namaTukang: data.namaTukang,
          statusKehadiran: data.statusKehadiran,
          keterangan: data.keterangan || '-',
        };
        setAbsensiPekerjaList(prev => [newAbsP, ...prev]);
        showToast(`Absensi dicatat untuk pekerja ${data.namaTukang}.`);

        // Supabase Insert Table
        supabase.from('absensi_pekerja').insert([newAbsP]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      case 'lead': {
        const newLead: LeadPenjualan = {
          id: `led-${generatedId}`,
          namaCustomer: data.namaCustomer,
          namaProjek: data.namaProjek,
          namaBlok: data.namaBlok,
          namaMarketing: data.namaMarketing,
          leadStatus: data.leadStatus,
          noWhatsapp: data.noWhatsapp,
          tanggalInput: data.tanggalInput || today,
        };
        setLeadList(prev => [newLead, ...prev]);
        showToast(`Lead Customer ${newLead.namaCustomer} dicatat.`);

        // Supabase Insert Table
        supabase.from('leads_penjualan').insert([newLead]).then(({ error }) => {
          if (error) console.warn('Supabase insert failed:', error.message);
        });
        break;
      }
      default:
        break;
    }
  };

  // Helper selectors to quickly open modal
  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-tr from-[#ebf3fc] via-[#e2eefa] to-[#f3f8fd] text-slate-800 font-sans">
      
      {/* Decorative Background Blobs for Glassmorphism */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-sky-200/40 opacity-50 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-teal-100/30 opacity-40 blur-[110px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-100/40 opacity-30 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Dynamic Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3.5 p-4 rounded-2xl glass-panel text-slate-800 border-l-4 border-l-emerald-500 shadow-xl max-w-sm animate-scale-up">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          <div className="text-xs font-semibold">{toastMessage}</div>
        </div>
      )}

      {/* Main Structural Boundary */}
      <div className="flex min-h-screen">

        {/* 1. LEFT SIDEBAR - Desktop Glassmorphic rail */}
        <aside className="hidden lg:flex flex-col w-72 glass-panel m-4 mr-0 rounded-3xl overflow-hidden p-6 gap-8 shrink-0">
          
          {/* Logo Brand Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Building size={22} />
              </div>
              <div>
                <h1 className="text-lg font-display font-black text-slate-900 tracking-tight leading-none mb-0.5">SISPER<span className="text-indigo-600">.</span></h1>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-sans">Perumahan Sektor Utama</p>
              </div>
            </div>

            
          </div>

          {/* Navigation group */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">Kategori Menu</span>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full justify-start text-left flex items-center gap-3.5 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-500/10 text-indigo-700 shadow-sm border border-indigo-500/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <BarChart3 size={18} className="text-indigo-500" />
              Overview & Dashboard
            </button>

            <button
              onClick={() => setActiveTab('konstruksi')}
              className={`w-full justify-start text-left flex items-center gap-3.5 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === 'konstruksi'
                  ? 'bg-blue-500/10 text-blue-700 border border-blue-500/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Building size={18} className="text-blue-500" />
              Pekerjaan Konstruksi
            </button>

            <button
              onClick={() => setActiveTab('logistik')}
              className={`w-full justify-start text-left flex items-center gap-3.5 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === 'logistik'
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Warehouse size={18} className="text-emerald-500" />
              Logistik & Gudang
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`w-full justify-start text-left flex items-center gap-3.5 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === 'marketing'
                  ? 'bg-orange-500/10 text-orange-700 border border-orange-500/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <TrendingUp size={18} className="text-orange-500" />
              Marketing & Penjualan
            </button>

            <button
              onClick={() => setActiveTab('operasional')}
              className={`w-full justify-start text-left flex items-center gap-3.5 px-3 py-3 text-xs sm:text-sm font-bold rounded-xl transition ${
                activeTab === 'operasional'
                  ? 'bg-rose-500/10 text-rose-700 border border-rose-500/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Users size={18} className="text-rose-500" />
              Data karyawan dan pekerja
            </button>
          </div>

          {/* User profile segment */}
          <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-md border border-white/20 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                RF
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Rizqo Fadhilah</h4>
                <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">Site Administrator</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-1 pt-2 border-t border-slate-100">
              <Clock size={11} className="text-indigo-400 animate-pulse" />
              <span>{currentTime || 'Syncing...'}</span>
            </div>
          </div>
        </aside>

        {/* 2. MAIN HEADER AND TAB PAGES SCROLLABLE ZONE */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto max-w-full lg:max-w-[calc(100%-18rem)]">
          
          {/* Header Mobile Toolbar / Brand bar */}
          <header className="flex lg:hidden items-center justify-between mb-5 p-3 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
                <Building size={16} />
              </div>
              <h1 className="text-md font-display font-black text-slate-800">SISPER<span className="text-indigo-600">.</span></h1>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700"
            >
              <Menu size={18} />
            </button>
          </header>

          {/* Desktop Navigation Top Summary / Filters */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-extrabold text-slate-800 tracking-tight">Sistem Informasi Perumahan</h2>
              <p className="text-[11px] text-slate-400 font-medium">Pengawasan Progres Lapangan, Logistik Gudang & Pipeline Penjualan</p>
            </div>
          </div>

          {/* Active Workspaces Render Context */}
          <div className="flex-1 min-h-[500px]">
            {activeTab === 'dashboard' && (
              <DashboardView 
                projects={projects}
                konstruksiList={konstruksiList}
                inventoryList={inventoryList}
                progresList={progresList}
                absensiList={absensiList}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
              />
            )}

            {activeTab === 'konstruksi' && (
              <ConstructionView 
                konstruksiList={konstruksiList}
                progresList={progresList}
                transaksiList={transaksiList}
                inventoryList={inventoryList}
                pembayaranList={pembayaranList}
                selectedProjectId={selectedProjectId}
                onAddKonstruksi={() => openModal('konstruksi')}
                onAddProgres={() => openModal('progres')}
                onAddPembayaran={() => openModal('pembayaran')}
                onUpdateProgres={handleUpdateProgres}
                onUpdateKonstruksiStatus={handleUpdateKonstruksiStatus}
                onUpdateKonstruksiSaleStatus={handleUpdateKonstruksiSaleStatus}
              />
            )}

            {activeTab === 'logistik' && (
              <LogistikView 
                inventoryList={inventoryList}
                gudangList={gudangList}
                supplierList={supplierList}
                transaksiList={transaksiList}
                konstruksiList={konstruksiList}
                projects={projects}
                onAddInventory={() => openModal('inventory')}
                onAddGudang={() => openModal('gudang')}
                onAddSupplier={() => openModal('supplier')}
                onAddTransaksi={() => openModal('transaksi')}
              />
            )}

            {activeTab === 'marketing' && (
              <MarketingView 
                leadList={leadList}
                feeList={feeList}
                onAddLead={() => openModal('lead')}
                onAddFee={() => openModal('fee')}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onUpdateFeeStatus={handleUpdateFeeStatus}
              />
            )}

            {activeTab === 'operasional' && (
              <OperasionalView 
                karyawanList={karyawanList}
                absensiList={absensiList}
                absensiPekerjaList={absensiPekerjaList}
                progresList={progresList}
                onAddKaryawan={() => openModal('karyawan')}
                onAddAbsensi={() => openModal('absensi')}
                onAddAbsensiPekerja={() => openModal('absensi_pekerja')}
              />
            )}
          </div>
        </main>

      </div>

      {/* 3. MOBILE MENU BACKDROP / DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm">
          <div className="w-72 bg-white/95 backdrop-blur-xl h-full p-6 flex flex-col gap-6 shadow-2xl animate-slide-in">
            
            {/* Header drawer */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500 rounded-lg text-white">
                  <Building size={16} />
                </div>
                <h2 className="text-md font-display font-black text-slate-800">SISPER Menu</h2>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex-1 flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                  activeTab === 'dashboard' ? 'bg-indigo-50/80 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 size={16} />
                Overview & Dashboard
              </button>

              <button
                onClick={() => { setActiveTab('konstruksi'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                  activeTab === 'konstruksi' ? 'bg-blue-50/80 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building size={16} />
                Progres Konstruksi Unit
              </button>

              <button
                onClick={() => { setActiveTab('logistik'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                  activeTab === 'logistik' ? 'bg-emerald-50/80 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Warehouse size={16} />
                Logistik & Gudang
              </button>

              <button
                onClick={() => { setActiveTab('marketing'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                  activeTab === 'marketing' ? 'bg-orange-50/80 text-orange-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <TrendingUp size={16} />
                Marketing & Penjualan
              </button>

              <button
                onClick={() => { setActiveTab('operasional'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-3.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                  activeTab === 'operasional' ? 'bg-rose-50/80 text-rose-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users size={16} />
                Data karyawan dan pekerja
              </button>
            </div>

            {/* Footer drawer */}
            <div className="border-t pt-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-indigo-400" />
                <span>{currentTime || 'UTC Sync'}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. DYNAMIC SYSTEM MODAL (Adapts inputs based on active record trigger type) */}
      <AddRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        projects={projects}
        gudangList={gudangList}
        karyawanList={karyawanList}
        konstruksiList={konstruksiList}
        inventoryList={inventoryList}
        progresList={progresList}
        onSave={handleSaveModal}
      />

    </div>
  );
}

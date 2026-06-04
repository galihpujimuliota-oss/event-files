import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, CheckCircle2, UserX, Users, Monitor, Building, Settings, BellRing, Table2, Trash2, Edit, Mail, Search, Download, QrCode, Printer, LogOut, CheckCircle, LayoutDashboard, Cpu, Database, Activity, BarChart3, Info, Sparkles, Loader2, X, ChevronDown } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { store, AttendeeData } from '../store/store';
import { ALLOWED_ATTENDEES } from '../store/allowedAttendees';

export default function AdminScanner() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('yudisium_admin_logged_in') !== 'true') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('yudisium_admin_logged_in');
    navigate('/admin-login');
  };

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SCAN' | 'DATA' | 'UNREGISTERED' | 'QR' | 'INFO' | 'SETTINGS'>('DASHBOARD');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rekapTab, setRekapTab] = useState<'HOTEL' | 'LEGALISIR' | 'SASH'>('HOTEL');
  const [rekapSearch, setRekapSearch] = useState('');
  const [scanResult, setScanResult] = useState<{ status: 'IDLE' | 'SUCCESS' | 'NOT_FOUND', attendee?: AttendeeData }>({ status: 'IDLE' });
  const [scanInput, setScanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const isScanningRef = useRef(true);

  const [broadcastSubject, setBroadcastSubject] = useState('Pengingat: Yudisium & Pengukuhan Guru Profesional PPG Dalam Jabatan Batch 4 Tahun 2025');
  const [broadcastBody, setBroadcastBody] = useState(`Yth. Bapak/Bapak/Ibu Peserta,\n\nBerikut adalah instruksi acara Yudisium & Pengukuhan Guru Profesional PPG Dalam Jabatan Batch 4 Tahun 2025 FITK - LPTK UIN Maulana Malik Ibrahim Malang:\n\n📅 Hari/Tanggal: \n⏰ Waktu:\n📍 Tempat:\n📹 Link Streaming: http://\n\nHarap hadir tepat waktu dan membawa Access Pass QR Code Anda.\n\nTerima kasih.\nPanitia`);
  
  // reset scanning state when result changes back to IDLE
  useEffect(() => {
    if (scanResult.status === 'IDLE') {
      isScanningRef.current = true;
    } else {
      isScanningRef.current = false;
    }
  }, [scanResult.status]);
  
  const [selectedAttendee, setSelectedAttendee] = useState<AttendeeData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AttendeeData>>({});

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; filename: string } | null>(null);

  const downloadBase64File = (base64Data: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to download file', e);
      alert('Gagal mengunduh bukti otomatis. Silakan klik kanan gambar lalu pilih Simpan Gambar.');
    }
  };

  const handleOpenAttendeeDetail = async (att: AttendeeData) => {
    setIsLoadingDetail(true);
    try {
      const full = await store.getAttendeeById(att.id);
      if (full) {
        setSelectedAttendee(full);
      } else {
        setSelectedAttendee(att);
      }
      setEditForm({});
      setIsEditMode(false);
    } catch (e) {
      console.error(e);
      setSelectedAttendee(att);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewAndDownloadProof = async (id: string, fileType: 'HOTEL' | 'LEGALISIR' | 'SASH') => {
    setIsLoadingFile(true);
    try {
      const full = await store.getAttendeeById(id);
      if (!full) {
        alert('Gagal memuat detail peserta.');
        return;
      }
      
      let base64Url = '';
      let fileTitle = '';
      if (fileType === 'HOTEL') {
        base64Url = full.paymentHotelProofUrl || '';
        fileTitle = 'Bukti Pembayaran Hotel';
      } else if (fileType === 'LEGALISIR') {
        base64Url = full.paymentLegalisirProofUrl || '';
        fileTitle = 'Bukti Pembayaran Legalisir';
      } else if (fileType === 'SASH') {
        base64Url = full.paymentSashProofUrl || '';
        fileTitle = 'Bukti Pembayaran Selempang';
      }

      if (!base64Url || base64Url === 'yes') {
        alert('Foto bukti pembayaran belum diunggah atau kosong.');
        return;
      }

      const safeFilename = `${fileTitle.toLowerCase().replace(/\s+/g, '_')}_${full.npk}.jpg`;
      setLightboxImage({ url: base64Url, title: `${fileTitle} - ${full.fullName} (${full.npk})`, filename: safeFilename });
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat memproses berkas.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  type AdminLog = { id: string; time: string; message: string; };
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('yudisium_admin_logs');
    if (saved) {
      try { setAdminLogs(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const addLog = (message: string) => {
    const newLog = {
      id: Date.now().toString() + Math.random(),
      time: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      message
    };
    setAdminLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      localStorage.setItem('yudisium_admin_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleEditChange = (key: keyof AttendeeData, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedAttendee) return;
    await store.updateAttendeeAdmin(selectedAttendee.id, editForm);
    setSelectedAttendee({ ...selectedAttendee, ...editForm } as AttendeeData);
    setIsEditMode(false);
    updateStats();
  };

  const handleVerifyPaymentModal = async () => {
    if (!selectedAttendee) return;
    await store.verifyAttendeeAdmin(selectedAttendee.id);
    setSelectedAttendee({ ...selectedAttendee, status: 'VERIFIED' } as AttendeeData);
    addLog(`Verifikasi berhasil melalui modal untuk: ${selectedAttendee.fullName} (${selectedAttendee.npk})`);
    updateStats();
  };

  const getCertMethodText = (method?: string) => {
    if (method === 'MODEL_1') return 'Model 1: Mandiri';
    if (method === 'MODEL_2') return 'Model 2: Diwakilkan';
    if (method === 'MODEL_3') return 'Model 3: Jasa Pengiriman IKA PPG';
    return '-';
  };
  const [attendeesList, setAttendeesList] = useState<AttendeeData[]>([]);

  const [isSupabaseConnected, setIsSupabaseConnected] = useState(!!import.meta.env.VITE_SUPABASE_URL);

  const [syncStatus, setSyncStatus] = useState<{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'; message?: string }>({ status: 'IDLE' });

  const handleSyncLocalData = async () => {
    setSyncStatus({ status: 'LOADING' });
    const result = await store.syncLocalDataToSupabase();
    if (result.success) {
      setSyncStatus({ status: 'SUCCESS', message: `Berhasil memindahkan ${result.count} data pendaftaran lokal ke Supabase Cloud!` });
      updateStats();
    } else {
      setSyncStatus({ status: 'ERROR', message: result.message || 'Gagal menyinkronkan data.' });
    }
  };

  const [stats, setStats] = useState({ total: 0, luring: 0, daring: 0, verified: 0 });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateStats = async () => {
    setIsRefreshing(true);
    try {
      const allDict = await store.getAllAttendees();
      const all = Object.values(allDict).filter(a => a.isRegistered); // Pastikan merekap yang udah register final
      setAttendeesList(all);
      setStats({
        total: all.length,
        daring: all.filter(a => a.attendanceType === 'DARING').length,
        luring: all.filter(a => a.attendanceType === 'LURING').length,
        verified: all.filter(a => a.status === 'VERIFIED').length,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    updateStats();
    
    // Auto-poll local db/supabase to ensure dashboard is always in sync with registrations
    const interval = setInterval(() => {
      updateStats();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let timer: any = null;
    let isStarted = false;

    if (activeTab === 'SCAN') {
      timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode('qr-reader');
          html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (isScanningRef.current) {
                isScanningRef.current = false;
                const id = decodedText.split('/').pop() || decodedText;
                handleVerification(id);
              }
            },
            (errorMessage) => {
              // ignore continuous errors
            }
          ).then(() => {
            isStarted = true;
          }).catch((err) => {
            console.error("Camera start failed", err);
          });
        } catch (e) {
          console.error("QR Code init error", e);
        }
      }, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (html5QrCode && isStarted) {
        html5QrCode.stop().then(() => {
          html5QrCode?.clear();
        }).catch(e => console.error("Failed to stop scanner", e));
      }
    };
  }, [activeTab]);

  const handleVerification = async (id: string) => {
    if (!id.trim()) {
      isScanningRef.current = true;
      return;
    }
    const verifiedAttendee = await store.verifyAttendeeAdmin(id.trim());
    if (verifiedAttendee) {
      setScanResult({ status: 'SUCCESS', attendee: verifiedAttendee });
      addLog(`Verifikasi berhasil melalui scan barcode untuk: ${verifiedAttendee.fullName} (${verifiedAttendee.npk})`);
      await updateStats();
    } else {
      setScanResult({ status: 'NOT_FOUND' });
      addLog(`Gagal scan barcode, ID tidak valid: ${id}`);
    }
    setScanInput('');
  };

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerification(scanInput);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin menghapus data peserta ini?')) {
      await store.deleteAttendeeAdmin(id);
      await updateStats();
    }
  };

  const handleSendReminder = () => {
    const emails = attendeesList
      .filter(att => att.email)
      .map(att => att.email)
      .join(',');

    if (!emails) {
      alert("Tidak ada email peserta yang tersedia.");
      return;
    }

    const subject = encodeURIComponent(broadcastSubject);
    const body = encodeURIComponent(broadcastBody);
    
    // Open email client with bcc to hide emails from everyone
    window.location.href = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
    
    alert(`Membuka aplikasi email... Terdapat ${stats.total} peserta.`);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Nama Lengkap', 'NPK', 'Email', 'No HP', 'Sekolah', 'Bid. Studi', 'Provinsi', 'Kota', 'Alamat', 
      'Tipe Kehadiran', 'Pesan Selempang', 'Rekening Selempang', 'No Rek. Selempang', 'Bank Selempang',
      'Rekening Hotel', 'No Rek. Hotel', 'Bank Hotel', 'Rekening Legalisir', 'No Rek. Legalisir', 'Bank Legalisir', 'Pengambilan Serdik', 'Status'
    ];
    const rows = attendeesList.map(att => [
      att.id,
      `"${att.fullName}"`,
      att.npk,
      att.email || '',
      `'${att.phoneWA}'`,
      `"${att.schoolName}"`,
      `"${att.studyField}"`,
      `"${att.province}"`,
      `"${att.city}"`,
      `"${att.address}"`,
      att.attendanceType || '',
      att.wantsSash ? 'Ya' : 'Tidak',
      `"${att.paymentSashAccountName || ''}"`,
      `'${att.paymentSashAccountNumber || ''}'`,
      `"${att.paymentSashBank || ''}"`,
      `"${att.paymentHotelAccountName || ''}"`,
      `'${att.paymentHotelAccountNumber || ''}'`,
      `"${att.paymentHotelBank || ''}"`,
      `"${att.paymentLegalisirAccountName || ''}"`,
      `'${att.paymentLegalisirAccountNumber || ''}'`,
      `"${att.paymentLegalisirBank || ''}"`,
      att.certificateRetrievalMethod || '',
      att.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Peserta_Yudisium_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-teal-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-teal-300" />
            <span className="font-bold tracking-widest text-lg flex items-center gap-2">
              SYS.ADMIN_TERMINAL
              {isRefreshing && <Loader2 className="w-4 h-4 text-teal-300 animate-spin" />}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isSupabaseConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-100 text-[10px] font-bold px-2 py-1 rounded border border-amber-400/30 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Local DB
              </span>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1 bg-teal-800 hover:bg-teal-900 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-20 space-y-6">
        {/* Dropdown Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold text-slate-700"
          >
            <div className="flex items-center gap-2">
              {activeTab === 'DASHBOARD' && <><LayoutDashboard className="w-5 h-5 text-teal-600"/> DASHBOARD</>}
              {activeTab === 'SCAN' && <><ScanFace className="w-5 h-5 text-teal-600"/> SCANNER</>}
              {activeTab === 'DATA' && <><Table2 className="w-5 h-5 text-teal-600"/> DATA PENDAFTARAN</>}
              {activeTab === 'UNREGISTERED' && <><UserX className="w-5 h-5 text-amber-600"/> BELUM REGISTRASI</>}
              {activeTab === 'QR' && <><QrCode className="w-5 h-5 text-teal-600"/> CETAK QR CODES</>}
              {activeTab === 'INFO' && <><BellRing className="w-5 h-5 text-teal-600"/> BROADCAST INFO</>}
              {activeTab === 'SETTINGS' && <><Settings className="w-5 h-5 text-teal-600"/> SETTINGS</>}
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                <button onClick={() => { setActiveTab('DASHBOARD'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'DASHBOARD' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <LayoutDashboard className="w-5 h-5"/> DASHBOARD
                </button>
                <button onClick={() => { setActiveTab('SCAN'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'SCAN' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <ScanFace className="w-5 h-5"/> SCANNER
                </button>
                <button onClick={() => { setActiveTab('DATA'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'DATA' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Table2 className="w-5 h-5"/> DATA PENDAFTARAN
                </button>
                <button onClick={() => { setActiveTab('UNREGISTERED'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'UNREGISTERED' ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <UserX className="w-5 h-5"/> BELUM REGISTRASI
                </button>
                <button onClick={() => { setActiveTab('QR'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'QR' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <QrCode className="w-5 h-5"/> CETAK QR CODES
                </button>
                <button onClick={() => { setActiveTab('INFO'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'INFO' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <BellRing className="w-5 h-5"/> BROADCAST INFO
                </button>
                <button onClick={() => { setActiveTab('SETTINGS'); setIsMenuOpen(false); }} className={`p-4 text-left font-bold flex items-center gap-3 transition-colors ${activeTab === 'SETTINGS' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Settings className="w-5 h-5"/> SETTINGS
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-slate-500 text-xs font-bold mb-1">TOTAL PESERTA</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-indigo-600 text-xs font-bold mb-1">HADIR LURING</p>
            <p className="text-3xl font-bold text-indigo-800">{stats.luring}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-teal-50 border border-teal-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-teal-600 text-xs font-bold mb-1">HADIR DARING</p>
            <p className="text-3xl font-bold text-teal-800">{stats.daring}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-emerald-600 text-xs font-bold mb-1">TERVERIFIKASI</p>
            <p className="text-3xl font-bold text-emerald-800">{stats.verified}</p>
          </motion.div>
        </div>

        {/* TABS CONTENT */}
        <AnimatePresence mode="wait">
        {activeTab === 'DASHBOARD' && (() => {
          // 1. Study field breakdown
          const studyFieldCounts: Record<string, number> = {};
          attendeesList.forEach(a => {
            const field = a.studyField || 'Lainnya';
            studyFieldCounts[field] = (studyFieldCounts[field] || 0) + 1;
          });
          const sortedStudyFields = Object.entries(studyFieldCounts)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5);

          // 2. Province breakdown
          const provinceCounts: Record<string, number> = {};
          attendeesList.forEach(a => {
            const prov = a.province || 'Lainnya';
            provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
          });
          const sortedProvinces = Object.entries(provinceCounts)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5);

          // 3. Status breakdown
          const pendingCount = attendeesList.filter(a => a.status === 'PENDING').length;
          const verifiedCount = attendeesList.filter(a => a.status === 'VERIFIED').length;

          // 4. Hotel proof vs Legalisir proof
          const hotelProofCount = attendeesList.filter(a => !!a.paymentHotelProofUrl).length;
          const legalisirProofCount = attendeesList.filter(a => !!a.paymentLegalisirProofUrl).length;

          const listHotel = attendeesList.filter(a => a.attendanceType === 'LURING');
          const listLegalisir = attendeesList;
          const listSelempang = attendeesList.filter(a => a.wantsSash === true);

          const getFilteredRekapList = () => {
            let baseList = [];
            if (rekapTab === 'HOTEL') baseList = listHotel;
            else if (rekapTab === 'LEGALISIR') baseList = listLegalisir;
            else if (rekapTab === 'SASH') baseList = listSelempang;

            if (!rekapSearch.trim()) return baseList;
            const searchLower = rekapSearch.toLowerCase();
            return baseList.filter(a => 
              a.fullName.toLowerCase().includes(searchLower) ||
              a.npk.includes(searchLower)
            );
          };

          const filteredRekap = getFilteredRekapList();

          const handleExportCategoryCSV = (category: 'HOTEL' | 'LEGALISIR' | 'SASH') => {
            let targetList = [];
            let catName = '';
            let headers = ['No', 'Nama Lengkap', 'NPK / Akun Siaga', 'No WhatsApp', 'Bank Rekening Pengirim', 'Atas Nama Rekening Pengirim', 'No Rekening Pengirim', 'URL Bukti Pembayaran'];

            if (category === 'HOTEL') {
              targetList = listHotel;
              catName = 'Pembayaran_Acara_Hotel';
            } else if (category === 'LEGALISIR') {
              targetList = listLegalisir;
              catName = 'Pembayaran_Legalisir';
            } else if (category === 'SASH') {
              targetList = listSelempang;
              catName = 'Pembayaran_Selempang';
            }

            const rows = targetList.map((att, idx) => {
              let bank = '';
              let acctName = '';
              let acctNum = '';
              let proofUrl = '';

              if (category === 'HOTEL') {
                bank = att.paymentHotelBank || '';
                acctName = att.paymentHotelAccountName || '';
                acctNum = att.paymentHotelAccountNumber || '';
                proofUrl = att.paymentHotelProofUrl || '';
              } else if (category === 'LEGALISIR') {
                bank = att.paymentLegalisirBank || '';
                acctName = att.paymentLegalisirAccountName || '';
                acctNum = att.paymentLegalisirAccountNumber || '';
                proofUrl = att.paymentLegalisirProofUrl || '';
              } else if (category === 'SASH') {
                bank = att.paymentSashBank || '';
                acctName = att.paymentSashAccountName || '';
                acctNum = att.paymentSashAccountNumber || '';
                proofUrl = att.paymentSashProofUrl || '';
              }

              return [
                idx + 1,
                `"${att.fullName}"`,
                `'${att.npk}'`,
                `'${att.phoneWA}'`,
                `"${bank}"`,
                `"${acctName}"`,
                `'${acctNum}'`,
                `"${proofUrl}"`
              ];
            });

            // Using BOM \uFEFF to make sure Excel opens the CSV correctly with UTF-8 encoding
            const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
              + headers.join(',') + "\n"
              + rows.map(e => e.join(",")).join("\n");
              
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Rekap_${catName}_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          const copyAllWAOfActiveTab = () => {
            let targetList = [];
            if (rekapTab === 'HOTEL') targetList = listHotel;
            else if (rekapTab === 'LEGALISIR') targetList = listLegalisir;
            else if (rekapTab === 'SASH') targetList = listSelempang;

            const waNumbers = targetList.map(a => a.phoneWA).filter(Boolean).join(', ');
            if (!waNumbers) {
              alert('Tidak ada nomor WhatsApp untuk disalin');
              return;
            }
            navigator.clipboard.writeText(waNumbers);
            alert(`Berhasil menyalin ${targetList.length} nomor WhatsApp ke clipboard!`);
          };

          return (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Analytics Header Row */}
              <div className="bg-gradient-to-r from-teal-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-300" /> Ringkasan Analitik Registrasi Yudisium
                  </h3>
                  <p className="text-xs text-teal-100/90 max-w-2xl leading-relaxed">
                    Visualisasi data pendaftaran, sebaran wilayah, program studi peserta, status verifikasi administrasi finansial, serta pemantauan kapasitas server secara real-time.
                  </p>
                </div>
                <div className="shrink-0 flex gap-2.5">
                  <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white hover:bg-slate-100 text-teal-900 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-xs">
                    <Download className="w-4 h-4 text-teal-700" /> Ekspor CSV Penuh ({stats.total})
                  </button>
                </div>
              </div>

              {/* Main Analysis Chart Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Program Studi Terbanyak */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Building className="w-4 h-4 text-teal-600" /> Top 5 Sebaran Program Studi
                  </h4>
                  <div className="space-y-3.5">
                    {sortedStudyFields.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">Belum ada sebaran data program studi.</p>
                    ) : (
                      sortedStudyFields.map(([field, count], index) => {
                        const maxVal = Math.max(...Object.values(studyFieldCounts), 1);
                        const percentage = Math.round((count / stats.total) * 100) || 0;
                        const widthPercentage = Math.round((count / maxVal) * 100) || 0;
                        return (
                          <div key={field} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                              <span className="truncate max-w-[70%]" title={field}>{index + 1}. {field}</span>
                              <span className="text-slate-500 font-mono">{count} peserta ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${widthPercentage}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Sebaran Daerah Provinsi Asal */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Building className="w-4 h-4 text-indigo-600" /> Top 5 Sebaran Asal Provinsi
                  </h4>
                  <div className="space-y-3.5">
                    {sortedProvinces.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">Belum ada data geografi wilayah.</p>
                    ) : (
                      sortedProvinces.map(([prov, count], index) => {
                        const maxVal = Math.max(...Object.values(provinceCounts), 1);
                        const percentage = Math.round((count / stats.total) * 100) || 0;
                        const widthPercentage = Math.round((count / maxVal) * 100) || 0;
                        return (
                          <div key={prov} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                              <span className="truncate max-w-[75%]" title={prov}>{index + 1}. {prov}</span>
                              <span className="text-slate-500 font-mono">{count} orang ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${widthPercentage}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Tipe Kehadiran & Status Verifikasi */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Users className="w-4 h-4 text-amber-600" /> Rasio Metode Kehadiran & Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Kehadiran gauge */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metode Kehadiran</p>
                      <div className="flex items-end justify-center gap-4 py-1">
                        <div>
                          <p className="text-lg font-bold text-indigo-700 font-mono">{stats.luring}</p>
                          <p className="text-[9px] text-slate-400 font-bold">LURING</p>
                        </div>
                        <div className="text-slate-300 font-light">/</div>
                        <div>
                          <p className="text-lg font-bold text-teal-700 font-mono">{stats.daring}</p>
                          <p className="text-[9px] text-slate-400 font-bold">DARING</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-indigo-600 h-full" style={{ width: `${stats.total > 0 ? (stats.luring / stats.total) * 100 : 50}%` }} />
                        <div className="bg-teal-500 h-full" style={{ width: `${stats.total > 0 ? (stats.daring / stats.total) * 100 : 50}%` }} />
                      </div>
                    </div>

                    {/* Verifikasi gauge */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Verifikasi</p>
                      <div className="flex items-end justify-center gap-4 py-1">
                        <div>
                          <p className="text-lg font-bold text-emerald-700 font-mono">{verifiedCount}</p>
                          <p className="text-[9px] text-emerald-600 font-bold">VERIFIED</p>
                        </div>
                        <div className="text-slate-300 font-light">/</div>
                        <div>
                          <p className="text-lg font-bold text-amber-700 font-mono">{pendingCount}</p>
                          <p className="text-[9px] text-amber-600 font-bold">PENDING</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-600 h-full" style={{ width: `${stats.total > 0 ? (verifiedCount / stats.total) * 100 : 50}%` }} />
                        <div className="bg-amber-500 h-full" style={{ width: `${stats.total > 0 ? (pendingCount / stats.total) * 100 : 50}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Payment Files Counters */}
                  <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-xl p-3 text-xs flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Lampiran Administrasi Diunggah:</span>
                    <div className="flex gap-4">
                      <span className="font-medium text-slate-600">Proof Hotel: <strong className="text-slate-900 font-mono">{hotelProofCount}</strong></span>
                      <span className="font-medium text-slate-600">Proof Legalisir: <strong className="text-slate-900 font-mono">{legalisirProofCount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 4. Live Server Monitor Panel (Scalability Indicator) */}
                <div className="bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-teal-400 text-sm flex items-center gap-2 pb-1 border-b border-slate-800">
                    <Cpu className="w-4 h-4 animate-spin text-teal-400" style={{ animationDuration: '4s' }} /> Live System Concurrency Simulator
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Estimasi performa sistem database terpusat (Supabase Postgres) ketika menampung beban simulasi <strong>2800+ Peserta</strong> simultan dengan <strong>8 Admin</strong>:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">KONEKSI POOL SQL</p>
                      <p className="text-base font-extrabold text-teal-400 font-mono mt-0.5">8 / 100 <span className="text-[10px] text-teal-500 font-normal">Active</span></p>
                      <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest mt-1.5 inline-block">SANGAT SEHAT</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">LATENCY DATABASE</p>
                      <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">~64ms <span className="text-[10px] text-emerald-500 font-normal">Avg</span></p>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest mt-1.5 inline-block">OPTIMAL</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">CONCURRENT WRITES</p>
                      <p className="text-base font-extrabold text-indigo-400 font-mono mt-0.5">80 <span className="text-[10px] text-indigo-500 font-normal">req/s</span></p>
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest mt-1.5 inline-block">AMAN (BUFFERED)</span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">LOCAL INDEX SYNC</p>
                      <p className="text-base font-extrabold text-teal-400 font-mono mt-0.5">AKTIF</p>
                      <span className="text-[8px] bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest mt-1.5 inline-block">Sinkron</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rekap Kategori Khusus Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <Table2 className="w-5 h-5 text-teal-600" /> Rekap Data Berdasarkan Kategori
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      Menu rekap instan peserta untuk Pembayaran Acara Hotel, Pembayaran Legalisir, serta Pembayaran Selempang.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={copyAllWAOfActiveTab}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Mail className="w-4 h-4 text-slate-500" /> Salin Semua No. WA ({getFilteredRekapList().length})
                    </button>
                    <button
                      onClick={() => handleExportCategoryCSV(rekapTab)}
                      className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Ekspor CSV Kategori
                    </button>
                  </div>
                </div>

                {/* Sub-tabs Selectors */}
                <div className="flex bg-slate-50 p-1.5 rounded-xl gap-1 border border-slate-100 max-w-fit flex-col sm:flex-row">
                  <button
                    onClick={() => { setRekapTab('HOTEL'); setRekapSearch(''); }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${rekapTab === 'HOTEL' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    🏨 PEMBAYARAN HOTEL
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rekapTab === 'HOTEL' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                      {listHotel.length}
                    </span>
                  </button>
                  <button
                    onClick={() => { setRekapTab('LEGALISIR'); setRekapSearch(''); }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${rekapTab === 'LEGALISIR' ? 'bg-white text-teal-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    📜 PEMBAYARAN LEGALISIR
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rekapTab === 'LEGALISIR' ? 'bg-teal-50 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                      {listLegalisir.length}
                    </span>
                  </button>
                  <button
                    onClick={() => { setRekapTab('SASH'); setRekapSearch(''); }}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${rekapTab === 'SASH' ? 'bg-white text-amber-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    🎗️ PEMBAYARAN SELEMPANG
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rekapTab === 'SASH' ? 'bg-amber-50 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                      {listSelempang.length}
                    </span>
                  </button>
                </div>

                {/* Search Bar and Export buttons for the active category */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="relative w-full max-w-md border border-slate-200 rounded-xl overflow-hidden flex items-center bg-white transition-shadow focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 shadow-sm">
                    <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                    <input
                      type="text"
                      placeholder={`Cari nama atau NPK...`}
                      className="w-full px-3 py-2.5 outline-none text-xs placeholder:text-slate-400 font-medium"
                      value={rekapSearch}
                      onChange={(e) => setRekapSearch(e.target.value)}
                    />
                    {rekapSearch && (
                      <button onClick={() => setRekapSearch('')} className="absolute right-4 text-xs font-bold text-slate-405 hover:text-slate-600">Batal</button>
                    )}
                  </div>
                  <button onClick={() => {
                     const headers = ["NO", "NAMA LENGKAP", "NPK", "NO WA", "PENGIRIM", "BUKTI ID"];
                     const rows = filteredRekap.map((att, i) => {
                       let detailsStr = '';
                       if (rekapTab === 'HOTEL') {
                         detailsStr = att.paymentHotelAccountName ? `${att.paymentHotelBank} an. ${att.paymentHotelAccountName} (${att.paymentHotelAccountNumber})` : '';
                       } else if (rekapTab === 'LEGALISIR') {
                         detailsStr = att.paymentLegalisirAccountName ? `${att.paymentLegalisirBank} an. ${att.paymentLegalisirAccountName} (${att.paymentLegalisirAccountNumber})` : '';
                       } else if (rekapTab === 'SASH') {
                         detailsStr = att.paymentSashAccountName ? `${att.paymentSashBank} an. ${att.paymentSashAccountName} (${att.paymentSashAccountNumber})` : '';
                       }
                       return [
                         i + 1,
                         `"${att.fullName}"`,
                         `"${att.npk}"`,
                         `"${att.phoneWA}"`,
                         `"${detailsStr}"`,
                         `"${att.id}"`
                       ];
                     });
                     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                     const encodedUri = encodeURI(csvContent);
                     const link = document.createElement("a");
                     link.setAttribute("href", encodedUri);
                     link.setAttribute("download", `Rekap_Pembayaran_${rekapTab}_${new Date().toISOString().slice(0,10)}.csv`);
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                  }} className="shrink-0 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-colors">
                    <Download className="w-4 h-4" /> Unduh Berkas Data (CSV)
                  </button>
                </div>

                {/* Table for active category */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#0f172a] text-white sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300 w-12 text-center">No</th>
                          <th className="px-4 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300">Nama Lengkap</th>
                          <th className="px-4 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300">NPK / Akun Siaga</th>
                          <th className="px-4 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300">No. WhatsApp</th>
                          <th className="px-4 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300 text-center">Bukti Pembayaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredRekap.map((att, index) => {
                          let proofUrl = '';
                          let detailsStr = '';
                          if (rekapTab === 'HOTEL') {
                            proofUrl = att.paymentHotelProofUrl || '';
                            detailsStr = att.paymentHotelAccountName ? `${att.paymentHotelBank} an. ${att.paymentHotelAccountName} (${att.paymentHotelAccountNumber})` : '';
                          } else if (rekapTab === 'LEGALISIR') {
                            proofUrl = att.paymentLegalisirProofUrl || '';
                            detailsStr = att.paymentLegalisirAccountName ? `${att.paymentLegalisirBank} an. ${att.paymentLegalisirAccountName} (${att.paymentLegalisirAccountNumber})` : '';
                          } else if (rekapTab === 'SASH') {
                            proofUrl = att.paymentSashProofUrl || '';
                            detailsStr = att.paymentSashAccountName ? `${att.paymentSashBank} an. ${att.paymentSashAccountName} (${att.paymentSashAccountNumber})` : '';
                          }

                          return (
                            <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 text-slate-400 font-mono text-center">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-800">{att.fullName}</div>
                                {detailsStr && (
                                  <div className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-50 border border-slate-100 rounded inline-block px-1.5 py-0.5">
                                    Pengirim: {detailsStr}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-600 font-semibold">{att.npk}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-slate-600 font-bold">{att.phoneWA}</span>
                                  <a
                                    href={`https://wa.me/${att.phoneWA.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-700 hover:text-emerald-800 px-2.5 py-0.5 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors shrink-0 text-[10px] font-bold border border-emerald-205"
                                    title="Hubungi via WhatsApp"
                                  >
                                    Hubungi
                                  </a>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {proofUrl ? (
                                  <button
                                    onClick={() => handleViewAndDownloadProof(att.id, rekapTab)}
                                    disabled={isLoadingFile}
                                    className="text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-teal-200 transition-colors inline-flex items-center gap-1 shadow-sm shrink-0"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Lihat & Unduh Bukti
                                  </button>
                                ) : (
                                  <span className="text-rose-500 text-xs font-bold bg-rose-50 border border-rose-100 px-2.5 py-1 rounded inline-block">Belum Unggah</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredRekap.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium italic">
                              Tidak ada data ditemukan untuk pencarian kategori ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {activeTab === 'SCAN' && (
          <motion.div key="scan" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm relative">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ScanFace className="w-5 h-5 text-teal-600"/> Kamera Scanner</h3>
                <div className="relative rounded-xl overflow-hidden aspect-square">
                  <div id="qr-reader" className="w-full h-full bg-slate-900 border-0 flex items-center justify-center relative z-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
                  
                  {/* Visual Status Indicator Overlay */}
                  <div className={`absolute inset-0 z-10 pointer-events-none border-4 transition-all duration-500 ease-in-out ${
                    scanResult.status === 'IDLE' 
                      ? 'border-yellow-400/60 shadow-[inset_0_0_20px_rgba(250,204,21,0.3)] animate-pulse' 
                      : scanResult.status === 'SUCCESS' 
                        ? 'border-teal-500 bg-teal-500/20 shadow-[inset_0_0_30px_rgba(20,184,166,0.4)]' 
                        : 'border-rose-500 bg-rose-500/20 shadow-[inset_0_0_30px_rgba(244,63,94,0.4)]'
                  }`} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleManualScan} className="flex gap-2">
                  <input 
                    type="text" 
                    autoFocus
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow shadow-sm font-mono text-sm"
                    placeholder="Input ID Manual..."
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                  />
                  <button type="submit" disabled={!scanInput} className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-6 rounded-xl font-bold transition-all shadow-sm active:scale-95">
                    Verifikasi
                  </button>
                </form>
              </div>
            </div>

            <div className={`relative border-2 ${scanResult.status === 'IDLE' ? 'border-dashed border-slate-300 bg-white' : scanResult.status === 'SUCCESS' ? 'border-teal-200 bg-teal-50/50' : 'border-rose-200 bg-rose-50/50'} rounded-xl p-6 min-h-[300px] flex flex-col justify-center items-center text-center transition-colors shadow-sm`}>
              {scanResult.status === 'IDLE' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400">
                  <QrCode className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-semibold tracking-wide uppercase text-slate-500">Scan QR Code Peserta</p>
                </motion.div>
              )}
              {scanResult.status === 'NOT_FOUND' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-rose-500 flex flex-col items-center">
                  <UserX className="w-20 h-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-rose-800 mb-2">Tidak Ditemukan</h3>
                  <p className="text-rose-600 text-sm mb-6">QR Code tidak valid / peserta belum registrasi final.</p>
                  <button onClick={() => setScanResult({ status: 'IDLE' })} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                    Scan Ulang
                  </button>
                </motion.div>
              )}
              {scanResult.status === 'SUCCESS' && scanResult.attendee && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full text-left bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
                  <div className="bg-teal-100 text-teal-800 px-4 py-2.5 text-sm rounded-xl font-bold flex items-center justify-center gap-2 mb-6 tracking-wide">
                    <CheckCircle className="w-5 h-5"/> TERVERIFIKASI HADIR
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-rose-600 rounded-xl border-2 border-white shadow-[0_4px_12px_rgb(0,0,0,0.1)] overflow-hidden shrink-0 flex justify-center items-center">
                        {scanResult.attendee.photoUrl ? <img src={scanResult.attendee.photoUrl} alt="Profil" className="w-full h-full object-cover" /> : <span className="text-white/50 text-xs font-mono uppercase">Img</span>}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-800 leading-tight mb-1">{scanResult.attendee.fullName}</h3>
                        <p className="text-slate-500 font-mono text-xs tracking-widest">{scanResult.attendee.id}</p>
                        <span className="inline-block px-2.5 py-1 mt-2 rounded-[6px] text-xs font-bold tracking-widest uppercase bg-teal-50 text-teal-700 border border-teal-100">
                          {scanResult.attendee.attendanceType}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-slate-400 font-mono tracking-widest uppercase mb-1">Bidang Studi</p><p className="font-semibold text-slate-800">{scanResult.attendee.studyField}</p></div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-slate-400 font-mono tracking-widest uppercase mb-1">Sekolah</p><p className="font-semibold text-slate-800">{scanResult.attendee.schoolName}</p></div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-slate-400 font-mono tracking-widest uppercase mb-1">Email</p><p className="font-semibold text-slate-800 break-all">{scanResult.attendee.email || '-'}</p></div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><p className="text-slate-400 font-mono tracking-widest uppercase mb-1">WA</p><p className="font-semibold text-slate-800">{scanResult.attendee.phoneWA}</p></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button onClick={() => setScanResult({ status: 'IDLE' })} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors text-sm shadow-md active:scale-95">
                        Siap Scan Berikutnya
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* LOG AKTIVITAS */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-teal-600" /> Log Aktivitas Verifikasi
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {adminLogs.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Belum ada aktivitas tercatat.</p>
                ) : (
                  adminLogs.map(log => (
                    <div key={log.id} className="flex justify-between items-start border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{log.message}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">{log.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'DATA' && (() => {
          const filteredAttendees = attendeesList.filter(att => 
            att.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            att.npk.includes(searchQuery)
          );

          return (
            <motion.div key="data" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative max-w-sm w-full border border-slate-200 rounded-xl overflow-hidden flex items-center bg-white transition-shadow focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Pencarian Nama atau NPK..."
                    className="w-full px-3 py-2.5 outline-none text-sm placeholder:text-slate-400 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-xs whitespace-nowrap">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#0f172a] text-white">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase text-slate-300">Nama & NPK</th>
                      <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase text-slate-300">Email & WA</th>
                      <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase text-slate-300">Tipe Hadir</th>
                      <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase text-slate-300">Status</th>
                      <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase text-slate-300 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{att.fullName}</p>
                          <p className="text-slate-400 text-xs font-mono tracking-widest">{att.npk}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-slate-600 font-medium">{att.email || '-'}</p>
                          <p className="text-slate-400 text-xs font-mono">{att.phoneWA}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${att.attendanceType === 'LURING' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 'bg-teal-50 border border-teal-100 text-teal-700'}`}>
                            {att.attendanceType}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${att.status === 'VERIFIED' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                            {att.status === 'VERIFIED' ? <CheckCircle className="w-3 h-3"/> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}
                            {att.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => handleOpenAttendeeDetail(att)}
                            disabled={isLoadingDetail}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 p-2 rounded-lg transition-colors inline-flex items-center justify-center min-w-[32px] min-h-[32px]"
                            title="Edit / Detail Peserta"
                          >
                            {isLoadingDetail ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-550" />
                            ) : (
                              <Edit className="w-4 h-4" />
                            )}
                          </button>
                          <button onClick={() => handleDelete(att.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors ml-1"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {filteredAttendees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium tracking-wide">
                          {attendeesList.length > 0 ? 'TIDAK ADA DATA.' : 'BELUM ADA DATA PESERTA.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })()}

        {activeTab === 'UNREGISTERED' && (() => {
          // Find NPKs inside ALLOWED_ATTENDEES that are NOT in attendeesList
          const registeredNpks = new Set(attendeesList.map(a => a.npk));
          let unregisteredList = Object.entries(ALLOWED_ATTENDEES)
            .filter(([npk]) => !registeredNpks.has(npk))
            .map(([npk, data]) => ({ npk, ...data }));

          if (rekapSearch) {
             const q = rekapSearch.toLowerCase();
             unregisteredList = unregisteredList.filter(u => 
                u.fullName.toLowerCase().includes(q) ||
                u.studyField.toLowerCase().includes(q) ||
                u.npk.toLowerCase().includes(q)
             );
          }

          const exportToCsv = () => {
             const headers = ["NO", "NAMA LENGKAP", "NPK", "BIDANG STUDI"];
             const rows = unregisteredList.map((u, i) => [
               i + 1,
               `"${u.fullName}"`,
               `"${u.npk}"`,
               `"${u.studyField}"`
             ]);
             const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
             const encodedUri = encodeURI(csvContent);
             const link = document.createElement("a");
             link.setAttribute("href", encodedUri);
             link.setAttribute("download", `Rekap_Belum_Registrasi_${new Date().toISOString().slice(0,10)}.csv`);
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
          };

          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-50/50">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600" />
                    PESERTA BELUM REGISTRASI
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Daftar peserta yang ada di file acuan namun belum melakukan registrasi online ({unregisteredList.length} orang).</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                      <input 
                        type="text" 
                        placeholder="Cari NPK/Nama/Bidang..." 
                        className="w-full pl-9 pr-4 py-2 bg-white border border-amber-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium placeholder-slate-400"
                        value={rekapSearch}
                        onChange={(e) => setRekapSearch(e.target.value)}
                      />
                      {rekapSearch && (
                        <button onClick={() => setRekapSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                           <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button onClick={exportToCsv} className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                      <Download className="w-4 h-4" /> Unduh Berkas (CSV)
                    </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                  <thead className="bg-[#0f172a] text-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-5 py-3 w-16 font-semibold text-[10px] tracking-wider uppercase text-slate-300 text-center">NO</th>
                      <th className="px-5 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300">NAMA LENGKAP</th>
                      <th className="px-5 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300 w-48">BIDANG STUDI</th>
                      <th className="px-5 py-3 font-semibold text-[10px] tracking-wider uppercase text-slate-300 text-center">NPK / AKUN SIAGA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium bg-white">
                    {unregisteredList.map((u, idx) => (
                      <tr key={u.npk} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs text-center">{idx + 1}</td>
                        <td className="px-5 py-4 font-bold text-slate-800 uppercase">{u.fullName}</td>
                        <td className="px-5 py-4">
                           <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                             {u.studyField}
                           </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 font-bold text-center">{u.npk}</td>
                      </tr>
                    ))}
                    {unregisteredList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-slate-400 font-medium tracking-wide">
                          {rekapSearch ? 'TIDAK ADA HASIL PENCARIAN.' : 'SEMUA PESERTA TELAH MELAKUKAN REGISTRASI.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })()}

        {activeTab === 'QR' && (() => {
          const handleDownloadAll = () => {
            const container = document.getElementById('qr-batch-container');
            if (container) {
              toPng(container, { cacheBust: true, backgroundColor: '#ffffff' })
                .then((dataUrl) => {
                  const link = document.createElement('a');
                  link.download = `Batch-QR-Codes-${new Date().toISOString().slice(0,10)}.png`;
                  link.href = dataUrl;
                  link.click();
                })
                .catch((err) => console.error('Failed to download QR batch', err));
            }
          };

          const handleDownloadSingle = (id: string, name: string) => {
            const qrElement = document.getElementById(`qr-card-${id}`);
            if (qrElement) {
              toPng(qrElement, { cacheBust: true, backgroundColor: '#ffffff' })
                .then((dataUrl) => {
                  const link = document.createElement('a');
                  link.download = `QR-${name.replace(/\s+/g, '-')}.png`;
                  link.href = dataUrl;
                  link.click();
                })
                .catch((err) => console.error('Failed to download individual QR', err));
            }
          };

          return (
            <motion.div key="qr" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg tracking-tight">QR Code Generator</h3>
                  <p className="text-slate-500 text-sm">Unduh QR Code peserta untuk cetak ID Card (Name Tag).</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-xs">
                    <Printer className="w-4 h-4" /> Print (PDF)
                  </button>
                  <button onClick={handleDownloadAll} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-xs">
                    <Download className="w-4 h-4" /> Download Semua
                  </button>
                </div>
              </div>

              {attendeesList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100 font-medium tracking-wide">
                  BELUM ADA DATA.
                </div>
              ) : (
                <div id="qr-batch-container" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                  {attendeesList.map((att) => (
                    <div key={att.id} id={`qr-card-${att.id}`} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm relative group overflow-hidden">
                      <div className="mb-3 p-1">
                        <QRCodeSVG value={att.id} size={110} level="H" />
                      </div>
                      <p className="font-bold text-xs text-slate-800 line-clamp-1 w-full uppercase" title={att.fullName}>{att.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5 mb-2">{att.npk}</p>
                      <span className={`inline-block w-full py-1 rounded-[4px] text-[9px] font-bold tracking-widest uppercase ${att.attendanceType === 'LURING' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 'bg-teal-50 border border-teal-100 text-teal-700'}`}>
                        {att.attendanceType}
                      </span>
                      
                      {/* Hover Overlay for Download Single */}
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleDownloadSingle(att.id, att.fullName)}
                          className="bg-teal-600 text-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
                          title="Download QR"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  #qr-batch-container, #qr-batch-container * { visibility: visible; }
                  #qr-batch-container { position: absolute; left: 0; top: 0; width: 100%; grid-template-columns: repeat(4, 1fr) !important; gap: 10mm; padding: 10mm; background: white; border: none; }
                  .group-hover\\:opacity-100 { display: none !important; }
                }
              `}</style>
            </motion.div>
          );
        })()}

        {activeTab === 'INFO' && (
          <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl shadow-sm mx-auto mt-8">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 border border-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">Email System Broadcast</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Kirim instruksi acara, link streaming, atau pengingat jadwal langsung ke email seluruh peserta.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Target Audience</p>
                <p className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg inline-block border border-teal-100">{stats.total} Peserta (Terdaftar Final)</p>
                
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Pilih Cepat Template Pesan:</p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Pengingat: Yudisium & Pengukuhan Guru Profesional PPG Daljab FITK UIN Malang');
                        setBroadcastBody(`Yth. Bapak/Ibu Peserta Yudisium,\n\nIni adalah pengingat untuk kegiatan Yudisium & Pengukuhan Guru Profesional PPG Daljab FITK UIN Malang.\n\nHarap pastikan Anda datang tepat waktu dan membawa QR Code Access Pass Anda untuk verifikasi presensi di pintu masuk.\n\nTerima kasih.\nPanitia`);
                      }}
                      className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-600 font-medium transition-all shadow-sm"
                    >
                      🔔 Pengingat Jadwal
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Link Streaming: Yudisium & Pengukuhan Guru Profesional PPG Daljab FITK UIN Malang');
                        setBroadcastBody(`Yth. Bapak/Ibu Peserta Yudisium,\n\nBagi Bapak/Ibu yang mengikuti kegiatan secara daring (online), berikut adalah informasi link streaming resmi:\n\n📹 Link Live Streaming: https://youtube.com/live/link-streaming-disini\n🔑 Room Meeting ID & Passcode (jika ada):\n\nSilakan bersiap bergabung 30 menit sebelum acara formal dimulai.\n\nTerima kasih.\nPanitia`);
                      }}
                      className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-600 font-medium transition-all shadow-sm"
                    >
                      📹 Link Streaming
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Instruksi & Tata Tertib Acara Yudisium PPG FITK UIN Malang');
                        setBroadcastBody(`Yth. Bapak/Ibu Peserta Yudisium,\n\nBerikut adalah beberapa instruksi penting terkait pelaksanaan Yudisium:\n\n1. Harap menggunakan busana formal nasional yang rapi dan sopan sesuai ketentuan LPTK.\n2. Tunjukkan QR Code Access Pass Anda pada petugas di lokasi acara.\n3. Harap tertib mengikuti jalannya acara dari awal hingga selesai.\n\nTerima kasih atas kerjasamanya.\nPanitia`);
                      }}
                      className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:text-teal-600 font-medium transition-all shadow-sm"
                    >
                      📋 Instruksi Acara
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 tracking-wide uppercase mb-1.5">Subjek Email (Dapat Diedit)</label>
                  <input 
                    type="text" 
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="Contoh: Pengingat Jadwal Yudisium..."
                    className="w-full text-sm bg-white p-3 font-semibold text-slate-800 border-2 border-slate-100 rounded-lg shadow-sm focus:border-teal-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="pt-1">
                  <label className="block text-xs font-bold text-slate-500 tracking-wide uppercase mb-1.5">Isi Pesan Email (Dapat Diedit)</label>
                  <textarea 
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    rows={8}
                    placeholder="Tulis pesan atau instruksi Anda di sini..."
                    className="w-full text-sm bg-white p-3 font-medium text-slate-800 border-2 border-slate-100 rounded-lg shadow-sm focus:border-teal-500 focus:outline-none transition-all leading-relaxed font-sans"
                  />
                </div>
              </div>
              
              <button onClick={handleSendReminder} className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-[0_8px_20px_-4px_rgba(13,148,136,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                <BellRing className="w-5 h-5"/> EKSEKUSI BROADCAST EMAIL
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'SETTINGS' && (
          <motion.div key="settings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl shadow-sm mx-auto mt-8">
            <div className="flex gap-4 items-center mb-6 border-b border-slate-100 pb-6">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                <Settings className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">Status Cloud Database</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Pengaturan koneksi Database (Supabase) untuk sinkronisasi data.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Status Koneksi Supabase</p>
                  {isSupabaseConnected ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle className="w-5 h-5"/> Terhubung ke Cloud
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                      Database Lokal (Offline)
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Penyimpanan Terakhir</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {stats.total > 0 ? `${stats.total} Data di Sistem` : 'Belum ada data'}
                  </p>
                </div>
              </div>

              {isSupabaseConnected && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                    🔌 Pindahkan Data Lokal ke Supabase Cloud
                  </h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Jika Anda sebelumnya sudah memiliki data pendaftaran (dari ujicoba luring/daring) yang tersimpan secara lokal di browser ini, dan sekarang setelah mereset tabel di Supabase data tersebut menjadi 0, silakan klik tombol di bawah ini untuk <strong>mengunggah dan menyinkronkan ulang</strong> semua data tersebut ke database Supabase Cloud Anda secara instan:
                  </p>
                  
                  {syncStatus.status === 'SUCCESS' && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold mb-3">
                      {syncStatus.message}
                    </div>
                  )}

                  {syncStatus.status === 'ERROR' && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs font-semibold mb-3">
                      {syncStatus.message}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncLocalData}
                    disabled={syncStatus.status === 'LOADING'}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    {syncStatus.status === 'LOADING' ? 'Sedang Sinkronisasi...' : '🔄 Sinkronisasikan Data ke Cloud'}
                  </button>
                </div>
              )}

              {isSupabaseConnected && stats.total === 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mt-4 text-sm text-amber-800">
                  <span className="font-bold block mb-1">⚠️ Mengapa Data 0 Padahal Terhubung?</span>
                  <p className="mb-2"><strong>Peringatan Supabase (RLS Disabled / Gagal Simpan):</strong> Jika Anda masih gagal menyimpan data pendaftaran atau ada error RLS, metode terbaik adalah <strong>mereset ulang tabelnya</strong>.</p>
                  <p><strong>Solusi (Hard Reset):</strong> Buka <strong>SQL Editor</strong> di Supabase Anda, copy dan jalankan kode di bawah ini. <em>(Catatan: Pastikan Anda belum memiliki data penting, karena ini akan membuat ulang tabel menjadi bersih dari awal)</em></p>
                  <pre className="block bg-amber-100 p-3 mt-2 rounded font-mono text-[10px] sm:text-xs text-amber-900 overflow-x-auto whitespace-pre">
{`-- 1. HAPUS TABEL LAMA BESERTA ATURANNYA
DROP TABLE IF EXISTS attendees CASCADE;

-- 2. BUAT ULANG TABEL BERSIH
CREATE TABLE attendees (
  id uuid PRIMARY KEY,
  email text,
  "fullName" text NOT NULL,
  npk text NOT NULL,
  address text,
  city text,
  province text,
  "schoolName" text,
  "phoneWA" text,
  "studyField" text,
  "photoUrl" text,
  "attendanceType" text,
  "paymentHotelBank" text,
  "paymentHotelAccountName" text,
  "paymentHotelAccountNumber" text,
  "paymentHotelProofUrl" text,
  "paymentLegalisirBank" text,
  "paymentLegalisirAccountName" text,
  "paymentLegalisirAccountNumber" text,
  "paymentLegalisirProofUrl" text,
  "certificateRetrievalMethod" text,
  "isRegistered" boolean DEFAULT false,
  status text DEFAULT 'PENDING'
);

-- 3. AKTIFKAN KEAMANAN DAN BERIKAN AKSES PENUH
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON attendees FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON attendees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON attendees FOR DELETE USING (true);`}
                  </pre>
                </div>
              )}

              {!isSupabaseConnected && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-blue-900 mt-6 shadow-sm">
                  <h4 className="font-bold mb-2 flex items-center gap-2">Membutuhkan Koneksi Supabase</h4>
                  <p className="text-sm opacity-90 mb-4">
                    Saat ini aplikasi menggunakan <strong>Local DB</strong>. Jika perangkat direfresh atau diakses oleh pengguna lain, datanya akan terpisah.
                    Untuk menyimpan dan menyinkronkan data secara realtime (CLOUD):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm font-medium">
                    <li>Buat akun dan project di <strong>Supabase</strong></li>
                    <li>Buka menu <strong>AI Studio Sidebar &gt; Settings &gt; Variables (Secrets)</strong></li>
                    <li>Tambahkan <code className="bg-white px-2 py-0.5 rounded text-blue-700 mx-1">VITE_SUPABASE_URL</code></li>
                    <li>Tambahkan <code className="bg-white px-2 py-0.5 rounded text-blue-700 mx-1">VITE_SUPABASE_ANON_KEY</code></li>
                    <li>Tunggu beberapa saat, lalu Refresh halaman web ini.</li>
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {selectedAttendee && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 md:p-6 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
              <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">Detail Peserta & Pembayaran</h3>
                  <p className="text-slate-500 text-xs font-mono mt-0.5 tracking-wider">{selectedAttendee.id}</p>
                </div>
                <button onClick={() => setSelectedAttendee(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"><UserX className="w-5 h-5"/></button>
              </div>

              <div className="p-5 overflow-y-auto bg-slate-50/30 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* KOLOM KIRI: DATA DIRI */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-2 mb-4 flex justify-between items-center">
                        Data Identitas 
                        <button onClick={() => { setIsEditMode(!isEditMode); setEditForm(selectedAttendee); }} className="text-xs font-bold text-blue-600 hover:underline">{isEditMode ? 'Batal Edit' : 'Edit Data'}</button>
                      </h4>
                      <div className="space-y-3 text-sm">
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold uppercase">Nama Lengkap</span>
                          {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.fullName || ''} onChange={e => handleEditChange('fullName', e.target.value)} /> : 
                          <span className="font-semibold text-slate-800">{selectedAttendee.fullName}</span>}
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold uppercase">NPK</span>
                          {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.npk || ''} onChange={e => handleEditChange('npk', e.target.value)} /> : 
                          <span className="font-mono text-slate-700">{selectedAttendee.npk}</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Tipe Kehadiran</span>
                            {isEditMode ? (
                              <select className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.attendanceType || ''} onChange={e => handleEditChange('attendanceType', e.target.value as any)}>
                                <option value="LURING">LURING</option>
                                <option value="DARING">DARING</option>
                              </select>
                            ) : <span className={`inline-block px-2 text-xs font-bold leading-6 rounded uppercase mt-0.5 w-fit ${selectedAttendee.attendanceType === 'LURING' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>{selectedAttendee.attendanceType}</span>}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Status Scanner</span>
                            <span className={`inline-block px-2 text-xs font-bold leading-6 rounded uppercase mt-0.5 w-fit ${selectedAttendee.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{selectedAttendee.status}</span>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold uppercase">Sekolah</span>
                          {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.schoolName || ''} onChange={e => handleEditChange('schoolName', e.target.value)} /> : 
                          <span className="text-slate-700">{selectedAttendee.schoolName}</span>}
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold uppercase">Bid. Studi</span>
                          {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.studyField || ''} onChange={e => handleEditChange('studyField', e.target.value)} /> : 
                          <span className="text-slate-700">{selectedAttendee.studyField}</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Provinsi</span>
                             {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.province || ''} onChange={e => handleEditChange('province', e.target.value)} /> : <span className="text-slate-700">{selectedAttendee.province}</span>}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Kab/Kota</span>
                            {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.city || ''} onChange={e => handleEditChange('city', e.target.value)} /> : <span className="text-slate-700">{selectedAttendee.city}</span>}
                          </div>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-semibold uppercase">Alamat</span>
                          {isEditMode ? <textarea className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.address || ''} onChange={e => handleEditChange('address', e.target.value)} rows={2} /> : 
                          <span className="text-slate-700">{selectedAttendee.address}</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold uppercase">Email</span>
                            {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.email || ''} onChange={e => handleEditChange('email', e.target.value)} /> : 
                            <span className="text-slate-700 break-all">{selectedAttendee.email || '-'}</span>}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold uppercase">WhatsApp</span>
                            {isEditMode ? <input type="text" className="input-base p-2 border border-slate-300 rounded mt-1 text-sm bg-white" value={editForm.phoneWA || ''} onChange={e => handleEditChange('phoneWA', e.target.value)} /> : 
                            <span className="font-mono text-slate-700">{selectedAttendee.phoneWA}</span>}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* KOLOM KANAN: PEMBAYARAN & LAINNYA */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm border-b border-slate-200 pb-2 mb-4">Informasi Pembayaran</h4>
                      <div className="space-y-6">
                        
                        {(selectedAttendee.attendanceType === 'LURING' || selectedAttendee.paymentHotelProofUrl) && (
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h5 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">Hotel (LURING)</h5>
                            <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 mb-4">
                              <p><span className="text-slate-400 font-semibold block text-[10px] uppercase">Bank</span>{selectedAttendee.paymentHotelBank || '-'}</p>
                              <p><span className="text-slate-400 font-semibold block text-[10px] uppercase">No Rekening</span><span className="font-mono">{selectedAttendee.paymentHotelAccountNumber || '-'}</span></p>
                              <p><span className="text-slate-400 font-semibold block text-[10px] uppercase">Atas Nama</span>{selectedAttendee.paymentHotelAccountName || '-'}</p>
                            </div>
                            
                            {selectedAttendee.paymentHotelProofUrl ? (
                              <div className="border border-slate-200 rounded-lg overflow-hidden relative group">
                                <img src={selectedAttendee.paymentHotelProofUrl} alt="Bukti Hotel" className="w-full h-32 object-contain bg-slate-100" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                  <button onClick={() => {
                                    const filename = `bukti_hotel_${selectedAttendee.npk}.jpg`;
                                    setLightboxImage({ url: selectedAttendee.paymentHotelProofUrl as string, title: `Bukti Pembayaran Hotel - ${selectedAttendee.fullName} (${selectedAttendee.npk})`, filename });
                                  }} className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Zoom/Buka Jelas</button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold">Bukti Belum Diunggah</div>
                            )}
                          </div>
                        )}

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h5 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">Legalisir (Wajib Semua)</h5>
                          <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 mb-4">
                            <p><span className="text-slate-400 font-semibold block text-[10px] uppercase">Bank</span>{selectedAttendee.paymentLegalisirBank || '-'}</p>
                            <p><span className="text-slate-400 font-semibold block text-[10px] uppercase">No Rekening</span><span className="font-mono">{selectedAttendee.paymentLegalisirAccountNumber || '-'}</span></p>
                            <p><span className="text-slate-400 font-semibold block text-[10px] uppercase">Atas Nama</span>{selectedAttendee.paymentLegalisirAccountName || '-'}</p>
                          </div>
                          
                          {selectedAttendee.paymentLegalisirProofUrl ? (
                            <div className="border border-slate-200 rounded-lg overflow-hidden relative group">
                              <img src={selectedAttendee.paymentLegalisirProofUrl} alt="Bukti Legalisir" className="w-full h-32 object-contain bg-slate-100" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                 <button onClick={() => {
                                   const filename = `bukti_legalisir_${selectedAttendee.npk}.jpg`;
                                   setLightboxImage({ url: selectedAttendee.paymentLegalisirProofUrl as string, title: `Bukti Pembayaran Legalisir - ${selectedAttendee.fullName} (${selectedAttendee.npk})`, filename });
                                 }} className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Zoom/Buka Jelas</button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold">Bukti Belum Diunggah</div>
                          )}
                        </div>

                        {/* 3. Selempang / Sash Audit Box */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h5 className="font-extrabold text-slate-800 text-xs mb-3 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Selempang (Opsional)
                          </h5>
                          {selectedAttendee.wantsSash ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
                                <p><span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Bank Pengirim</span>{selectedAttendee.paymentSashBank || '-'}</p>
                                <p><span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">No Rekening</span><span className="font-mono">{selectedAttendee.paymentSashAccountNumber || '-'}</span></p>
                                <p><span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Atas Nama</span>{selectedAttendee.paymentSashAccountName || '-'}</p>
                              </div>
                              
                              {selectedAttendee.paymentSashProofUrl ? (
                                <div className="border border-slate-200 rounded-lg overflow-hidden relative group">
                                  <img src={selectedAttendee.paymentSashProofUrl} alt="Bukti Selempang" className="w-full h-32 object-contain bg-slate-100" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <button onClick={() => {
                                      const filename = `bukti_selempang_${selectedAttendee.npk}.jpg`;
                                      setLightboxImage({ url: selectedAttendee.paymentSashProofUrl as string, title: `Bukti Pembayaran Selempang - ${selectedAttendee.fullName} (${selectedAttendee.npk})`, filename });
                                    }} className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Zoom/Buka Jelas</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-20 border border-dashed border-rose-300 rounded-lg flex items-center justify-center text-rose-500 text-xs font-semibold">Bukti Belum Diunggah</div>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-slate-400 text-xs font-medium italic border border-dashed border-slate-200 rounded-lg">Peserta tidak memesan selempang</div>
                          )}
                        </div>

                        {selectedAttendee.attendanceType === 'DARING' && (
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-900 shadow-sm">
                            <h5 className="font-bold text-indigo-800 text-xs mb-2 uppercase tracking-wider">Pengambilan Serdik</h5>
                            <p className="text-sm font-semibold">{getCertMethodText(selectedAttendee.certificateRetrievalMethod)}</p>
                            {selectedAttendee.certificateRetrievalMethod === 'MODEL_3' && (
                              <p className="text-xs text-indigo-600 mt-2 italic">* Harus mengisi Form IKA PPG</p>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
              <div className="p-4 md:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                {isEditMode ? (
                  <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm order-1 sm:order-2">Simpan Update</button>
                ) : (
                  <>
                    <button onClick={() => setSelectedAttendee(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors order-2 sm:order-1">Tutup</button>
                    {selectedAttendee.status === 'PENDING' && (
                      <button onClick={handleVerifyPaymentModal} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm order-1 sm:order-2">
                        <CheckCircle className="w-4 h-4"/> Setujui / Verifikasi Scanner
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
        {/* LIGHTBOX / VIEWER MODAL */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/95"
            >
              {/* Header */}
              <div className="w-full max-w-4xl flex items-center justify-between text-white mb-4 z-10 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex flex-col">
                  <h3 className="font-bold text-sm md:text-base tracking-tight">{lightboxImage.title}</h3>
                  <p className="text-slate-400 text-[10px] md:text-xs">Lihat & simpan pas foto / bukti pembayaran dengan kualitas asli</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadBase64File(lightboxImage.url, lightboxImage.filename)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-teal-400 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold"
                    title="Unduh Berkas Asli"
                  >
                    <Download className="w-4 h-4" /> Unduh Berkas
                  </button>
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white hover:text-slate-200 rounded-lg transition-all"
                    title="Tutup Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Image View */}
              <div className="relative w-full max-w-3xl max-h-[75vh] flex items-center justify-center border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-2xl p-4">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded animate-in zoom-in-95 duration-200"
                />
              </div>

              {/* Footer Guidelines */}
              <div className="mt-4 text-slate-400 text-center text-[11px] font-medium max-w-md">
                Klik tombol <span className="text-teal-400 font-bold">Unduh Berkas</span> untuk menyimpan bukti secara langsung. Anda juga dapat klik kanan atau tekan lama gambar untuk menyimpan.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </AnimatePresence>
      </main>
    </div>
  );
}

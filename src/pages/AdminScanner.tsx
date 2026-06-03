import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, CheckCircle2, UserX, Users, Monitor, Building, Settings, BellRing, Table2, Trash2, Edit, Mail, Search, Download, QrCode, Printer, LogOut, CheckCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { store, AttendeeData } from '../store/store';

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

  const [activeTab, setActiveTab] = useState<'SCAN' | 'DATA' | 'QR' | 'INFO' | 'SETTINGS'>('SCAN');
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
    if (method === 'MODEL_3') return 'Model 3: Jasa Pengiriman HMPS';
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

  const updateStats = async () => {
    const allDict = await store.getAllAttendees();
    const all = Object.values(allDict).filter(a => a.isRegistered); // Pastikan merekap yang udah register final
    setAttendeesList(all);
    setStats({
      total: all.length,
      daring: all.filter(a => a.attendanceType === 'DARING').length,
      luring: all.filter(a => a.attendanceType === 'LURING').length,
      verified: all.filter(a => a.status === 'VERIFIED').length,
    });
  };

  useEffect(() => {
    updateStats();
    
    // Auto-poll local db/supabase to ensure dashboard is always in sync with registrations
    const interval = setInterval(() => {
      updateStats();
    }, 5000);
    
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
      'Tipe Kehadiran', 'Rekening Hotel', 'No Rek. Hotel', 'Bank Hotel', 'Rekening Legalisir', 'No Rek. Legalisir', 'Bank Legalisir', 'Pengambilan Serdik', 'Status'
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
            <span className="font-bold tracking-widest text-lg">SYS.ADMIN_TERMINAL</span>
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
        {/* Tabs Menu */}
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-wrap md:flex-nowrap">
          <button onClick={() => setActiveTab('SCAN')} className={`flex-1 min-w-[50%] md:min-w-0 py-3.5 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'SCAN' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <ScanFace className="w-4 h-4"/> SCANNER
          </button>
          <button onClick={() => setActiveTab('DATA')} className={`flex-1 min-w-[50%] md:min-w-0 py-3.5 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'DATA' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Table2 className="w-4 h-4"/> DATA
          </button>
          <button onClick={() => setActiveTab('QR')} className={`flex-1 min-w-[50%] md:min-w-0 py-3.5 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'QR' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <QrCode className="w-4 h-4"/> QRs
          </button>
          <button onClick={() => setActiveTab('INFO')} className={`flex-1 min-w-[33%] md:min-w-0 py-3.5 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'INFO' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BellRing className="w-4 h-4"/> INFO
          </button>
          <button onClick={() => setActiveTab('SETTINGS')} className={`flex-1 min-w-[33%] md:min-w-0 py-3.5 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'SETTINGS' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Settings className="w-4 h-4"/> SETTINGS
          </button>
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
                          <button onClick={() => { setSelectedAttendee(att); setEditForm({}); setIsEditMode(false); }} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
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
                                  <button onClick={() => window.open(selectedAttendee.paymentHotelProofUrl as string, '_blank')} className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Zoom/Buka Jelas</button>
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
                                <button onClick={() => window.open(selectedAttendee.paymentLegalisirProofUrl as string, '_blank')} className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Zoom/Buka Jelas</button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold">Bukti Belum Diunggah</div>
                          )}
                        </div>

                        {selectedAttendee.attendanceType === 'DARING' && (
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-900 shadow-sm">
                            <h5 className="font-bold text-indigo-800 text-xs mb-2 uppercase tracking-wider">Pengambilan Serdik</h5>
                            <p className="text-sm font-semibold">{getCertMethodText(selectedAttendee.certificateRetrievalMethod)}</p>
                            {selectedAttendee.certificateRetrievalMethod === 'MODEL_3' && (
                              <p className="text-xs text-indigo-600 mt-2 italic">* Harus mengisi Form HMPS</p>
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
        </AnimatePresence>
      </main>
    </div>
  );
}

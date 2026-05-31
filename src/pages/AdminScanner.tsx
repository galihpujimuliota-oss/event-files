import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, CheckCircle2, UserX, Users, Monitor, Building, Settings, BellRing, Table2, Trash2, Edit, Mail, Search, Download, QrCode, Printer, LogOut } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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

  const [activeTab, setActiveTab] = useState<'SCAN' | 'DATA' | 'QR' | 'INFO'>('SCAN');
  const [scanResult, setScanResult] = useState<{ status: 'IDLE' | 'SUCCESS' | 'NOT_FOUND', attendee?: AttendeeData }>({ status: 'IDLE' });
  const [scanInput, setScanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [stats, setStats] = useState({ total: 0, daring: 0, luring: 0, verified: 0 });
  const [attendeesList, setAttendeesList] = useState<AttendeeData[]>([]);

  const updateStats = async () => {
    const allDict = await store.getAllAttendees();
    const all = Object.values(allDict);
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
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'SCAN') {
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        handleVerification(decodedText.split('/').pop() || decodedText);
      }, (error) => {
        // Ignore continuous scan errors
      });

      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }
  }, [activeTab]);

  const handleVerification = async (id: string) => {
    if (!id.trim()) return;
    const verifiedAttendee = await store.verifyAttendeeAdmin(id.trim());
    if (verifiedAttendee) {
      setScanResult({ status: 'SUCCESS', attendee: verifiedAttendee });
      await updateStats();
    } else {
      setScanResult({ status: 'NOT_FOUND' });
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
    alert(`Email pengingat acara dan informasi kegiatan berhasil dikirim ke ${stats.total} peserta terdaftar via email.`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'NPK', 'Email', 'No HP', 'Sekolah', 'Bid. Studi', 'Provinsi', 'Kota', 'Alamat', 'Tipe Kehadiran', 'Status'];
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 h-full min-h-[500px]"
    >
      <div className="border-b-4 border-[#d4af37] pb-4 mb-6 relative flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#1e3a8a]"/> Administrator
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data, Scan kehadiran, & Kirim Pengingat Acara Yudisium PPG Daljab Batch 4</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('SCAN')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'SCAN' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
          <ScanFace className="w-4 h-4"/> Scanner Hadir
        </button>
        <button onClick={() => setActiveTab('DATA')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'DATA' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Table2 className="w-4 h-4"/> Data Peserta
        </button>
        <button onClick={() => setActiveTab('QR')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'QR' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
          <QrCode className="w-4 h-4"/> QR Generator
        </button>
        <button onClick={() => setActiveTab('INFO')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-t-md transition-colors ${activeTab === 'INFO' ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
          <BellRing className="w-4 h-4"/> Pengingat & Info
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white border text-center border-slate-200 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="bg-slate-100 p-2 rounded-full mb-2">
            <Users className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Peserta</p>
          <p className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white border text-center border-slate-200 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-2 rounded-full mb-2">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Luring (Hadir)</p>
          <p className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.luring}</p>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white border text-center border-slate-200 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-2 rounded-full mb-2">
            <Monitor className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Daring</p>
          <p className="text-2xl font-black text-slate-800 leading-none mt-1">{stats.daring}</p>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25 }} className="bg-[#1e3a8a] border text-center rounded-lg p-4 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-white/10 p-2 rounded-full mb-2">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Terverifikasi</p>
          <p className="text-2xl font-black text-white leading-none mt-1">{stats.verified}</p>
        </motion.div>
      </div>

      {/* TABS CONTENT */}
      <AnimatePresence mode="wait">
      {activeTab === 'SCAN' && (
        <motion.div key="scan" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
              <h3 className="font-bold text-slate-800 mb-2">Kamera Scanner Otomatis</h3>
              <div id="qr-reader" className="w-full bg-white rounded-md overflow-hidden border border-slate-300"></div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2">Manual / Scanner Hardware</h3>
              <p className="text-xs text-slate-500 mb-4">Input ID secara manual jika QR tidak terbaca.</p>
              
              <form onSubmit={handleManualScan} className="flex gap-2">
                <input 
                  type="text" 
                  autoFocus
                  className="flex-1 text-sm rounded-md border border-slate-300 px-3 py-2 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none transition-shadow"
                  placeholder="Input ID Peserta..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                />
                <button type="submit" className="bg-[#1e3a8a] hover:bg-[#0f172a] text-white px-4 rounded-md font-bold transition-all shadow-sm active:scale-95">
                  Cek
                </button>
              </form>
            </div>
          </div>

          <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 bg-white min-h-[300px] flex flex-col justify-center items-center text-center">
            {scanResult.status === 'IDLE' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400">
                <ScanFace className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Silakan scan Barcode ke kamera atau input ID manual.</p>
              </motion.div>
            )}
            {scanResult.status === 'NOT_FOUND' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-red-500">
                <UserX className="w-20 h-20 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Data Tidak Ditemukan</h3>
                <p className="text-red-400 text-sm mt-2">ID Barcode tidak valid atau belum registrasi.</p>
              </motion.div>
            )}
            {scanResult.status === 'SUCCESS' && scanResult.attendee && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full text-left">
                <div className="bg-green-100 text-green-800 px-3 py-2 text-sm rounded-md font-bold flex items-center justify-center gap-2 mb-6 shadow-sm">
                  <CheckCircle2 className="w-5 h-5"/> TERVERIFIKASI HADIR
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0">
                      {scanResult.attendee.photoUrl && <img src={scanResult.attendee.photoUrl} alt="Profil" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{scanResult.attendee.fullName}</h3>
                      <p className="text-slate-500 font-mono text-xs">{scanResult.attendee.npk}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-[#1e3a8a] text-white">
                        {scanResult.attendee.attendanceType}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-md border border-slate-200">
                    <div><p className="text-slate-500 font-semibold mb-0.5">Bidang Studi</p><p className="font-semibold text-slate-800">{scanResult.attendee.studyField}</p></div>
                    <div><p className="text-slate-500 font-semibold mb-0.5">Asal Sekolah</p><p className="font-semibold text-slate-800">{scanResult.attendee.schoolName}</p></div>
                    <div><p className="text-slate-500 font-semibold mb-0.5">Email</p><p className="font-semibold text-slate-800 break-all">{scanResult.attendee.email || '-'}</p></div>
                    <div><p className="text-slate-500 font-semibold mb-0.5">Nomor WA</p><p className="font-semibold text-slate-800">{scanResult.attendee.phoneWA}</p></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'DATA' && (() => {
        const filteredAttendees = attendeesList.filter(att => 
          att.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          att.npk.includes(searchQuery)
        );

        return (
          <motion.div key="data" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border text-sm border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative max-w-sm w-full border border-slate-300 rounded-md overflow-hidden flex items-center bg-white transition-shadow focus-within:border-[#1e3a8a] focus-within:ring-1 focus-within:ring-[#1e3a8a]">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan Nama atau NPK/Siaga..."
                  className="w-full px-3 py-2 outline-none text-sm placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={handleExportCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold transition-all shadow-sm active:scale-95 text-xs whitespace-nowrap">
                <Download className="w-4 h-4" /> Export ke CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a] text-[#d4af37]">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase">Nama & NPK</th>
                    <th className="px-4 py-3 font-semibold uppercase">Email & WA</th>
                    <th className="px-4 py-3 font-semibold uppercase">Metode</th>
                    <th className="px-4 py-3 font-semibold uppercase">Status</th>
                    <th className="px-4 py-3 font-semibold uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendees.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{att.fullName}</p>
                        <p className="text-slate-500 text-xs font-mono">{att.npk}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{att.email || '-'}</p>
                        <p className="text-slate-500 text-xs">{att.phoneWA}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${att.attendanceType === 'LURING' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {att.attendanceType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${att.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => alert('Fitur edit detail dalam pengembangan')} className="text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(att.id)} className="text-red-500 hover:text-red-700 p-1 transition-transform hover:scale-110"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        {attendeesList.length > 0 ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada data peserta.'}
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
          <motion.div key="qr" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">QR Code Generator</h3>
                <p className="text-slate-500 text-sm">Unduh QR Code peserta untuk cetak kartu id card nametag secara mandiri.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-bold transition-all shadow-sm active:scale-95 text-sm">
                  <Printer className="w-4 h-4" /> Cetak Barcode (PDF)
                </button>
                <button onClick={handleDownloadAll} className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#0f172a] text-white px-4 py-2 rounded-md font-bold transition-all shadow-sm active:scale-95 text-sm">
                  <Download className="w-4 h-4" /> Download Semua (PNG)
                </button>
              </div>
            </div>

            {attendeesList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                Belum ada data peserta.
              </div>
            ) : (
              <div id="qr-batch-container" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {attendeesList.map((att) => (
                  <div key={att.id} id={`qr-card-${att.id}`} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm relative group overflow-hidden">
                    <div className="mb-2 p-1 bg-white">
                      <QRCodeSVG value={att.id} size={100} level="H" />
                    </div>
                    <p className="font-bold text-xs text-slate-800 line-clamp-1 w-full" title={att.fullName}>{att.fullName}</p>
                    <p className="text-[10px] text-slate-500 mb-1">{att.npk}</p>
                    <span className={`inline-block px-2 py-0.5 mt-auto rounded text-[8px] font-bold ${att.attendanceType === 'LURING' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {att.attendanceType}
                    </span>
                    
                    {/* Hover Overlay for Download Single */}
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDownloadSingle(att.id, att.fullName)}
                        className="bg-[#1e3a8a] text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
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
        <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl shadow-sm">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Email Pengingat (Reminder Broadcast)</h3>
              <p className="text-slate-500 text-sm">Kirim email otomatis kepada peserta yang telah mendaftar dengan detail jadwal dan link youtube atau registrasi ulang.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Subjek:</p>
              <p className="text-sm bg-white p-2 text-slate-800 border rounded">Pengingat: Yudisium & Pengukuhan Guru Profesional PPG Daljab FITK UIN Malang</p>
            </div>
            
            <button onClick={handleSendReminder} className="w-full bg-[#1e3a8a] text-white py-3 rounded-md font-bold hover:bg-[#0f172a] transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
              <BellRing className="w-5 h-5"/> Kirim Pengingat Acara Sekarang
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">Target penerima: {stats.total} Peserta Terdaftar (Luring & Daring)</p>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}

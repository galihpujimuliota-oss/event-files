import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, CreditCard, Download, Loader2, Info } from 'lucide-react';
import { store, AttendeeData } from '../store/store';

export default function CheckStatus() {
  const navigate = useNavigate();
  
  const [npk, setNpk] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [errorLine, setErrorLine] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npk.trim()) return;
    
    setIsLoading(true);
    setErrorLine('');
    setAttendee(null);
    
    try {
      const found = await store.getAttendeeByNpk(npk.trim());
      if (found) {
        setAttendee(found);
      } else {
        setErrorLine('Data tidak ditemukan. Pastikan NPK yang Anda masukkan sudah benar, tekan Mulai Registrasi jika belum terdata.');
      }
    } catch (e) {
      console.error(e);
      setErrorLine('Gagal memeriksa data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDigitalReceipt = (att: AttendeeData, type: 'HOTEL' | 'LEGALISIR' | 'SASH') => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Draw background
      ctx.fillStyle = '#f8fafc'; // slate-50
      ctx.fillRect(0, 0, 600, 800);

      // Header strip (teal border at very top)
      ctx.fillStyle = '#0f766e'; // teal-700
      ctx.fillRect(0, 0, 600, 15);

      // Main Card background shadow / border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30, 30, 540, 740);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e2e8f0'; // slate-200
      ctx.strokeRect(30, 30, 540, 740);

      // Decorative inner teal border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ccfbf1'; // teal-100
      ctx.strokeRect(40, 40, 520, 720);

      // Title text
      ctx.fillStyle = '#0f766e'; // teal-700
      ctx.font = 'bold 22px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KUITANSI PEMBAYARAN DIGITAL', 300, 95);

      ctx.fillStyle = '#475569'; // slate-600
      ctx.font = 'bold 12px Arial, Helvetica, sans-serif';
      ctx.fillText('SISTEM UTAMA REGISTRASI YUDISIUM', 300, 120);

      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = '10px Arial, Helvetica, sans-serif';
      ctx.fillText('Dokumen ini valid sebagai bukti pembayaran yang terverifikasi aman.', 300, 138);

      // Main divider line
      ctx.beginPath();
      ctx.moveTo(60, 155);
      ctx.lineTo(540, 155);
      ctx.strokeStyle = '#cbd5e1'; // slate-300
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Receipt details grouping
      const drawRow = (label: string, value: string, y: number) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b'; // slate-500
        ctx.font = 'bold 11px Arial, Helvetica, sans-serif';
        ctx.fillText(label.toUpperCase(), 70, y);

        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.font = '14px Courier, monospace';
        ctx.fillText(value, 230, y + 2);
      };

      let paymentTitle = '';
      let bankAccount = '-';
      let accountName = '-';
      let trxPrefix = '';
      
      if (type === 'HOTEL') {
        paymentTitle = 'Biaya Akomodasi Hotel (LURING)';
        bankAccount = att.paymentHotelAccountNumber || '-';
        accountName = att.paymentHotelAccountName || '-';
        trxPrefix = 'HTL';
      } else if (type === 'LEGALISIR') {
        paymentTitle = 'Biaya Legalisir Ijazah (Wajib)';
        bankAccount = att.paymentLegalisirAccountNumber || '-';
        accountName = att.paymentLegalisirAccountName || '-';
        trxPrefix = 'LGL';
      } else {
        paymentTitle = 'Biaya Pemesanan Selempang Yudisium';
        bankAccount = att.paymentSashAccountNumber || '-';
        accountName = att.paymentSashAccountName || '-';
        trxPrefix = 'SLP';
      }

      const transactionId = `TRX-${att.npk || '000'}-${trxPrefix}`;
      const dateFormatted = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';

      let currentY = 195;
      drawRow('NO TRANSAKSI', transactionId, currentY); currentY += 45;
      drawRow('NAMA PESERTA', att.fullName || '-', currentY); currentY += 45;
      drawRow('NPK / NIM', att.npk || '-', currentY); currentY += 45;
      drawRow('PROGRAM STUDI', att.studyField || '-', currentY); currentY += 45;
      drawRow('INSTITUSI / SEKOLAH', att.schoolName || '-', currentY); currentY += 45;
      drawRow('JENIS PEMBAYARAN', paymentTitle, currentY); currentY += 45;
      drawRow('SENDER ACCOUNT', accountName, currentY); currentY += 45;
      drawRow('REKENING PENGIRIM', bankAccount, currentY); currentY += 45;
      drawRow('WAKTU VERIFIKASI', dateFormatted, currentY);

      // Draw bottom divider line
      ctx.beginPath();
      ctx.moveTo(60, currentY + 30);
      ctx.lineTo(540, currentY + 30);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stamp "PAID / LUNAS"
      ctx.save();
      ctx.translate(410, 610);
      ctx.rotate(-12 * Math.PI / 180);
      
      // Draw stamp circle
      ctx.strokeStyle = 'rgba(15, 118, 110, 0.85)'; // teal
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw stamp inner letters
      ctx.fillStyle = 'rgba(15, 118, 110, 0.85)';
      ctx.font = 'bold 15px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LUNAS', 0, -8);
      ctx.font = 'bold 11px Arial, Helvetica, sans-serif';
      ctx.fillText('VERIFIED', 0, 12);
      ctx.font = '9px Arial, Helvetica, sans-serif';
      ctx.fillText('YUDISIUM', 0, 25);
      ctx.restore();

      // Barcode Simulation
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.font = '9px Arial, sans-serif';
      ctx.fillText('BARCODE VERIFIKASI SISTEM:', 70, 715);
      
      const barcodeStartX = 70;
      const barcodeY = 722;
      const barcodeHeight = 25;
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 60; i++) {
        const lineW = (Math.sin(i * 3) + 1.2) * 1.5;
        ctx.fillRect(barcodeStartX + (i * 3.5), barcodeY, Math.min(lineW, 3), barcodeHeight);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`*SYSTEM-DIGITAL-PROOF-AUTH-${(att.id || 'Npk').slice(0, 8).toUpperCase()}*`, 300, 762);

      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (e) {
      console.error('Failed to generate receipt', e);
      return '';
    }
  };

  const handleDownloadProof = (type: 'HOTEL' | 'LEGALISIR' | 'SASH') => {
    if (!attendee) return;
    
    let url = '';
    let docType = '';

    if (type === 'HOTEL') {
      url = attendee.paymentHotelProofUrl || '';
      docType = 'hotel';
    } else if (type === 'LEGALISIR') {
      url = attendee.paymentLegalisirProofUrl || '';
      docType = 'legalisir';
    } else if (type === 'SASH') {
      url = attendee.paymentSashProofUrl || '';
      docType = 'selempang';
    }

    if (!url) {
      alert('Bukti pembayaran tidak ditemukan atau belum diunggah.');
      return;
    }

    if (url === 'yes') { // This means it was migrated/digital
      url = generateDigitalReceipt(attendee, type);
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `bukti_pembayaran_${docType}_${attendee.npk}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1 font-medium bg-slate-50 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ChevronLeft className="w-5 h-5" /> Kembali
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="relative z-10 max-w-xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Cek Status Registrasi</h2>
          <p className="text-slate-500 text-sm">Masukkan Nomor Peserta (NPK/NIM) Anda untuk memeriksa status pendaftaran Anda pada acara Yudisium.</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative z-10 flex gap-3 mb-10">
          <input
            type="text"
            value={npk}
            onChange={(e) => setNpk(e.target.value)}
            placeholder="Masukkan NPK / NIM Anda"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
            required
          />
          <button
            type="submit"
            disabled={isLoading || !npk.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Cari
          </button>
        </form>

        <AnimatePresence mode="wait">
          {errorLine && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium flex items-start gap-3 mb-6"
            >
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              {errorLine}
            </motion.div>
          )}

          {attendee && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8"
            >
              <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Data Peserta Ditemukan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-10">
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Nama Lengkap</p>
                    <p className="font-bold text-slate-800 text-base">{attendee.fullName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">NPK / NIM</p>
                    <p className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded inline-block border border-slate-200">{attendee.npk}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">No HP / WhatsApp</p>
                    <p className="font-bold text-slate-800">{attendee.phoneWA}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Tipe Kehadiran</p>
                    <p className="inline-flex items-center gap-1.5 font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
                      {attendee.attendanceType}
                    </p>
                  </div>
                  {attendee.certificateRetrievalMethod && (
                    <div>
                      <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Model Kehadiran / Pengukuhan</p>
                      <p className="inline-flex items-center gap-1.5 font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
                        {attendee.certificateRetrievalMethod.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Sekolah / Instansi</p>
                    <p className="font-bold text-slate-800">{attendee.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Bidang Studi</p>
                    <p className="font-bold text-slate-800">{attendee.studyField}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Provinsi</p>
                    <p className="font-bold text-slate-800">{attendee.province}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Kabupaten / Kota</p>
                    <p className="font-bold text-slate-800">{attendee.city}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border text-center border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Cetak Bukti Pembayaran</h4>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                  {attendee.attendanceType === 'LURING' && attendee.paymentHotelProofUrl && (
                    <button onClick={() => handleDownloadProof('HOTEL')} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-xs rounded-lg transition-colors">
                      <Download className="w-4 h-4" /> Bukti Hotel
                    </button>
                  )}
                  {attendee.paymentLegalisirProofUrl && (
                    <button onClick={() => handleDownloadProof('LEGALISIR')} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-xs rounded-lg transition-colors">
                      <Download className="w-4 h-4" /> Bukti Legalisir
                    </button>
                  )}
                  {attendee.paymentSashProofUrl && (
                    <button onClick={() => handleDownloadProof('SASH')} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-bold text-xs rounded-lg transition-colors">
                      <Download className="w-4 h-4" /> Bukti Selempang
                    </button>
                  )}
                </div>
                {(!attendee.paymentHotelProofUrl && !attendee.paymentLegalisirProofUrl && !attendee.paymentSashProofUrl) && (
                  <p className="text-xs text-slate-400 italic">Belum ada bukti pembayaran yang tersimpan.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

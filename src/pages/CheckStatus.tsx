import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, CreditCard, Download, Loader2, Info, Fingerprint, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
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

  const handleDownloadCard = () => {
    const cardElement = document.getElementById('registration-card-check');
    if (cardElement) {
      toPng(cardElement, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `Kartu-Registrasi-${attendee?.fullName || 'Peserta'}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Failed to download card', err);
        });
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
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">Silahkan masukkan NPK/PEG.ID/Siaga Anda untuk memeriksa status pendaftaran Anda pada acara Yudisium. Pastikan NPK/PEG.ID/Siaga tersebut adalah nomor yang sebelumnya diinput ketika melakukan registrasi awal. Apabila sesuai maka data anda telah terekap, apabila tidak sesuai maka silahkan melakukan registrasi ulang.</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative z-10 flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="text"
            value={npk}
            onChange={(e) => setNpk(e.target.value)}
            placeholder="NPK / PEG.ID / Siaga"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
            required
          />
          <button
            type="submit"
            disabled={isLoading || !npk.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Cari NPK/PEG.ID/Siaga
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

              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden relative mb-6" id="registration-card-check">
                  <div className="bg-teal-600 p-5 text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10"><Fingerprint className="w-24 h-24 text-white" /></div>
                    <h3 className="text-white font-bold text-lg tracking-widest relative z-10">ACCESS PASS</h3>
                    <p className="text-teal-100/80 text-xs font-mono mt-1 relative z-10">SYS.26 // BATCH_4_2025</p>
                  </div>
                  
                  <div className="p-6 relative">
                    <div className="absolute top-1/2 left-0 -ml-4 w-8 h-8 bg-slate-50 rounded-full border-r border-slate-100 -mt-4 shadow-inner" />
                    <div className="absolute top-1/2 right-0 -mr-4 w-8 h-8 bg-slate-50 rounded-full border-l border-slate-100 -mt-4 shadow-inner" />
                    
                    <div className="flex gap-5 mb-8">
                      <div className="w-20 h-28 bg-rose-600 shrink-0 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border-4 border-white ring-1 ring-slate-100">
                        {attendee.photoUrl ? (
                          <img src={attendee.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-white/80 px-2 text-center uppercase tracking-widest">No Image</span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center space-y-3 flex-1 overflow-hidden">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">Attendee</p>
                          <p className="font-bold text-slate-800 text-sm leading-tight truncate">{attendee.fullName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">ID / NPK</p>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{attendee.npk}</p>
                        </div>
                        <div>
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] items-center font-bold tracking-widest uppercase shadow-sm ${attendee.attendanceType === 'LURING' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 'bg-teal-50 border border-teal-100 text-teal-700'}`}>
                            {attendee.attendanceType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-200 pt-6 pb-2 flex flex-col items-center">
                      <div className="w-full bg-slate-50 rounded-xl p-3 mb-6 border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Time Server Login</p>
                        <p className="font-mono text-xs font-bold text-slate-700">{new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB</p>
                        {attendee.attendanceType === 'LURING' && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wide">Jadwal Registrasi Offline</p>
                            <p className="font-mono text-xs font-bold text-slate-700">11.00 - 12.00 WIB</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <QRCodeSVG 
                          value={`https://yudisium.verify/attendee/${attendee.id}`}
                          size={140}
                          level={"H"}
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-4 uppercase tracking-widest">GATEWAY: {attendee.id}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full max-w-sm gap-3">
                  <button 
                    onClick={handleDownloadCard} 
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-[0_8px_20px_-4px_rgba(13,148,136,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" /> Download Kartu Barcode
                  </button>
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Printer className="w-5 h-5" /> Print
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

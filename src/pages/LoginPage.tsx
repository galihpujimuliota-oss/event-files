import { useNavigate } from 'react-router-dom';
import { Fingerprint, ScanEye, ShieldCheck } from 'lucide-react';
import { store } from '../store/store';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = async () => {
    setIsConnecting(true);
    // Simulate connection delay for the animation
    setTimeout(async () => {
      store.clear();
      await store.saveAttendee({
        id: Math.random().toString(36).substring(2, 9),
        isRegistered: false
      });
      navigate('/form-identitas');
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5 }}
      className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[400px] relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50 via-white to-white opacity-60 pointer-events-none" />
      
      <div className="max-w-sm w-full space-y-8 text-center relative z-10">
        <div>
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            {/* Animated Scanning Effect */}
            <AnimatePresence mode="wait">
              {isConnecting ? (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex items-center justify-center w-full h-full"
                >
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-teal-500 opacity-80"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-b-2 border-l-2 border-teal-300 opacity-60"
                  />
                  <ShieldCheck className="w-10 h-10 text-teal-600 relative z-10" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-teal-50 rounded-3xl flex items-center justify-center w-full h-full shadow-sm border border-teal-100 overflow-hidden relative"
                >
                  {/* Scanner line animation (simulates a moving GIF) */}
                  <motion.div
                    animate={{ y: ["0%", "200%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-teal-400/30 border-b border-teal-400 z-0"
                  />
                  <ScanEye className="w-10 h-10 text-teal-600 relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isConnecting ? 'Authenticating...' : 'Access Terminal'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            {isConnecting 
              ? 'Connecting securely to Google Workspace...' 
              : 'Verify your identity to proceed with the registration form securely.'
            }
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl p-3.5 text-slate-700 font-medium hover:bg-slate-50 hover:border-teal-200 hover:text-teal-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {isConnecting && (
              <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent"
              />
            )}
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="relative z-10">{isConnecting ? 'Authenticating...' : 'Authenticate via Google'}</span>
          </button>
          
          <div className="bg-amber-50/50 p-4 border border-amber-200/50 rounded-xl text-left">
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              <strong className="block mb-1">Status Integrasi:</strong>
              Saat ini sistem menggunakan antarmuka simulasi koneksi Google (Mock) untuk keperluan preview awal/desain. Untuk terhubung sepenuhnya dengan Google (Real Auth), dibutuhkan konfigurasi Firebase/Supabase di tahap deployment.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { Outlet, useLocation } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NetworkBackground from './NetworkBackground';

export default function Layout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      {/* Background Decorative Tech Elements */}
      <NetworkBackground />
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-white to-transparent pointer-events-none z-0" />

      {/* Header Tech Style */}
      <header className="relative z-10 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 flex items-center justify-center bg-white rounded-lg p-1.5 border border-slate-100 shadow-sm relative overflow-hidden">
              {/* Fallback to text if img is missing, but try to load uploaded logo */}
              <img src="/ascent-logo.png" alt="Ascent Premiere Hotel" className="h-full object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              <div className="hidden font-bold text-slate-800 text-xs px-2 text-center uppercase tracking-widest">Ascent<br/>Hotel</div>
            </div>
            <div>
              <h1 className="font-semibold text-slate-800 text-lg tracking-tight flex items-center gap-2">
                Yudisium <span className="text-teal-600 border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-full text-xs font-mono">SYS.26</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Digital Registration Portal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 relative z-10 flex flex-col justify-center">
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Fingerprint className="w-4 h-4 text-teal-300" />
          <p className="text-slate-400 font-mono text-xs">Secured System Gateway</p>
        </div>
        <p className="text-slate-400 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} Universitas Islam Negeri Maulana Malik Ibrahim Malang.
        </p>
        <p className="mt-4">
          <a href="/admin-login" className="text-teal-600/70 hover:text-teal-600 font-mono text-xs transition-colors border-b border-teal-200/50 hover:border-teal-400 pb-0.5">
            ACCESS_ADMIN_TERMINAL
          </a>
        </p>
      </footer>
    </div>
  );
}

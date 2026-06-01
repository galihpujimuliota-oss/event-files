import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserCog, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate admin authentication
    if (password === 'admin123' || password === 'petugas') {
      sessionStorage.setItem('yudisium_admin_logged_in', 'true');
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="p-8 flex flex-col items-center justify-center min-h-[500px]"
    >
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden relative">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5"><Fingerprint className="w-48 h-48 text-teal-400" /></div>
          <div className="relative z-10 w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
            <UserCog className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight relative z-10">Admin Terminal</h2>
          <p className="text-slate-400 mt-2 text-xs font-mono tracking-widest uppercase relative z-10">
            Secure Access Required
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold font-mono text-slate-400 mb-2 tracking-widest uppercase">Passcode</label>
              <div className="relative">
                <Lock className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-400' : 'text-teal-600'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-slate-50 font-mono tracking-widest ${error ? 'border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 text-rose-700 bg-rose-50/50' : 'border-slate-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'} focus:outline-none transition-all`}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {error && <p className="text-rose-500 text-xs mt-3 font-medium flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-500 block"></span>Access Denied. Cek kembali password Anda.</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_20px_-4px_rgba(13,148,136,0.3)] active:scale-95 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Verify & Enter
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

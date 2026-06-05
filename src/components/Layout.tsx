import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Fingerprint, User, CalendarRange, CreditCard, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NetworkBackground from './NetworkBackground';

export default function Layout() {
  const location = useLocation();

  const navigate = useNavigate();

  const steps = [
    { path: '/form-identitas', label: 'Identitas', icon: User },
    { path: '/form-kehadiran', label: 'Kehadiran', icon: CalendarRange },
    { path: '/form-pembayaran', label: 'Pembayaran', icon: CreditCard }
  ];

  const currentStepIndex = steps.findIndex(step => step.path === location.pathname);
  const isFormFlow = currentStepIndex !== -1;
  
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
        {isFormFlow && (
          <div className="mb-10 w-full max-w-xl mx-auto px-4">
            <div className="relative flex items-center justify-between">
              {/* Connecting Background Line */}
              <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-[2px] bg-slate-100 rounded-full z-0" />
              
              {/* Active Progress Fill Line */}
              <motion.div 
                className="absolute left-0 top-5 -translate-y-1/2 h-[2px] bg-teal-500 rounded-full z-0"
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%` 
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />

              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;
                
                return (
                  <button 
                    key={step.path} 
                    type="button"
                    onClick={() => {
                        if (isCompleted || isActive) {
                           navigate(step.path);
                        }
                    }}
                    disabled={!isCompleted && !isActive}
                    className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                  >
                    {/* Circle Indicator */}
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <motion.div
                          layoutId="activeStepGlow"
                          className="absolute -inset-1.5 bg-teal-500/20 rounded-full blur-sm"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.05 : 1,
                          backgroundColor: isCompleted || isActive ? '#0d9488' : '#ffffff',
                          borderColor: isCompleted || isActive ? '#0d9488' : '#e2e8f0',
                        }}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-sm transition-all duration-350 ${
                          isActive ? 'shadow ring-2 ring-teal-500/10' : ''
                        } ${isCompleted && !isActive ? 'group-hover:ring-2 group-hover:ring-teal-500/50' : ''}`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-white stroke-[2.5]" />
                        ) : (
                          <StepIcon className={`w-4 h-4 transition-colors duration-350 ${isCompleted || isActive ? 'text-white' : 'text-slate-400'}`} />
                        )}
                      </motion.div>
                    </div>

                    {/* Label */}
                    <div className="absolute top-12 text-center whitespace-nowrap">
                      <span className={`text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-350 ${
                        isActive 
                          ? 'text-teal-700 font-bold' 
                          : isCompleted 
                            ? 'text-slate-600 group-hover:text-teal-600' 
                            : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden relative animate-slide-up">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Fingerprint className="w-4 h-4 text-teal-300" />
          <p className="text-slate-400 font-mono text-xs">Secured System Gateway</p>
        </div>
        <p className="text-slate-400 text-[11px] sm:text-xs tracking-wide max-w-xl mx-auto px-4 leading-relaxed">
          &copy; 2026 | Universitas Islam Negeri Maulana Malik Ibrahim Malang & Ascent Premiere Hotel and Convention Malang
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

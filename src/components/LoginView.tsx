import React from 'react';
import { motion } from 'motion/react';
import { 
  Building, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert
} from 'lucide-react';

export interface UserSession {
  username: string;
  name: string;
  role: 'super_admin' | 'logistik' | 'pengawas' | 'marketing' | 'admin_umum';
  roleLabel: string;
}

const DEMO_ACCOUNTS = [
  { username: 'superadmin', password: 'sisper123', name: 'Rizqo', role: 'super_admin' as const, roleLabel: 'Super Admin', color: 'indigo' },
  { username: 'irfan', password: 'irfan1', name: 'Irfan', role: 'logistik' as const, roleLabel: 'Logistik', color: 'emerald' },
  { username: 'risko', password: 'risko2', name: 'Agung Saputra', role: 'pengawas' as const, roleLabel: 'Pengawas', color: 'blue' },
  { username: 'emy', password: 'emy123', name: 'Siti Rahma', role: 'marketing' as const, roleLabel: 'Marketing', color: 'orange' },
  { username: 'fira', password: 'fira321', name: 'Budi Santoso', role: 'admin_umum' as const, roleLabel: 'Admin Umum', color: 'rose' },
];

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Short artificial delay for rich feel
    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === username.toLowerCase().trim() && acc.password === password
      );

      if (match) {
        const session: UserSession = {
          username: match.username,
          name: match.name,
          role: match.role,
          roleLabel: match.roleLabel,
        };
        onLoginSuccess(session);
      } else {
        setError('Username atau password yang Anda masukkan salah.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-tr from-[#ebf3fc] via-[#e2eefa] to-[#f3f8fd] text-slate-800 font-sans flex items-center justify-center p-4">
      
      {/* Decorative Background Blobs for Glassmorphism */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-sky-200/40 opacity-50 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-teal-100/30 opacity-40 blur-[110px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-100/40 opacity-30 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        
        {/* Left Side: App Intro & Branding */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-center lg:text-left p-2 sm:p-4">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 animate-bounce-slow">
              <Building size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none mb-1">
                SISPER<span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[11px] uppercase font-bold text-indigo-500 tracking-widest font-sans">
                Perumahan Sektor Utama
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 tracking-tight leading-tight">
              Akses Portal Multi-Role SISPER
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Sistem informasi pengawasan progres proyek lapangan, pencatatan logistik & material gudang, pipeline marketing, serta operasional dalam genggaman Anda.
            </p>
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Form */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl"
          >
            <div className="mb-6">
              <h3 className="text-xl font-display font-extrabold text-slate-900">Masuk ke Akun Anda</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Masukkan kredensial Anda untuk melanjutkan pekerjaan Anda.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase px-0.5" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    placeholder="Contoh: superadmin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-sm rounded-xl pl-11 pr-4 py-3 bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase px-0.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm rounded-xl pl-11 pr-12 py-3 bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

          </motion.div>

        </div>

      </div>

    </div>
  );
}

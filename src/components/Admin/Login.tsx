import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, LogIn, ArrowRight, UserPlus, Loader2, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import logoLight from '../img/ky_stat_logo-removebg-preview.png';
import logoDark from '../img/logo dark.png';

interface LoginProps {
  onLoginSuccess: (session: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess(data.session);
      } else {
        const { error, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data.user) {
          setMessage({ type: 'success', text: 'Pendaftaran berhasil! Silakan cek email kamu untuk konfirmasi akun admin.' });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-primary/20 blur-[130px] rounded-full animate-pulse opacity-60"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-600/20 blur-[130px] rounded-full animate-pulse delay-1000 opacity-60"></div>

      <div className="w-full max-w-md relative z-10 transition-all">
        {/* Branding */}
        <div className="text-center mb-10 group">
          <div className="inline-flex p-5 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-primary/10 mb-6 border border-slate-100 dark:border-slate-800 transition-all group-hover:scale-110 group-hover:rotate-3 duration-500">
            <img src={logoLight} className="h-10 md:h-12 dark:hidden" alt="Logo" />
            <img src={logoDark} className="h-10 md:h-12 hidden dark:block" alt="Logo" />
          </div>
          <h1 className="text-4xl font-black tracking-tight dark:text-white transition-colors duration-500">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium px-4">
            {isLogin 
              ? 'Silakan masuk untuk mengelola konten dashboard KyyStats.' 
              : 'Daftarkan email kamu untuk mendapatkan akses penuh ke manajemen konten.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[48px] shadow-2xl border border-white dark:border-slate-800 transition-all duration-500">
          {message && (
            <div className={`mb-6 p-4 rounded-3xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100/50 dark:border-green-900/50' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100/50 dark:border-red-900/50'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
              <p className="text-xs font-bold leading-relaxed">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="admin@kyystats.id"
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-sm dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-sm dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group border-2 border-primary/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="tracking-widest uppercase">{isLogin ? 'Log In Now' : 'Join as Admin'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
            className="w-full mt-8 text-center"
          >
            <p className="text-sm text-slate-500 font-medium hover:text-primary transition-colors">
              {isLogin ? 'Belum punya akses?' : 'Sudah punya akses?'}
              <span className="ml-2 text-primary font-black underline underline-offset-8 decoration-2 decoration-primary/30">
                {isLogin ? 'Daftar Sekarang' : 'Log In Saja'}
              </span>
            </p>
          </button>
        </div>

        {/* Fine Print */}
        <p className="text-center mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">
          &copy; 2026 KyyStats Analytical Engine &bull; System Protected
        </p>
      </div>
    </div>
  );
};

export default Login;

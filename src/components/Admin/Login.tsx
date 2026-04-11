import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, UserPlus, ShieldCheck, Loader2, Key, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../HomePage/ThemeToggle';

interface LoginProps {
  onLoginSuccess: (session: any) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (view === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess(data.session);
      } else if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName, role: 'contributor' }
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.' });
        setView('login');
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin?view=reset-password`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Instruksi reset password telah dikirim ke email Anda.' });
        setView('login');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-grid-pattern opacity-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-2xl border border-slate-100 dark:border-slate-800 p-10 relative">
          <div className="absolute top-8 right-8 scale-75">
            <ThemeToggle />
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase italic">
              Kyy<span className="text-primary">Stats</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 italic">
              {view === 'login' ? 'Selamat Datang Kembali' : view === 'signup' ? 'Daftar Kontributor Baru' : 'Reset Kata Sandi'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider ${
                  message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><ShieldCheck size={18} /></span>
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm dark:text-white focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    placeholder="Masukkan nama..."
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Alamat Email</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></span>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm dark:text-white focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Kata Sandi</label>
                    {view === 'login' && (
                        <button 
                            type="button"
                            onClick={() => { setView('forgot-password'); setMessage(null); }}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline italic"
                        >
                            Lupa Kata Sandi?
                        </button>
                    )}
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18} /></span>
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm dark:text-white focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Masuk Sekarang' : view === 'signup' ? 'Daftar Akun' : 'Kirim Link Reset'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 dark:border-slate-800 text-center">
            {view === 'forgot-password' ? (
                 <button 
                    onClick={() => { setView('login'); setMessage(null); }}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 hover:text-primary transition-colors italic w-full"
                >
                    <ArrowLeft size={14} /> Kembali ke Halaman Masuk
                </button>
            ) : (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                {view === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                <button 
                    onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setMessage(null); }}
                    className="ml-2 text-primary hover:underline italic"
                >
                    {view === 'login' ? 'Daftar Disini' : 'Masuk Sekarang'}
                </button>
                </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

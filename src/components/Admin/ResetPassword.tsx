import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, Key, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-4xl p-10 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Sandi Diperbarui!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Kata sandi Anda telah berhasil diubah. <br/> Mengalihkan Anda ke Dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-grid-pattern opacity-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-2xl border border-slate-100 dark:border-slate-800 p-10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Key className="text-primary" size={28} />
          </div>
          
          <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase italic mb-2">Sandi <span className="text-primary">Baru</span></h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10 italic">Masukkan kata sandi baru untuk akun Anda</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Kata Sandi Baru</label>
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

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Konfirmasi Sandi</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Key size={18} /></span>
                <input 
                  required
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm dark:text-white focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Perbarui Kata Sandi
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

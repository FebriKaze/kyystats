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
      setError('Passwords do not match!');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-none p-10 text-center shadow-xl border border-slate-200 font-sans"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-none border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-700" size={32} />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 uppercase tracking-wide mb-3">Password Updated!</h2>
          <p className="text-slate-600 text-xs font-medium uppercase tracking-wider leading-relaxed">
            Your password has been successfully updated. <br/> Redirecting to Dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative font-sans text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md font-sans"
      >
        <div className="bg-white rounded-none shadow-xl border border-slate-200 p-10 text-center font-sans">
          <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center mx-auto mb-6">
            <Key className="text-[#0d2137]" size={24} />
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-slate-900 uppercase tracking-wide mb-2">New Password</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-8">Enter a new password for your account</p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-[#c0392b] rounded-none text-xs font-bold uppercase tracking-wider text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-5 text-left font-sans">
            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">New Password</label>
              <div className="relative font-sans">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={16} /></span>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-xs text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Confirm Password</label>
              <div className="relative font-sans">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></span>
                <input 
                  required
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-xs text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-3.5 bg-[#0d2137] text-white rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-900 active:bg-black transition-colors flex items-center justify-center gap-2 group border border-[#0d2137] shadow-sm font-sans mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Update Password
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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

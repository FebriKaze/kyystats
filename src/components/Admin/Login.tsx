import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, UserPlus, ShieldCheck, Loader2, Key, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import logoLight from '../img/ky_stat_logo.webp';

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
        setMessage({ type: 'success', text: 'Registration successful! Please check your email for verification.' });
        setView('login');
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin?view=reset-password`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset instructions have been sent to your email.' });
        setView('login');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative font-sans text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md font-sans"
      >
        <div className="bg-white rounded-none shadow-xl border border-slate-200 p-10 relative font-sans">
          <div className="text-center mb-8 font-sans">
            <div className="flex justify-center mb-4 font-sans">
               <img 
                 src={logoLight} 
                 alt="KyyStats Logo" 
                 className="h-12 w-auto object-contain"
               />
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1 font-sans">
              {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Register New Contributor' : 'Reset Password'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-none text-xs font-bold uppercase tracking-wider border font-sans ${
                  message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-[#c0392b]'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            {view === 'signup' && (
              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Full Name</label>
                <div className="relative font-sans">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><ShieldCheck size={16} /></span>
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-xs text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors font-medium"
                    placeholder="Enter your name..."
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Email Address</label>
              <div className="relative font-sans">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16} /></span>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-xs text-slate-900 focus:outline-none focus:border-[#0d2137] transition-colors font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center justify-between font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Password</label>
                    {view === 'login' && (
                        <button 
                            type="button"
                            onClick={() => { setView('forgot-password'); setMessage(null); }}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#0d2137] hover:text-[#c0392b] transition-colors"
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
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
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-3.5 bg-[#0d2137] text-white rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-900 active:bg-black transition-colors flex items-center justify-center gap-2 group border border-[#0d2137] shadow-sm font-sans mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center font-sans">
            {view === 'forgot-password' ? (
                 <button 
                    onClick={() => { setView('login'); setMessage(null); }}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-center gap-2 hover:text-[#0d2137] transition-colors w-full"
                >
                    <ArrowLeft size={14} /> Back to Sign In
                </button>
            ) : (
                <p className="text-xs font-medium text-slate-600 font-sans">
                {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                    onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setMessage(null); }}
                    className="ml-2 font-bold text-[#0d2137] hover:text-[#c0392b] transition-colors uppercase tracking-wider text-xs"
                >
                    {view === 'login' ? 'Sign Up Here' : 'Sign In'}
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

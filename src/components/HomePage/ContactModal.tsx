import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState({ name: '', email: '', type: 'Konsultasi', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('contacts').insert([{
        name: formState.name,
        email: formState.email,
        type: formState.type,
        message: formState.message
      }]);

      if (error) throw error;
      
      setIsSuccess(true);
      setFormState({ name: '', email: '', type: 'Konsultasi', message: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
    
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-4xl p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-primary transition-colors p-2">
              <X size={24} />
            </button>

            {isSuccess ? (
              <div className="text-center py-16 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black mb-4 dark:text-white tracking-tighter">Pesan Terkirim!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Terima kasih sudah menghubungi. Kami akan merespons dalam waktu 24 jam.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h3 className="text-4xl font-black tracking-tighter mb-3 dark:text-white">Hubungi Saya</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">Siap mengubah data Anda menjadi insight? Mari bicara.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Nama Lengkap</label>
                      <input
                        required
                        type="text"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white font-medium"
                        placeholder="Nama Anda"
                        value={formState.name}
                        onChange={e => setFormState({...formState, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Alamat Email</label>
                      <input
                        required
                        type="email"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white font-medium"
                        placeholder="emailAnda@company.com"
                        value={formState.email}
                        onChange={e => setFormState({...formState, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Tipe Proyek</label>
                    <div className="relative">
                      <select
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white font-medium appearance-none"
                        value={formState.type}
                        onChange={e => setFormState({...formState, type: e.target.value})}
                      >
                        <option>Konsultasi Data</option>
                        <option>Visualisasi Data</option>
                        <option>Pemodelan Prediktif</option>
                        <option>Analisis Statistik Lengkap</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <motion.div animate={{ y: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↓</motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Pesan / Brief</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none dark:text-white font-medium"
                      placeholder="Ceritakan tantangan data atau kebutuhan proyek Anda..."
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                    />
                  </div>
                  
                  <button
                    disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;

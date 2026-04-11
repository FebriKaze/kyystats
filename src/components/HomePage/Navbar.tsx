import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, LayoutDashboard, LogOut, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import logoLight from '../img/ky_stat_logo.webp';
import logoDark from '../img/logo_dark.webp';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../../lib/supabase';
import SafeImage from '../Common/SafeImage';

interface NavbarProps {
  onContactClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  session?: any;
  userProfile?: any;
}

const Navbar: React.FC<NavbarProps> = ({ onContactClick, onNavigate, currentPage, session, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Artikel', href: '/articles' },
    { name: 'Statistik', href: '/statistik' },
    { name: 'Kontak', href: '#contact' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('/');
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b dark:border-slate-800" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-900 dark:text-white">
        <button onClick={() => onNavigate('/')} className="flex items-center cursor-pointer">
          <img src={logoLight} alt="KY Stat" className="h-8 md:h-10 w-auto object-contain dark:hidden" />
          <img src={logoDark} alt="KY Stat" className="h-8 md:h-10 w-auto object-contain hidden dark:block" />
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                if (link.name === 'Kontak' || link.href.startsWith('#')) {
                  if (currentPage !== 'home') {
                    onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('contact');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  onNavigate(link.href);
                }
              }}
              className={cn(
                "text-sm font-medium transition-colors cursor-pointer",
                currentPage === link.href.replace('/', '') || (currentPage === 'home' && (link.href === '/' || link.href === 'home'))
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
              )}
            >
              {link.name}
            </button>
          ))}
          
          <div className="flex items-center space-x-4 pl-4 border-l border-slate-100 dark:border-slate-800">
            <ThemeToggle />
            
            {session ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all active:scale-95 bg-slate-100 dark:bg-slate-800"
                >
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                      <User size={20} />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selamat Datang,</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userProfile?.full_name || 'Kontributor'}</p>
                        </div>
                        <button 
                          onClick={() => { onNavigate(`author/${userProfile?.id}`); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                        >
                          <User size={18} className="group-hover:text-primary transition-colors" />
                          Profil Saya
                        </button>
                        <button 
                          onClick={() => { onNavigate('admin'); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                        >
                          <LayoutDashboard size={18} className="group-hover:text-primary transition-colors" />
                          Dashboard
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('/admin')}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg shadow-slate-200/50 dark:shadow-none"
              >
                <LogIn size={14} />
                Login
              </button>
            )}

            <button
              onClick={onContactClick}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Hubungi Saya
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button 
            className="p-2 text-slate-600 dark:text-slate-300" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 p-8 flex flex-col space-y-6 md:hidden shadow-2xl overflow-y-auto max-h-[80vh]"
          >
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  setIsOpen(false);
                  if (link.name === 'Kontak' || link.href.startsWith('#')) {
                    if (currentPage !== 'home') {
                      onNavigate('/');
                      setTimeout(() => {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      const el = document.getElementById('contact');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    onNavigate(link.href);
                  }
                }}
                className={cn(
                  "text-lg font-medium text-left",
                  currentPage === link.href.replace('/', '') || (currentPage === 'home' && (link.href === '/' || link.href === 'home'))
                    ? "text-primary"
                    : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
                )}
              >
                {link.name}
              </button>
            ))}
            
            {session ? (
               <button 
                onClick={() => { onNavigate('/admin'); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-3xl font-bold"
              >
                <LayoutDashboard size={20} />
                Dashboard Admin
              </button>
            ) : (
              <button 
                onClick={() => { onNavigate('/admin'); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-3xl font-bold"
              >
                <LogIn size={20} />
                Login Admin
              </button>
            )}

            <button
              onClick={() => { onContactClick(); setIsOpen(false); }}
              className="bg-primary text-white px-6 py-4 rounded-3xl font-semibold text-center mt-2 shadow-lg shadow-primary/20"
            >
              Hubungi Saya
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import logoDark from '../img/logo_dark.webp';
import { supabase } from '../../lib/supabase';
import ProfileAvatar from '../Common/ProfileAvatar';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  session?: any;
  userProfile?: any;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, session, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Articles', href: '/articles' },
    { name: 'Data', href: '/data' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('/');
  };

  const isActive = (href: string) => {
    if (href === '/') return currentPage === 'home' || currentPage === '';
    return currentPage.startsWith(href.replace('/', ''));
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0d2137] shadow-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <button onClick={() => onNavigate('/')} className="flex items-center cursor-pointer shrink-0">
          <img src={logoDark} alt="KYY Stats" className="h-8 md:h-10 w-auto object-contain" />
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => onNavigate(link.href)}
              className={cn(
                "text-sm font-medium transition-colors cursor-pointer",
                isActive(link.href)
                  ? "text-white font-bold"
                  : "text-white/75 hover:text-white"
              )}
            >
              {link.name}
            </button>
          ))}
          
          {/* Admin profile dropdown — only when logged in */}
          {session && (
            <div className="relative pl-4 border-l border-white/20">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 overflow-hidden rounded-full border-2 border-white/20 hover:border-white/50 transition-all"
              >
                <ProfileAvatar
                  src={userProfile?.avatar_url}
                  alt={userProfile?.full_name || 'Profile'}
                  className="h-full w-full rounded-full"
                  iconSize={18}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-3 w-52 bg-white shadow-xl border border-slate-200 p-2 z-20"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{userProfile?.full_name || 'Admin'}</p>
                      </div>
                      <button 
                        onClick={() => { onNavigate(`author/${userProfile?.id}`); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <User size={15} /> My Profile
                      </button>
                      <button 
                        onClick={() => { onNavigate('admin'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="p-2 text-white md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Popular Topics Secondary Bar */}
      <div className="hidden md:block border-t border-white/10 bg-[#0d2137]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-1 overflow-x-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 shrink-0 mr-3">POPULAR PAGES</span>
          {['Poverty', 'Child Mortality', 'Global Education', 'CO₂ Emissions', 'Migration', 'Economy', 'Life Expectancy', 'Population Growth', 'Artificial Intelligence'].map((topic) => (
            <button
              key={topic}
              onClick={() => onNavigate(`/articles?filter=${encodeURIComponent(topic)}`)}
              className="shrink-0 text-[11px] font-medium text-white/65 hover:text-white whitespace-nowrap px-3 py-1 hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-[#0d2137] border-t border-white/10 p-6 flex flex-col space-y-4 md:hidden shadow-xl"
          >
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => { setIsOpen(false); onNavigate(link.href); }}
                className={cn(
                  "text-base font-medium text-left py-1",
                  isActive(link.href) ? "text-white font-bold" : "text-white/70 hover:text-white"
                )}
              >
                {link.name}
              </button>
            ))}
            
            {session && (
              <>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <button 
                    onClick={() => { onNavigate('admin'); setIsOpen(false); }}
                    className="w-full flex items-center gap-2 text-sm text-white/70 hover:text-white py-2"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-2 text-sm text-red-400 py-2"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

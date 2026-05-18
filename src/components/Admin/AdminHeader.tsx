import React, { useState, useEffect } from 'react';
import { ChevronDown, Bell, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ProfileAvatar from '../Common/ProfileAvatar';
import logoLight from '../img/ky_stat_logo.webp';

interface AdminHeaderProps {
  onNavigate: (view: any) => void;
  activeView: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onNavigate, activeView }) => {
  const [isKontenOpen, setIsKontenOpen] = useState(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
        else setProfile({ full_name: user.email?.split('@')[0], role: 'contributor' });
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src={logoLight} className="h-8" alt="KyyStats" />
            <span className="text-xl font-serif font-bold tracking-tight text-slate-900">CMS</span>
          </div>

          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-700 hover:text-[#c0392b] transition-colors flex items-center gap-2 border border-slate-200 uppercase tracking-widest"
          >
            ← View Website
          </button>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-sm font-bold transition-colors ${activeView === 'home' ? 'text-[#0d2137]' : 'text-slate-500 hover:text-[#0d2137]'}`}
            >
              Home
            </button>

            <div 
              className="relative py-4"
              onMouseEnter={() => setIsKontenOpen(true)}
              onMouseLeave={() => setIsKontenOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${['manage-articles', 'manage-statistics', 'manage-portfolio'].includes(activeView) ? 'text-[#0d2137]' : 'text-slate-500 hover:text-[#0d2137]'}`}
              >
                Content <ChevronDown size={16} />
              </button>
              
              <AnimatePresence>
                {isKontenOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 shadow-lg py-2 z-50 font-sans"
                  >
                    <button onClick={() => { onNavigate('manage-articles'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#c0392b] transition-colors rounded-none">Articles</button>
                    <button onClick={() => { onNavigate('manage-statistics'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#c0392b] transition-colors rounded-none">Statistics</button>
                    <button onClick={() => { onNavigate('manage-portfolio'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#c0392b] transition-colors rounded-none">Portfolio</button>
                    <button onClick={() => { onNavigate('manage-featured'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#c0392b] transition-colors rounded-none">Project Archive</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              className="relative py-4"
              onMouseEnter={() => setIsPengaturanOpen(true)}
              onMouseLeave={() => setIsPengaturanOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${['profile', 'manage-users'].includes(activeView) ? 'text-[#0d2137]' : 'text-slate-500 hover:text-[#0d2137]'}`}
              >
                Settings <ChevronDown size={16} />
              </button>
              
              <AnimatePresence>
                {isPengaturanOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-0 w-56 bg-white border border-slate-200 shadow-lg py-2 z-50 font-sans"
                  >
                    <button onClick={() => { onNavigate('profile'); setIsPengaturanOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#c0392b] transition-colors rounded-none">My Profile</button>
                    {profile?.role === 'owner' && (
                      <button 
                        onClick={() => { onNavigate('manage-users'); setIsPengaturanOpen(false); }} 
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#0d2137] hover:bg-slate-50 hover:text-[#c0392b] transition-colors border-t border-slate-200 mt-1 rounded-none"
                      >
                        Manage Users
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-6 font-sans">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="text-slate-400 hover:text-[#0d2137] transition-colors relative p-1"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#c0392b] rounded-full border border-white"></span>
            </button>
          </div>
          
          <div className="relative font-sans">
            <div 
              className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right hidden sm:block font-sans">
                <p className="text-xs font-bold text-slate-900 uppercase line-clamp-1 max-w-[120px]">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-[9px] font-bold text-[#c0392b] uppercase tracking-widest mt-0.5 font-sans">
                  {profile?.role === 'owner' ? 'Owner Account' : 'Contributor'}
                </p>
              </div>
              <ProfileAvatar
                src={profile?.avatar_url}
                alt={profile?.full_name || 'Admin'}
                className="h-10 w-10 rounded-none border border-slate-200 group-hover:border-[#0d2137]"
                iconSize={20}
              />
            </div>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg py-2 z-50 font-sans">
                <button onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0d2137] transition-colors flex items-center gap-2 rounded-none">
                  <User size={16} /> Profile
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#c0392b] hover:bg-rose-50 transition-colors flex items-center gap-2 rounded-none">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

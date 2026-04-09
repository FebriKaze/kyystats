import React, { useState, useEffect } from 'react';
import { ChevronDown, Bell, User, LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import logoLight from '../img/ky_stat_logo-removebg-preview.png';
import logoDark from '../img/logo dark.png';
import { ThemeToggle } from '../HomePage/ThemeToggle';

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
        else setProfile({ full_name: user.email?.split('@')[0] });
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src={logoLight} className="h-8 dark:hidden" alt="" />
            <img src={logoDark} className="h-8 hidden dark:block" alt="" />
            <span className="text-xl font-black tracking-tighter dark:text-white">Dashboard</span>
          </div>

          {/* Main Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-sm font-bold transition-colors ${activeView === 'home' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
            >
              Beranda
            </button>

            <div className="relative">
              <button 
                onMouseEnter={() => { setIsKontenOpen(true); setIsPengaturanOpen(false); }}
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${activeView.startsWith('manage-') ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
              >
                Konten <ChevronDown size={16} />
              </button>
              
              {isKontenOpen && (
                <div 
                  onMouseLeave={() => setIsKontenOpen(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-2 overflow-hidden"
                >
                  <button onClick={() => { onNavigate('manage-articles'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all">Artikel</button>
                  <button onClick={() => { onNavigate('manage-portfolio'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all">Portfolio</button>
                  <button onClick={() => { onNavigate('manage-statistics'); setIsKontenOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all">Statistik</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onMouseEnter={() => { setIsKontenOpen(false); setIsPengaturanOpen(true); }}
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${activeView === 'profile' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
              >
                Pengaturan <ChevronDown size={16} />
              </button>
              
              {isPengaturanOpen && (
                <div 
                  onMouseLeave={() => setIsPengaturanOpen(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-2 overflow-hidden"
                >
                  <button onClick={() => { onNavigate('profile'); setIsPengaturanOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all">Profil Saya</button>
                  <button onClick={() => { onNavigate('settings'); setIsPengaturanOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all">Sistem</button>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="text-slate-400 hover:text-primary transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            {isNotifOpen && (
              <div 
                className="absolute top-full right-[-50px] mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsNotifOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                  <p className="text-xs font-black dark:text-white">Notifikasi</p>
                </div>
                <div className="px-4 py-4 text-center">
                  <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Belum ada notifikasi baru.</p>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Saran: Menu ini bisa dihubungkan untuk notifikasi komentar, pesan contact, atau alert sistem.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div 
              className="flex items-center gap-3 pl-6 border-l border-slate-100 dark:border-slate-800 cursor-pointer group"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black dark:text-white uppercase line-clamp-1 max-w-[120px]">
                  {profile?.full_name || 'ADMIN USER'}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-primary transition-color">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
            </div>

            {isProfileOpen && (
              <div 
                className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-3 overflow-hidden animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                  <p className="text-xs font-black dark:text-white line-clamp-1">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{profile?.email || 'admin@kyystats.id'}</p>
                </div>
                <button 
                  onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <User size={16} /> Profil Saya
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                  <Settings size={16} /> Pengaturan
                </button>
                <div className="h-px bg-slate-50 dark:bg-slate-800 my-2"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                >
                  <LogOut size={16} /> Keluar
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

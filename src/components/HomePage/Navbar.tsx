import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import logoLight from '../img/ky_stat_logo-removebg-preview.webp';
import logoDark from '../img/logo dark.webp';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onContactClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onContactClick, onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: 'home' },
    { name: 'Portfolio', href: 'portfolio' },
    { name: 'Artikel', href: 'articles' },
    { name: 'Statistik', href: 'statistik' },
    { name: 'Kontak', href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b dark:border-slate-800" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-900 dark:text-white">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex items-center">
          <img src={logoLight} alt="KY Stat" className="h-8 md:h-10 w-auto object-contain dark:hidden" />
          <img src={logoDark} alt="KY Stat" className="h-8 md:h-10 w-auto object-contain hidden dark:block" />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                if (link.name === 'Contact') {
                  onContactClick();
                } else if (link.href.startsWith('#')) {
                  if (currentPage !== 'home') onNavigate('home');
                  setTimeout(() => {
                    window.location.hash = link.href;
                  }, 100);
                } else {
                  onNavigate(link.href);
                }
              }}
              className={cn(
                "text-sm font-medium transition-colors cursor-pointer",
                currentPage === link.href || (currentPage === 'home' && link.href === 'home')
                  ? "text-primary"
                  : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
              )}
            >
              {link.name}
            </button>
          ))}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={onContactClick}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
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
                  if (link.name === 'Contact') {
                    onContactClick();
                  } else if (link.href.startsWith('#')) {
                    if (currentPage !== 'home') onNavigate('home');
                    setTimeout(() => {
                      window.location.hash = link.href;
                    }, 100);
                  } else {
                    onNavigate(link.href);
                  }
                }}
                className={cn(
                  "text-lg font-medium text-left",
                  currentPage === link.href || (currentPage === 'home' && link.href === 'home')
                    ? "text-primary"
                    : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
                )}
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => { onContactClick(); setIsOpen(false); }}
              className="bg-primary text-white px-6 py-3 rounded-full font-semibold text-center mt-2 shadow-lg shadow-primary/20"
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

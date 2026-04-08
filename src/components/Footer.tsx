import React from 'react';
import { Linkedin, Github, BookOpen, Mail } from 'lucide-react';
import logoLight from './img/ky_stat_logo-removebg-preview.png';
import logoDark from './img/logo dark.png';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950" id="contact">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src={logoLight} alt="KY Stat" className="h-10 w-auto mb-2 dark:hidden" />
          <img src={logoDark} alt="KY Stat" className="h-10 w-auto mb-2 hidden dark:block" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            © 2026 KYY STATS. PRECISION THROUGH DATA.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          {[
            { icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/febrikaze/', label: 'LinkedIn' },
            { icon: <Github size={20} />, href: 'https://github.com/FebriKaze', label: 'GitHub' },
            { icon: <BookOpen size={20} />, href: 'https://medium.com/@jakartahero58', label: 'Medium' },
            { icon: <Mail size={20} />, href: 'mailto:jakartahero58@gmail.com', label: 'Email' },
          ].map((social, i) => (
            <a 
              key={i} 
              href={social.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={social.label}
              className="text-slate-400 hover:text-primary transition-colors p-2"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Linkedin, Github, BookOpen, Mail, ArrowRight } from 'lucide-react';
import logoDark from '../img/logo_dark.webp';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles' },
    { name: 'Data', href: '/data' },
    { name: 'Portfolio', href: '/portfolio' },
  ];

  const socials = [
    { icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/in/febrikaze/', label: 'LinkedIn' },
    { icon: <Github size={18} />, href: 'https://github.com/FebriKaze', label: 'GitHub' },
    { icon: <BookOpen size={18} />, href: 'https://medium.com/@jakartahero58', label: 'Medium' },
    { icon: <Mail size={18} />, href: 'mailto:jakartahero58@gmail.com', label: 'Email' },
  ];

  return (
    <footer className="bg-[#0d2137] text-white border-t-4 border-[#c0392b]" id="contact">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <img src={logoDark} alt="KY Stat" className="h-9 w-auto mb-4" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Research and data to make progress. Open access, freely available for everyone.
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:mx-auto">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 md:text-center">Navigation</h4>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
              {navLinks.map(link => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1 group cursor-pointer"
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all text-[#c0392b]" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="md:text-right md:flex md:flex-col md:items-end">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Connect</h4>
            <div className="flex gap-3 flex-wrap md:justify-end">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="p-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors cursor-pointer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-4">jakartahero58@gmail.com</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[11px] text-white/30 uppercase tracking-widest">
            © 2026 KYY Stats · Precision Through Data
          </p>
          <p className="text-[11px] text-white/30">
            All data is open access and openly licensed
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

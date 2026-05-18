import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BarChart3, FileText, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative pt-36 pb-16 md:pt-44 md:pb-20 bg-[#0d2137] text-white w-full border-b-4 border-[#c0392b] overflow-hidden">
      
      {/* === BACKGROUND: Subtle data grid + dot scatter === */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Horizontal grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
          <div key={i} className="absolute w-full h-px bg-white/4" style={{ top: `${y * 100}%` }} />
        ))}
        {/* Vertical grid lines */}
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((x, i) => (
          <div key={i} className="absolute h-full w-px bg-white/4" style={{ left: `${x * 100}%` }} />
        ))}
        {/* Scatter dots — simulating data points on a world projection */}
        {[
          { x: 12, y: 30 }, { x: 18, y: 45 }, { x: 22, y: 28 }, { x: 28, y: 55 },
          { x: 35, y: 35 }, { x: 42, y: 22 }, { x: 48, y: 40 }, { x: 52, y: 60 },
          { x: 55, y: 30 }, { x: 60, y: 48 }, { x: 65, y: 35 }, { x: 70, y: 25 },
          { x: 75, y: 50 }, { x: 80, y: 38 }, { x: 85, y: 62 }, { x: 90, y: 30 },
          { x: 25, y: 70 }, { x: 38, y: 75 }, { x: 30, y: 80 }, { x: 45, y: 72 },
          { x: 62, y: 65 }, { x: 72, y: 72 }, { x: 82, y: 68 },
          { x: 8, y: 55 }, { x: 15, y: 62 }, { x: 95, y: 45 }, { x: 5, y: 40 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: i % 5 === 0 ? '5px' : i % 3 === 0 ? '4px' : '3px',
              height: i % 5 === 0 ? '5px' : i % 3 === 0 ? '4px' : '3px',
            }}
          />
        ))}
        {/* Curved connecting lines (suggest data connections) */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <path d="M 120 300 Q 400 150 680 380" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M 300 420 Q 600 200 900 350" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M 800 280 Q 1100 450 1400 300" stroke="white" strokeWidth="1" fill="none" />
          <path d="M 200 200 Q 500 350 750 250" stroke="white" strokeWidth="1" fill="none" />
          <path d="M 900 200 Q 1200 350 1500 220" stroke="white" strokeWidth="1" fill="none" />
        </svg>
        {/* Radial glow in center */}
        <div className="absolute inset-0 bg-radial-[ellipse_60%_50%_at_50%_50%] from-[#1a3a5c]/60 via-transparent to-transparent" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-[#0d2137] to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 text-center z-10 relative">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-snug md:leading-tight mb-4 max-w-3xl mx-auto"
        >
          Research and data to make progress against the world's largest problems.
        </motion.h1>

        <motion.a
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#e8a87c] hover:text-[#f0c090] mb-8 transition-colors"
        >
          Read about our mission <ArrowRight size={13} />
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <form onSubmit={handleSearch} className="relative flex items-center shadow-2xl">
            <input 
              type="text" 
              placeholder='Search for a topic, article, or dataset...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 py-3.5 pl-5 pr-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#c0392b] placeholder-slate-400 font-sans rounded-none"
            />
            <button type="submit" className="absolute right-4 text-slate-400 hover:text-slate-700 transition-colors">
              <Search size={20} />
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2.5 text-xs"
        >
          <button onClick={() => navigate('/data')} className="flex items-center gap-1.5 px-4 py-1.5 border border-white/20 bg-white/5 hover:bg-white/15 text-white/80 transition-colors">
            <BarChart3 size={12} /> Data Explorer
          </button>
          <button onClick={() => navigate('/articles')} className="flex items-center gap-1.5 px-4 py-1.5 border border-white/20 bg-white/5 hover:bg-white/15 text-white/80 transition-colors">
            <FileText size={12} /> Browse Articles
          </button>
          <div className="flex items-center gap-1.5 px-4 py-1.5 border border-white/20 bg-white/5 text-white/60">
            <Globe size={12} /> Open access
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-5 text-[11px] text-white/35 tracking-wide"
        >
          All freely available — open access and openly licensed
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;

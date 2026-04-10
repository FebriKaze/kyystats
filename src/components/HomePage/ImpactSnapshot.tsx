import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, Palette, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedProject } from '../../types';
import taxImage from '../img/Pendapatan Pajak Negara.webp';

interface ImpactSnapshotProps {
  projects: FeaturedProject[];
}

const ImpactSnapshot: React.FC<ImpactSnapshotProps> = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const fallbackProject: FeaturedProject = {
    id: '1',
    title: 'National Tax Revenue Analysis (2014-2024)',
    description: 'A decade-long study on national fiscal growth and tax collection efficiency, highlighting a massive surge in domestic revenue.',
    image_url: taxImage,
    tags: ['PYTHON', 'SQL', 'LOOKER'],
    impact_val: '92.5%',
    impact_desc: 'Surge in tax revenue over the last decade',
    highlight_y: '2022',
    hightlight_desc: 'Highest year-over-year growth recorded',
    image_label: '10 Tahun Terakhir'
  };

  const data = projects && projects.length > 0 ? projects : [fallbackProject];
  const currentProject = data[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  }, [data.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && data.length > 1) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, data.length]);

  return (
    <section className="py-24 px-6 bg-(--secondary-bg) transition-colors duration-300" id="experience">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter dark:text-white">Impact Snapshot</h2>
            <div className="w-12 h-1.5 bg-primary rounded-full" />
          </div>
          
          {data.length > 1 && (
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button 
                onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
                aria-label="Previous slide"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {data.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); }}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-3 rounded-full transition-all flex items-center justify-center p-1 ${
                      currentIndex === i ? 'w-8 bg-primary' : 'w-3 bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className="sr-only">Slide {i + 1}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
                aria-label="Next slide"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Featured Analysis Slide */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] md:min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProject.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 md:p-10 flex flex-col h-full"
              >
                <div className="flex-1">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-4 block">Featured Infographic</span>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4 dark:text-white leading-tight">{currentProject.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-xl mb-6 leading-relaxed">
                    {currentProject.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {currentProject.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="relative mt-8 group">
                  <div className="relative w-fit mx-auto overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl">
                    <div className="absolute top-3 right-3 z-10 bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                      {currentProject.image_label}
                    </div>
                    <img 
                      src={currentProject.image_url} 
                      alt={currentProject.title} 
                      className="h-[300px] sm:h-[450px] w-auto object-contain block"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary/20"
            >
              <h3 className="text-xl font-bold mb-2">Tools & Tech</h3>
              <p className="text-primary-foreground/70 text-sm mb-8">The engine behind the insights.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'PYTHON', icon: <Terminal size={24} /> },
                  { name: 'SQL', icon: <Database size={24} /> },
                  { name: 'CANVA', icon: <Palette size={24} /> },
                  { name: 'LOOKER', icon: <TrendingUp size={24} /> },
                ].map((tool) => (
                  <div key={tool.name} className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                    {tool.icon}
                    <span className="text-[10px] font-bold tracking-widest">{tool.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Impact Metrics Card - Simplified to fix rendering */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col justify-center min-h-[350px]">
              <div className="flex items-center gap-2 text-primary mb-10">
                <TrendingUp size={24} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Impact</h3>
              </div>
              <div className="space-y-12">
                <div className="flex flex-col gap-2">
                  <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                     {currentProject.impact_val || '—'}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    {currentProject.impact_desc}
                  </div>
                </div>
                <div className="h-px bg-slate-100 dark:border-slate-800 w-full" />
                <div className="flex flex-col gap-2">
                  <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {currentProject.highlight_y || '—'}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    {currentProject.hightlight_desc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSnapshot;

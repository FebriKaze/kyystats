import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Database, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import taxImage from './img/Pendapatan Pajak Negara.jpg';

const ImpactSnapshot: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-(--secondary-bg) transition-colors duration-300" id="experience">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 dark:text-white">Impact Snapshot</h2>
          <div className="w-12 h-1.5 bg-primary rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Featured Analysis */}
          <motion.div
            whileHover={{ y: -5 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-4 block">Featured Infographic</span>
              <h3 className="text-3xl font-black tracking-tight mb-4 dark:text-white">National Tax Revenue Analysis (2014-2024)</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                A decade-long study on national fiscal growth and tax collection efficiency, highlighting a massive surge in domestic revenue.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['PYTHON', 'SQL', 'LOOKER'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="relative w-fit max-w-full mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 mt-2 group">
              <img 
                src={taxImage} 
                alt="National Tax Revenue Analysis" 
                className="max-h-[400px] w-auto object-contain block shadow-inner dark:opacity-90"
              />
              {/* Highlight Label for 2022 */}
              <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                10 Tahun Terakhir
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            {/* Tools & Tech */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary/20"
              id="stack"
            >
              <h3 className="text-xl font-bold mb-2">Tools & Tech</h3>
              <p className="text-primary-foreground/70 text-sm mb-8">The engine behind the insights.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'PYTHON', icon: <Terminal size={24} /> },
                  { name: 'SQL', icon: <Database size={24} /> },
                  { name: 'TABLEAU', icon: <BarChart3 size={24} /> },
                  { name: 'LOOKER', icon: <TrendingUp size={24} /> },
                ].map((tool) => (
                  <div key={tool.name} className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                    {tool.icon}
                    <span className="text-[10px] font-bold tracking-widest">{tool.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Impact Metrics */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex-1"
            >
              <div className="flex items-center gap-2 text-primary mb-6">
                <TrendingUp size={24} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Impact</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">92.5%</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-snug">Surge in tax revenue over the last decade</div>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800" />
                <div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">2022</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-snug">Highest year-over-year growth recorded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSnapshot;

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-20 dark:opacity-10" />
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-8"
        >
          <TrendingUp size={14} className="text-primary" />
          Data Storytelling Specialist
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-8"
        >
          Turning Raw Data into <br />
          <span className="text-gradient">Business Growth</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Specializing in descriptive analytics and predictive modeling to help high-growth companies optimize logistics, reduce churn, and scale operations with precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all active:scale-95"
          >
            View Portfolio <ArrowDown size={18} />
          </a>
          <a
            href="#experience"
            className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Case Studies
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

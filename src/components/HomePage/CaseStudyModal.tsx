import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { Project } from '../../types';

interface CaseStudyModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 text-white bg-slate-900/20 hover:bg-slate-900/40 p-2 rounded-full backdrop-blur-md transition-all">
              <X size={24} />
            </button>

            <div className="aspect-video w-full relative">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent flex items-end p-8 md:p-12">
                <div className="text-white">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-80 mb-2 block">{project.category}</span>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter">{project.title}</h3>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-10">
              {/* Lead Text Style */}
              <div className="text-xl font-black text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-4 border-primary pl-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-2xl mb-10">
                {project.description}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <section>
                    <h4 className="text-lg font-black tracking-tight mb-3 flex items-center gap-2 dark:text-white">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      The Challenge
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.details.challenge}</p>
                  </section>
                  <section>
                    <h4 className="text-lg font-black tracking-tight mb-3 flex items-center gap-2 dark:text-white">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      The Solution
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{project.details.solution}</p>
                  </section>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 h-fit">
                  <h4 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2 dark:text-white">
                    <TrendingUp size={20} className="text-primary" />
                    Key Result
                  </h4>
                  <p className="text-primary font-bold text-lg leading-snug">{project.details.result}</p>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:opacity-90 transition-all"
                >
                  Close Case Study
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CaseStudyModal;

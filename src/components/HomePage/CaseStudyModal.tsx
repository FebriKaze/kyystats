import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, ArrowLeft } from 'lucide-react';
import { Project } from '../../types';

interface CaseStudyModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  isPage?: boolean;
}

const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, isOpen, onClose, isPage }) => {
  useEffect(() => {
    if (!isPage && isOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose, isPage]);

  if (!project) return null;

  if (isPage) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <button onClick={onClose} className="mb-8 flex items-center gap-1.5 text-slate-500 text-sm hover:text-[#0d2137] transition-colors">
            <ArrowLeft size={16} /> Back to Portfolio
          </button>

          <div className="border-b-2 border-slate-900 pb-8 mb-10">
            <span className="text-[10px] font-black tracking-widest uppercase text-[#c0392b] mb-2 block">{project.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">{project.title}</h1>
          </div>

          <div className="aspect-video w-full mb-12 border border-slate-200 bg-slate-50">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-12">
            <div className="text-xl font-serif text-slate-800 leading-relaxed border-l-4 border-[#0d2137] pl-6 py-2">
              {project.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-10">
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">The Challenge</h2>
                  <p className="text-slate-600 leading-relaxed">{project.details.challenge}</p>
                </section>
                <section>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">The Solution</h2>
                  <p className="text-slate-600 leading-relaxed">{project.details.solution}</p>
                </section>
              </div>
              <div className="border-2 border-[#c0392b] bg-slate-50 p-6 h-fit">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#c0392b] mb-3 flex items-center gap-1.5">
                  <TrendingUp size={16} /> Key Result
                </h3>
                <p className="text-slate-900 font-bold text-xl font-serif leading-snug">{project.details.result}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-none overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-6 right-6 z-10 text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 p-2.5 transition-all">
              <X size={20} />
            </button>

            <div className="aspect-video w-full relative bg-slate-50 border-b border-slate-200">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-8 md:p-12">
                <div className="text-white">
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#c0392b] mb-2 block">{project.category}</span>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">{project.title}</h3>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-10">
              <div className="text-lg font-serif text-slate-800 leading-relaxed border-l-4 border-[#0d2137] pl-6 py-2">
                {project.description}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <section>
                    <h4 className="text-lg font-serif font-bold text-slate-900 mb-2 pb-2 border-b border-slate-200">The Challenge</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{project.details.challenge}</p>
                  </section>
                  <section>
                    <h4 className="text-lg font-serif font-bold text-slate-900 mb-2 pb-2 border-b border-slate-200">The Solution</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{project.details.solution}</p>
                  </section>
                </div>
                <div className="border-2 border-[#c0392b] bg-slate-50 p-6 h-fit">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#c0392b] mb-3 flex items-center gap-1.5">
                    <TrendingUp size={16} /> Key Result
                  </h4>
                  <p className="text-slate-900 font-bold text-lg font-serif leading-snug">{project.details.result}</p>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-200 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#0d2137] text-white font-bold hover:bg-[#0a1b32] transition-all text-sm"
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

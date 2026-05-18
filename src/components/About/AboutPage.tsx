import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Target, Users, Database, Award, ArrowUpRight, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { usePageView } from '../../hooks/usePageView';
import SafeImage from '../Common/SafeImage';

interface AboutPageProps {
  onNavigate?: (path: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  usePageView({ pageType: 'about', pageTitle: 'About Us' });

  const pillars = [
    {
      icon: <Database className="text-[#c0392b]" size={28} />,
      title: "Rigorous Empiricism",
      description: "Every analysis, chart, and report is built upon verified empirical datasets from world-renowned statistical agencies, research institutes, and academic publications."
    },
    {
      icon: <Eye className="text-[#c0392b]" size={28} />,
      title: "Interactive Intelligence",
      description: "We transform static numbers into dynamic, interactive visualisations. Our data explorers allow readers to interrogate the metrics and uncover underlying trends."
    },
    {
      icon: <Users className="text-[#c0392b]" size={28} />,
      title: "Open Access for All",
      description: "We believe fundamental knowledge about our world's largest challenges should not be paywalled. All our published research is open access and freely shareable."
    },
    {
      icon: <ShieldCheck className="text-[#c0392b]" size={28} />,
      title: "Uncompromising Precision",
      description: "Analytical integrity is our highest priority. We thoroughly document our data sources, methodologies, and calculations to ensure complete transparency."
    }
  ];

  const milestones = [
    { year: "2026", title: "Platform Launch", desc: "KyyStats debuted as an integrated data science and analytical journalism hub." },
    { year: "150+ Datasets", title: "Visualisation Archive", desc: "Curated interactive charts covering global demographics, economy, and CO₂ emissions." },
    { year: "Open Source", title: "Public Repository", desc: "Committed to open data practices with transparent codebases and reproducible models." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Hero Header */}
      <div className="bg-[#0d2137] text-white pt-36 pb-24 px-6 border-b-4 border-[#c0392b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-widest text-[#c0392b] bg-white/10 px-3 py-1 inline-block mb-6"
          >
            Mission & Vision
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight leading-tight mb-6"
          >
            Precision Through Data.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto font-sans"
          >
            KyyStats is an empirical research initiative dedicated to unlocking complex global realities. We bridge the gap between raw statistical datasets and public understanding through rigorous data science and interactive storytelling.
          </motion.p>
        </div>
      </div>

      {/* The Story / Editorial Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6 font-sans">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c0392b] block">Our Philosophy</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-snug">
              Why empirical clarity matters in an era of information overload.
            </h2>
            <div className="text-slate-600 space-y-4 text-base leading-relaxed font-sans">
              <p>
                In today's fast-paced digital landscape, critical decisions and public discourse are too often driven by fragmented headlines and emotional narratives. At KyyStats, we operate on a fundamental principle: <strong className="text-slate-900 font-bold font-serif">true progress requires objective measurement.</strong>
              </p>
              <p>
                Whether examining macroeconomic shifts, demographic transitions, or environmental sustainability, our objective is to provide a reliable baseline of factual evidence. By synthesizing massive international databases into clear, intuitive visual dashboards, we empower researchers, journalists, and policy makers to see the overarching trajectory of human development.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-8 sm:p-12 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0d2137]/5 border-l border-b border-slate-200 pointer-events-none flex items-center justify-center">
              <Target className="text-slate-300" size={36} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">Editorial & Data Standards</h3>
            <ul className="space-y-4 text-sm font-sans text-slate-700">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] mt-2 shrink-0" />
                <span><strong>Primary Sources Only:</strong> We exclusively ingest data from official census bureaus, multilateral organizations (UN, World Bank, IMF), and peer-reviewed journals.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] mt-2 shrink-0" />
                <span><strong>Reproducible Workflows:</strong> Scripts for data cleaning and transformation are standardized to eliminate manual calculation errors.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] mt-2 shrink-0" />
                <span><strong>Living Datasets:</strong> Our interactive charts are continuously updated as new empirical figures become publicly available.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="bg-slate-50 border-y border-slate-200 py-20 lg:py-28 font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c0392b] block mb-2">Pillars of Excellence</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Built on integrity, transparency, and accessible design.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-slate-200 p-8 hover:border-[#0d2137] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-slate-50 border border-slate-200 w-fit mb-6 group-hover:bg-[#0d2137] group-hover:text-white group-hover:border-[#0d2137] transition-colors">
                    {pillar.icon}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 mb-3">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Founder / Team */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 font-sans">
        <div className="bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-5 bg-[#0d2137] p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32 pointer-events-none"></div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#c0392b] block mb-2">Founder & Lead Researcher</span>
                <h3 className="text-3xl font-serif font-bold text-white mb-1">Febri Rizky</h3>
                <p className="text-xs text-slate-400 font-mono mb-6">Data Analyst</p>
                <p className="text-sm text-white/80 leading-relaxed mb-8 font-sans">
                  Combining deep expertise in full-stack software architecture with rigorous quantitative research, I founded KyyStats to democratize complex statistical insights. Dedicated to building elegant, high-performance web systems that empower public understanding.
                </p>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <a 
                  href="https://www.linkedin.com/in/febrikaze/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 border border-white/20 hover:bg-white hover:text-[#0d2137] transition-colors text-white/80"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a 
                  href="https://github.com/FebriKaze" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 border border-white/20 hover:bg-white hover:text-[#0d2137] transition-colors text-white/80"
                  aria-label="GitHub"
                >
                  <Github size={18} />
                </a>
                <a 
                  href="mailto:jakartahero58@gmail.com" 
                  className="p-2.5 border border-white/20 hover:bg-white hover:text-[#0d2137] transition-colors text-white/80 flex items-center gap-2 text-xs font-bold"
                >
                  <Mail size={18} /> Contact
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center font-sans">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8 font-sans">Milestones & Impact Snapshot</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {milestones.map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 border border-slate-200 border-l-4 border-l-[#0d2137]">
                    <h5 className="text-2xl font-serif font-bold text-slate-900 mb-1">{item.year}</h5>
                    <p className="text-xs font-bold text-[#c0392b] uppercase tracking-wider mb-2">{item.title}</p>
                    <p className="text-xs text-slate-600 font-sans">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div>
                  <p className="text-sm font-bold text-slate-900">Explore Our Data & Publications</p>
                  <p className="text-xs text-slate-500 font-sans">Dive into our latest interactive articles and statistical charts.</p>
                </div>
                {onNavigate && (
                  <button 
                    onClick={() => onNavigate('/articles')}
                    className="flex items-center gap-2 bg-[#0d2137] text-white px-6 py-3 font-bold text-xs hover:bg-[#1a3a5c] transition-colors whitespace-nowrap border border-[#0d2137] rounded-none cursor-pointer"
                  >
                    View Publications <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0d2137] text-white py-20 text-center relative font-sans border-t-2 border-[#c0392b]">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">Collaborate With KyyStats</h2>
          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto font-sans">
            Are you an academic researcher, journalist, or policy advocate? We welcome partnerships to visualize complex datasets and co-publish empirical insights.
          </p>
          <a 
            href="mailto:jakartahero58@gmail.com"
            className="inline-flex items-center gap-2 bg-[#c0392b] text-white px-8 py-4 font-bold text-xs uppercase tracking-wider hover:bg-rose-900 transition-colors border border-[#c0392b] rounded-none cursor-pointer"
          >
            Get In Touch <Mail size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

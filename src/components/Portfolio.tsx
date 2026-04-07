import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, ArrowRight } from 'lucide-react';
import { Project } from '../types';
import project1 from './img/1.jpg';
import projectPengangguran from './img/Pengangguran Indonesia 2025.jpg';
import projectTrackRecord from './img/TrackRecord MG.jpg';

interface PortfolioProps {
  onProjectClick: (project: Project) => void;
  onBackToHome: () => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onProjectClick, onBackToHome }) => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const projects: Project[] = [
    {
      category: 'KEMISKINAN',
      title: 'Papua jadi Provinsi dengan Kemiskinan Tertinggi',
      description: 'Papua Tengah mencatatkan persentase kemiskinan tertinggi di Indonesia.',
      image: project1,
      details: {
        challenge: "Data terbaru menunjukkan tantangan besar bagi wilayah Timur Indonesia. Berdasarkan angka BPS, Papua Tengah mencatatkan persentase kemiskinan tertinggi mencapai 29,5%.",
        solution: "Implemented a Recency, Frequency, and Monetary (RFM) analysis pipeline using Python.",
        result: "Targeted marketing campaigns based on these segments resulted in a 12% increase in customer retention."
      }
    },
    {
      category: 'PREDICTIVE TECH',
      title: 'Server Load Forecasting',
      description: 'Leveraged LSTM neural networks to predict server demand spikes 48 hours in advance.',
      image: projectPengangguran,
      details: {
        challenge: "Frequent server outages during peak traffic periods were causing significant revenue loss.",
        solution: "Built a time-series forecasting model using Long Short-Term Memory (LSTM) networks.",
        result: "The model achieved 94% accuracy in predicting spikes 48 hours ahead."
      }
    },
    {
      category: 'FINANCE',
      title: 'Track Record MG dalam Mengawal IPO',
      description: 'Real-time transaction monitoring system identifying anomalies with 99.4% accuracy.',
      image: projectTrackRecord,
      details: {
        challenge: "Legacy fraud detection systems were too slow and produced too many false positives.",
        solution: "Developed a real-time anomaly detection pipeline using Isolation Forests.",
        result: "Reduced false positives by 40% while maintaining a 99.4% detection rate."
      }
    },
    // Adding more dummy projects to fill the portfolio page
    {
      category: 'DATA VISUALIZATION',
      title: 'Global Warming Trends 2024',
      description: 'Interactive visualization of temperature shifts across the globe over the last decade.',
      image: project1,
      details: {
        challenge: "Communicating complex climate data to a non-technical audience in an engaging way.",
        solution: "Developed a D3.js powered dashboard with interactive maps and historical timelines.",
        result: "Viral reach with over 500k unique visitors and positive feedback from environmental NGOs."
      }
    },
    {
      category: 'KEMISKINAN',
      title: 'Economic Impact on Rural Areas',
      description: 'Analyzing the shift in household income after the latest subsidy reforms.',
      image: projectPengangguran,
      details: {
        challenge: "Understanding the granular impact of macro-economic changes on remote villages.",
        solution: "Conducted field surveys and processed data using R and Hadoop for large-scale analysis.",
        result: "Policy recommendations were adopted by the local government to improve distribution efficiency."
      }
    },
    {
      category: 'FINANCE',
      title: 'Stock Market Sentiment Analysis',
      description: 'Predicting market trends using NLP on social media and news sources.',
      image: projectTrackRecord,
      details: {
        challenge: "Processing millions of social media posts to find meaningful market indicators.",
        solution: "Built a BERT-based sentiment analysis model integrated with historical price data.",
        result: "Outperformed the baseline index by 8.5% over a 6-month backtesting period."
      }
    }
  ];

  const categories = ['All', ...new Set(projects.map(p => p.category))];

  const filteredProjects = projects.filter(p => 
    (filter === 'All' || p.category === filter) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pt-24 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <button 
              onClick={onBackToHome}
              className="group flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white">Full Portfolio</h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg">
              Explore the complete collection of my projects, experiments, and case studies.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64 order-2 sm:order-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition-all shadow-inner"
              />
            </div>
            
            <div className="flex items-center gap-2 order-1 sm:order-2 self-start sm:self-center">
              <Filter size={18} className="text-slate-500 dark:text-slate-400" />
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      filter === cat 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800 h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-3 block">{project.category}</span>
                  <h4 className="text-xl font-black tracking-tight mb-4 dark:text-white">{project.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">{project.description}</p>
                  <button 
                    onClick={() => onProjectClick(project)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                  >
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-slate-500 text-lg">No projects found matching your criteria.</p>
            <button 
              onClick={() => { setFilter('All'); setSearchQuery(''); }}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

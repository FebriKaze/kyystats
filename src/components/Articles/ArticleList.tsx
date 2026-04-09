import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Article } from '../../types';

interface ArticleListProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, onArticleClick }) => {
  return (
    <section className="py-24 px-6 bg-white dark:bg-[#020617] transition-colors duration-300" id="articles">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter dark:text-white">Latest Articles</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg">Deep dives into data trends, methodologies, and technical insights.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-slate-50 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.thumbnail_url} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(article.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><User size={12} /> {article.author}</span>
                </div>
                
                <h3 className="text-xl font-black tracking-tight mb-4 dark:text-white group-hover:text-primary transition-colors leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8 line-clamp-3">
                  {article.summary}
                </p>

                <div className="mt-auto">
                  <button 
                    onClick={() => onArticleClick(article)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all group-hover:translate-x-1"
                  >
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleList;

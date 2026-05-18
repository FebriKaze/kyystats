import React, { useState, useEffect } from 'react';
import { Search, User, FileText, ArrowRight, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../Common/Toast';

interface ArticleAssignmentProps {
  onClose: () => void;
  onAssignmentComplete: () => void;
}

const ArticleAssignment: React.FC<ArticleAssignmentProps> = ({ onClose, onAssignmentComplete }) => {
  const [unassignedArticles, setUnassignedArticles] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedContributor, setSelectedContributor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'bulk'>('single');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .is('user_id', null)
        .order('created_at', { ascending: false });

      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'owner')
        .order('full_name', { ascending: true });

      setUnassignedArticles(articles || []);
      setContributors(users || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', 'Failed to load data!');
    }
  };

  const handleSingleAssignment = async () => {
    if (!selectedArticle || !selectedContributor) {
      showToast('warning', 'Select an article and a contributor!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ user_id: selectedContributor.id })
        .eq('id', selectedArticle.id);

      if (error) throw error;

      showToast('success', `Article "${selectedArticle.title}" successfully assigned to ${selectedContributor.full_name}!`);
      
      setUnassignedArticles(prev => prev.filter(a => a.id !== selectedArticle.id));
      setSelectedArticle(null);
      setSelectedContributor(null);
      
      onAssignmentComplete();
    } catch (error) {
      showToast('error', 'Failed to assign article!');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (!selectedContributor) {
      showToast('warning', 'Select a contributor first!');
      return;
    }

    if (!window.confirm(`Assign all ${unassignedArticles.length} unassigned articles to ${selectedContributor.full_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ user_id: selectedContributor.id })
        .is('user_id', null);

      if (error) throw error;

      showToast('success', `Successfully assigned ${unassignedArticles.length} articles to ${selectedContributor.full_name}!`);
      setUnassignedArticles([]);
      onAssignmentComplete();
      onClose();
    } catch (error) {
      showToast('error', 'Failed bulk article assignment!');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = unassignedArticles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white rounded-none shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col font-sans">
        <div className="p-8 border-b border-slate-200 flex items-center justify-between font-sans shrink-0">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 uppercase">Article Assignment</h2>
            <p className="text-slate-500 text-xs mt-1">Assign unassigned articles to contributors</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-100 rounded-none hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto font-sans flex-1">
          <div className="flex gap-2 mb-8 font-sans border-b border-slate-200 pb-4">
            <button
              onClick={() => setAssignmentMode('single')}
              className={`px-5 py-2 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border ${
                assignmentMode === 'single'
                  ? 'bg-[#0d2137] text-white border-[#0d2137]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Single Assignment
            </button>
            <button
              onClick={() => setAssignmentMode('bulk')}
              className={`px-5 py-2 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border ${
                assignmentMode === 'bulk'
                  ? 'bg-[#0d2137] text-white border-[#0d2137]'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Bulk Assignment
            </button>
          </div>

          <div className="mb-8 font-sans">
            <h3 className="text-sm font-serif font-bold text-slate-900 mb-4 uppercase">Select Contributor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
              {contributors.map(contributor => (
                <div
                  key={contributor.id}
                  onClick={() => setSelectedContributor(contributor)}
                  className={`p-4 rounded-none border cursor-pointer transition-colors ${
                    selectedContributor?.id === contributor.id
                      ? 'border-[#0d2137] bg-slate-50 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 font-sans">
                    <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center font-sans">
                      <User size={18} className="text-slate-600" />
                    </div>
                    <div className="font-sans">
                      <p className="text-xs font-bold text-slate-900 uppercase">{contributor.full_name}</p>
                      <p className="text-xs text-slate-500 font-medium">{contributor.email}</p>
                    </div>
                    {selectedContributor?.id === contributor.id && (
                      <Check size={18} className="text-[#0d2137] ml-auto shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {assignmentMode === 'single' && (
            <div className="mb-8 font-sans">
              <h3 className="text-sm font-serif font-bold text-slate-900 mb-4 uppercase">Select Article</h3>
              
              <div className="relative mb-4 font-sans">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#0d2137] text-slate-900 transition-colors"
                />
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto font-sans pr-2">
                {filteredArticles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`p-4 rounded-none border cursor-pointer transition-colors ${
                      selectedArticle?.id === article.id
                        ? 'border-[#0d2137] bg-slate-50 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-3 font-sans">
                      <FileText size={18} className="text-slate-500 mt-0.5 shrink-0" />
                      <div className="flex-1 font-sans">
                        <p className="text-xs font-bold text-slate-900">{article.title}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{article.summary}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Created: {new Date(article.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      {selectedArticle?.id === article.id && (
                        <Check size={18} className="text-[#0d2137] shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignmentMode === 'bulk' && (
            <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-none font-sans">
              <div className="flex items-center gap-3 mb-2 font-sans">
                <div className="w-10 h-10 bg-[#0d2137] text-white border border-[#0d2137] rounded-none flex items-center justify-center font-sans">
                  <FileText size={18} />
                </div>
                <div className="font-sans">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bulk Assignment</p>
                  <p className="text-xs text-slate-600 font-medium">
                    {unassignedArticles.length} unassigned articles will be assigned to {selectedContributor?.full_name || 'the selected contributor'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 font-sans pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={assignmentMode === 'single' ? handleSingleAssignment : handleBulkAssignment}
              disabled={loading || (assignmentMode === 'single' ? !selectedArticle || !selectedContributor : !selectedContributor)}
              className="flex-1 px-6 py-3 bg-[#0d2137] text-white rounded-none font-bold text-xs uppercase tracking-wider hover:bg-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-[#0d2137] shadow-sm"
            >
              {loading ? 'Processing...' : assignmentMode === 'single' ? 'Assign Article' : 'Assign All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleAssignment;

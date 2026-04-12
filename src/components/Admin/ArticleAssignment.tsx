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
      // Load unassigned articles
      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .is('user_id', null)
        .order('created_at', { ascending: false });

      // Load contributors (non-owner users)
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'owner')
        .order('full_name', { ascending: true });

      setUnassignedArticles(articles || []);
      setContributors(users || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', 'Gagal memuat data!');
    }
  };

  const handleSingleAssignment = async () => {
    if (!selectedArticle || !selectedContributor) {
      showToast('warning', 'Pilih artikel dan contributor!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ user_id: selectedContributor.id })
        .eq('id', selectedArticle.id);

      if (error) throw error;

      showToast('success', `Artikel "${selectedArticle.title}" berhasil diassign ke ${selectedContributor.full_name}!`);
      
      // Update local state
      setUnassignedArticles(prev => prev.filter(a => a.id !== selectedArticle.id));
      setSelectedArticle(null);
      setSelectedContributor(null);
      
      onAssignmentComplete();
    } catch (error) {
      showToast('error', 'Gagal assign artikel!');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (!selectedContributor) {
      showToast('warning', 'Pilih contributor terlebih dahulu!');
      return;
    }

    if (!window.confirm(`Assign semua ${unassignedArticles.length} artikel tanpa owner ke ${selectedContributor.full_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .update({ user_id: selectedContributor.id })
        .is('user_id', null);

      if (error) throw error;

      showToast('success', `Berhasil assign ${unassignedArticles.length} artikel ke ${selectedContributor.full_name}!`);
      setUnassignedArticles([]);
      onAssignmentComplete();
      onClose();
    } catch (error) {
      showToast('error', 'Gagal bulk assign artikel!');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = unassignedArticles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Article Assignment</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Assign artikel tanpa owner ke contributor</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Assignment Mode Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setAssignmentMode('single')}
              className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                assignmentMode === 'single'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Single Assignment
            </button>
            <button
              onClick={() => setAssignmentMode('bulk')}
              className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                assignmentMode === 'bulk'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Bulk Assignment
            </button>
          </div>

          {/* Contributor Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pilih Contributor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contributors.map(contributor => (
                <div
                  key={contributor.id}
                  onClick={() => setSelectedContributor(contributor)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedContributor?.id === contributor.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <User size={18} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{contributor.full_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{contributor.email}</p>
                    </div>
                    {selectedContributor?.id === contributor.id && (
                      <Check size={20} className="text-primary ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Articles Selection (Single Mode) */}
          {assignmentMode === 'single' && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Pilih Artikel</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                />
              </div>

              {/* Articles List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredArticles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedArticle?.id === article.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText size={18} className="text-slate-400 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{article.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
                        <p className="text-xs text-slate-400 mt-2">Dibuat: {new Date(article.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      {selectedArticle?.id === article.id && (
                        <Check size={20} className="text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Mode Info */}
          {assignmentMode === 'bulk' && (
            <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                  <FileText size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">Bulk Assignment</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {unassignedArticles.length} artikel akan diassign ke {selectedContributor?.full_name || 'contributor yang dipilih'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={assignmentMode === 'single' ? handleSingleAssignment : handleBulkAssignment}
              disabled={loading || (assignmentMode === 'single' ? !selectedArticle || !selectedContributor : !selectedContributor)}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : assignmentMode === 'single' ? 'Assign Artikel' : 'Assign Semua'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleAssignment;

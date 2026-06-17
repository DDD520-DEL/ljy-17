import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit3, BookText, User, Trash2, Calendar, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MemorialArticle } from '@/types';
import { formatDate } from '@/utils/dateUtils';

export default function MemorialArticlesList() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { articles, globalSearchTerm, ancestors, branches, deleteArticle } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAncestor, setSelectedAncestor] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const ancestorParam = searchParams.get('ancestorId');
    if (ancestorParam) {
      setSelectedAncestor(ancestorParam);
    }
    const state = location.state as { searchTerm?: string } | null;
    if (state?.searchTerm) {
      setSearchTerm(state.searchTerm);
      window.history.replaceState({}, document.title);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [location.state, globalSearchTerm, searchParams]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.includes(searchTerm) || 
                          article.content.includes(searchTerm) ||
                          article.ancestorName?.includes(searchTerm) ||
                          article.author?.includes(searchTerm);
    const matchesAncestor = selectedAncestor === null || article.ancestorId === selectedAncestor;
    const matchesBranch = selectedBranch === null || article.branchId === selectedBranch;
    return matchesSearch && matchesAncestor && matchesBranch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    if (deleteArticle(id)) {
      setDeleteConfirmId(null);
    }
  };

  const getAncestorName = (ancestorId: string) => {
    const ancestor = ancestors.find(a => a.id === ancestorId);
    return ancestor?.name || '未知先人';
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return null;
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || null;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">追思文章</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {articles.length} 篇追思文章，寄托对先人的思念
          </p>
        </div>
        <Link to="/memorial-articles/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          撰写追思
        </Link>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="搜索文章标题、内容、先人、作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {ancestors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">按先人筛选</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedAncestor(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedAncestor === null
                        ? 'bg-brown-600 text-white shadow-soft'
                        : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    全部先人
                  </button>
                  {ancestors.map(ancestor => (
                    <button
                      key={ancestor.id}
                      onClick={() => setSelectedAncestor(ancestor.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedAncestor === ancestor.id
                          ? 'bg-brown-600 text-white shadow-soft'
                          : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                      }`}
                    >
                      <Heart className="w-3 h-3 inline mr-1" />
                      {ancestor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {branches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">按分支筛选</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedBranch(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedBranch === null
                        ? 'bg-gold-500 text-white shadow-soft'
                        : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    全部分支
                  </button>
                  {branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedBranch === branch.id
                          ? 'bg-gold-500 text-white shadow-soft'
                          : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                      }`}
                    >
                      <span 
                        className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                        style={{ backgroundColor: branch.color || '#dc2626' }}
                      />
                      {branch.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sortedArticles.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <BookText className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无追思文章</h3>
          <p className="text-brown-500 mb-6">祭扫之后，常有感而发，写下文字寄托哀思</p>
          <Link to="/memorial-articles/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            撰写第一篇追思
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedArticles.map((article, index) => {
            const ancestor = ancestors.find(a => a.id === article.ancestorId);
            const branch = article.branchId ? branches.find(b => b.id === article.branchId) : null;
            const isExpanded = expandedId === article.id;
            const previewLength = 200;
            const shouldTruncate = article.content.length > previewLength;
            
            return (
              <div
                key={article.id}
                className={`card group hover:border-gold-300 transition-all ${
                  isExpanded ? 'border-gold-300 shadow-card' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex flex-col items-center justify-center shadow-soft">
                      <span className="text-xl font-bold text-white leading-none">
                        {new Date(article.date).getDate()}
                      </span>
                      <span className="text-xs text-white/90 mt-0.5">
                        {new Date(article.date).getMonth() + 1}月
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-brown-400">
                        {new Date(article.date).getFullYear()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-semibold text-brown-800 mb-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                          <Link 
                            to={`/ancestors/${article.ancestorId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            {article.ancestorName || getAncestorName(article.ancestorId)}
                          </Link>
                          {branch && (
                            <span 
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs"
                              style={{ backgroundColor: branch.color || '#8B4513' }}
                            >
                              {branch.name}
                            </span>
                          )}
                          {article.author && (
                            <span className="inline-flex items-center gap-1 text-brown-500">
                              <User className="w-3.5 h-3.5" />
                              {article.author}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-brown-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(article.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`text-brown-600 leading-relaxed whitespace-pre-wrap ${
                        isExpanded ? '' : 'line-clamp-4'
                      }`}
                    >
                      {article.content}
                    </div>

                    {shouldTruncate && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : article.id)}
                        className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 mt-3 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            收起内容 <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            阅读全文 <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(article.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除文章"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <Link
                      to={`/memorial-articles/${article.id}/edit`}
                      className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                      title="编辑文章"
                    >
                      <Edit3 className="w-4 h-4 text-brown-500" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除这篇追思文章吗？此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

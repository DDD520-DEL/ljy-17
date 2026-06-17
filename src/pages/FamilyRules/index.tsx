import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, BookOpen, User, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyRule } from '@/types';

export default function FamilyRulesList() {
  const location = useLocation();
  const { rules, globalSearchTerm, branches, deleteRule, reorderRules } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { searchTerm?: string } | null;
    if (state?.searchTerm) {
      setSearchTerm(state.searchTerm);
      window.history.replaceState({}, document.title);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [location.state, globalSearchTerm]);

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.title.includes(searchTerm) || 
                          rule.content.includes(searchTerm) ||
                          rule.sourceAncestor?.includes(searchTerm);
    const matchesBranch = selectedBranch === null || rule.branchId === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const sortedRules = [...filteredRules].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDelete = (id: string) => {
    if (deleteRule(id)) {
      setDeleteConfirmId(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const targetRule = sortedRules[index - 1];
      reorderRules(sortedRules[index].id, targetRule.id);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < sortedRules.length - 1) {
      const targetRule = sortedRules[index + 1];
      reorderRules(sortedRules[index].id, targetRule.id);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">家训家规</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {rules.length} 条家训家规，传承家族智慧
          </p>
        </div>
        <Link to="/family-rules/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加家训
        </Link>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="搜索家训标题、内容、出处..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          {branches.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedBranch(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedBranch === null
                    ? 'bg-brown-600 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                全部分支
              </button>
              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedBranch === branch.id
                      ? 'bg-brown-600 text-white shadow-soft'
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
          )}
        </div>
      </div>

      {sortedRules.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无家训家规</h3>
          <p className="text-brown-500 mb-6">录入祖上传下来的家训家规，供后辈随时查看</p>
          <Link to="/family-rules/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加第一条家训
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRules.map((rule, index) => {
            const branch = rule.branchId ? branches.find(b => b.id === rule.branchId) : null;
            const isExpanded = expandedId === rule.id;
            return (
              <div
                key={rule.id}
                className={`card group hover:border-gold-300 transition-all ${
                  isExpanded ? 'border-gold-300 shadow-card' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded transition-colors ${
                          index === 0
                            ? 'text-brown-200 cursor-not-allowed'
                            : 'text-brown-400 hover:text-brown-600 hover:bg-cream-100'
                        }`}
                        title="上移"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sortedRules.length - 1}
                        className={`p-1 rounded transition-colors ${
                          index === sortedRules.length - 1
                            ? 'text-brown-200 cursor-not-allowed'
                            : 'text-brown-400 hover:text-brown-600 hover:bg-cream-100'
                        }`}
                        title="下移"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-serif text-lg font-semibold text-brown-800">
                        {rule.title}
                      </h3>
                      {branch && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: branch.color || '#8B4513' }}
                        >
                          {branch.name}
                        </span>
                      )}
                      {rule.sourceAncestor && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                          <User className="w-3 h-3" />
                          {rule.sourceAncestor}
                        </span>
                      )}
                    </div>

                    <div 
                      className={`text-brown-600 leading-relaxed ${
                        isExpanded ? '' : 'line-clamp-3'
                      }`}
                    >
                      {rule.content.split('\n').map((paragraph, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {!isExpanded && rule.content.length > 100 && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(rule.id)}
                        className="text-sm text-gold-600 hover:text-gold-700 mt-2"
                      >
                        展开全文 →
                      </button>
                    )}
                    {isExpanded && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="text-sm text-gold-600 hover:text-gold-700 mt-2"
                      >
                        收起内容 ↑
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rule.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <Link
                      to={`/family-rules/${rule.id}/edit`}
                      className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
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
              确定要删除这条家训家规吗？此操作不可撤销。
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

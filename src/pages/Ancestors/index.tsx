import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, Calendar, User, Heart, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getAge, getLunarCalendar, getGenerationName } from '@/utils/dateUtils';
import FavoriteButton from '@/components/FavoriteButton';

export default function AncestorsList() {
  const location = useLocation();
  const { ancestors, globalSearchTerm, branches } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { searchTerm?: string } | null;
    if (state?.searchTerm) {
      setSearchTerm(state.searchTerm);
      window.history.replaceState({}, document.title);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [location.state, globalSearchTerm]);

  const generations = [...new Set(ancestors.map(a => a.generation))].sort((a, b) => a - b);

  const filteredAncestors = ancestors.filter(ancestor => {
    const matchesSearch = ancestor.name.includes(searchTerm) || 
                          ancestor.relationship.includes(searchTerm);
    const matchesGeneration = selectedGeneration === null || ancestor.generation === selectedGeneration;
    const matchesBranch = selectedBranch === null || ancestor.branchId === selectedBranch;
    return matchesSearch && matchesGeneration && matchesBranch;
  });

  const sortedAncestors = [...filteredAncestors].sort((a, b) => a.generation - b.generation);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">先人管理</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {ancestors.length} 位先人，记录他们的生平与事迹
          </p>
        </div>
        <Link to="/ancestors/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加先人
        </Link>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="搜索姓名、关系..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedGeneration(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGeneration === null
                  ? 'bg-brown-600 text-white shadow-soft'
                  : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
              }`}
            >
              全部辈分
            </button>
            {generations.map(gen => (
              <button
                key={gen}
                onClick={() => setSelectedGeneration(gen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGeneration === gen
                    ? 'bg-brown-600 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                {getGenerationName(gen)}
              </button>
            ))}
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

      {sortedAncestors.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无先人信息</h3>
          <p className="text-brown-500 mb-6">添加第一位先人，开始记录家族历史</p>
          <Link to="/ancestors/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加先人
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAncestors.map((ancestor, index) => (
            <div
              key={ancestor.id}
              className="card group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                to={`/ancestors/${ancestor.id}`}
                className="flex items-start gap-4 mb-4 block"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-brown-400 to-brown-600 rounded-2xl flex items-center justify-center text-white text-2xl font-serif shadow-soft group-hover:scale-110 transition-transform overflow-hidden">
                  {ancestor.photos && ancestor.photos.length > 0 ? (
                    <img src={ancestor.photos[0]} alt={ancestor.name} className="w-full h-full object-cover" />
                  ) : (
                    ancestor.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold text-brown-800 truncate group-hover:text-gold-600 transition-colors">
                      {ancestor.name}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-brown-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-brown-500">{ancestor.relationship}</span>
                    <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                      {getGenerationName(ancestor.generation)}
                    </span>
                    {ancestor.branchId && (() => {
                      const branch = branches.find(b => b.id === ancestor.branchId);
                      return branch ? (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: branch.color || '#dc2626' }}
                        >
                          {branch.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </Link>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  <span className="text-brown-500">诞辰：</span>
                  <span className="text-brown-700">{formatDate(ancestor.birthDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-brown-500">忌日：</span>
                  <span className="text-brown-700">{formatDate(ancestor.deathDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-brown-500">享年：</span>
                  <span className="text-brown-700">{getAge(ancestor.birthDate, ancestor.deathDate)} 岁</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-brown-500">农历忌日：</span>
                  <span className="text-brown-700">{getLunarCalendar(ancestor.deathDate)}</span>
                </div>
              </div>

              {ancestor.biography && (
                <div className="pt-4 border-t border-brown-100">
                  <p className="text-sm text-brown-600 line-clamp-3 leading-relaxed">
                    {ancestor.biography}
                  </p>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-brown-100">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/ancestors/${ancestor.id}`}
                    className="flex-1 btn-secondary text-center flex items-center justify-center gap-2 text-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                    查看详情
                  </Link>
                  <FavoriteButton
                    entityType="ancestor"
                    entityId={ancestor.id}
                    name={ancestor.name}
                    subtitle={ancestor.relationship}
                  />
                  <Link
                    to={`/ancestors/${ancestor.id}/edit`}
                    className="px-3 py-2.5 text-brown-600 hover:bg-brown-100 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/rituals/new?ancestorId=${ancestor.id}`}
                    className="px-3 py-2.5 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                    title="记录祭祀"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

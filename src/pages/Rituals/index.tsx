import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, Calendar, MapPin, Users, Gift, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getLunarCalendar } from '@/utils/dateUtils';

export default function RitualsList() {
  const location = useLocation();
  const { rituals, ancestors, globalSearchTerm, branches } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAncestor, setSelectedAncestor] = useState<string | null>(null);
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

  const filteredRituals = rituals.filter(ritual => {
    const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
    const ancestorName = ancestor?.name || ritual.ancestorName || '';
    const matchesSearch = ancestorName.includes(searchTerm) || 
                          ritual.location.includes(searchTerm) ||
                          ritual.notes?.includes(searchTerm);
    const matchesAncestor = selectedAncestor === null || ritual.ancestorId === selectedAncestor;
    
    const ritualBranchId = ritual.branchId || ancestor?.branchId;
    const matchesBranch = selectedBranch === null || ritualBranchId === selectedBranch;
    
    return matchesSearch && matchesAncestor && matchesBranch;
  });

  const sortedRituals = [...filteredRituals].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">祭祀记录</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {rituals.length} 条祭祀记录，缅怀先人，传承孝道
          </p>
        </div>
        <Link to="/rituals/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          记录祭祀
        </Link>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="搜索先人、地点、备注..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedAncestor(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedAncestor === null
                  ? 'bg-brown-600 text-white shadow-soft'
                  : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
              }`}
            >
              全部先人
            </button>
            {ancestors.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAncestor(a.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAncestor === a.id
                    ? 'bg-brown-600 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                {a.name}
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

      {sortedRituals.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无祭祀记录</h3>
          <p className="text-brown-500 mb-6">记录第一次祭祀活动，缅怀先人</p>
          <Link to="/rituals/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            记录祭祀
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRituals.map((ritual, index) => {
            const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
            return (
              <div
                key={ritual.id}
                className="card group hover:border-gold-300 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-soft">
                      <span className="text-lg font-bold">
                        {new Date(ritual.date).getDate()}
                      </span>
                      <span className="text-xs">
                        {new Date(ritual.date).getMonth() + 1}月
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg font-semibold text-brown-800">
                        {ancestor?.name || ritual.ancestorName} 祭祀
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                        {formatDate(ritual.date, 'year')}年
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                        农历 {getLunarCalendar(ritual.date)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-brown-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(ritual.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{ritual.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{ritual.participants.length} 人参与</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-4 h-4" />
                        <span>{ritual.offerings.length} 种供品</span>
                      </div>
                    </div>

                    {ritual.notes && (
                      <p className="text-sm text-brown-600 mt-3 line-clamp-2">
                        {ritual.notes}
                      </p>
                    )}

                    {ritual.participants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {ritual.participants.slice(0, 5).map((p, i) => (
                          <span key={i} className="text-xs bg-cream-50 px-2 py-0.5 rounded-full text-brown-600 border border-brown-100">
                            {p}
                          </span>
                        ))}
                        {ritual.participants.length > 5 && (
                          <span className="text-xs text-brown-400">
                            +{ritual.participants.length - 5}人
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/rituals/${ritual.id}/edit`}
                      className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-brown-500" />
                    </Link>
                    <ChevronRight className="w-5 h-5 text-brown-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

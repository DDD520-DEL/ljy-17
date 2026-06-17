import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, Calendar, MapPin, Users, Sparkles, ChevronRight, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getLunarCalendar } from '@/utils/dateUtils';
import { FAMILY_EVENT_TYPE_META, FamilyEvent, FamilyEventType } from '@/types';

export default function FamilyEventsList() {
  const location = useLocation();
  const { events, globalSearchTerm, branches, deleteEvent } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FamilyEventType | 'all'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { searchTerm?: string } | null;
    if (state?.searchTerm) {
      setSearchTerm(state.searchTerm);
      window.history.replaceState({}, document.title);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [location.state, globalSearchTerm]);

  const filteredEvents = events.filter(event => {
    const typeMeta = FAMILY_EVENT_TYPE_META[event.type];
    const matchesSearch = event.title.includes(searchTerm) || 
                          event.description?.includes(searchTerm) ||
                          event.location?.includes(searchTerm) ||
                          event.participants.some(p => p.includes(searchTerm));
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesBranch = selectedBranch === null || event.branchId === selectedBranch;
    return matchesSearch && matchesType && matchesBranch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    if (deleteEvent(id)) {
      setDeleteConfirmId(null);
    }
  };

  const typeOptions: { value: FamilyEventType | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: '全部类型', icon: '📋' },
    ...Object.entries(FAMILY_EVENT_TYPE_META).map(([key, meta]) => ({
      value: key as FamilyEventType,
      label: meta.label,
      icon: meta.icon,
    })),
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">家族大事记</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {events.length} 条大事记，记录家族的重要时刻
          </p>
        </div>
        <Link to="/family-events/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          记录大事
        </Link>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="搜索标题、地点、参与人、描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {typeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedType === option.value
                    ? 'bg-brown-600 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                <span>{option.icon}</span>
                {option.label}
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

      {sortedEvents.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无大事记</h3>
          <p className="text-brown-500 mb-6">记录家族中的重要事件，传承家族记忆</p>
          <Link to="/family-events/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            记录第一件大事
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const typeMeta = FAMILY_EVENT_TYPE_META[event.type];
            const branch = event.branchId ? branches.find(b => b.id === event.branchId) : null;
            return (
              <div
                key={event.id}
                className={`card group hover:border-gold-300 transition-all border-l-4 ${typeMeta.bgColor.replace('bg-', 'border-l-')}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-soft ${typeMeta.bgColor}`}>
                      <span className="text-2xl">{typeMeta.icon}</span>
                      <span className={`text-xs font-medium mt-0.5 ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-serif text-lg font-semibold text-brown-800">
                        {event.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                        {formatDate(event.date, 'year')}年
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                        农历 {getLunarCalendar(event.date)}
                      </span>
                      {branch && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: branch.color || '#8B4513' }}
                        >
                          {branch.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-brown-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{event.participants.length} 人参与</span>
                      </div>
                      {event.photos && event.photos.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">📷 {event.photos.length}张照片</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-brown-600 mt-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {event.participants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {event.participants.slice(0, 5).map((p, i) => (
                          <span key={i} className="text-xs bg-cream-50 px-2 py-0.5 rounded-full text-brown-600 border border-brown-100">
                            {p}
                          </span>
                        ))}
                        {event.participants.length > 5 && (
                          <span className="text-xs text-brown-400">
                            +{event.participants.length - 5}人
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(event.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <Link
                      to={`/family-events/${event.id}/edit`}
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

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除这条大事记吗？此操作不可撤销。
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

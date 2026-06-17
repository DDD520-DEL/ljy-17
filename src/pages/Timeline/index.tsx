import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, groupByYear, getLunarCalendar } from '@/utils/dateUtils';
import { Calendar, MapPin, Users, Gift, ScrollText, TreeDeciduous, Edit3 } from 'lucide-react';
import { FAMILY_EVENT_TYPE_META, Ritual, FamilyEvent } from '@/types';

type TimelineItem = 
  | { kind: 'ritual'; data: Ritual }
  | { kind: 'event'; data: FamilyEvent };

export default function RitualTimeline() {
  const { rituals, events, ancestors, branches } = useAppStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showRituals, setShowRituals] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  const allItems: TimelineItem[] = [];

  if (showRituals) {
    rituals.forEach(ritual => {
      const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
      const ritualBranchId = ritual.branchId || ancestor?.branchId;
      if (selectedBranch === null || ritualBranchId === selectedBranch) {
        allItems.push({ kind: 'ritual', data: ritual });
      }
    });
  }

  if (showEvents) {
    events.forEach(event => {
      if (selectedBranch === null || event.branchId === selectedBranch) {
        allItems.push({ kind: 'event', data: event });
      }
    });
  }

  const sortedItems = [...allItems].sort((a, b) => {
    const dateA = a.kind === 'ritual' ? a.data.date : a.data.date;
    const dateB = b.kind === 'ritual' ? b.data.date : b.data.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const itemsByYear: Record<string, TimelineItem[]> = {};
  sortedItems.forEach(item => {
    const date = item.kind === 'ritual' ? item.data.date : item.data.date;
    const year = new Date(date).getFullYear().toString();
    if (!itemsByYear[year]) {
      itemsByYear[year] = [];
    }
    itemsByYear[year].push(item);
  });
  const years = Object.keys(itemsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  const ritualCount = sortedItems.filter(i => i.kind === 'ritual').length;
  const eventCount = sortedItems.filter(i => i.kind === 'event').length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-800">家族年表</h1>
        <p className="text-brown-500 text-sm mt-1">
          按时间线回顾家族历史 — 祭祀 {ritualCount} 次，大事记 {eventCount} 件
        </p>
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <TreeDeciduous className="w-4 h-4 text-brown-500" />
              <span className="text-sm font-medium text-brown-700">按分支筛选</span>
            </div>
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

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-brown-100">
            <span className="text-sm font-medium text-brown-700">显示内容</span>
            <button
              onClick={() => setShowRituals(!showRituals)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                showRituals
                  ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-soft'
                  : 'bg-cream-100 text-brown-500 hover:bg-cream-200'
              }`}
            >
              <Gift className="w-4 h-4" />
              祭祀记录
            </button>
            <button
              onClick={() => setShowEvents(!showEvents)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                showEvents
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-soft'
                  : 'bg-cream-100 text-brown-500 hover:bg-cream-200'
              }`}
            >
              ✨ 家族大事记
            </button>
          </div>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <ScrollText className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无记录</h3>
          <p className="text-brown-500 mb-6">记录祭祀活动或家族大事后，年表将自动生成</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/rituals/new" className="btn-secondary inline-flex items-center gap-2">
              <Gift className="w-4 h-4" />
              记录祭祀
            </Link>
            <Link to="/family-events/new" className="btn-primary inline-flex items-center gap-2">
              ✨ 记录大事
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-pink-300 to-emerald-300" />
          
          {years.map((year) => (
            <div key={year} className="mb-12">
              <div className="relative -ml-8 mb-6">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-gold-400 to-pink-400 rounded-full border-4 border-cream-100 shadow-glow z-10" />
                <div className="ml-10">
                  <h2 className="font-serif text-3xl font-bold text-brown-800">
                    {year} 年
                  </h2>
                  <p className="text-brown-500 text-sm">
                    共 {itemsByYear[year].filter(i => i.kind === 'ritual').length} 次祭祀，
                    {itemsByYear[year].filter(i => i.kind === 'event').length} 件大事
                  </p>
                </div>
              </div>

              <div className="space-y-6 ml-4">
                {itemsByYear[year].map((item, index) => {
                  if (item.kind === 'ritual') {
                    const ritual = item.data;
                    const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
                    return (
                      <div
                        key={`ritual-${ritual.id}`}
                        className="relative card ml-4 animate-slide-up border-l-4 border-l-gold-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute -left-[1.875rem] top-6 w-4 h-4 bg-gold-500 rounded-full border-4 border-cream-100 shadow-soft z-10" />
                        
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 text-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex flex-col items-center justify-center text-white shadow-soft">
                              <span className="text-xl font-bold">
                                {new Date(ritual.date).getDate()}
                              </span>
                              <span className="text-xs">
                                {['一', '二', '三', '四', '五', '六', '日'][new Date(ritual.date).getDay()]}
                              </span>
                            </div>
                            <p className="text-xs text-gold-600 mt-1 font-medium">
                              {new Date(ritual.date).getMonth() + 1}月
                            </p>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="font-serif text-xl font-semibold text-brown-800">
                                {ancestor?.name || ritual.ancestorName} 祭祀
                              </h3>
                              <span className="text-xs px-2.5 py-0.5 bg-gold-100 text-gold-700 rounded-full flex items-center gap-1 font-medium">
                                <Gift className="w-3 h-3" />
                                祭祀
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                                农历 {getLunarCalendar(ritual.date)}
                              </span>
                              <Link
                                to={`/rituals/${ritual.id}/edit`}
                                className="p-1 hover:bg-gold-50 rounded transition-colors ml-auto"
                              >
                                <Edit3 className="w-4 h-4 text-gold-500" />
                              </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-brown-400" />
                                <span className="text-brown-600">{formatDate(ritual.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-brown-400" />
                                <span className="text-brown-600 truncate">{ritual.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-brown-400" />
                                <span className="text-brown-600">{ritual.participants.join('、')}</span>
                              </div>
                            </div>

                            {ritual.offerings.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Gift className="w-4 h-4 text-gold-500" />
                                  <span className="text-sm font-medium text-brown-700">供品</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {ritual.offerings.map((o, i) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-1 bg-gold-50 text-gold-700 rounded-full text-xs border border-gold-100"
                                    >
                                      {o}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {ritual.notes && (
                              <div className="p-4 bg-gradient-to-r from-gold-50/50 to-cream-50 rounded-xl border border-gold-100">
                                <p className="text-sm text-brown-700 leading-relaxed">
                                  {ritual.notes}
                                </p>
                              </div>
                            )}

                            {ritual.photos && ritual.photos.length > 0 && (
                              <div className="flex gap-2 mt-4 flex-wrap">
                                {ritual.photos.slice(0, 4).map((photo, i) => (
                                  <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gold-200 shadow-soft">
                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const event = item.data;
                  const typeMeta = FAMILY_EVENT_TYPE_META[event.type];
                  return (
                    <div
                      key={`event-${event.id}`}
                      className={`relative card ml-4 animate-slide-up border-l-4 ${typeMeta.bgColor.replace('bg-', 'border-l-')}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div 
                        className={`absolute -left-[1.875rem] top-6 w-4 h-4 rounded-full border-4 border-cream-100 shadow-soft z-10 ${typeMeta.bgColor.replace('bg-', 'bg-')}`}
                        style={{ borderColor: '#FFFDFA' }}
                      />
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center">
                          <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-soft ${typeMeta.bgColor}`}>
                            <span className="text-2xl">{typeMeta.icon}</span>
                            <span className={`text-[10px] font-medium ${typeMeta.color} mt-0.5`}>
                              {typeMeta.label}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 font-medium ${typeMeta.color}`}>
                            {new Date(event.date).getMonth() + 1}月{new Date(event.date).getDate()}日
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className="font-serif text-xl font-semibold text-brown-800">
                              {event.title}
                            </h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium ${typeMeta.color} ${typeMeta.bgColor}`}>
                              {typeMeta.icon} {typeMeta.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                              农历 {getLunarCalendar(event.date)}
                            </span>
                            {event.branchId && (() => {
                              const branch = branches.find(b => b.id === event.branchId);
                              return branch ? (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: branch.color || '#8B4513' }}
                                >
                                  {branch.name}
                                </span>
                              ) : null;
                            })()}
                            <Link
                              to={`/family-events/${event.id}/edit`}
                              className={`p-1 rounded transition-colors ml-auto ${typeMeta.bgColor} hover:brightness-95`}
                            >
                              <Edit3 className={`w-4 h-4 ${typeMeta.color}`} />
                            </Link>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-brown-400" />
                              <span className="text-brown-600">{formatDate(event.date)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-brown-400" />
                                <span className="text-brown-600 truncate">{event.location}</span>
                              </div>
                            )}
                            {event.participants.length > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-brown-400" />
                                <span className="text-brown-600">{event.participants.join('、')}</span>
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <div className={`p-4 rounded-xl border ${typeMeta.bgColor} ${typeMeta.color.replace('text-', 'border-').replace('-600', '-200')}`}>
                              <p className="text-sm text-brown-700 leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                          )}

                          {event.photos && event.photos.length > 0 && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                              {event.photos.slice(0, 4).map((photo, i) => (
                                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-white shadow-soft">
                                  <img src={photo} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

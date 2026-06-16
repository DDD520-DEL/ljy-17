import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, groupByYear, getLunarCalendar } from '@/utils/dateUtils';
import { Calendar, MapPin, Users, Gift, ScrollText, TreeDeciduous } from 'lucide-react';

export default function RitualTimeline() {
  const { rituals, ancestors, branches } = useAppStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const filteredRituals = rituals.filter(ritual => {
    if (selectedBranch === null) return true;
    const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
    const ritualBranchId = ritual.branchId || ancestor?.branchId;
    return ritualBranchId === selectedBranch;
  });

  const sortedRituals = [...filteredRituals].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const ritualsByYear = groupByYear(sortedRituals);
  const years = Object.keys(ritualsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-800">祭祀年表</h1>
        <p className="text-brown-500 text-sm mt-1">
          按时间线回顾家族祭祀历史，铭记每一次缅怀
        </p>
      </div>

      {branches.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TreeDeciduous className="w-4 h-4 text-brown-500" />
            <span className="text-sm font-medium text-brown-700">按分支筛选</span>
          </div>
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
        </div>
      )}

      {filteredRituals.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <ScrollText className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无祭祀记录</h3>
          <p className="text-brown-500">记录祭祀活动后，年表将自动生成</p>
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 via-brown-300 to-brown-200" />
          
          {years.map((year, yearIndex) => (
            <div key={year} className="mb-12">
              <div className="relative -ml-8 mb-6">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-gold-500 rounded-full border-4 border-cream-100 shadow-glow z-10" />
                <div className="ml-10">
                  <h2 className="font-serif text-3xl font-bold text-brown-800">
                    {year} 年
                  </h2>
                  <p className="text-brown-500 text-sm">
                    共 {ritualsByYear[year].length} 次祭祀活动
                  </p>
                </div>
              </div>

              <div className="space-y-6 ml-4">
                {ritualsByYear[year].map((ritual, index) => {
                  const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
                  return (
                    <div
                      key={ritual.id}
                      className="relative card ml-4 animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="timeline-dot" />
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-brown-500 to-brown-700 rounded-xl flex flex-col items-center justify-center text-white shadow-soft">
                            <span className="text-xl font-bold">
                              {new Date(ritual.date).getDate()}
                            </span>
                            <span className="text-xs">
                              {['一', '二', '三', '四', '五', '六', '日'][new Date(ritual.date).getDay()]}
                            </span>
                          </div>
                          <p className="text-xs text-brown-500 mt-1">
                            {new Date(ritual.date).getMonth() + 1}月
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-serif text-xl font-semibold text-brown-800">
                              {ancestor?.name || ritual.ancestorName} 祭祀
                            </h3>
                            <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                              农历 {getLunarCalendar(ritual.date)}
                            </span>
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
                                    className="px-2.5 py-1 bg-cream-100 text-brown-700 rounded-full text-xs"
                                  >
                                    {o}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {ritual.notes && (
                            <div className="p-4 bg-cream-50 rounded-xl border border-brown-100">
                              <p className="text-sm text-brown-700 leading-relaxed">
                                {ritual.notes}
                              </p>
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

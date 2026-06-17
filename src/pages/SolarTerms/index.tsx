import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sun, 
  CalendarDays, 
  MapPin, 
  Gift, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Plus,
  Leaf,
  Flame,
  Snowflake,
  CloudSun,
} from 'lucide-react';
import { 
  getSolarTermsWithDates, 
  getCurrentSolarTerm, 
  getNextSolarTerm, 
  formatSolarTermDate, 
  getDaysUntilNextTerm,
  getRitualTerms,
} from '@/utils/solarTerms';
import { SolarTermWithDate } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';

type Season = 'all' | 'spring' | 'summer' | 'autumn' | 'winter' | 'ritual';

const SEASON_META = {
  all: { label: '全部节气', icon: Sparkles, color: 'text-brown-600 bg-brown-50' },
  spring: { label: '春季', icon: Leaf, color: 'text-green-600 bg-green-50' },
  summer: { label: '夏季', icon: Sun, color: 'text-red-600 bg-red-50' },
  autumn: { label: '秋季', icon: CloudSun, color: 'text-amber-600 bg-amber-50' },
  winter: { label: '冬季', icon: Snowflake, color: 'text-blue-600 bg-blue-50' },
  ritual: { label: '祭祀节气', icon: Flame, color: 'text-gold-600 bg-gold-50' },
};

export default function SolarTermsGuide() {
  const { ancestors } = useAppStore();
  const [selectedSeason, setSelectedSeason] = useState<Season>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const terms = useMemo(() => getSolarTermsWithDates(currentYear), [currentYear]);
  const currentTerm = useMemo(() => getCurrentSolarTerm(), []);
  const nextTerm = useMemo(() => getNextSolarTerm(), []);
  const daysUntilNext = useMemo(() => getDaysUntilNextTerm(), []);

  const filteredTerms = useMemo(() => {
    if (selectedSeason === 'all') return terms;
    if (selectedSeason === 'ritual') return terms.filter(t => t.hasRitualCustom);
    
    const seasonRanges: Record<string, [number, number]> = {
      spring: [0, 5],
      summer: [6, 11],
      autumn: [12, 17],
      winter: [18, 23],
    };
    const [start, end] = seasonRanges[selectedSeason];
    return terms.slice(start, end + 1);
  }, [selectedSeason, terms]);

  const ritualTerms = useMemo(() => getRitualTerms(), []);

  const toggleExpand = (termId: string) => {
    setExpandedTerm(expandedTerm === termId ? null : termId);
  };

  const createRitualLink = (term: SolarTermWithDate) => {
    const params = new URLSearchParams();
    if (ancestors.length > 0) {
      params.set('ancestorId', ancestors[0].id);
    }
    params.set('date', term.date);
    params.set('solarTerm', term.name);
    return `/rituals/new?${params.toString()}`;
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
            <Sun className="w-8 h-8" />
            二十四节气祭祀指南
          </h1>
          <p className="text-amber-100 mb-6 max-w-2xl">
            传统祭祀讲究时令节气，了解二十四节气与祭祀习俗的对应关系，
            让每一次祭祀都更符合传统礼制。
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <CalendarDays className="w-5 h-5" />
              <span>全年 {terms.length} 个节气</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Flame className="w-5 h-5" />
              <span>{ritualTerms.length} 个祭祀节气</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                当前节气
              </h2>
              <span className="text-sm text-brown-500">{currentYear}年</span>
            </div>
            
            <div className={`bg-gradient-to-br ${currentTerm.color} rounded-2xl p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 opacity-20 text-9xl leading-none transform translate-x-8 -translate-y-4">
                {currentTerm.icon}
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{currentTerm.icon}</span>
                      <div>
                        <h3 className="font-serif text-3xl font-bold">{currentTerm.name}</h3>
                        <p className="text-white/80 text-sm">{currentTerm.englishName}</p>
                      </div>
                    </div>
                    <p className="text-white/90 mt-3 max-w-md">{currentTerm.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <p className="text-xs text-white/80">节气日期</p>
                      <p className="font-bold">{formatSolarTermDate(currentTerm)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 mt-2">
                      <p className="text-xs text-white/80">下一节气</p>
                      <p className="font-bold">{nextTerm.name} · {daysUntilNext}天后</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {currentTerm.customs.map((custom, i) => (
                    <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      {custom}
                    </span>
                  ))}
                </div>

                {currentTerm.hasRitualCustom && currentTerm.ritualSuggestion && (
                  <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Flame className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">祭祀建议</p>
                        <p className="text-sm text-white/90">{currentTerm.ritualSuggestion}</p>
                      </div>
                    </div>
                    {currentTerm.offerings && currentTerm.offerings.length > 0 && (
                      <div className="mt-4 flex items-start gap-3">
                        <Gift className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-1">推荐供品</p>
                          <div className="flex flex-wrap gap-2">
                            {currentTerm.offerings.map((offering, i) => (
                              <span key={i} className="px-2 py-1 bg-white/20 rounded-lg text-xs">
                                {offering}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex gap-3">
                      <Link
                        to={createRitualLink(currentTerm)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        创建祭祀记录
                      </Link>
                      <Link
                        to={`/reservations/new?date=${currentTerm.date}&solarTerm=${currentTerm.name}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4" />
                        预约祭祀
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-serif text-lg font-bold text-brown-800 mb-4">季节筛选</h3>
            <div className="space-y-2">
              {(Object.keys(SEASON_META) as Season[]).map(season => {
                const meta = SEASON_META[season];
                const Icon = meta.icon;
                const isActive = selectedSeason === season;
                return (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? meta.color + ' font-medium shadow-soft'
                        : 'hover:bg-cream-100 text-brown-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{meta.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-bold text-brown-800 mb-4">即将到来</h3>
            <div className={`bg-gradient-to-br ${nextTerm.color} rounded-xl p-4 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{nextTerm.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-lg">{nextTerm.name}</p>
                  <p className="text-sm text-white/80">{formatSolarTermDate(nextTerm)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{daysUntilNext}</p>
                  <p className="text-xs text-white/80">天后</p>
                </div>
              </div>
              {nextTerm.hasRitualCustom && (
                <Link
                  to={`/reservations/new?date=${nextTerm.date}&solarTerm=${nextTerm.name}`}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <CalendarDays className="w-4 h-4" />
                  预约{nextTerm.name}祭祀
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gold-500" />
            {SEASON_META[selectedSeason].label}一览
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-brown-500">
              <span className="w-3 h-3 rounded-full bg-gold-400" />
              有祭祀习俗
            </span>
            <span className="flex items-center gap-1 text-brown-500">
              <span className="w-3 h-3 rounded-full bg-brown-300" />
              无祭祀习俗
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map((term, index) => {
            const isCurrent = term.id === currentTerm.id;
            const isExpanded = expandedTerm === term.id;
            
            return (
              <div
                key={term.id}
                className={`relative rounded-2xl border-2 transition-all overflow-hidden ${
                  isCurrent
                    ? 'border-gold-400 shadow-lg'
                    : term.hasRitualCustom
                    ? 'border-brown-100 hover:border-gold-300 hover:shadow-soft'
                    : 'border-brown-100 hover:border-brown-200 hover:shadow-soft'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-gold-500 text-white text-xs px-3 py-1 rounded-bl-xl font-medium">
                    当前节气
                  </div>
                )}
                {term.hasRitualCustom && !isCurrent && (
                  <div className="absolute top-0 right-0 bg-gold-100 text-gold-700 text-xs px-3 py-1 rounded-bl-xl">
                    祭祀节气
                  </div>
                )}
                
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpand(term.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${term.color} flex items-center justify-center flex-shrink-0 shadow-soft`}>
                      <span className="text-2xl">{term.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-brown-800">{term.name}</h3>
                      </div>
                      <p className="text-xs text-brown-500 mt-0.5">{term.englishName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <CalendarDays className="w-3.5 h-3.5 text-brown-400" />
                        <span className="text-sm text-brown-600">{formatDate(term.date, 'short')}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-brown-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brown-100 pt-4 space-y-4 animate-slide-down">
                    <p className="text-sm text-brown-600">{term.description}</p>
                    
                    <div>
                      <p className="text-xs text-brown-500 mb-2">传统习俗</p>
                      <div className="flex flex-wrap gap-2">
                        {term.customs.map((custom, i) => (
                          <span key={i} className="px-2 py-1 bg-cream-100 text-brown-700 rounded-lg text-xs">
                            {custom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {term.hasRitualCustom && term.ritualSuggestion && (
                      <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Flame className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium text-gold-800">祭祀建议</p>
                        </div>
                        <p className="text-sm text-brown-700">{term.ritualSuggestion}</p>
                      </div>
                    )}

                    {term.hasRitualCustom && term.offerings && term.offerings.length > 0 && (
                      <div>
                        <p className="text-xs text-brown-500 mb-2 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          推荐供品
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {term.offerings.map((offering, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs border border-amber-200">
                              {offering}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {term.hasRitualCustom && (
                      <div className="flex gap-2 pt-2">
                        <Link
                          to={createRitualLink(term)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brown-600 text-white rounded-lg text-sm font-medium hover:bg-brown-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          创建记录
                        </Link>
                        <Link
                          to={`/reservations/new?date=${term.date}&solarTerm=${term.name}`}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors"
                        >
                          <CalendarDays className="w-4 h-4" />
                          预约祭祀
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12 text-brown-400">
            <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>当前筛选条件下暂无节气</p>
          </div>
        )}
      </div>

      {selectedSeason === 'all' || selectedSeason === 'ritual' ? (
        <div className="card">
          <h2 className="section-title mb-6 flex items-center gap-2">
            <Flame className="w-5 h-5 text-gold-500" />
            重要祭祀节气
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ritualTerms.map((ritualTerm) => {
              const termWithDate = terms.find(t => t.id === ritualTerm.id);
              if (!termWithDate) return null;
              
              return (
                <Link
                  key={ritualTerm.id}
                  to={createRitualLink(termWithDate)}
                  className={`group flex flex-col items-center p-4 rounded-2xl border-2 border-transparent bg-gradient-to-br ${ritualTerm.color} bg-opacity-10 hover:shadow-soft hover:scale-105 transition-all`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ritualTerm.color} flex items-center justify-center mb-3 shadow-soft group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{ritualTerm.icon}</span>
                  </div>
                  <h4 className="font-serif font-bold text-brown-800 text-center">{ritualTerm.name}</h4>
                  <p className="text-xs text-brown-500 mt-1">{formatDate(termWithDate.date, 'short')}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-brown-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3" />
                    <span>创建祭祀</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

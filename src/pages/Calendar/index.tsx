import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Flame,
  Heart,
  Skull,
  MapPin,
  X,
  CalendarClock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  getCalendarDays,
  getEventsForMonth,
  isToday,
  isUpcoming,
  CalendarEvent,
  formatDate,
  getLunarCalendar,
} from '@/utils/dateUtils';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const eventTypeConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof Flame; label: string }> = {
  birth: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', icon: Heart, label: '诞辰' },
  death: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', icon: Skull, label: '忌日' },
  ritual: { bg: 'bg-gold-400/10', text: 'text-gold-600', dot: 'bg-gold-500', icon: Flame, label: '祭祀' },
  reservation: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: CalendarClock, label: '预约' },
};

export default function CalendarPage() {
  const { ancestors, rituals, reservations, settings } = useAppStore();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => getCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);
  const eventsMap = useMemo(
    () => getEventsForMonth(currentYear, currentMonth, ancestors, rituals, reservations),
    [currentYear, currentMonth, ancestors, rituals, reservations]
  );

  const selectedEvents = selectedDate ? (eventsMap.get(selectedDate) || []) : [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDate(null);
  };

  const goToday = () => {
    const n = new Date();
    setCurrentYear(n.getFullYear());
    setCurrentMonth(n.getMonth());
    setSelectedDate(null);
  };

  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const isCurrentMonth = (d: Date) => d.getMonth() === currentMonth;

  const totalEventsThisMonth = Array.from(eventsMap.values()).reduce((sum, evts) => sum + evts.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title mb-0">
            <CalendarDays className="w-6 h-6 text-gold-500" />
            纪念日日历
          </h1>
          <p className="text-sm text-brown-500 mt-1 ml-5">
            {currentYear}年{MONTHS[currentMonth]} · 共 {totalEventsThisMonth} 个纪念日
          </p>
        </div>
        <button onClick={goToday} className="btn-secondary text-sm px-4 py-2">
          回到今天
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card !p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <button onClick={prevMonth} className="p-2 hover:bg-brown-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-brown-600" />
            </button>
            <h2 className="font-serif text-xl font-semibold text-brown-800">
              {currentYear}年 {MONTHS[currentMonth]}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-brown-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-brown-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-brown-100 rounded-xl overflow-hidden">
            {WEEKDAYS.map(d => (
              <div key={d} className="bg-cream-50 py-2 text-center text-sm font-medium text-brown-600">
                {d}
              </div>
            ))}

            {days.map((day, idx) => {
              const key = dateKey(day);
              const events = eventsMap.get(key) || [];
              const inMonth = isCurrentMonth(day);
              const today = isToday(day);
              const upcoming = isUpcoming(day, settings.reminderDays);
              const selected = selectedDate === key;
              const hasEvents = events.length > 0;
              const eventTypes = [...new Set(events.map(e => e.type))];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(selected ? null : key)}
                  className={`
                    relative bg-white p-1.5 min-h-[80px] sm:min-h-[100px] text-left transition-all duration-200
                    hover:bg-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-inset
                    ${!inMonth ? 'opacity-30' : ''}
                    ${selected ? 'ring-2 ring-gold-500 bg-gold-400/5' : ''}
                    ${today ? 'bg-brown-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                        ${today ? 'bg-brown-600 text-white' : inMonth ? 'text-brown-800' : 'text-brown-400'}
                      `}
                    >
                      {day.getDate()}
                    </span>
                    {upcoming && hasEvents && inMonth && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>

                  {inMonth && (
                    <div className="mt-1 space-y-0.5">
                      {eventTypes.slice(0, 3).map(type => {
                        const cfg = eventTypeConfig[type];
                        return (
                          <div key={type} className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                            <span className={`text-[10px] leading-tight truncate ${cfg.text}`}>
                              {events.filter(e => e.type === type)[0].ancestorName}{cfg.label}
                            </span>
                          </div>
                        );
                      })}
                      {events.length > 3 && (
                        <span className="text-[10px] text-brown-400">+{events.length - 3}项</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold-500 rounded-full" />
              图例说明
            </h3>
            <div className="space-y-3">
              {Object.entries(eventTypeConfig).map(([type, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-800">{cfg.label}</p>
                      <p className="text-xs text-brown-500">
                        {type === 'birth' ? '先人诞辰纪念日' :
                         type === 'death' ? '先人忌日纪念日' :
                         type === 'ritual' ? '已完成的祭祀记录' : '待完成的祭祀预约'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-2 border-t border-brown-100">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs text-brown-500">即将到来的纪念日（{settings.reminderDays}天内）</p>
              </div>
            </div>
          </div>

          {selectedDate ? (
            <div className="card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-brown-800">
                  {formatDate(selectedDate)}
                </h3>
                <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-brown-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-brown-400" />
                </button>
              </div>
              <p className="text-xs text-brown-500 mb-4">农历 {getLunarCalendar(selectedDate)}</p>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-brown-400">
                  <div className="text-4xl mb-2">🕊️</div>
                  <p className="text-sm">当天暂无纪念活动</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(event => {
                    const cfg = eventTypeConfig[event.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={event.id} className={`p-4 rounded-xl ${cfg.bg} border border-brown-100`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center border ${cfg.dot}/20`}>
                            <Icon className={`w-5 h-5 ${cfg.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-brown-800 truncate">{event.ancestorName}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.dot}/20`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-brown-500 mt-0.5">{event.label}</p>
                            {event.location && (
                              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {event.type === 'reservation' && event.reservationId && (
                            <Link
                              to={`/reservations/${event.reservationId}/edit`}
                              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              查看预约
                            </Link>
                          )}
                          <Link
                            to={`/ancestors/${event.ancestorId}`}
                            className="text-xs px-3 py-1.5 bg-cream-100 text-brown-600 rounded-lg hover:bg-cream-200 transition-colors"
                          >
                            查看先人
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gold-500 rounded-full" />
                本月概览
              </h3>
              <div className="space-y-3">
                {(() => {
                  const allEvents: CalendarEvent[] = [];
                  eventsMap.forEach(evts => allEvents.push(...evts));
                  const grouped = allEvents.reduce<Record<string, CalendarEvent[]>>((acc, evt) => {
                    const d = evt.date;
                    if (!acc[d]) acc[d] = [];
                    acc[d].push(evt);
                    return acc;
                  }, {});
                  const sorted = Object.entries(grouped).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
                  if (sorted.length === 0) {
                    return (
                      <div className="text-center py-8 text-brown-400">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-sm">本月暂无纪念活动</p>
                      </div>
                    );
                  }
                  return sorted.map(([date, evts]) => (
                    <div key={date} className="space-y-2">
                      <p className="text-xs font-medium text-brown-500 sticky top-0 bg-white/80 py-1">
                        {formatDate(date, 'short')}（农历 {getLunarCalendar(date)}）
                      </p>
                      {evts.map(evt => {
                        const cfg = eventTypeConfig[evt.type];
                        return (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedDate(date)}
                            className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-cream-50 transition-colors"
                          >
                            <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                            <span className="text-sm text-brown-700 truncate">{evt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

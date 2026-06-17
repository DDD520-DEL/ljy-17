import { Link } from 'react-router-dom';
import { 
  Flame, 
  CalendarDays, 
  ScrollText, 
  TreeDeciduous, 
  Users, 
  Gift, 
  Clock,
  ChevronRight,
  TrendingUp,
  Heart,
  CalendarClock,
  MapPin,
  Camera,
  ZoomIn,
  CalendarRange,
  Sparkles,
} from 'lucide-react';
import { FAMILY_EVENT_TYPE_META } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getLunarCalendar, getAge, calculateDaysUntilFutureDate, getCalendarDays, getEventsForMonth, isToday, isUpcoming } from '@/utils/dateUtils';
import { AlbumPhoto } from '@/types';

export default function Dashboard() {
  const { ancestors, rituals, events, reservations, members, reminders, branches, settings } = useAppStore();
  
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;

  const getBranchStats = (branchId: string) => {
    const ancestorCount = ancestors.filter(a => a.branchId === branchId).length;
    const memberCount = members.filter(m => m.branchId === branchId).length;
    const ritualCount = rituals.filter(r => {
      const ancestor = ancestors.find(a => a.id === r.ancestorId);
      return r.branchId === branchId || ancestor?.branchId === branchId;
    }).length;
    return { ancestorCount, memberCount, ritualCount };
  };
  
  const stats = [
    { 
      label: '先人数', 
      value: ancestors.length, 
      icon: Flame, 
      color: 'from-orange-400 to-red-500',
      bg: 'bg-orange-50'
    },
    { 
      label: '待办提醒', 
      value: reminders.length, 
      icon: Clock, 
      color: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50'
    },
    { 
      label: '祭祀预约', 
      value: pendingReservations, 
      icon: CalendarClock, 
      color: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-50'
    },
    { 
      label: '祭祀记录', 
      value: rituals.length, 
      icon: ScrollText, 
      color: 'from-emerald-400 to-green-500',
      bg: 'bg-green-50'
    },
    { 
      label: '家族大事记', 
      value: events.length, 
      icon: Sparkles, 
      color: 'from-pink-400 to-rose-500',
      bg: 'bg-pink-50'
    },
    { 
      label: '家族成员', 
      value: members.length, 
      icon: Users, 
      color: 'from-purple-400 to-pink-500',
      bg: 'bg-purple-50'
    },
  ];

  const quickActions = [
    { label: '添加先人', icon: Flame, path: '/ancestors/new', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
    { label: '祭祀预约', icon: CalendarClock, path: '/reservations/new', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { label: '记录祭祀', icon: CalendarDays, path: '/rituals/new', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { label: '家族大事', icon: Sparkles, path: '/family-events/new', color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
    { label: '查看族谱', icon: TreeDeciduous, path: '/family-tree', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
    { label: '家属管理', icon: Users, path: '/members', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
    { label: '纪念日历', icon: CalendarRange, path: '/calendar', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
    { label: '家族相册', icon: Camera, path: '/album', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
  ];

  const upcomingReminders = reminders.slice(0, 6);
  const recentRituals = [...rituals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const recentEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  const upcomingReservations = [...reservations]
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentPhotos: AlbumPhoto[] = (() => {
    const all: AlbumPhoto[] = [];
    ancestors.forEach((ancestor) => {
      (ancestor.photos || []).forEach((url) => {
        all.push({
          url,
          sourceType: 'ancestor',
          sourceId: ancestor.id,
          sourceName: ancestor.name,
          date: ancestor.createdAt,
          description: `${ancestor.name} - ${ancestor.relationship}`,
        });
      });
    });
    rituals.forEach((ritual) => {
      const ancestorName = ritual.ancestorName || ancestors.find((a) => a.id === ritual.ancestorId)?.name || '';
      (ritual.photos || []).forEach((url) => {
        all.push({
          url,
          sourceType: 'ritual',
          sourceId: ritual.id,
          sourceName: ancestorName,
          date: ritual.date,
          description: `${ancestorName} 祭祀 - ${ritual.location}`,
        });
      });
    });
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-brown-700 via-brown-600 to-gold-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold mb-2">缅怀先人，传承家风</h1>
          <p className="text-brown-100 mb-6 max-w-xl">
            记录家族历史，传承先辈美德。让每一次祭祀都成为家族凝聚力的纽带。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/ancestors/new" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brown-700 rounded-xl font-medium hover:bg-brown-50 transition-all shadow-lg hover:shadow-xl">
              <Flame className="w-5 h-5" />
              添加先人
            </Link>
            <Link to="/rituals/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 text-white rounded-xl font-medium hover:bg-gold-500 transition-all shadow-lg hover:shadow-xl">
              <Gift className="w-5 h-5" />
              记录祭祀
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="stat-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl ${stat.bg} mb-3`}>
                  <Icon className={`w-7 h-7 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                </div>
                <p className="text-3xl font-bold text-brown-800 font-serif mb-1">{stat.value}</p>
                <p className="text-brown-500 text-xs">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${action.color}`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-medium text-xs text-center">{action.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-gold-500" />
            纪念日历
          </h2>
          <Link to="/calendar" className="text-sm text-brown-500 hover:text-brown-700 flex items-center gap-1">
            查看完整日历 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {(() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth();
          const miniDays = getCalendarDays(year, month);
          const miniEvents = getEventsForMonth(year, month, ancestors, rituals, reservations);
          const WEEKDAYS_MINI = ['日', '一', '二', '三', '四', '五', '六'];
          const dateKey = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const inMonth = (d: Date) => d.getMonth() === month;
          return (
            <div>
              <p className="text-center font-serif text-lg font-semibold text-brown-800 mb-3">
                {year}年{month + 1}月
              </p>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS_MINI.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-brown-500 py-1">{d}</div>
                ))}
                {miniDays.map((day, idx) => {
                  const key = dateKey(day);
                  const events = miniEvents.get(key) || [];
                  const today = isToday(day);
                  const isM = inMonth(day);
                  const upcoming = isUpcoming(day, settings.reminderDays);
                  const hasBirth = events.some(e => e.type === 'birth');
                  const hasDeath = events.some(e => e.type === 'death');
                  const hasRitual = events.some(e => e.type === 'ritual' || e.type === 'reservation');
                  return (
                    <Link
                      key={idx}
                      to="/calendar"
                      className={`
                        relative flex flex-col items-center justify-center py-1.5 rounded-lg text-sm transition-all
                        ${!isM ? 'text-brown-300' : today ? 'bg-brown-600 text-white font-bold' : 'text-brown-700 hover:bg-cream-100'}
                        ${upcoming && isM && !today ? 'ring-1 ring-red-300' : ''}
                      `}
                    >
                      {day.getDate()}
                      {isM && events.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasBirth && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {hasDeath && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                          {hasRitual && <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1 text-xs text-brown-500"><span className="w-2 h-2 rounded-full bg-green-500" />诞辰</span>
                <span className="flex items-center gap-1 text-xs text-brown-500"><span className="w-2 h-2 rounded-full bg-purple-500" />忌日</span>
                <span className="flex items-center gap-1 text-xs text-brown-500"><span className="w-2 h-2 rounded-full bg-gold-500" />祭祀</span>
                <span className="flex items-center gap-1 text-xs text-brown-500"><span className="w-2 h-2 rounded-full border border-red-300" />即将到来</span>
              </div>
            </div>
          );
        })()}
      </div>

      {branches.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <TreeDeciduous className="w-5 h-5 text-gold-500" />
              分支统计
            </h2>
            <Link to="/settings" className="text-sm text-brown-500 hover:text-brown-700 flex items-center gap-1">
              管理分支 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => {
              const branchStats = getBranchStats(branch.id);
              return (
                <div 
                  key={branch.id}
                  className="p-5 rounded-2xl border border-brown-100 bg-gradient-to-br from-cream-50 to-white hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-soft"
                      style={{ backgroundColor: branch.color || '#dc2626' }}
                    >
                      {branch.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-brown-800">{branch.name}</h3>
                      {branch.description && (
                        <p className="text-xs text-brown-500">{branch.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-brown-800 font-serif">{branchStats.ancestorCount}</p>
                      <p className="text-xs text-brown-500">先人</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 font-serif">{branchStats.memberCount}</p>
                      <p className="text-xs text-brown-500">成员</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600 font-serif">{branchStats.ritualCount}</p>
                      <p className="text-xs text-brown-500">祭祀</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">即将到来</h2>
            <Link to="/reservations" className="text-sm text-brown-500 hover:text-brown-700 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-12 text-brown-400">
              <div className="text-5xl mb-3">🕊️</div>
              <p>近期暂无纪念日和预约</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder, index) => (
                <div 
                  key={reminder.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    reminder.daysLeft <= 3 ? 'bg-red-50 border border-red-100' : 
                    reminder.type === 'reservation' ? 'bg-blue-50 border border-blue-100' :
                    'bg-cream-50 border border-brown-100'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                    reminder.daysLeft <= 3 ? 'bg-red-100 text-red-600' : 
                    reminder.type === 'reservation' ? 'bg-blue-100 text-blue-600' :
                    'bg-gold-100 text-gold-600'
                  }`}>
                    <span className="text-2xl font-bold">{reminder.daysLeft || '今'}</span>
                    <span className="text-xs">天</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-brown-800 truncate">{reminder.ancestorName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        reminder.type === 'birth' 
                          ? 'bg-green-100 text-green-700' 
                          : reminder.type === 'death'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {reminder.type === 'birth' ? '诞辰' : 
                         reminder.type === 'death' ? '忌日' : '预约祭祀'}
                      </span>
                    </div>
                    <p className="text-sm text-brown-500 mt-0.5">{reminder.dateStr}</p>
                    {reminder.location && (
                      <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {reminder.location}
                      </p>
                    )}
                    <p className="text-xs text-brown-400 mt-0.5">农历 {getLunarCalendar(reminder.date)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brown-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">预约祭祀</h2>
            <Link to="/reservations" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              管理预约 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-12 text-brown-400">
              <div className="text-5xl mb-3">📅</div>
              <p>暂无祭祀预约</p>
              <Link to="/reservations/new" className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm underline">
                创建第一个预约
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReservations.map((reservation, index) => {
                const daysLeft = calculateDaysUntilFutureDate(reservation.date);
                const isUrgent = daysLeft >= 0 && daysLeft <= 3;
                const isOverdue = daysLeft < 0;
                return (
                  <Link
                    key={reservation.id}
                    to={`/reservations/${reservation.id}/edit`}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md ${
                      isUrgent ? 'bg-red-50 border border-red-100' : 
                      isOverdue ? 'bg-orange-50 border border-orange-100' :
                      'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                      isUrgent ? 'bg-red-100 text-red-600' : 
                      isOverdue ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <CalendarClock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-brown-800 truncate">
                          {reservation.ancestorName} 祭祀
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isOverdue 
                            ? 'bg-orange-100 text-orange-700'
                            : isUrgent 
                              ? 'bg-red-100 text-red-700' 
                              : daysLeft <= 7 
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isOverdue ? `逾期 ${Math.abs(daysLeft)} 天` : daysLeft === 0 ? '今天' : `${daysLeft} 天后`}
                        </span>
                      </div>
                      <p className="text-sm text-brown-500 mt-0.5 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(reservation.date)}
                      </p>
                      <p className="text-xs text-brown-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {reservation.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {reservation.participants.slice(0, 3).map((p, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-0.5 rounded-full text-brown-600 border border-brown-100">
                            {p}
                          </span>
                        ))}
                        {reservation.participants.length > 3 && (
                          <span className="text-xs text-brown-400">+{reservation.participants.length - 3}人</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">最近祭祀</h2>
            <Link to="/rituals" className="text-sm text-brown-500 hover:text-brown-700 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentRituals.length === 0 ? (
            <div className="text-center py-12 text-brown-400">
              <div className="text-5xl mb-3">📜</div>
              <p>暂无祭祀记录</p>
              <Link to="/rituals/new" className="inline-block mt-3 text-brown-600 hover:text-brown-800 text-sm underline">
                记录第一次祭祀
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRituals.map((ritual, index) => (
                <div 
                  key={ritual.id}
                  className="flex items-start gap-4 p-4 bg-cream-50 rounded-xl border border-brown-100 hover:bg-cream-100 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-brown-800">{ritual.ancestorName} 祭祀</h3>
                      <span className="text-xs text-brown-500">{formatDate(ritual.date, 'short')}</span>
                    </div>
                    <p className="text-sm text-brown-500 mt-1 line-clamp-1">{ritual.location}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {ritual.participants.slice(0, 3).map((p, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-0.5 rounded-full text-brown-600 border border-brown-100">
                          {p}
                        </span>
                      ))}
                      {ritual.participants.length > 3 && (
                        <span className="text-xs text-brown-400">+{ritual.participants.length - 3}人</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">家族先人</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ancestors.slice(0, 4).map((ancestor, index) => (
            <Link 
              key={ancestor.id}
              to={`/ancestors/${ancestor.id}/edit`}
              className="group p-5 bg-gradient-to-br from-cream-50 to-white rounded-2xl border border-brown-100 hover:border-gold-300 hover:shadow-card transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-brown-400 to-brown-600 rounded-full flex items-center justify-center text-white text-xl font-serif shadow-soft group-hover:scale-110 transition-transform overflow-hidden">
                  {ancestor.photos && ancestor.photos.length > 0 ? (
                    <img src={ancestor.photos[0]} alt={ancestor.name} className="w-full h-full object-cover" />
                  ) : (
                    ancestor.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-brown-800 group-hover:text-gold-600 transition-colors">{ancestor.name}</h3>
                  <p className="text-sm text-brown-500">{ancestor.relationship}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brown-600">
                  享年 {getAge(ancestor.birthDate, ancestor.deathDate)} 岁
                </span>
                <div className="flex items-center gap-1 text-brown-400">
                  <Heart className="w-4 h-4" />
                  <span>缅怀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {recentPhotos.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">近期照片</h2>
            <Link to="/album" className="text-sm text-brown-500 hover:text-brown-700 flex items-center gap-1">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentPhotos.map((photo, index) => (
              <Link
                key={`${photo.sourceId}-${index}`}
                to="/album"
                className="group relative aspect-square rounded-2xl overflow-hidden border border-brown-100 hover:border-gold-300 transition-all duration-300 hover:shadow-card bg-cream-50"
              >
                <img
                  src={photo.url}
                  alt={photo.description}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">{photo.sourceName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        photo.sourceType === 'ancestor'
                          ? 'bg-blue-500/80 text-white'
                          : 'bg-gold-500/80 text-white'
                      }`}>
                        {photo.sourceType === 'ancestor' ? '先人' : '祭祀'}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/album"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brown-50 to-cream-100 text-brown-700 rounded-xl font-medium hover:from-brown-100 hover:to-cream-200 transition-all border border-brown-200"
            >
              <Camera className="w-4 h-4" />
              进入家族相册
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            近期大事记
          </h2>
          <Link to="/family-events" className="text-sm text-brown-500 hover:text-brown-700 flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-12 text-brown-400">
            <div className="text-5xl mb-3">✨</div>
            <p>暂无大事记记录</p>
            <Link to="/family-events/new" className="inline-block mt-3 text-gold-600 hover:text-gold-700 text-sm underline">
              记录第一件大事 →
            </Link>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-pink-200 via-amber-200 to-emerald-200" />
            <div className="space-y-4">
              {recentEvents.map((event, index) => {
                const typeMeta = FAMILY_EVENT_TYPE_META[event.type];
                return (
                  <div
                    key={event.id}
                    className="relative animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className={`absolute -left-4 top-4 w-4 h-4 rounded-full border-2 border-white shadow-soft ${typeMeta.bgColor.replace('bg-', 'bg-')}`} style={{ backgroundColor: 'transparent', borderColor: 'white' }}>
                      <div className={`w-full h-full rounded-full ${typeMeta.bgColor.replace('bg-', 'bg-')}`} />
                    </div>
                    <Link
                      to={`/family-events/${event.id}/edit`}
                      className={`ml-4 p-4 rounded-xl border transition-all hover:shadow-soft hover:border-gold-300 ${typeMeta.bgColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{typeMeta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-brown-800">{event.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeMeta.color} bg-white/80`}>
                              {typeMeta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-brown-500 mb-2">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {formatDate(event.date)}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                            {event.participants.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.participants.length}人
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-brown-600 line-clamp-2">{event.description}</p>
                          )}
                          {event.photos && event.photos.length > 0 && (
                            <div className="flex gap-1.5 mt-2">
                              {event.photos.slice(0, 3).map((photo, i) => (
                                <div
                                  key={i}
                                  className="w-12 h-12 rounded-lg overflow-hidden border border-white shadow-soft"
                                >
                                  <img
                                    src={photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {event.photos.length > 3 && (
                                <div className="w-12 h-12 rounded-lg bg-white/60 flex items-center justify-center text-xs text-brown-500 border border-white shadow-soft">
                                  +{event.photos.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

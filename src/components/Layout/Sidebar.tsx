import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  CalendarDays,
  ScrollText,
  TreeDeciduous,
  UserCircle,
  Settings,
  Flame,
  CalendarClock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', icon: Home, label: '首页', end: true },
  { path: '/ancestors', icon: Flame, label: '先人管理' },
  { path: '/reservations', icon: CalendarClock, label: '祭祀预约' },
  { path: '/rituals', icon: CalendarDays, label: '祭祀记录' },
  { path: '/timeline', icon: ScrollText, label: '祭祀年表' },
  { path: '/family-tree', icon: TreeDeciduous, label: '族谱展示' },
  { path: '/members', icon: Users, label: '家属管理' },
  { path: '/settings', icon: Settings, label: '系统设置' },
];

export default function Sidebar() {
  const location = useLocation();
  const { reminders, reservations } = useAppStore();
  const urgentCount = reminders.filter(r => r.daysLeft <= 3).length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-brown-50 to-cream-100 border-r border-brown-200 flex flex-col">
      <div className="p-6 border-b border-brown-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-glow">
            <UserCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-brown-800">家族祭祀</h1>
            <p className="text-xs text-brown-500">传承 · 缅怀 · 铭记</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item group relative ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brown-700' : 'text-brown-500 group-hover:text-brown-700'}`} />
              <span className="flex-1">{item.label}</span>
              {item.path === '/' && urgentCount > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {urgentCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-brown-200">
        <div className="bg-gradient-to-r from-brown-100 to-cream-100 rounded-xl p-4">
          <p className="text-sm text-brown-600 mb-2">💡 温馨提示</p>
          <p className="text-xs text-brown-500 mb-2">
            近期有 {reminders.length} 个纪念日即将到来，
            {pendingReservationsCount > 0 && ` 另有 ${pendingReservationsCount} 个预约待进行，`}
            请提前做好祭扫准备。
          </p>
          {pendingReservationsCount > 0 && (
            <Link to="/reservations" className="text-xs text-blue-600 hover:text-blue-700 underline">
              查看预约 →
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

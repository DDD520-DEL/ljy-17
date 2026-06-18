import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Camera,
  FileText,
  CalendarRange,
  Sparkles,
  Package,
  MapPin,
  BookOpen,
  BookText,
  Wallet,
  Library,
  Sun,
  Network,
  BarChart3,
  Star,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FavoriteItem } from '@/types';

const navItems = [
  { path: '/', icon: Home, label: '首页', end: true },
  { path: '/statistics', icon: BarChart3, label: '统计看板' },
  { path: '/ancestors', icon: Flame, label: '先人管理' },
  { path: '/family-rules', icon: BookOpen, label: '家训家规' },
  { path: '/memorial-articles', icon: BookText, label: '追思文章' },
  { path: '/reservations', icon: CalendarClock, label: '祭祀预约' },
  { path: '/rituals', icon: CalendarDays, label: '祭祀记录' },
  { path: '/expenses', icon: Wallet, label: '祭祀花费' },
  { path: '/ritual-templates', icon: FileText, label: '祭祀模板' },
  { path: '/offerings', icon: Package, label: '供品库存' },
  { path: '/offering-wiki', icon: Library, label: '供品百科' },
  { path: '/solar-terms', icon: Sun, label: '节气指南' },
  { path: '/locations', icon: MapPin, label: '祭祀地点' },
  { path: '/family-events', icon: Sparkles, label: '家族大事记' },
  { path: '/album', icon: Camera, label: '家族相册' },
  { path: '/timeline', icon: ScrollText, label: '祭祀年表' },
  { path: '/calendar', icon: CalendarRange, label: '纪念日历' },
  { path: '/family-tree', icon: TreeDeciduous, label: '族谱展示' },
  { path: '/relationship-graph', icon: Network, label: '关系图谱' },
  { path: '/members', icon: Users, label: '家属管理' },
  { path: '/settings', icon: Settings, label: '系统设置' },
];

function getFavoriteLink(item: FavoriteItem): string {
  switch (item.entityType) {
    case 'ancestor':
      return `/ancestors/${item.entityId}`;
    case 'ritual':
      return `/rituals/${item.entityId}/edit`;
    case 'member':
      return `/members/${item.entityId}`;
    default:
      return '/';
  }
}

function getFavoriteIcon(item: FavoriteItem) {
  switch (item.entityType) {
    case 'ancestor':
      return Flame;
    case 'ritual':
      return CalendarDays;
    case 'member':
      return Users;
    default:
      return Star;
  }
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reminders, reservations, offerings, settings, favorites, toggleFavorite } = useAppStore();
  const urgentCount = reminders.filter(r => r.daysLeft <= 3).length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'pending').length;
  const lowStockCount = offerings.filter(o => {
    const threshold = o.lowStockThreshold ?? settings.lowStockThreshold;
    return o.quantity <= threshold;
  }).length;

  const handleRemoveFavorite = (e: React.MouseEvent, item: FavoriteItem) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.entityType, item.entityId, item.name, item.subtitle);
  };

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
              {item.path === '/offerings' && lowStockCount > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {lowStockCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {favorites.length > 0 && (
        <div className="px-4 pt-4 border-t border-brown-200">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
              <span className="text-sm font-medium text-brown-700">我的收藏</span>
              <span className="text-xs text-brown-400">({favorites.length})</span>
            </div>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
            {favorites.map((item) => {
              const Icon = getFavoriteIcon(item);
              const link = getFavoriteLink(item);
              const isActive = location.pathname === link;
              return (
                <div
                  key={item.id}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gold-50 border border-gold-200'
                      : 'hover:bg-brown-50 border border-transparent'
                  }`}
                  onClick={() => navigate(link)}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gold-600' : 'text-brown-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'text-brown-800 font-medium' : 'text-brown-600'}`}>
                      {item.name}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-brown-400 truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${
                    isActive ? 'text-gold-500' : 'text-brown-300 opacity-0 group-hover:opacity-100'
                  }`} />
                  <button
                    onClick={(e) => handleRemoveFavorite(e, item)}
                    className="p-0.5 rounded text-brown-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="取消收藏"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-brown-200 mt-auto">
        <div className="bg-gradient-to-r from-brown-100 to-cream-100 rounded-xl p-4">
          <p className="text-sm text-brown-600 mb-2">💡 温馨提示</p>
          <p className="text-xs text-brown-500 mb-2">
            近期有 {reminders.length} 个纪念日即将到来，
            {pendingReservationsCount > 0 && ` 另有 ${pendingReservationsCount} 个预约待进行，`}
            请提前做好祭扫准备。
          </p>
          {lowStockCount > 0 && (
            <p className="text-xs text-amber-600 mb-2">
              ⚠️ 有 {lowStockCount} 种供品库存不足，请及时采购。
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            {pendingReservationsCount > 0 && (
              <Link to="/reservations" className="text-xs text-blue-600 hover:text-blue-700 underline">
                查看预约 →
              </Link>
            )}
            {lowStockCount > 0 && (
              <Link to="/offerings" className="text-xs text-amber-600 hover:text-amber-700 underline">
                查看库存 →
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

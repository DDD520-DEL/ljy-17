import { Bell, Search, Menu, X, User, Calendar, Users, Cloud, CloudOff, Wifi, RefreshCw, AlertCircle, LogOut, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import { Ancestor, Ritual, FamilyMember } from '@/types';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface SearchResult {
  type: 'ancestor' | 'ritual' | 'member';
  item: Ancestor | Ritual | FamilyMember;
  title: string;
  subtitle: string;
  icon: typeof User;
}

export default function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { reminders, ancestors, rituals, members, setGlobalSearchTerm, user, syncState, logout } = useAppStore();
  
  const urgentReminders = reminders.filter(r => r.daysLeft <= 3);
  const hasUrgent = urgentReminders.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    ancestors.forEach(a => {
      if (a.name.toLowerCase().includes(term) || a.relationship.toLowerCase().includes(term)) {
        results.push({
          type: 'ancestor',
          item: a,
          title: a.name,
          subtitle: `${a.relationship} · ${formatDate(a.deathDate)}`,
          icon: User,
        });
      }
    });

    rituals.forEach(r => {
      if (r.location.toLowerCase().includes(term) || r.ancestorName.toLowerCase().includes(term) ||
          r.participants.some(p => p.toLowerCase().includes(term)) ||
          r.offerings.some(o => o.toLowerCase().includes(term)) ||
          (r.notes && r.notes.toLowerCase().includes(term))) {
        results.push({
          type: 'ritual',
          item: r,
          title: `${r.ancestorName} 祭祀`,
          subtitle: `${formatDate(r.date)} · ${r.location}`,
          icon: Calendar,
        });
      }
    });

    members.forEach(m => {
      if (m.name.toLowerCase().includes(term) || m.relationship.toLowerCase().includes(term) ||
          (m.phone && m.phone.toLowerCase().includes(term))) {
        results.push({
          type: 'member',
          item: m,
          title: m.name,
          subtitle: `${m.relationship} · ${m.generation}代`,
          icon: Users,
        });
      }
    });

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  }, [searchTerm, ancestors, rituals, members]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setGlobalSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      handleSearchNavigate();
    }
  };

  const handleSearchNavigate = () => {
    setShowSearchResults(false);
    const term = searchTerm.trim();
    setGlobalSearchTerm(term);

    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      navigateToResult(firstResult);
    } else {
      navigate('/ancestors', { state: { searchTerm: term } });
    }
    setSearchTerm('');
  };

  const navigateToResult = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchTerm('');
    setGlobalSearchTerm('');

    switch (result.type) {
      case 'ancestor':
        navigate('/ancestors', { state: { searchTerm: result.title } });
        break;
      case 'ritual':
        navigate('/rituals', { state: { searchTerm: result.title } });
        break;
      case 'member':
        navigate('/members', { state: { searchTerm: result.title } });
        break;
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const getSyncIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <Wifi className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'conflict':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        if (!user) return <CloudOff className="w-4 h-4 text-brown-400" />;
        if (syncState.pendingChanges > 0) return <Cloud className="w-4 h-4 text-orange-500" />;
        return <Wifi className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getSyncTooltip = () => {
    switch (syncState.status) {
      case 'syncing':
        return '正在同步...';
      case 'success':
        return '同步成功';
      case 'error':
        return `同步失败：${syncState.lastSyncError || '未知错误'}`;
      case 'conflict':
        return '存在数据冲突';
      default:
        if (!user) return '未登录 - 点击登录后可同步';
        if (syncState.pendingChanges > 0) return `${syncState.pendingChanges} 项待同步`;
        if (syncState.lastSyncAt) return `已同步：${new Date(syncState.lastSyncAt).toLocaleString('zh-CN')}`;
        return '已连接云端';
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-brown-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 hover:bg-brown-100 rounded-lg transition-colors"
          onClick={onMenuToggle}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-brown-600" /> : <Menu className="w-5 h-5 text-brown-600" />}
        </button>
        
        <div className="relative hidden md:block" ref={searchRef}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="搜索先人、活动、家属..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchTerm.trim() && setShowSearchResults(true)}
            className="pl-10 pr-4 py-2 w-64 bg-cream-50 border border-brown-200 rounded-lg text-sm focus:bg-white focus:border-brown-400 focus:outline-none transition-all"
          />
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card border border-brown-100 overflow-hidden z-50 animate-fade-in">
              <div className="p-3 border-b border-brown-100 bg-gradient-to-r from-brown-50 to-cream-50">
                <p className="text-xs font-medium text-brown-600">搜索结果 ({searchResults.length})</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${result.item.id}-${index}`}
                      onClick={() => navigateToResult(result)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-cream-50 transition-colors text-left border-b border-brown-50 last:border-b-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        result.type === 'ancestor' ? 'bg-brown-100 text-brown-600' :
                        result.type === 'ritual' ? 'bg-gold-100 text-gold-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brown-800 text-sm truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-brown-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.type === 'ancestor' ? 'bg-brown-100 text-brown-600' :
                        result.type === 'ritual' ? 'bg-gold-100 text-gold-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {result.type === 'ancestor' ? '先人' : result.type === 'ritual' ? '祭祀' : '家属'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="p-2 border-t border-brown-100 bg-cream-50 text-center">
                <button
                  onClick={handleSearchNavigate}
                  className="text-xs text-brown-600 hover:text-brown-800 transition-colors"
                >
                  按回车键查看全部结果 →
                </button>
              </div>
            </div>
          )}
          
          {showSearchResults && searchTerm.trim() && searchResults.length === 0 && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card border border-brown-100 overflow-hidden z-50 animate-fade-in">
              <div className="p-8 text-center">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm text-brown-600 mb-3">未找到相关结果</p>
                <button
                  onClick={handleSearchNavigate}
                  className="text-xs text-brown-500 hover:text-brown-700 transition-colors"
                >
                  前往先人管理页面搜索 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-brown-700">
            {formatDate(new Date().toISOString())}
          </p>
          <p className="text-xs text-brown-500">
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long' })}
          </p>
        </div>
        
        <div className="relative">
          <button
            className="p-2.5 hover:bg-brown-100 rounded-xl transition-all relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className={`w-5 h-5 ${hasUrgent ? 'text-gold-600' : 'text-brown-500'}`} />
            {hasUrgent && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card border border-brown-100 overflow-hidden z-50 animate-fade-in">
              <div className="p-4 border-b border-brown-100 bg-gradient-to-r from-brown-50 to-cream-50">
                <h3 className="font-serif font-semibold text-brown-800">纪念日提醒</h3>
                <p className="text-xs text-brown-500">近期即将到来的纪念日</p>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {reminders.length === 0 ? (
                  <div className="p-8 text-center text-brown-400">
                    <p className="text-4xl mb-2">🎉</p>
                    <p>近期暂无纪念日提醒</p>
                  </div>
                ) : (
                  reminders.map(reminder => (
                    <div 
                      key={reminder.id}
                      className={`p-4 border-b border-brown-50 hover:bg-cream-50 transition-colors ${
                        reminder.daysLeft <= 3 ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-brown-800">
                            {reminder.ancestorName}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              reminder.type === 'birth' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {reminder.type === 'birth' ? '诞辰' : '忌日'}
                            </span>
                          </p>
                          <p className="text-sm text-brown-500 mt-1">
                            {reminder.dateStr}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          reminder.daysLeft <= 3 
                            ? 'bg-red-100 text-red-700' 
                            : reminder.daysLeft <= 7 
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-cream-100 text-brown-600'
                        }`}>
                          {reminder.daysLeft === 0 ? '今天' : `${reminder.daysLeft}天后`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => user ? navigate('/settings') : navigate('/auth')}
          className="p-2.5 hover:bg-brown-100 rounded-xl transition-all"
          title={getSyncTooltip()}
        >
          {getSyncIcon()}
        </button>
        
        <div className="relative" ref={userMenuRef}>
          <button
            className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-medium shadow-soft hover:shadow-md transition-shadow"
            onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/auth')}
          >
            {user ? user.username.charAt(0).toUpperCase() : '族'}
          </button>

          {showUserMenu && user && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-card border border-brown-100 overflow-hidden z-50 animate-fade-in">
              <div className="p-4 border-b border-brown-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-soft">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brown-800 truncate">{user.username}</p>
                    <p className="text-xs text-brown-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-brown-500" />
                  <span className="text-sm text-brown-700">设置与同步</span>
                </button>
                <div className="h-px bg-brown-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">退出登录</span>
                </button>
              </div>
              <div className="p-3 bg-brown-50 border-t border-brown-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brown-500">同步状态</span>
                  <span className={`inline-flex items-center gap-1 ${
                    syncState.status === 'error' ? 'text-red-600' :
                    syncState.status === 'syncing' ? 'text-blue-600' :
                    syncState.pendingChanges > 0 ? 'text-orange-600' :
                    'text-emerald-600'
                  }`}>
                    {getSyncIcon()}
                    {syncState.status === 'syncing' ? '同步中' :
                     syncState.status === 'error' ? '异常' :
                     syncState.pendingChanges > 0 ? `${syncState.pendingChanges}项待同步` :
                     '正常'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!user && !showUserMenu && (
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block">
              <div className="w-48 p-2 bg-white rounded-xl shadow-card border border-brown-100 text-xs text-brown-600 text-center">
                点击登录账户
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

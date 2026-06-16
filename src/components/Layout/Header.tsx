import { Bell, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const reminders = useAppStore(state => state.reminders);
  
  const urgentReminders = reminders.filter(r => r.daysLeft <= 3);
  const hasUrgent = urgentReminders.length > 0;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-brown-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 hover:bg-brown-100 rounded-lg transition-colors"
          onClick={onMenuToggle}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-brown-600" /> : <Menu className="w-5 h-5 text-brown-600" />}
        </button>
        
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="搜索先人、活动..."
            className="pl-10 pr-4 py-2 w-64 bg-cream-50 border border-brown-200 rounded-lg text-sm focus:bg-white focus:border-brown-400 focus:outline-none transition-all"
          />
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
        
        <div className="w-10 h-10 bg-gradient-to-br from-brown-500 to-brown-700 rounded-full flex items-center justify-center text-white font-medium shadow-soft">
          族
        </div>
      </div>
    </header>
  );
}

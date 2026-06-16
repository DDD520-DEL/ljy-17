import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, Calendar, MapPin, Users, Gift, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getLunarCalendar, calculateDaysUntilFutureDate } from '@/utils/dateUtils';
import { RitualReservation } from '@/types';

type StatusFilter = 'all' | 'pending' | 'completed' | 'cancelled';

export default function ReservationsList() {
  const location = useLocation();
  const { reservations, ancestors, globalSearchTerm, completeReservation, deleteReservation } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAncestor, setSelectedAncestor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { searchTerm?: string } | null;
    if (state?.searchTerm) {
      setSearchTerm(state.searchTerm);
      window.history.replaceState({}, document.title);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [location.state, globalSearchTerm]);

  const getStatusInfo = (status: RitualReservation['status']) => {
    switch (status) {
      case 'pending':
        return { label: '待进行', color: 'bg-blue-100 text-blue-700', icon: Clock };
      case 'completed':
        return { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'cancelled':
        return { label: '已取消', color: 'bg-gray-100 text-gray-600', icon: XCircle };
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const ancestor = ancestors.find(a => a.id === reservation.ancestorId);
    const ancestorName = ancestor?.name || reservation.ancestorName || '';
    const matchesSearch = ancestorName.includes(searchTerm) || 
                          reservation.location.includes(searchTerm) ||
                          reservation.notes?.includes(searchTerm);
    const matchesAncestor = selectedAncestor === null || reservation.ancestorId === selectedAncestor;
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesAncestor && matchesStatus;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleComplete = (id: string) => {
    completeReservation(id);
    setShowCompleteConfirm(null);
  };

  const handleDelete = (id: string) => {
    deleteReservation(id);
    setShowDeleteConfirm(null);
  };

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const completedCount = reservations.filter(r => r.status === 'completed').length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">祭祀预约</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {reservations.length} 条预约，{pendingCount} 条待进行，{completedCount} 条已完成
          </p>
        </div>
        <Link to="/reservations/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新建预约
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
            <input
              type="text"
              placeholder="搜索先人、地点、备注..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-brown-600 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-blue-600 text-white shadow-soft'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                待进行
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-green-600 text-white shadow-soft'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                已完成
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedAncestor(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAncestor === null
                    ? 'bg-gold-500 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                全部先人
              </button>
              {ancestors.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAncestor(a.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAncestor === a.id
                      ? 'bg-gold-500 text-white shadow-soft'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {sortedReservations.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无祭祀预约</h3>
          <p className="text-brown-500 mb-6">提前规划祭祀活动，缅怀先人</p>
          <Link to="/reservations/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新建预约
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReservations.map((reservation, index) => {
            const ancestor = ancestors.find(a => a.id === reservation.ancestorId);
            const statusInfo = getStatusInfo(reservation.status);
            const StatusIcon = statusInfo.icon;
            const daysLeft = calculateDaysUntilFutureDate(reservation.date);
            const isUrgent = reservation.status === 'pending' && daysLeft >= 0 && daysLeft <= 3;
            const isOverdue = reservation.status === 'pending' && daysLeft < 0;
            
            return (
              <div
                key={reservation.id}
                className={`card group hover:border-gold-300 transition-all ${
                  isUrgent ? 'border-red-200 bg-red-50/30' : ''
                } ${isOverdue ? 'border-orange-200 bg-orange-50/30' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-soft ${
                      reservation.status === 'pending' 
                        ? isUrgent 
                          ? 'bg-gradient-to-br from-red-400 to-red-600'
                          : 'bg-gradient-to-br from-blue-400 to-indigo-600'
                        : reservation.status === 'completed'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                      <span className="text-lg font-bold">
                        {new Date(reservation.date).getDate()}
                      </span>
                      <span className="text-xs">
                        {new Date(reservation.date).getMonth() + 1}月
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-serif text-lg font-semibold text-brown-800">
                        {ancestor?.name || reservation.ancestorName} 祭祀预约
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                      {reservation.status === 'pending' && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isOverdue 
                            ? 'bg-orange-100 text-orange-700'
                            : isUrgent 
                              ? 'bg-red-100 text-red-700' 
                              : daysLeft <= 7 
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isOverdue ? `已逾期 ${Math.abs(daysLeft)} 天` : daysLeft === 0 ? '今天' : `${daysLeft} 天后`}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                        农历 {getLunarCalendar(reservation.date)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-brown-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(reservation.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{reservation.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{reservation.participants.length} 人参与</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-4 h-4" />
                        <span>{reservation.offerings.length} 种供品</span>
                      </div>
                    </div>

                    {reservation.notes && (
                      <p className="text-sm text-brown-600 mt-3 line-clamp-2">
                        {reservation.notes}
                      </p>
                    )}

                    {reservation.participants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {reservation.participants.slice(0, 5).map((p, i) => (
                          <span key={i} className="text-xs bg-cream-50 px-2 py-0.5 rounded-full text-brown-600 border border-brown-100">
                            {p}
                          </span>
                        ))}
                        {reservation.participants.length > 5 && (
                          <span className="text-xs text-brown-400">
                            +{reservation.participants.length - 5}人
                          </span>
                        )}
                      </div>
                    )}

                    {reservation.offerings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {reservation.offerings.slice(0, 5).map((o, i) => (
                          <span key={i} className="text-xs bg-gold-50 px-2 py-0.5 rounded-full text-gold-700 border border-gold-100">
                            {o}
                          </span>
                        ))}
                        {reservation.offerings.length > 5 && (
                          <span className="text-xs text-gold-500">
                            +{reservation.offerings.length - 5}种
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:flex-col md:items-end">
                    {reservation.status === 'pending' && (
                      <button
                        onClick={() => setShowCompleteConfirm(reservation.id)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors group/btn"
                        title="标记为已完成"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 group-hover/btn:text-green-600" />
                      </button>
                    )}
                    <Link
                      to={`/reservations/${reservation.id}/edit`}
                      className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-5 h-5 text-brown-500" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(reservation.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="删除"
                    >
                      <XCircle className="w-5 h-5 text-red-400" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-brown-300 hidden md:block" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认完成</h3>
            <p className="text-brown-600 mb-6">
              确定要将此预约标记为已完成吗？系统会自动创建一条对应的祭祀记录。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCompleteConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleComplete(showCompleteConfirm)}
                className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除这条预约记录吗？此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
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

import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, Calendar, TrendingUp, Wallet, PieChart, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/dateUtils';
import { RitualExpense, ExpenseCategory, EXPENSE_CATEGORY_META } from '@/types';

interface RitualExpenseSummary {
  ritualId: string;
  ritualName: string;
  ritualDate: string;
  ancestorName: string;
  totalAmount: number;
  expenseCount: number;
  expenses: RitualExpense[];
  categoryBreakdown: Record<ExpenseCategory, number>;
}

export default function ExpensesList() {
  const location = useLocation();
  const { expenses, rituals, ancestors, globalSearchTerm } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [selectedRitualId, setSelectedRitualId] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'list'>('summary');
  const [expandedRituals, setExpandedRituals] = useState<Set<string>>(new Set());

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<ExpenseCategory, number> = {
      offering: 0,
      transport: 0,
      catering: 0,
      other: 0,
    };
    expenses.forEach(e => {
      breakdown[e.category] += e.amount;
    });
    return breakdown;
  }, [expenses]);

  const ritualSummaries = useMemo((): RitualExpenseSummary[] => {
    const summaryMap = new Map<string, RitualExpenseSummary>();

    rituals.forEach(ritual => {
      const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
      const ancestorName = ancestor?.name || ritual.ancestorName || '';
      const ritualName = `${ancestorName} 祭祀`;

      summaryMap.set(ritual.id, {
        ritualId: ritual.id,
        ritualName,
        ritualDate: ritual.date,
        ancestorName,
        totalAmount: 0,
        expenseCount: 0,
        expenses: [],
        categoryBreakdown: {
          offering: 0,
          transport: 0,
          catering: 0,
          other: 0,
        },
      });
    });

    expenses.forEach(expense => {
      const summary = summaryMap.get(expense.ritualId);
      if (summary) {
        summary.totalAmount += expense.amount;
        summary.expenseCount += 1;
        summary.expenses.push(expense);
        summary.categoryBreakdown[expense.category] += expense.amount;
      }
    });

    return Array.from(summaryMap.values())
      .filter(s => s.expenseCount > 0)
      .sort((a, b) => new Date(b.ritualDate).getTime() - new Date(a.ritualDate).getTime());
  }, [expenses, rituals, ancestors]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const ritual = rituals.find(r => r.id === expense.ritualId);
      const ancestor = ancestors.find(a => a.id === ritual?.ancestorId);
      const ancestorName = ancestor?.name || ritual?.ancestorName || '';
      const ritualName = `${ancestorName} 祭祀`;

      const matchesSearch = searchTerm === '' ||
        expense.notes?.includes(searchTerm) ||
        ritualName.includes(searchTerm) ||
        EXPENSE_CATEGORY_META[expense.category].label.includes(searchTerm);

      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesRitual = selectedRitualId === 'all' || expense.ritualId === selectedRitualId;

      return matchesSearch && matchesCategory && matchesRitual;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, rituals, ancestors, searchTerm, selectedCategory, selectedRitualId]);

  const toggleRitualExpand = (ritualId: string) => {
    const newExpanded = new Set(expandedRituals);
    if (newExpanded.has(ritualId)) {
      newExpanded.delete(ritualId);
    } else {
      newExpanded.add(ritualId);
    }
    setExpandedRituals(newExpanded);
  };

  const getRitualOptions = () => {
    return rituals
      .filter(r => expenses.some(e => e.ritualId === r.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(ritual => {
        const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
        const ancestorName = ancestor?.name || ritual.ancestorName || '';
        return {
          id: ritual.id,
          label: `${ancestorName} 祭祀 - ${formatDate(ritual.date)}`,
        };
      });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">祭祀花费</h1>
          <p className="text-brown-500 text-sm mt-1">
            共记录 {expenses.length} 笔花费，总支出 ¥{totalAmount.toFixed(2)}
          </p>
        </div>
        <Link
          to="/expenses/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          记录花费
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <p className="text-sm text-brown-500">总支出</p>
              <p className="text-2xl font-bold text-brown-800">
                ¥{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-brown-500">花费笔数</p>
              <p className="text-2xl font-bold text-brown-800">{expenses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-brown-500">平均单笔</p>
              <p className="text-2xl font-bold text-brown-800">
                ¥{expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-brown-500">关联祭祀</p>
              <p className="text-2xl font-bold text-brown-800">{ritualSummaries.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map(category => {
          const meta = EXPENSE_CATEGORY_META[category];
          const amount = categoryBreakdown[category];
          const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
          return (
            <div key={category} className={`${meta.bgColor} rounded-xl p-4 border border-brown-100`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{meta.icon}</span>
                <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
              </div>
              <p className="text-xl font-bold text-brown-800">¥{amount.toFixed(2)}</p>
              <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${meta.bgColor.replace('50', '400')}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-brown-500 mt-1">{percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>

      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
              <input
                type="text"
                placeholder="搜索备注、祭祀名称、类别..."
                value={searchTerm || globalSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-brown-600 font-medium">视图：</label>
              <div className="flex bg-brown-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'summary'
                      ? 'bg-white text-brown-800 shadow-sm'
                      : 'text-brown-600 hover:text-brown-800'
                  }`}
                >
                  按祭祀汇总
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-brown-800 shadow-sm'
                      : 'text-brown-600 hover:text-brown-800'
                  }`}
                >
                  全部记录
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-brown-600 font-medium">类别：</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | 'all')}
                className="input-field py-2 px-3 text-sm"
              >
                <option value="all">全部类别</option>
                {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map(cat => (
                  <option key={cat} value={cat}>
                    {EXPENSE_CATEGORY_META[cat].icon} {EXPENSE_CATEGORY_META[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-brown-600 font-medium">祭祀：</label>
              <select
                value={selectedRitualId}
                onChange={(e) => setSelectedRitualId(e.target.value)}
                className="input-field py-2 px-3 text-sm"
              >
                <option value="all">全部祭祀</option>
                {getRitualOptions().map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <div className="space-y-4">
          {ritualSummaries.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-10 h-10 text-brown-400" />
              </div>
              <h3 className="font-serif text-xl text-brown-800 mb-2">暂无花费记录</h3>
              <p className="text-brown-500 mb-6">记录第一次祭祀花费，便于日后查阅</p>
              <Link to="/expenses/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                记录花费
              </Link>
            </div>
          ) : (
            ritualSummaries.map((summary, index) => (
              <div
                key={summary.ritualId}
                className="card group hover:border-gold-300 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                  onClick={() => toggleRitualExpand(summary.ritualId)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-soft">
                      <span className="text-lg font-bold">
                        {new Date(summary.ritualDate).getDate()}
                      </span>
                      <span className="text-xs">
                        {new Date(summary.ritualDate).getMonth() + 1}月
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg font-semibold text-brown-800">
                        {summary.ritualName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                        {formatDate(summary.ritualDate, 'year')}年
                      </span>
                      <span className="text-lg font-bold text-gold-600 ml-auto">
                        ¥{summary.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-brown-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(summary.ritualDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4" />
                        <span>{summary.expenseCount} 笔花费</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(summary.categoryBreakdown) as ExpenseCategory[]).map(cat => {
                        const amount = summary.categoryBreakdown[cat];
                        if (amount <= 0) return null;
                        const meta = EXPENSE_CATEGORY_META[cat];
                        return (
                          <span
                            key={cat}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bgColor} ${meta.color}`}
                          >
                            {meta.icon} {meta.label} ¥{amount.toFixed(2)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/expenses/new?ritualId=${summary.ritualId}`}
                      className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Plus className="w-4 h-4 text-brown-500" />
                    </Link>
                    {expandedRituals.has(summary.ritualId) ? (
                      <ChevronUp className="w-5 h-5 text-brown-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-brown-400" />
                    )}
                  </div>
                </div>

                {expandedRituals.has(summary.ritualId) && (
                  <div className="mt-4 pt-4 border-t border-brown-100">
                    <div className="space-y-2">
                      {summary.expenses
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(expense => {
                          const meta = EXPENSE_CATEGORY_META[expense.category];
                          return (
                            <div
                              key={expense.id}
                              className="flex items-center justify-between p-3 bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${meta.bgColor} rounded-lg flex items-center justify-center`}>
                                  <span className="text-lg">{meta.icon}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                                    <span className="text-xs text-brown-400">{formatDate(expense.date)}</span>
                                  </div>
                                  {expense.notes && (
                                    <p className="text-sm text-brown-600 mt-0.5 line-clamp-1">{expense.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-brown-800">¥{expense.amount.toFixed(2)}</span>
                                <Link
                                  to={`/expenses/${expense.id}/edit`}
                                  className="p-1.5 hover:bg-brown-200 rounded-md transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-brown-500" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-brown-400" />
              </div>
              <h3 className="font-serif text-xl text-brown-800 mb-2">没有找到匹配的花费记录</h3>
              <p className="text-brown-500">尝试调整搜索条件或筛选器</p>
            </div>
          ) : (
            filteredExpenses.map((expense, index) => {
              const meta = EXPENSE_CATEGORY_META[expense.category];
              const ritual = rituals.find(r => r.id === expense.ritualId);
              const ancestor = ancestors.find(a => a.id === ritual?.ancestorId);
              const ancestorName = ancestor?.name || ritual?.ancestorName || '';
              const ritualName = `${ancestorName} 祭祀`;

              return (
                <div
                  key={expense.id}
                  className="card group hover:border-gold-300 transition-all"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${meta.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">{meta.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                        <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                          {ritualName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-brown-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-brown-600 mt-2 line-clamp-1">{expense.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xl font-bold text-brown-800">
                        ¥{expense.amount.toFixed(2)}
                      </span>
                      <Link
                        to={`/expenses/${expense.id}/edit`}
                        className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-brown-500" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

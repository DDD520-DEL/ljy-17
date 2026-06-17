import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RitualExpense, ExpenseCategory, EXPENSE_CATEGORY_META } from '@/types';

interface ExpenseFormProps {
  mode: 'create' | 'edit';
}

export default function ExpenseForm({ mode }: ExpenseFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedRitualId = searchParams.get('ritualId');

  const { addExpense, updateExpense, deleteExpense, expenses, rituals, ancestors } = useAppStore();

  const [formData, setFormData] = useState<Partial<RitualExpense>>({
    ritualId: preselectedRitualId || '',
    ritualName: '',
    amount: 0,
    category: 'offering' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        setFormData(expense);
      } else {
        navigate('/expenses');
      }
    }
  }, [mode, id, expenses, navigate]);

  useEffect(() => {
    if (formData.ritualId) {
      const ritual = rituals.find(r => r.id === formData.ritualId);
      if (ritual) {
        const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
        const ritualName = `${ancestor?.name || ritual.ancestorName} 祭祀 - ${new Date(ritual.date).toLocaleDateString('zh-CN')}`;
        setFormData(prev => ({ ...prev, ritualName }));
      }
    }
  }, [formData.ritualId, rituals, ancestors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ritualId) {
      newErrors.ritualId = '请选择关联的祭祀活动';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '请输入有效的金额';
    }
    if (!formData.date) {
      newErrors.date = '请选择日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (mode === 'create') {
      addExpense(formData as Omit<RitualExpense, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (mode === 'edit' && id) {
      updateExpense(id, formData);
    }

    navigate('/expenses');
  };

  const handleDelete = () => {
    if (id && deleteExpense(id)) {
      navigate('/expenses');
    }
  };

  const getRitualDisplayText = (ritualId: string): string => {
    const ritual = rituals.find(r => r.id === ritualId);
    if (!ritual) return '';
    const ancestor = ancestors.find(a => a.id === ritual.ancestorId);
    const ancestorName = ancestor?.name || ritual.ancestorName || '';
    const dateStr = new Date(ritual.date).toLocaleDateString('zh-CN');
    return `${ancestorName} 祭祀 - ${dateStr}`;
  };

  const ritualOptions = [...rituals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/expenses" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '记录祭祀花费' : '编辑花费记录'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            关联祭祀活动 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.ritualId || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, ritualId: e.target.value }));
              if (errors.ritualId) {
                setErrors(prev => ({ ...prev, ritualId: '' }));
              }
            }}
            className={`input-field ${errors.ritualId ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          >
            <option value="">请选择祭祀活动</option>
            {ritualOptions.map(ritual => (
              <option key={ritual.id} value={ritual.id}>
                {getRitualDisplayText(ritual.id)}
              </option>
            ))}
          </select>
          {errors.ritualId && <p className="text-red-500 text-xs mt-1">{errors.ritualId}</p>}
          {rituals.length === 0 && (
            <p className="text-amber-600 text-xs mt-1">
              暂无祭祀记录，请先<Link to="/rituals/new" className="underline">记录祭祀活动</Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              金额 (元) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-500">¥</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
                  if (errors.amount) {
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }
                }}
                placeholder="0.00"
                className={`input-field pl-8 ${errors.amount ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, date: e.target.value }));
                if (errors.date) {
                  setErrors(prev => ({ ...prev, date: '' }));
                }
              }}
              className={`input-field ${errors.date ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            花费类别
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map((category) => {
              const meta = EXPENSE_CATEGORY_META[category];
              const isSelected = formData.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? `border-gold-500 ${meta.bgColor}`
                      : 'border-brown-200 bg-white hover:border-brown-400'
                  }`}
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            备注
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="记录花费详情，如供品清单、交通路线、用餐人数等..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-brown-100">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Link to="/expenses" className="btn-secondary">
              取消
            </Link>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除这条花费记录吗？此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
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

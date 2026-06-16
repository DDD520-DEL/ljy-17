import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Ritual } from '@/types';

interface RitualFormProps {
  mode: 'create' | 'edit';
}

export default function RitualForm({ mode }: RitualFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedAncestorId = searchParams.get('ancestorId');
  
  const { addRitual, updateRitual, deleteRitual, rituals, ancestors } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<Ritual>>({
    ancestorId: preselectedAncestorId || '',
    ancestorName: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    participants: [],
    offerings: [],
    notes: '',
  });
  
  const [newParticipant, setNewParticipant] = useState('');
  const [newOffering, setNewOffering] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const ritual = rituals.find(r => r.id === id);
      if (ritual) {
        setFormData(ritual);
      } else {
        navigate('/rituals');
      }
    }
  }, [mode, id, rituals, navigate]);

  useEffect(() => {
    if (formData.ancestorId) {
      const ancestor = ancestors.find(a => a.id === formData.ancestorId);
      if (ancestor) {
        setFormData(prev => ({ ...prev, ancestorName: ancestor.name }));
      }
    }
  }, [formData.ancestorId, ancestors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ancestorId) {
      newErrors.ancestorId = '请选择祭祀对象';
    }
    if (!formData.date) {
      newErrors.date = '请选择祭祀日期';
    }
    if (!formData.location?.trim()) {
      newErrors.location = '请输入墓地位置';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (mode === 'create') {
      addRitual(formData as Omit<Ritual, 'id' | 'createdAt'>);
    } else if (mode === 'edit' && id) {
      updateRitual(id, formData);
    }
    
    navigate('/rituals');
  };

  const handleDelete = () => {
    if (id && deleteRitual(id)) {
      navigate('/rituals');
    }
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !formData.participants?.includes(newParticipant.trim())) {
      setFormData(prev => ({
        ...prev,
        participants: [...(prev.participants || []), newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (name: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants?.filter(p => p !== name) || []
    }));
  };

  const addOffering = () => {
    if (newOffering.trim() && !formData.offerings?.includes(newOffering.trim())) {
      setFormData(prev => ({
        ...prev,
        offerings: [...(prev.offerings || []), newOffering.trim()]
      }));
      setNewOffering('');
    }
  };

  const removeOffering = (item: string) => {
    setFormData(prev => ({
      ...prev,
      offerings: prev.offerings?.filter(o => o !== item) || []
    }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/rituals" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '记录祭祀' : '编辑祭祀记录'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              祭祀对象 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ancestorId || ''}
              onChange={(e) => {
                const ancestor = ancestors.find(a => a.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  ancestorId: e.target.value,
                  ancestorName: ancestor?.name
                }));
                if (errors.ancestorId) {
                  setErrors(prev => ({ ...prev, ancestorId: '' }));
                }
              }}
              className={`input-field ${errors.ancestorId ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            >
              <option value="">请选择先人</option>
              {ancestors.map(a => (
                <option key={a.id} value={a.id}>{a.name} - {a.relationship}</option>
              ))}
            </select>
            {errors.ancestorId && <p className="text-red-500 text-xs mt-1">{errors.ancestorId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              祭祀日期 <span className="text-red-500">*</span>
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
            墓地位置 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, location: e.target.value }));
              if (errors.location) {
                setErrors(prev => ({ ...prev, location: '' }));
              }
            }}
            placeholder="如：南山陵园A区12号"
            className={`input-field ${errors.location ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            参与人员
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
              placeholder="输入姓名，按回车添加"
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addParticipant}
              className="btn-secondary px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.participants?.length === 0 ? (
              <span className="text-sm text-brown-400">暂无参与人员</span>
            ) : (
              formData.participants?.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-cream-100 text-brown-700 rounded-full text-sm"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => removeParticipant(p)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            供品
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newOffering}
              onChange={(e) => setNewOffering(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOffering())}
              placeholder="输入供品名称，按回车添加"
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addOffering}
              className="btn-secondary px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.offerings?.length === 0 ? (
              <span className="text-sm text-brown-400">暂无供品记录</span>
            ) : (
              formData.offerings?.map((o, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold-100 text-gold-700 rounded-full text-sm"
                >
                  {o}
                  <button
                    type="button"
                    onClick={() => removeOffering(o)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            备注
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="记录祭祀过程中的感想、天气、特殊情况等..."
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
            <Link to="/rituals" className="btn-secondary">
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
              确定要删除这条祭祀记录吗？此操作不可撤销。
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

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, ImagePlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyEvent, FamilyEventType, FAMILY_EVENT_TYPE_META } from '@/types';

interface FamilyEventFormProps {
  mode: 'create' | 'edit';
}

export default function FamilyEventForm({ mode }: FamilyEventFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { addEvent, updateEvent, deleteEvent, events, branches } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<FamilyEvent>>({
    type: 'wedding',
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    participants: [],
    photos: [],
    location: '',
    branchId: '',
  });
  
  const [newParticipant, setNewParticipant] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const event = events.find(e => e.id === id);
      if (event) {
        setFormData(event);
      } else {
        navigate('/family-events');
      }
    }
  }, [mode, id, events, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) {
      newErrors.type = '请选择事件类型';
    }
    if (!formData.title?.trim()) {
      newErrors.title = '请输入事件标题';
    }
    if (!formData.date) {
      newErrors.date = '请选择事件日期';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (mode === 'create') {
      addEvent(formData as Omit<FamilyEvent, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (mode === 'edit' && id) {
      updateEvent(id, formData);
    }
    
    navigate('/family-events');
  };

  const handleDelete = () => {
    if (id && deleteEvent(id)) {
      navigate('/family-events');
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

  const typeOptions = Object.entries(FAMILY_EVENT_TYPE_META) as [FamilyEventType, typeof FAMILY_EVENT_TYPE_META[FamilyEventType]][];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/family-events" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '记录家族大事' : '编辑大事记'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              事件类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {typeOptions.map(([type, meta]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, type }));
                    if (errors.type) setErrors(prev => ({ ...prev, type: '' }));
                  }}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    formData.type === type
                      ? 'border-gold-500 bg-gold-50 shadow-soft'
                      : 'border-brown-200 hover:border-brown-400 bg-white'
                  }`}
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <span className={`text-xs font-medium ${formData.type === type ? 'text-gold-700' : 'text-brown-600'}`}>
                    {meta.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              事件日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, date: e.target.value }));
                if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
              }}
              className={`input-field ${errors.date ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            事件标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="如：张小明与王丽婚礼、张小宝出生等"
            className={`input-field ${errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              所属分支
            </label>
            <select
              value={formData.branchId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value || undefined }))}
              className="input-field"
            >
              <option value="">未分配</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              地点
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="如：城市大酒店、阳光花园等"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            相关人员
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
              <span className="text-sm text-brown-400">暂无相关人员</span>
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
            事件描述
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="详细描述事件的经过、感想等..."
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            相关照片
          </label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const result = ev.target?.result as string;
                  if (result) {
                    setFormData((prev) => ({
                      ...prev,
                      photos: [...(prev.photos || []), result],
                    }));
                  }
                };
                reader.readAsDataURL(file);
              });
              if (photoInputRef.current) {
                photoInputRef.current.value = '';
              }
            }}
            className="hidden"
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {(formData.photos || []).map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden border border-brown-100 group"
              >
                <img
                  src={photo}
                  alt={`照片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      photos: prev.photos?.filter((_, i) => i !== index),
                    }));
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-brown-200 flex flex-col items-center justify-center gap-1 text-brown-400 hover:text-brown-600 hover:border-brown-400 transition-colors"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">添加照片</span>
            </button>
          </div>
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
            <Link to="/family-events" className="btn-secondary">
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
              确定要删除这条大事记吗？此操作不可撤销。
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

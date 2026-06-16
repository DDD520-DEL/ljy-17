import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, User, ImagePlus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Ancestor } from '@/types';

interface AncestorFormProps {
  mode: 'create' | 'edit';
}

export default function AncestorForm({ mode }: AncestorFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addAncestor, updateAncestor, deleteAncestor, ancestors } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<Ancestor>>({
    name: '',
    relationship: '',
    birthDate: '',
    deathDate: '',
    biography: '',
    generation: 0,
    photos: [],
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const ancestor = ancestors.find(a => a.id === id);
      if (ancestor) {
        setFormData(ancestor);
      } else {
        navigate('/ancestors');
      }
    }
  }, [mode, id, ancestors, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.relationship?.trim()) {
      newErrors.relationship = '请输入关系';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = '请选择诞辰';
    }
    if (!formData.deathDate) {
      newErrors.deathDate = '请选择忌日';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (mode === 'create') {
      addAncestor(formData as Omit<Ancestor, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (mode === 'edit' && id) {
      updateAncestor(id, formData);
    }
    
    navigate('/ancestors');
  };

  const handleDelete = () => {
    if (id && deleteAncestor(id)) {
      navigate('/ancestors');
    }
  };

  const handleInputChange = (field: keyof Ancestor, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/ancestors" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '添加先人' : '编辑先人信息'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-brown-100">
          <div className="w-24 h-24 bg-gradient-to-br from-brown-400 to-brown-600 rounded-2xl flex items-center justify-center text-white text-3xl font-serif shadow-soft overflow-hidden">
            {formData.photos && formData.photos.length > 0 ? (
              <img src={formData.photos[0]} alt={formData.name} className="w-full h-full object-cover" />
            ) : (
              formData.name?.charAt(0) || <User className="w-12 h-12" />
            )}
          </div>
          <div>
            <p className="text-brown-500 text-sm mb-1">先人照片</p>
            <p className="text-brown-400 text-xs">第一张照片将作为头像显示</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            先人照片
          </label>
          <input
            ref={fileInputRef}
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
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
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
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-gold-500 text-white px-1.5 py-0.5 rounded">
                    头像
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-brown-200 flex flex-col items-center justify-center gap-1 text-brown-400 hover:text-brown-600 hover:border-brown-400 transition-colors"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">添加照片</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入姓名"
              className={`input-field ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              关系 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.relationship || ''}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
              placeholder="如：祖父、祖母、父亲"
              className={`input-field ${errors.relationship ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              诞辰 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`input-field ${errors.birthDate ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              忌日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.deathDate || ''}
              onChange={(e) => handleInputChange('deathDate', e.target.value)}
              className={`input-field ${errors.deathDate ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.deathDate && <p className="text-red-500 text-xs mt-1">{errors.deathDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              辈分
            </label>
            <select
              value={formData.generation || 0}
              onChange={(e) => handleInputChange('generation', parseInt(e.target.value))}
              className="input-field"
            >
              <option value={-3}>高祖辈</option>
              <option value={-2}>曾祖辈</option>
              <option value={-1}>祖辈</option>
              <option value={0}>父辈</option>
              <option value={1}>我辈</option>
              <option value={2}>子辈</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            生平简介
          </label>
          <textarea
            value={formData.biography || ''}
            onChange={(e) => handleInputChange('biography', e.target.value)}
            rows={4}
            placeholder="请输入生平简介，记录先人的事迹和美德..."
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
            <Link to="/ancestors" className="btn-secondary">
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
              确定要删除 "{formData.name}" 的信息吗？此操作不可撤销，相关的祭祀记录也将被删除。
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

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, X, ImagePlus, FileText, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Ritual, RitualTemplate } from '@/types';

interface RitualFormProps {
  mode: 'create' | 'edit';
}

export default function RitualForm({ mode }: RitualFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedAncestorId = searchParams.get('ancestorId');
  const templateId = searchParams.get('templateId');
  
  const { addRitual, updateRitual, deleteRitual, rituals, ancestors, branches, templates } = useAppStore();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Ritual>>({
    ancestorId: preselectedAncestorId || '',
    ancestorName: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    participants: [],
    offerings: [],
    notes: '',
    photos: [],
    branchId: '',
  });
  
  const [newParticipant, setNewParticipant] = useState('');
  const [newOffering, setNewOffering] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (mode === 'create' && templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        applyTemplate(template);
      }
    }
  }, [mode, templateId, templates]);

  const applyTemplate = (template: RitualTemplate) => {
    setFormData(prev => ({
      ...prev,
      location: template.location,
      participants: [...template.participants],
      offerings: [...template.offerings],
      notes: template.notes || prev.notes,
      branchId: template.branchId || prev.branchId,
      ...(template.ancestorId ? {
        ancestorId: template.ancestorId,
        ancestorName: template.ancestorName,
      } : {}),
    }));
    setAppliedTemplate(template.id);
    setShowTemplateSelector(false);
  };

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
        {mode === 'create' && (
          <div className="p-4 bg-cream-50 rounded-xl border border-brown-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-medium text-brown-800">使用祭祀模板</h3>
                  <p className="text-sm text-brown-500">
                    {appliedTemplate 
                      ? `已应用模板：${templates.find(t => t.id === appliedTemplate)?.name}`
                      : '选择预设模板快速填充信息'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {appliedTemplate && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <Check className="w-3.5 h-3.5" />
                    已应用
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  {appliedTemplate ? '更换模板' : '选择模板'}
                </button>
                <Link
                  to="/ritual-templates/new"
                  className="text-sm text-brown-600 hover:text-brown-800 underline"
                  target="_blank"
                >
                  新建模板
                </Link>
              </div>
            </div>

            {showTemplateSelector && (
              <div className="mt-4 pt-4 border-t border-brown-100">
                {templates.length === 0 ? (
                  <div className="text-center py-6 text-brown-500">
                    <p>暂无可用模板</p>
                    <Link
                      to="/ritual-templates/new"
                      className="inline-block mt-2 text-gold-600 hover:text-gold-700 underline text-sm"
                      target="_blank"
                    >
                      创建第一个模板 →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-thin">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          appliedTemplate === template.id
                            ? 'border-gold-500 bg-gold-50'
                            : 'border-brown-200 hover:border-brown-400 bg-white'
                        }`}
                        onClick={() => applyTemplate(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-brown-800 truncate">{template.name}</h4>
                            {template.description && (
                              <p className="text-xs text-brown-500 mt-0.5 line-clamp-1">{template.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-brown-500">
                              <span>📍 {template.location}</span>
                              <span>👥 {template.participants.length}人</span>
                              <span>🎁 {template.offerings.length}样</span>
                            </div>
                          </div>
                          {appliedTemplate === template.id && (
                            <Check className="w-5 h-5 text-gold-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            祭祀现场照片
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

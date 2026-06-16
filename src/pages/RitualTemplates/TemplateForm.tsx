import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RitualTemplate } from '@/types';

interface TemplateFormProps {
  mode: 'create' | 'edit';
}

export default function TemplateForm({ mode }: TemplateFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { addTemplate, updateTemplate, templates, ancestors, branches } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<RitualTemplate>>({
    name: '',
    description: '',
    location: '',
    participants: [],
    offerings: [],
    notes: '',
    ancestorId: '',
    ancestorName: '',
    branchId: '',
  });
  
  const [newParticipant, setNewParticipant] = useState('');
  const [newOffering, setNewOffering] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const template = templates.find(t => t.id === id);
      if (template) {
        setFormData(template);
      } else {
        navigate('/ritual-templates');
      }
    }
  }, [mode, id, templates, navigate]);

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
    
    if (!formData.name?.trim()) {
      newErrors.name = '请输入模板名称';
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
      addTemplate(formData as Omit<RitualTemplate, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (mode === 'edit' && id) {
      updateTemplate(id, formData);
    }
    
    navigate('/ritual-templates');
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
        <Link to="/ritual-templates" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '新建祭祀模板' : '编辑祭祀模板'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              模板名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="如：清明常规祭祀、冬至大祭"
              className={`input-field ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              适用先人
            </label>
            <select
              value={formData.ancestorId || ''}
              onChange={(e) => {
                const ancestor = ancestors.find(a => a.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  ancestorId: e.target.value || undefined,
                  ancestorName: ancestor?.name
                }));
              }}
              className="input-field"
            >
              <option value="">通用模板（不指定）</option>
              {ancestors.map(a => (
                <option key={a.id} value={a.id}>{a.name} - {a.relationship}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            模板描述
          </label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="简要描述这个模板的用途"
            className="input-field"
          />
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
              <span className="text-sm text-brown-400">暂无供品</span>
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
            备注模板
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="预设的备注内容，如祭祀流程、注意事项等"
            className="input-field resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-brown-100">
          <div />
          
          <div className="flex items-center gap-3">
            <Link to="/ritual-templates" className="btn-secondary">
              取消
            </Link>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存模板
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

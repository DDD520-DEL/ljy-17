import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyRule } from '@/types';

interface FamilyRuleFormProps {
  mode: 'create' | 'edit';
}

export default function FamilyRuleForm({ mode }: FamilyRuleFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { addRule, updateRule, deleteRule, rules, branches } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<FamilyRule>>({
    title: '',
    content: '',
    sourceAncestor: '',
    branchId: '',
    sortOrder: 0,
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const rule = rules.find(r => r.id === id);
      if (rule) {
        setFormData(rule);
      } else {
        navigate('/family-rules');
      }
    } else if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        sortOrder: rules.length,
      }));
    }
  }, [mode, id, rules, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = '请输入家训标题';
    }
    if (!formData.content?.trim()) {
      newErrors.content = '请输入家训内容';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (mode === 'create') {
      addRule(formData as Omit<FamilyRule, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (mode === 'edit' && id) {
      updateRule(id, formData);
    }
    
    navigate('/family-rules');
  };

  const handleDelete = () => {
    if (id && deleteRule(id)) {
      navigate('/family-rules');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/family-rules" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '添加家训家规' : '编辑家训家规'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gold-50 to-cream-100 rounded-xl border border-gold-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-brown-800">
              {mode === 'create' ? '录入家训' : '修订家训'}
            </p>
            <p className="text-sm text-brown-500">
              祖训如灯，照亮后辈前行之路
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            家训标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="如：孝悌为先、勤俭持家等"
            className={`input-field font-serif text-lg ${errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              出处先人
            </label>
            <input
              type="text"
              value={formData.sourceAncestor || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sourceAncestor: e.target.value }))}
              placeholder="如：张老太爷、张爷爷等"
              className="input-field"
            />
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
              <option value="">全族通用</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            家训内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, content: e.target.value }));
              if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
            }}
            rows={8}
            placeholder="请输入家训家规的正文内容，可分段书写..."
            className={`input-field resize-none font-serif text-base leading-relaxed ${errors.content ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          <p className="text-xs text-brown-400 mt-2">
            提示：家训内容是家族智慧的传承，请认真录入，确保准确无误。
          </p>
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
            <Link to="/family-rules" className="btn-secondary">
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
              确定要删除这条家训家规吗？此操作不可撤销。
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

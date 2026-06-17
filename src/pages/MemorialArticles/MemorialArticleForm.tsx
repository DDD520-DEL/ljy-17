import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, BookText, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MemorialArticle } from '@/types';

interface MemorialArticleFormProps {
  mode: 'create' | 'edit';
}

export default function MemorialArticleForm({ mode }: MemorialArticleFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  const { addArticle, updateArticle, deleteArticle, articles, ancestors, branches } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<MemorialArticle>>({
    ancestorId: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    branchId: '',
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const article = articles.find(a => a.id === id);
      if (article) {
        setFormData(article);
      } else {
        navigate('/memorial-articles');
      }
    } else if (mode === 'create') {
      const ancestorParam = searchParams.get('ancestorId');
      if (ancestorParam) {
        const ancestor = ancestors.find(a => a.id === ancestorParam);
        if (ancestor) {
          setFormData(prev => ({
            ...prev,
            ancestorId: ancestorParam,
            ancestorName: ancestor.name,
            branchId: ancestor.branchId || '',
          }));
        }
      }
    }
  }, [mode, id, articles, navigate, searchParams, ancestors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ancestorId) {
      newErrors.ancestorId = '请选择纪念的先人';
    }
    if (!formData.title?.trim()) {
      newErrors.title = '请输入文章标题';
    }
    if (!formData.content?.trim()) {
      newErrors.content = '请输入文章正文';
    }
    if (!formData.date) {
      newErrors.date = '请选择写作日期';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAncestorChange = (ancestorId: string) => {
    const ancestor = ancestors.find(a => a.id === ancestorId);
    setFormData(prev => ({
      ...prev,
      ancestorId,
      ancestorName: ancestor?.name,
      branchId: ancestor?.branchId || prev.branchId,
    }));
    if (errors.ancestorId) {
      setErrors(prev => ({ ...prev, ancestorId: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (mode === 'create') {
      addArticle(formData as Omit<MemorialArticle, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (mode === 'edit' && id) {
      updateArticle(id, formData);
    }
    
    navigate('/memorial-articles');
  };

  const handleDelete = () => {
    if (id && deleteArticle(id)) {
      navigate('/memorial-articles');
    }
  };

  const getAncestorName = (ancestorId: string) => {
    const ancestor = ancestors.find(a => a.id === ancestorId);
    return ancestor?.name || '';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/memorial-articles" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '撰写追思文章' : '编辑追思文章'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow flex-shrink-0">
            <BookText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-brown-800">
              {mode === 'create' ? '撰写追思' : '修订追思'}
            </p>
            <p className="text-sm text-brown-500">
              以文字寄哀思，让思念长存
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              纪念先人 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ancestorId || ''}
              onChange={(e) => handleAncestorChange(e.target.value)}
              className={`input-field ${errors.ancestorId ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            >
              <option value="">请选择先人</option>
              {ancestors.map(ancestor => (
                <option key={ancestor.id} value={ancestor.id}>
                  {ancestor.name} ({ancestor.relationship})
                </option>
              ))}
            </select>
            {errors.ancestorId && <p className="text-red-500 text-xs mt-1">{errors.ancestorId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              写作日期 <span className="text-red-500">*</span>
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
            文章标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="如：清明祭扫忆祖父、奶奶的红烧肉等"
            className={`input-field font-serif text-lg ${errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              作者
            </label>
            <input
              type="text"
              value={formData.author || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="请输入作者姓名"
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
              <option value="">全族</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            文章正文 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, content: e.target.value }));
              if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
            }}
            rows={12}
            placeholder="在此写下您对先人的思念之情..."
            className={`input-field resize-none font-serif text-base leading-relaxed ${errors.content ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
          <p className="text-xs text-brown-400 mt-2">
            提示：您可以分段书写，回车键可换行。文章将永久保存，供家族后人缅怀。
          </p>
        </div>

        {formData.ancestorId && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200">
            <Heart className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-brown-600">
                本文纪念 <span className="font-semibold text-rose-700">{getAncestorName(formData.ancestorId)}</span>
              </p>
            </div>
          </div>
        )}

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
            <Link to="/memorial-articles" className="btn-secondary">
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
              确定要删除这篇追思文章吗？此操作不可撤销。
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

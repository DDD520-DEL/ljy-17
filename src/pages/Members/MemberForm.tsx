import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyMember } from '@/types';

interface MemberFormProps {
  mode: 'create' | 'edit';
}

export default function MemberForm({ mode }: MemberFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addMember, updateMember, members, branches } = useAppStore();

  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    relationship: '',
    birthDate: '',
    generation: 1,
    gender: 'male',
    isAlive: true,
    phone: '',
    parentId: '',
    spouseId: '',
    branchId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && id) {
      const member = members.find(m => m.id === id);
      if (member) {
        setFormData(member);
      } else {
        navigate('/members');
      }
    }
  }, [mode, id, members, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.relationship?.trim()) {
      newErrors.relationship = '请输入关系';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (mode === 'create') {
      const newMember = addMember(formData as Omit<FamilyMember, 'id' | 'createdAt'>);
      navigate(`/members/${newMember.id}`);
    } else if (mode === 'edit' && id) {
      updateMember(id, formData);
      navigate(`/members/${id}`);
    }
  };

  const handleInputChange = (field: keyof FamilyMember, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const currentGeneration = formData.generation ?? 1;
  const currentId = mode === 'edit' ? id : undefined;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to={mode === 'edit' && id ? `/members/${id}` : '/members'} className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-brown-800">
          {mode === 'create' ? '添加家属成员' : '编辑家属成员'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-brown-100">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-serif shadow-soft overflow-hidden ${
            formData.gender === 'female'
              ? 'bg-gradient-to-br from-pink-400 to-pink-600'
              : 'bg-gradient-to-br from-blue-400 to-blue-600'
          } ${!formData.isAlive ? 'opacity-60 grayscale' : ''}`}>
            {formData.avatar ? (
              <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
            ) : (
              formData.name?.charAt(0) || <User className="w-12 h-12" />
            )}
          </div>
          <div>
            <p className="text-brown-500 text-sm mb-1">成员头像</p>
            <p className="text-brown-400 text-xs">姓名首字将作为头像显示</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入姓名"
              className="input-field"
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
              placeholder="如：父亲、母亲、哥哥"
              className="input-field"
            />
            {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              出生日期
            </label>
            <input
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              联系电话
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="请输入联系电话"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              性别
            </label>
            <select
              value={formData.gender || 'male'}
              onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
              className="input-field"
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              辈分
            </label>
            <select
              value={formData.generation ?? 1}
              onChange={(e) => handleInputChange('generation', parseInt(e.target.value))}
              className="input-field"
            >
              <option value={-2}>曾祖辈</option>
              <option value={-1}>祖辈</option>
              <option value={0}>父辈</option>
              <option value={1}>我辈</option>
              <option value={2}>子辈</option>
              <option value={3}>孙辈</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              父/母
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => handleInputChange('parentId', e.target.value)}
              className="input-field"
            >
              <option value="">无</option>
              {members.filter(m => m.generation < currentGeneration && m.id !== currentId).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              配偶
            </label>
            <select
              value={formData.spouseId || ''}
              onChange={(e) => handleInputChange('spouseId', e.target.value)}
              className="input-field"
            >
              <option value="">无</option>
              {members.filter(m => m.generation === currentGeneration && m.id !== currentId).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            所属分支
          </label>
          <select
            value={formData.branchId || ''}
            onChange={(e) => handleInputChange('branchId', e.target.value)}
            className="input-field"
          >
            <option value="">未分配</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isAlive"
            checked={formData.isAlive ?? true}
            onChange={(e) => handleInputChange('isAlive', e.target.checked)}
            className="w-4 h-4 rounded border-brown-300 text-brown-600 focus:ring-brown-500"
          />
          <label htmlFor="isAlive" className="text-sm text-brown-700">
            在世
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brown-100">
          <Link
            to={mode === 'edit' && id ? `/members/${id}` : '/members'}
            className="btn-secondary"
          >
            取消
          </Link>
          <button type="submit" className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {mode === 'create' ? '添加' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

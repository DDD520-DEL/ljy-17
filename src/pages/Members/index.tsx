import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, User, Phone, Heart, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyMember } from '@/types';
import { getGenerationName } from '@/utils/dateUtils';

export default function MembersList() {
  const location = useLocation();
  const { members, addMember, updateMember, deleteMember, globalSearchTerm } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const state = location.state as { searchTerm?: string } | null;
    if (state?.searchTerm) {
      setSearchTerm(state.searchTerm);
      window.history.replaceState({}, document.title);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [location.state, globalSearchTerm]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
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
  });

  const generations = [...new Set(members.map(m => m.generation))].sort((a, b) => a - b);

  const filteredMembers = members.filter(member => 
    member.name.includes(searchTerm) || 
    member.relationship.includes(searchTerm) ||
    member.phone?.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.relationship?.trim()) return;
    
    if (editingMember) {
      updateMember(editingMember.id, formData);
    } else {
      addMember(formData as Omit<FamilyMember, 'id' | 'createdAt'>);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      birthDate: '',
      generation: 1,
      gender: 'male',
      isAlive: true,
      phone: '',
      parentId: '',
      spouseId: '',
    });
    setShowForm(false);
    setEditingMember(null);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData(member);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (deleteMember(id)) {
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">家属管理</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {members.length} 位家属成员，{members.filter(m => m.isAlive).length} 位在世
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加成员
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
          <input
            type="text"
            placeholder="搜索姓名、关系、电话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-brown-800">
                {editingMember ? '编辑成员' : '添加家属成员'}
              </h3>
              <button 
                onClick={resetForm}
                className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-brown-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入姓名"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    关系 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.relationship || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="如：父亲、母亲、哥哥"
                    className="input-field"
                    required
                  />
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
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
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
                    value={formData.generation || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, generation: parseInt(e.target.value) }))}
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
                    父/母 ID
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">无</option>
                    {members.filter(m => m.generation < (formData.generation || 1)).map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    配偶 ID
                  </label>
                  <select
                    value={formData.spouseId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, spouseId: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">无</option>
                    {members.filter(m => m.generation === (formData.generation || 1) && m.id !== editingMember?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAlive"
                  checked={formData.isAlive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAlive: e.target.checked }))}
                  className="w-4 h-4 rounded border-brown-300 text-brown-600 focus:ring-brown-500"
                />
                <label htmlFor="isAlive" className="text-sm text-brown-700">
                  在世
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brown-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  {editingMember ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无家属成员</h3>
          <p className="text-brown-500 mb-6">添加第一位家属成员，完善家族信息</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className="card group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-soft ${
                  member.gender === 'male'
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                    : 'bg-gradient-to-br from-pink-400 to-pink-600'
                } ${!member.isAlive ? 'opacity-60 grayscale' : ''}`}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold text-brown-800 truncate">
                        {member.name}
                      </h3>
                      {!member.isAlive && (
                        <Heart className="w-4 h-4 text-brown-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-brown-500" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(member.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-brown-500">{member.relationship}</span>
                    <span className="text-xs px-2 py-0.5 bg-cream-100 text-brown-600 rounded-full">
                      {getGenerationName(member.generation)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {member.birthDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-brown-500">出生日期：</span>
                    <span className="text-brown-700">{member.birthDate}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brown-400" />
                    <a href={`tel:${member.phone}`} className="text-brown-700 hover:text-gold-600 transition-colors">
                      {member.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-brown-500">状态：</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    member.isAlive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-brown-100 text-brown-600'
                  }`}>
                    {member.isAlive ? '在世' : '已逝世'}
                  </span>
                </div>
              </div>

              {showDeleteConfirm === member.id && (
                <div className="mt-4 pt-4 border-t border-brown-100">
                  <p className="text-sm text-brown-600 mb-3">确定要删除 "{member.name}" 吗？</p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 text-sm text-brown-600 hover:bg-brown-50 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      确认删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

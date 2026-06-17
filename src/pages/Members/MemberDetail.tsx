import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Heart,
  Phone,
  User,
  TreeDeciduous,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getAge, getGenerationName } from '@/utils/dateUtils';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, branches, deleteMember } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const member = members.find(m => m.id === id);

  if (!member) {
    return (
      <div className="animate-fade-in text-center py-16">
        <div className="w-20 h-20 mx-auto bg-brown-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-brown-400" />
        </div>
        <h2 className="font-serif text-xl text-brown-800 mb-2">未找到该家属成员</h2>
        <p className="text-brown-500 mb-6">该成员可能已被删除或不存在</p>
        <Link to="/members" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回家属管理
        </Link>
      </div>
    );
  }

  const parent = member.parentId ? members.find(m => m.id === member.parentId) : undefined;
  const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : undefined;
  const children = members.filter(m => m.parentId === member.id);
  const siblings = parent 
    ? members.filter(m => m.parentId === parent.id && m.id !== member.id)
    : [];
  const branch = member.branchId ? branches.find(b => b.id === member.branchId) : undefined;

  const age = member.birthDate ? getAge(member.birthDate) : null;

  const handleDelete = () => {
    if (deleteMember(member.id)) {
      navigate('/members');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/members" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-brown-800">家属成员详情</h1>
          <p className="text-brown-500 text-sm mt-1">查看和管理家属成员信息</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/members/${member.id}/edit`)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg mb-4 ${
              member.gender === 'male'
                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                : 'bg-gradient-to-br from-pink-400 to-pink-600'
            } ${!member.isAlive ? 'opacity-60 grayscale' : ''}`}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <h2 className="font-serif text-2xl font-bold text-brown-800 mb-1">
              {member.name}
              {!member.isAlive && <Heart className="w-5 h-5 text-brown-400 inline ml-2" />}
            </h2>
            <p className="text-brown-500 mb-4">{member.relationship}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                member.isAlive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-brown-100 text-brown-600'
              }`}>
                {member.isAlive ? '在世' : '已逝世'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-cream-100 text-brown-600">
                {getGenerationName(member.generation)}
              </span>
              {branch && (
                <span 
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: branch.color || '#dc2626' }}
                >
                  {branch.name}
                </span>
              )}
            </div>
            <div className={`text-sm ${member.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>
              {member.gender === 'male' ? '男性' : '女性'}
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-500" />
              亲属关系
            </h3>
            <div className="space-y-3">
              {parent && (
                <div className="flex items-center justify-between">
                  <span className="text-brown-500">父/母</span>
                  <Link to={`/members/${parent.id}`} className="text-brown-800 hover:text-gold-600">
                    {parent.name}
                  </Link>
                </div>
              )}
              {spouse && (
                <div className="flex items-center justify-between">
                  <span className="text-brown-500">配偶</span>
                  <Link to={`/members/${spouse.id}`} className="text-brown-800 hover:text-gold-600">
                    {spouse.name}
                  </Link>
                </div>
              )}
              {siblings.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-brown-500">兄弟姐妹</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {siblings.map(s => (
                      <Link key={s.id} to={`/members/${s.id}`} className="text-brown-800 hover:text-gold-600">
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {children.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-brown-500">子女</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {children.map(c => (
                      <Link key={c.id} to={`/members/${c.id}`} className="text-brown-800 hover:text-gold-600">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {!parent && !spouse && siblings.length === 0 && children.length === 0 && (
                <p className="text-brown-400 text-sm">暂无亲属关系信息</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-brown-800 mb-6 flex items-center gap-2">
              <TreeDeciduous className="w-5 h-5 text-gold-500" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-brown-500 mb-1">姓名</label>
                <p className="text-brown-800 font-medium">{member.name}</p>
              </div>
              <div>
                <label className="block text-sm text-brown-500 mb-1">关系</label>
                <p className="text-brown-800 font-medium">{member.relationship}</p>
              </div>
              <div>
                <label className="block text-sm text-brown-500 mb-1">性别</label>
                <p className="text-brown-800 font-medium">{member.gender === 'male' ? '男' : '女'}</p>
              </div>
              <div>
                <label className="block text-sm text-brown-500 mb-1">辈分</label>
                <p className="text-brown-800 font-medium">{getGenerationName(member.generation)}</p>
              </div>
              {member.birthDate && (
                <div>
                  <label className="block text-sm text-brown-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    出生日期
                  </label>
                  <p className="text-brown-800 font-medium">
                    {formatDate(member.birthDate)}
                    {age !== null && member.isAlive && (
                      <span className="text-brown-500 ml-2">({age}岁)</span>
                    )}
                  </p>
                </div>
              )}
              {member.phone && (
                <div>
                  <label className="block text-sm text-brown-500 mb-1 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    联系电话
                  </label>
                  <a href={`tel:${member.phone}`} className="text-brown-800 font-medium hover:text-gold-600">
                    {member.phone}
                  </a>
                </div>
              )}
              {branch && (
                <div>
                  <label className="block text-sm text-brown-500 mb-1">家族分支</label>
                  <p className="text-brown-800 font-medium flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: branch.color || '#dc2626' }}
                    />
                    {branch.name}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm text-brown-500 mb-1">生存状态</label>
                <p className={`font-medium ${member.isAlive ? 'text-green-700' : 'text-brown-600'}`}>
                  {member.isAlive ? '在世' : '已逝世'}
                </p>
              </div>
            </div>
          </div>

          {children.length > 0 && (
            <div className="card mt-6">
              <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-500" />
                子女 ({children.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children.map(child => (
                  <Link
                    key={child.id}
                    to={`/members/${child.id}`}
                    className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      child.gender === 'male'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-pink-100 text-pink-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brown-800 truncate">{child.name}</p>
                      <p className="text-sm text-brown-500">{child.relationship}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-2">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除家属成员 "{member.name}" 吗？此操作不可撤销。
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
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
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

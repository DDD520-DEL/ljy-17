import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Heart,
  MapPin,
  Users,
  Gift,
  BookOpen,
  TreeDeciduous,
  User,
  ChevronDown,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  BookText,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, getAge, getLunarCalendar, getGenerationName, groupByYear } from '@/utils/dateUtils';
import { TreeNode, FamilyMember } from '@/types';

const buildTree = (members: FamilyMember[], generation: number): TreeNode[] => {
  const genMembers = members.filter(m => m.generation === generation);

  return genMembers.map(member => {
    const children = buildTree(members, generation + 1).filter(
      child => members.find(m => m.id === child.id)?.parentId === member.id
    );

    const spouse = member.spouseId
      ? members.find(m => m.id === member.spouseId)
      : undefined;

    return {
      id: member.id,
      name: member.name,
      gender: member.gender,
      relationship: member.relationship,
      isAlive: member.isAlive,
      birthDate: member.birthDate,
      avatar: member.avatar,
      generation: member.generation,
      branchId: member.branchId,
      children,
      spouse: spouse ? {
        id: spouse.id,
        name: spouse.name,
        gender: spouse.gender,
        relationship: spouse.relationship,
        isAlive: spouse.isAlive,
        birthDate: spouse.birthDate,
        avatar: spouse.avatar,
        generation: spouse.generation,
        children: [],
      } : undefined,
    };
  });
};

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  highlightId?: string;
}

function TreeNodeComponent({ node, level, highlightId }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isHighlighted = highlightId === node.id || highlightId === node.spouse?.id;

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {level > 0 && (
          <div className="w-6 h-px bg-brown-300" />
        )}

        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-brown-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-brown-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-brown-500" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${
            node.gender === 'male'
              ? 'bg-gradient-to-br from-blue-400 to-blue-600'
              : 'bg-gradient-to-br from-pink-400 to-pink-600'
          } ${!node.isAlive ? 'opacity-60 grayscale' : ''} ${isHighlighted ? 'ring-4 ring-gold-400 ring-opacity-50' : ''}`}>
            {node.avatar ? (
              <img src={node.avatar} alt={node.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${node.isAlive ? 'text-brown-800' : 'text-brown-400'} ${isHighlighted ? 'text-gold-600 font-semibold' : ''}`}>
                {node.name}
              </span>
              {!node.isAlive && (
                <Heart className="w-3.5 h-3.5 text-brown-400" />
              )}
              {isHighlighted && (
                <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                  当前
                </span>
              )}
            </div>
            <p className="text-xs text-brown-500">{node.relationship}</p>
          </div>
        </div>

        {node.spouse && (
          <>
            <div className="flex items-center gap-1 px-3">
              <div className="w-4 h-px bg-gold-400" />
              <span className="text-xs text-gold-600">配偶</span>
              <div className="w-4 h-px bg-gold-400" />
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${
              node.spouse.gender === 'male'
                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                : 'bg-gradient-to-br from-pink-400 to-pink-600'
            } ${!node.spouse.isAlive ? 'opacity-60 grayscale' : ''} ${highlightId === node.spouse.id ? 'ring-4 ring-gold-400 ring-opacity-50' : ''}`}>
              {node.spouse.avatar ? (
                <img src={node.spouse.avatar} alt={node.spouse.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${node.spouse.isAlive ? 'text-brown-800' : 'text-brown-400'} ${highlightId === node.spouse.id ? 'text-gold-600 font-semibold' : ''}`}>
                  {node.spouse.name}
                </span>
                {!node.spouse.isAlive && (
                  <Heart className="w-3.5 h-3.5 text-brown-400" />
                )}
                {highlightId === node.spouse.id && (
                  <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                    当前
                  </span>
                )}
              </div>
              <p className="text-xs text-brown-500">{node.spouse.relationship}</p>
            </div>
          </>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-14 mt-4 space-y-4 pl-4 border-l-2 border-dashed border-brown-200">
          {node.children.map((child, index) => (
            <div key={child.id} className="relative">
              {index === 0 && (
                <div className="absolute -left-4 top-6 w-4 h-px border-t-2 border-dashed border-brown-200" />
              )}
              <TreeNodeComponent node={child} level={level + 1} highlightId={highlightId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AncestorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ancestors, rituals, members, articles, deleteAncestor } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const ancestor = ancestors.find(a => a.id === id);

  if (!ancestor) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/ancestors" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-brown-600" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-brown-800">先人详情</h1>
        </div>
        <div className="card text-center py-16">
          <h3 className="font-serif text-xl text-brown-800 mb-2">未找到先人信息</h3>
          <Link to="/ancestors" className="btn-primary inline-flex items-center gap-2 mt-4">
            返回先人列表
          </Link>
        </div>
      </div>
    );
  }

  const ancestorRituals = rituals
    .filter(r => r.ancestorId === ancestor.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ancestorArticles = articles
    .filter(a => a.ancestorId === ancestor.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ritualsByYear = groupByYear(ancestorRituals);

  const generations = [...new Set(members.map(m => m.generation))].sort((a, b) => a - b);
  const roots = buildTree(members, generations[0] || 0);

  const relatedMembers = members.filter(m => m.generation === ancestor.generation);

  const handleDelete = () => {
    if (id && deleteAncestor(id)) {
      navigate('/ancestors');
    }
  };

  const allPhotos = ancestor.photos || [];
  const displayPhotos = showAllPhotos ? allPhotos : allPhotos.slice(0, 8);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/ancestors" className="p-2 hover:bg-brown-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-brown-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-brown-800">先人详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
          <Link
            to={`/ancestors/${ancestor.id}/edit`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </Link>
        </div>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-40 h-40 bg-gradient-to-br from-brown-400 to-brown-600 rounded-3xl flex items-center justify-center text-white text-5xl font-serif shadow-card overflow-hidden">
              {allPhotos.length > 0 ? (
                <img src={allPhotos[0]} alt={ancestor.name} className="w-full h-full object-cover" />
              ) : (
                ancestor.name.charAt(0)
              )}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm px-3 py-1 bg-gradient-to-r from-gold-100 to-gold-200 text-gold-700 rounded-full font-medium inline-block">
                {getGenerationName(ancestor.generation)} · 第{ancestor.generation + 3}代
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-3xl font-serif font-bold text-brown-800 mb-2">{ancestor.name}</h2>
              <p className="text-brown-600 text-lg">{ancestor.relationship}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-cream-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-brown-500 mb-0.5">诞辰</p>
                  <p className="font-medium text-brown-800">{formatDate(ancestor.birthDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-cream-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-brown-500 mb-0.5">忌日</p>
                  <p className="font-medium text-brown-800">{formatDate(ancestor.deathDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-cream-50 rounded-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-brown-500 mb-0.5">享年</p>
                  <p className="font-medium text-brown-800">{getAge(ancestor.birthDate, ancestor.deathDate)} 岁</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-cream-50 rounded-xl">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-xs text-brown-500 mb-0.5">农历忌日</p>
                  <p className="font-medium text-brown-800">{getLunarCalendar(ancestor.deathDate)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <p className="text-brown-500 text-sm mb-1">祭祀记录</p>
                <p className="text-3xl font-bold text-gold-600 font-serif">{ancestorRituals.length}</p>
              </div>
              <div className="stat-card">
                <p className="text-brown-500 text-sm mb-1">追思文章</p>
                <p className="text-3xl font-bold text-rose-600 font-serif">{ancestorArticles.length}</p>
              </div>
              <div className="stat-card">
                <p className="text-brown-500 text-sm mb-1">家族世代</p>
                <p className="text-3xl font-bold text-brown-800 font-serif">{generations.length}</p>
              </div>
              <div className="stat-card">
                <p className="text-brown-500 text-sm mb-1">同代亲属</p>
                <p className="text-3xl font-bold text-blue-600 font-serif">{relatedMembers.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="section-title">
              <BookOpen className="w-6 h-6 text-gold-500" />
              生平传记
            </h3>
            {ancestor.biography ? (
              <div className="prose prose-brown max-w-none">
                <p className="text-brown-700 leading-relaxed whitespace-pre-wrap text-base">
                  {ancestor.biography}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-brown-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无生平传记</p>
                <Link
                  to={`/ancestors/${ancestor.id}/edit`}
                  className="btn-secondary inline-flex items-center gap-2 mt-4 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑生平
                </Link>
              </div>
            )}
          </div>

          {allPhotos.length > 0 && (
            <div className="card">
              <h3 className="section-title">
                <ImageIcon className="w-6 h-6 text-gold-500" />
                照片相册
                <span className="text-sm font-normal text-brown-500 ml-2">
                  共 {allPhotos.length} 张
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {displayPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl overflow-hidden border border-brown-100 hover:border-gold-300 transition-all group cursor-pointer"
                  >
                    <img
                      src={photo}
                      alt={`${ancestor.name} 照片 ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              {allPhotos.length > 8 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllPhotos(!showAllPhotos)}
                    className="btn-secondary text-sm"
                  >
                    {showAllPhotos ? '收起' : `展开全部 (${allPhotos.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title !mb-0">
                <Gift className="w-6 h-6 text-gold-500" />
                祭祀历史
                <span className="text-sm font-normal text-brown-500 ml-2">
                  共 {ancestorRituals.length} 条记录
                </span>
              </h3>
              <Link
                to={`/rituals/new?ancestorId=${ancestor.id}`}
                className="btn-gold inline-flex items-center gap-2 text-sm py-2 px-4"
              >
                <Plus className="w-4 h-4" />
                记录祭祀
              </Link>
            </div>

            {ancestorRituals.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto mb-4 text-brown-200" />
                <p className="text-brown-500 mb-4">暂无祭祀记录</p>
                <Link
                  to={`/rituals/new?ancestorId=${ancestor.id}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  添加第一条祭祀记录
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(ritualsByYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                  <div key={year}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-lg font-serif font-bold text-brown-800">{year}年</span>
                      <span className="flex-1 h-px bg-brown-200" />
                      <span className="text-sm text-brown-500">{ritualsByYear[year].length} 次祭祀</span>
                    </div>
                    <div className="space-y-3">
                      {ritualsByYear[year].map((ritual, index) => (
                        <div
                          key={ritual.id}
                          className="flex items-start gap-4 p-4 bg-cream-50 rounded-xl border border-brown-100 hover:border-gold-300 transition-all"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex flex-col items-center justify-center text-white shadow-soft flex-shrink-0">
                            <span className="text-lg font-bold leading-none">
                              {new Date(ritual.date).getDate()}
                            </span>
                            <span className="text-xs mt-0.5">
                              {new Date(ritual.date).getMonth() + 1}月
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full">
                                农历 {getLunarCalendar(ritual.date)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1.5 text-brown-600">
                                <MapPin className="w-3.5 h-3.5 text-brown-400" />
                                <span>{ritual.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-brown-600">
                                <Users className="w-3.5 h-3.5 text-brown-400" />
                                <span>{ritual.participants.length} 人参与</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-brown-600">
                                <Gift className="w-3.5 h-3.5 text-brown-400" />
                                <span>{ritual.offerings.length} 种供品</span>
                              </div>
                            </div>

                            {ritual.notes && (
                              <p className="text-sm text-brown-600 mt-2 pt-2 border-t border-brown-100 line-clamp-2">
                                {ritual.notes}
                              </p>
                            )}

                            {ritual.participants.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {ritual.participants.slice(0, 4).map((p, i) => (
                                  <span key={i} className="text-xs bg-white px-2 py-0.5 rounded-full text-brown-600 border border-brown-100">
                                    {p}
                                  </span>
                                ))}
                                {ritual.participants.length > 4 && (
                                  <span className="text-xs text-brown-400 py-0.5">
                                    +{ritual.participants.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <Link
                            to={`/rituals/${ritual.id}/edit`}
                            className="p-2 hover:bg-brown-100 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Edit3 className="w-4 h-4 text-brown-500" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title !mb-0">
                <BookText className="w-6 h-6 text-rose-500" />
                追思文章
                <span className="text-sm font-normal text-brown-500 ml-2">
                  共 {ancestorArticles.length} 篇
                </span>
              </h3>
              <Link
                to={`/memorial-articles/new?ancestorId=${ancestor.id}`}
                className="btn-rose inline-flex items-center gap-2 text-sm py-2 px-4"
              >
                <Plus className="w-4 h-4" />
                撰写追思
              </Link>
            </div>

            {ancestorArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookText className="w-16 h-16 mx-auto mb-4 text-brown-200" />
                <p className="text-brown-500 mb-4">暂无追思文章</p>
                <p className="text-sm text-brown-400 mb-6">祭扫之后，有感而发，写下文字寄托哀思</p>
                <Link
                  to={`/memorial-articles/new?ancestorId=${ancestor.id}`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  撰写第一篇追思
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {ancestorArticles.slice(0, 3).map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-start gap-4 p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-300 transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex flex-col items-center justify-center shadow-soft flex-shrink-0">
                      <span className="text-lg font-bold text-white leading-none">
                        {new Date(article.date).getDate()}
                      </span>
                      <span className="text-xs text-white/90 mt-0.5">
                        {new Date(article.date).getMonth() + 1}月
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-semibold text-brown-800 mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-3 mb-2 text-sm">
                        {article.author && (
                          <span className="inline-flex items-center gap-1 text-brown-500">
                            <User className="w-3.5 h-3.5" />
                            {article.author}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-brown-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(article.date)}
                        </span>
                      </div>
                      <p className="text-sm text-brown-600 line-clamp-2 whitespace-pre-wrap">
                        {article.content}
                      </p>
                    </div>

                    <Link
                      to={`/memorial-articles/${article.id}/edit`}
                      className="p-2 hover:bg-rose-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Edit3 className="w-4 h-4 text-rose-500" />
                    </Link>
                  </div>
                ))}

                {ancestorArticles.length > 3 && (
                  <div className="text-center pt-2">
                    <Link
                      to={`/memorial-articles?ancestorId=${ancestor.id}`}
                      className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700"
                    >
                      查看全部 {ancestorArticles.length} 篇追思文章 →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title">
              <TreeDeciduous className="w-6 h-6 text-gold-500" />
              所属世代
            </h3>

            <div className="mb-6 p-4 bg-gradient-to-br from-gold-50 to-cream-100 rounded-xl border border-gold-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-brown-600">世代等级</span>
                <span className="text-2xl font-bold text-gold-600">第{ancestor.generation + 3}代</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brown-600">辈分称呼</span>
                <span className="text-lg font-semibold text-brown-800">{getGenerationName(ancestor.generation)}</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { value: -3, name: '高祖辈' },
                { value: -2, name: '曾祖辈' },
                { value: -1, name: '祖辈' },
                { value: 0, name: '父辈' },
                { value: 1, name: '我辈' },
                { value: 2, name: '子辈' },
              ].map(gen => {
                const isCurrent = gen.value === ancestor.generation;
                return (
                  <div
                    key={gen.value}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-gold-500 text-white shadow-soft'
                        : gen.value < ancestor.generation
                        ? 'bg-brown-50 text-brown-500'
                        : 'bg-cream-50 text-brown-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                      <span className={`${isCurrent ? 'font-semibold' : ''}`}>{gen.name}</span>
                    </div>
                    <span className={`text-sm ${isCurrent ? 'text-gold-100' : ''}`}>
                      第{gen.value + 3}代
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">
              <TreeDeciduous className="w-6 h-6 text-gold-500" />
              族谱位置
            </h3>

            {members.length === 0 ? (
              <div className="text-center py-8 text-brown-400">
                <TreeDeciduous className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无家族成员数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin -mx-2 px-2">
                <div className="min-w-[300px]">
                  {roots.map((root, index) => (
                    <div key={root.id} style={{ animationDelay: `${index * 100}ms` }}>
                      <TreeNodeComponent node={root} level={0} highlightId={ancestor.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedMembers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-brown-100">
                <h4 className="font-medium text-brown-800 mb-4">同代亲属 ({relatedMembers.length})</h4>
                <div className="space-y-2">
                  {relatedMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        member.id === ancestor.id
                          ? 'bg-gold-50 border border-gold-200'
                          : 'bg-cream-50 hover:bg-cream-100'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft flex-shrink-0 ${
                        member.gender === 'male'
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                          : 'bg-gradient-to-br from-pink-400 to-pink-600'
                      } ${!member.isAlive ? 'opacity-60 grayscale' : ''}`}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium truncate ${member.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
                            {member.name}
                          </span>
                          {member.id === ancestor.id && (
                            <span className="text-xs px-1.5 py-0.5 bg-gold-500 text-white rounded">
                              当前
                            </span>
                          )}
                          {!member.isAlive && (
                            <Heart className="w-3 h-3 text-brown-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-brown-500 truncate">{member.relationship}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除 "{ancestor.name}" 的信息吗？此操作不可撤销，相关的祭祀记录也将被删除。
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

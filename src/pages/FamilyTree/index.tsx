import { useState } from 'react';
import { ChevronDown, ChevronRight, User, TreeDeciduous, Heart } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getGenerationName } from '@/utils/dateUtils';
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
}

function TreeNodeComponent({ node, level }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

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
          } ${!node.isAlive ? 'opacity-60 grayscale' : ''}`}>
            {node.avatar ? (
              <img src={node.avatar} alt={node.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${node.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
                {node.name}
              </span>
              {!node.isAlive && (
                <Heart className="w-3.5 h-3.5 text-brown-400" />
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
            } ${!node.spouse.isAlive ? 'opacity-60 grayscale' : ''}`}>
              {node.spouse.avatar ? (
                <img src={node.spouse.avatar} alt={node.spouse.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${node.spouse.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
                  {node.spouse.name}
                </span>
                {!node.spouse.isAlive && (
                  <Heart className="w-3.5 h-3.5 text-brown-400" />
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
              <TreeNodeComponent node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FamilyTree() {
  const { members, ancestors, branches } = useAppStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  
  const filteredMembers = selectedBranch === null
    ? members
    : members.filter(m => m.branchId === selectedBranch);
  
  const generations = [...new Set(filteredMembers.map(m => m.generation))].sort((a, b) => a - b);
  
  const roots = buildTree(filteredMembers, generations[0] || 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">族谱展示</h1>
          <p className="text-brown-500 text-sm mt-1">
            按辈分排列，了解家族脉络，传承家族文化
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-brown-600">男性</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-brown-600">女性</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3 h-3 text-brown-400" />
            <span className="text-brown-600">已逝世</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-500 text-sm mb-1">家族成员</p>
              <p className="text-3xl font-bold text-brown-800 font-serif">{members.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <TreeDeciduous className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-500 text-sm mb-1">在世亲属</p>
              <p className="text-3xl font-bold text-green-600 font-serif">{members.filter(m => m.isAlive).length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <User className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-500 text-sm mb-1">家族世代</p>
              <p className="text-3xl font-bold text-gold-600 font-serif">{generations.length}</p>
            </div>
            <div className="p-3 bg-gold-50 rounded-xl">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brown-500 text-sm mb-1">家族先人</p>
              <p className="text-3xl font-bold text-purple-600 font-serif">{ancestors.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <span className="text-xl">🕊️</span>
            </div>
          </div>
        </div>
      </div>

      {branches.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TreeDeciduous className="w-4 h-4 text-brown-500" />
            <span className="text-sm font-medium text-brown-700">按分支筛选</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBranch(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedBranch === null
                  ? 'bg-brown-600 text-white shadow-soft'
                  : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
              }`}
            >
              全部分支
            </button>
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedBranch === branch.id
                    ? 'bg-brown-600 text-white shadow-soft'
                    : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                }`}
              >
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: branch.color || '#dc2626' }}
                />
                {branch.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <TreeDeciduous className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无家族成员</h3>
          <p className="text-brown-500 mb-6">添加家族成员后，族谱将自动生成</p>
        </div>
      ) : (
        <div className="space-y-8">
          {generations.map(gen => (
            <div key={gen} className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brown-100">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white font-bold shadow-soft">
                  {gen + 3}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-brown-800">
                    {getGenerationName(gen)}
                  </h3>
                  <p className="text-sm text-brown-500">
                    共 {filteredMembers.filter(m => m.generation === gen).length} 人
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.filter(m => m.generation === gen).map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl border border-brown-100 hover:border-gold-300 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-soft ${
                      member.gender === 'male'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-gradient-to-br from-pink-400 to-pink-600'
                    } ${!member.isAlive ? 'opacity-60 grayscale' : ''}`}>
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${member.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
                          {member.name}
                        </span>
                        {!member.isAlive && (
                          <Heart className="w-4 h-4 text-brown-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-brown-500 truncate">{member.relationship}</p>
                      {member.branchId && (() => {
                        const branch = branches.find(b => b.id === member.branchId);
                        return branch ? (
                          <span 
                            className="inline-block text-xs px-2 py-0.5 rounded-full text-white mt-1"
                            style={{ backgroundColor: branch.color || '#dc2626' }}
                          >
                            {branch.name}
                          </span>
                        ) : null;
                      })()}
                      {member.birthDate && (
                        <p className="text-xs text-brown-400 mt-0.5">
                          {member.isAlive ? '出生' : '生卒'}：{member.birthDate}
                          {!member.isAlive && ' - 已逝世'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="card">
            <h3 className="font-serif text-xl font-semibold text-brown-800 mb-6 flex items-center gap-3">
              <TreeDeciduous className="w-6 h-6 text-gold-500" />
              家族关系树
            </h3>
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[600px] pl-4">
                {roots.map((root, index) => (
                  <div key={root.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <TreeNodeComponent node={root} level={0} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

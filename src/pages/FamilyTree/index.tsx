import { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight, User, TreeDeciduous, Heart, Download, Image, Settings, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getGenerationName } from '@/utils/dateUtils';
import { TreeNode, FamilyMember } from '@/types';
import html2canvas from 'html2canvas';

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
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  forExport?: boolean;
  showDates?: boolean;
  showPhotos?: boolean;
}

function TreeNodeComponent({ 
  node, 
  level, 
  expandedNodes, 
  toggleNode,
  forExport = false,
  showDates = true,
  showPhotos = true,
}: TreeNodeComponentProps) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;

  const renderAvatar = (person: TreeNode | TreeNode['spouse']) => {
    if (!person) return null;
    
    if (!showPhotos) {
      return (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${
          person.gender === 'male'
            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
            : 'bg-gradient-to-br from-pink-400 to-pink-600'
        } ${!person.isAlive ? 'opacity-60 grayscale' : ''}`}>
          <User className="w-6 h-6 text-white" />
        </div>
      );
    }

    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${
        person.gender === 'male'
          ? 'bg-gradient-to-br from-blue-400 to-blue-600'
          : 'bg-gradient-to-br from-pink-400 to-pink-600'
      } ${!person.isAlive ? 'opacity-60 grayscale' : ''}`}>
        {person.avatar ? (
          <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>
    );
  };

  const renderInfo = (person: TreeNode | TreeNode['spouse']) => {
    if (!person) return null;

    return (
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${person.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
            {person.name}
          </span>
          {!person.isAlive && (
            <Heart className="w-3.5 h-3.5 text-brown-400" />
          )}
        </div>
        <p className="text-xs text-brown-500">{person.relationship}</p>
        {showDates && person.birthDate && (
          <p className="text-xs text-brown-400 mt-0.5">
            {person.isAlive ? '出生' : '生卒'}：{person.birthDate}
            {!person.isAlive && ' - 已逝世'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {level > 0 && (
          <div className="w-6 h-px bg-brown-300" />
        )}
        
        {hasChildren && !forExport && (
          <button
            onClick={() => toggleNode(node.id)}
            className="p-1 hover:bg-brown-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-brown-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-brown-500" />
            )}
          </button>
        )}
        {(!hasChildren || forExport) && <div className="w-6" />}
        
        <div className="flex items-center gap-3">
          {renderAvatar(node)}
          {renderInfo(node)}
        </div>
        
        {node.spouse && (
          <>
            <div className="flex items-center gap-1 px-3">
              <div className="w-4 h-px bg-gold-400" />
              <span className="text-xs text-gold-600">配偶</span>
              <div className="w-4 h-px bg-gold-400" />
            </div>
            {renderAvatar(node.spouse)}
            {renderInfo(node.spouse)}
          </>
        )}
      </div>
      
      {hasChildren && (isExpanded || forExport) && (
        <div className="ml-14 mt-4 space-y-4 pl-4 border-l-2 border-dashed border-brown-200">
          {node.children.map((child, index) => (
            <div key={child.id} className="relative">
              {index === 0 && (
                <div className="absolute -left-4 top-6 w-4 h-px border-t-2 border-dashed border-brown-200" />
              )}
              <TreeNodeComponent 
                node={child} 
                level={level + 1} 
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                forExport={forExport}
                showDates={showDates}
                showPhotos={showPhotos}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExportTreeNodeComponentProps {
  node: TreeNode;
  level: number;
  showDates: boolean;
  showPhotos: boolean;
  expandedNodes: Set<string>;
}

function ExportTreeNodeComponent({ node, level, showDates, showPhotos, expandedNodes }: ExportTreeNodeComponentProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  const renderAvatar = (person: TreeNode | TreeNode['spouse']) => {
    if (!person) return null;
    
    if (!showPhotos) {
      return (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${
          person.gender === 'male'
            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
            : 'bg-gradient-to-br from-pink-400 to-pink-600'
        } ${!person.isAlive ? 'opacity-60 grayscale' : ''}`}>
          <User className="w-6 h-6 text-white" />
        </div>
      );
    }

    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft ${
        person.gender === 'male'
          ? 'bg-gradient-to-br from-blue-400 to-blue-600'
          : 'bg-gradient-to-br from-pink-400 to-pink-600'
      } ${!person.isAlive ? 'opacity-60 grayscale' : ''}`}>
        {person.avatar ? (
          <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>
    );
  };

  const renderInfo = (person: TreeNode | TreeNode['spouse']) => {
    if (!person) return null;

    return (
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${person.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
            {person.name}
          </span>
          {!person.isAlive && (
            <Heart className="w-3.5 h-3.5 text-brown-400" />
          )}
        </div>
        <p className="text-xs text-brown-500">{person.relationship}</p>
        {showDates && person.birthDate && (
          <p className="text-xs text-brown-400 mt-0.5">
            {person.isAlive ? '出生' : '生卒'}：{person.birthDate}
            {!person.isAlive && ' - 已逝世'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {level > 0 && (
          <div className="w-6 h-px bg-brown-300" />
        )}
        
        <div className="w-6" />
        
        <div className="flex items-center gap-3">
          {renderAvatar(node)}
          {renderInfo(node)}
        </div>
        
        {node.spouse && (
          <>
            <div className="flex items-center gap-1 px-3">
              <div className="w-4 h-px bg-gold-400" />
              <span className="text-xs text-gold-600">配偶</span>
              <div className="w-4 h-px bg-gold-400" />
            </div>
            {renderAvatar(node.spouse)}
            {renderInfo(node.spouse)}
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
              <ExportTreeNodeComponent 
                node={child} 
                level={level + 1} 
                showDates={showDates}
                showPhotos={showPhotos}
                expandedNodes={expandedNodes}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FamilyTree() {
  const { members, ancestors, branches, settings } = useAppStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportExpandAll, setExportExpandAll] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  const filteredMembers = selectedBranch === null
    ? members
    : members.filter(m => m.branchId === selectedBranch);
  
  const generations = [...new Set(filteredMembers.map(m => m.generation))].sort((a, b) => a - b);
  
  const roots = buildTree(filteredMembers, generations[0] || 0);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const getAllNodeIds = (nodes: TreeNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (nodeList: TreeNode[]) => {
      nodeList.forEach(node => {
        ids.push(node.id);
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return ids;
  };

  const expandAll = () => {
    const allIds = getAllNodeIds(roots);
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleExport = async (exportType: 'tree' | 'list') => {
    setIsExporting(true);
    setShowExportOptions(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const exportContainer = exportContainerRef.current;
      if (!exportContainer) return;

      const canvas = await html2canvas(exportContainer, {
        background: '#FFFDFA',
        useCORS: true,
        logging: false,
        // @ts-expect-error html2canvas 类型定义不完整，但运行时支持 scale 选项
        scale: 2,
      });

      const link = document.createElement('a');
      const branchName = selectedBranch 
        ? branches.find(b => b.id === selectedBranch)?.name || ''
        : '';
      const branchSuffix = branchName ? `_${branchName}` : '';
      link.download = `族谱${branchSuffix}_${exportType === 'tree' ? '关系树' : '成员列表'}_${new Date().toLocaleDateString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const { includeBirthDeathDates, includePhotos } = settings.shareSettings;

  const effectiveExpandedNodes = exportExpandAll 
    ? new Set(getAllNodeIds(roots))
    : expandedNodes;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">族谱展示</h1>
          <p className="text-brown-500 text-sm mt-1">
            按辈分排列，了解家族脉络，传承家族文化
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
          >
            <ChevronDown className="w-4 h-4" />
            全部展开
          </button>
          <button
            onClick={collapseAll}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
          >
            <ChevronRight className="w-4 h-4" />
            全部收起
          </button>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="btn-gold flex items-center gap-2 text-sm py-2 px-4"
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? '导出中...' : '导出族谱'}
          </button>
          
          {showExportOptions && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-card border border-brown-100 py-2 z-20 min-w-[240px] animate-fade-in">
              <div className="px-4 py-2 border-b border-brown-100">
                <p className="text-xs text-brown-500 font-medium mb-2">导出内容设置</p>
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  <Settings className="w-3 h-3 text-brown-400" />
                  <span className="text-brown-600">
                    {includeBirthDeathDates ? '包含' : '不包含'}生卒日期
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <Settings className="w-3 h-3 text-brown-400" />
                  <span className="text-brown-600">
                    {includePhotos ? '包含' : '不包含'}照片
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brown-600">当前筛选：{selectedBranch ? branches.find(b => b.id === selectedBranch)?.name : '全部分支'}</span>
                </div>
              </div>
              
              <div className="px-4 py-2 border-b border-brown-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportExpandAll}
                    onChange={(e) => setExportExpandAll(e.target.checked)}
                    className="w-4 h-4 text-gold-500 border-brown-300 rounded focus:ring-gold-500"
                  />
                  <span className="text-sm text-brown-700">导出时展开所有节点</span>
                </label>
                <p className="text-xs text-brown-500 mt-1 pl-6">
                  {exportExpandAll 
                    ? '将展开所有世代的关系树'
                    : `仅导出当前展开的 ${expandedNodes.size} 个节点`}
                </p>
              </div>
              
              <button
                onClick={() => handleExport('tree')}
                className="w-full px-4 py-2 text-left hover:bg-cream-50 flex items-center gap-2 text-sm text-brown-700"
              >
                <TreeDeciduous className="w-4 h-4 text-gold-500" />
                导出关系树图
              </button>
              <button
                onClick={() => handleExport('list')}
                className="w-full px-4 py-2 text-left hover:bg-cream-50 flex items-center gap-2 text-sm text-brown-700"
              >
                <Image className="w-4 h-4 text-gold-500" />
                导出成员列表
              </button>
              <div className="border-t border-brown-100 mt-1 pt-1">
                <button
                  onClick={() => setShowExportOptions(false)}
                  className="w-full px-4 py-2 text-left hover:bg-cream-50 flex items-center gap-2 text-sm text-brown-500"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>
            </div>
          )}
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
                      {includePhotos && member.avatar ? (
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
                      {includeBirthDeathDates && member.birthDate && (
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
                    <TreeNodeComponent 
                      node={root} 
                      level={0}
                      expandedNodes={expandedNodes}
                      toggleNode={toggleNode}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={exportContainerRef} 
        className="fixed -left-[9999px] top-0 bg-[#FFFDFA] p-8"
        style={{ minWidth: '1200px' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-brown-800 mb-2">家族族谱</h1>
          <p className="text-brown-500">
            导出时间：{new Date().toLocaleString('zh-CN')}
          </p>
          {selectedBranch && (() => {
            const branch = branches.find(b => b.id === selectedBranch);
            return branch ? (
              <p className="text-brown-600 mt-1">
                筛选分支：{branch.name}
              </p>
            ) : null;
          })()}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-brown-800 mb-4">家族成员统计</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-cream-100 rounded-xl text-center">
              <p className="text-brown-500 text-sm">总人数</p>
              <p className="text-2xl font-bold text-brown-800 font-serif">{filteredMembers.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-brown-500 text-sm">在世</p>
              <p className="text-2xl font-bold text-green-600 font-serif">{filteredMembers.filter(m => m.isAlive).length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <p className="text-brown-500 text-sm">逝世</p>
              <p className="text-2xl font-bold text-purple-600 font-serif">{filteredMembers.filter(m => !m.isAlive).length}</p>
            </div>
            <div className="p-4 bg-gold-50 rounded-xl text-center">
              <p className="text-brown-500 text-sm">世代</p>
              <p className="text-2xl font-bold text-gold-600 font-serif">{generations.length}</p>
            </div>
          </div>
        </div>

        {generations.map(gen => (
          <div key={gen} className="mb-8">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-brown-200">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {gen + 3}
              </div>
              <h3 className="font-serif text-lg font-semibold text-brown-800">
                {getGenerationName(gen)}
              </h3>
              <span className="text-sm text-brown-500">
                ({filteredMembers.filter(m => m.generation === gen).length} 人)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {filteredMembers.filter(m => m.generation === gen).map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-brown-100"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft ${
                    member.gender === 'male'
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                      : 'bg-gradient-to-br from-pink-400 to-pink-600'
                  } ${!member.isAlive ? 'opacity-60 grayscale' : ''}`}>
                    {includePhotos && member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full rounded-full object-cover" 
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium text-sm truncate ${member.isAlive ? 'text-brown-800' : 'text-brown-400'}`}>
                        {member.name}
                      </span>
                      {!member.isAlive && (
                        <Heart className="w-3 h-3 text-brown-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-brown-500 truncate">{member.relationship}</p>
                    {includeBirthDeathDates && member.birthDate && (
                      <p className="text-xs text-brown-400">
                        {member.birthDate}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8">
          <h2 className="text-xl font-serif font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-gold-500" />
            家族关系树
          </h2>
          <p className="text-xs text-brown-500 mb-4">
            {exportExpandAll
              ? '已展开所有节点'
              : effectiveExpandedNodes.size > 0 
                ? `当前已展开 ${effectiveExpandedNodes.size} 个节点的子节点`
                : '当前所有节点均为收起状态（仅显示根节点）'}
          </p>
          <div className="pl-4">
            {roots.map((root) => (
              <ExportTreeNodeComponent 
                key={root.id}
                node={root} 
                level={0}
                showDates={includeBirthDeathDates}
                showPhotos={includePhotos}
                expandedNodes={effectiveExpandedNodes}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brown-200 text-center text-xs text-brown-400">
          <p>家族祭祀管理平台 · 族谱导出</p>
        </div>
      </div>
    </div>
  );
}

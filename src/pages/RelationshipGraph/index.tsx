import { useState, useCallback, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Filter,
  X,
  Heart,
  Users,
  User,
  ArrowRightLeft,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getGenerationName } from '@/utils/dateUtils';
import type { GraphNodeData, GraphEdgeData, GraphEdgeType } from '@/types';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const EDGE_STYLES: Record<GraphEdgeType, { color: string; label: string; dashArray?: string }> = {
  parent: { color: '#8B7355', label: '血缘' },
  spouse: { color: '#D4A574', label: '婚姻', dashArray: '5,5' },
  sibling: { color: '#A0522D', label: '兄弟姐妹', dashArray: '2,3' },
};

function RelationshipGraphContent() {
  const navigate = useNavigate();
  const { ancestors, members, branches } = useAppStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdgeData>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyAncestors, setShowOnlyAncestors] = useState(false);
  const [showOnlyAlive, setShowOnlyAlive] = useState(false);

  const generations = useMemo(() => {
    const allGenerations = new Set<number>();
    ancestors.forEach(a => allGenerations.add(a.generation));
    members.forEach(m => allGenerations.add(m.generation));
    return [...allGenerations].sort((a, b) => a - b);
  }, [ancestors, members]);

  const buildGraph = useCallback(() => {
    const newNodes: Node<GraphNodeData>[] = [];
    const newEdges: Edge<GraphEdgeData>[] = [];

    const getBranchColor = (branchId?: string) => {
      if (!branchId) return undefined;
      const branch = branches.find(b => b.id === branchId);
      return branch?.color;
    };

    const filteredAncestors = ancestors.filter(ancestor => {
      const matchesSearch = ancestor.name.includes(searchTerm) || ancestor.relationship.includes(searchTerm);
      const matchesGeneration = selectedGeneration === null || ancestor.generation === selectedGeneration;
      const matchesBranch = selectedBranch === null || ancestor.branchId === selectedBranch;
      const matchesAlive = !showOnlyAlive;
      return matchesSearch && matchesGeneration && matchesBranch && matchesAlive;
    });

    const filteredMembers = members.filter(member => {
      if (showOnlyAncestors) return false;
      const matchesSearch = member.name.includes(searchTerm) || member.relationship.includes(searchTerm);
      const matchesGeneration = selectedGeneration === null || member.generation === selectedGeneration;
      const matchesBranch = selectedBranch === null || member.branchId === selectedBranch;
      const matchesAlive = !showOnlyAlive || member.isAlive;
      return matchesSearch && matchesGeneration && matchesBranch && matchesAlive;
    });

    const allIds = new Set([
      ...filteredAncestors.map(a => a.id),
      ...filteredMembers.map(m => m.id),
    ]);

    const ancestorMap = new Map(filteredAncestors.map(a => [a.id, a]));

    const generationColumns = new Map<number, number>();

    filteredAncestors.forEach(ancestor => {
      const col = generationColumns.get(ancestor.generation) || 0;
      generationColumns.set(ancestor.generation, col + 1);

      newNodes.push({
        id: `ancestor-${ancestor.id}`,
        type: 'custom',
        position: { x: col * 200, y: ancestor.generation * 200 + 100 },
        data: {
          label: ancestor.name,
          type: 'ancestor',
          gender: 'male',
          avatar: ancestor.photos?.[0] || ancestor.photo,
          isAlive: false,
          generation: ancestor.generation,
          branchId: ancestor.branchId,
          branchColor: getBranchColor(ancestor.branchId),
          detailUrl: `/ancestors/${ancestor.id}`,
          relationship: ancestor.relationship,
        },
      });
    });

    filteredMembers.forEach(member => {
      const col = generationColumns.get(member.generation) || 0;
      generationColumns.set(member.generation, col + 1);

      newNodes.push({
        id: `member-${member.id}`,
        type: 'custom',
        position: { x: col * 200 + 100, y: member.generation * 200 + 100 },
        data: {
          label: member.name,
          type: 'member',
          gender: member.gender,
          avatar: member.avatar,
          isAlive: member.isAlive,
          generation: member.generation,
          branchId: member.branchId,
          branchColor: getBranchColor(member.branchId),
          detailUrl: `/members/${member.id}`,
          relationship: member.relationship,
        },
      });
    });

    filteredMembers.forEach(member => {
      if (member.parentId && allIds.has(member.parentId)) {
        const parentType = ancestorMap.has(member.parentId) ? 'ancestor' : 'member';
        newEdges.push({
          id: `parent-${member.id}-${member.parentId}`,
          source: `${parentType}-${member.parentId}`,
          target: `member-${member.id}`,
          animated: true,
          style: { stroke: EDGE_STYLES.parent.color, strokeWidth: 2 },
          label: EDGE_STYLES.parent.label,
          labelBgPadding: [8, 4],
          labelBgStyle: { fill: '#FFFDFA', fillOpacity: 0.8 },
          data: { type: 'parent', label: EDGE_STYLES.parent.label },
        });
      }

      if (member.spouseId && allIds.has(member.spouseId)) {
        const existingEdge = newEdges.find(
          e =>
            (e.source === `member-${member.id}` && e.target === `member-${member.spouseId}`) ||
            (e.source === `member-${member.spouseId}` && e.target === `member-${member.id}`)
        );

        if (!existingEdge && member.id < member.spouseId) {
          const spouseType = ancestorMap.has(member.spouseId) ? 'ancestor' : 'member';
          newEdges.push({
            id: `spouse-${member.id}-${member.spouseId}`,
            source: `member-${member.id}`,
            target: `${spouseType}-${member.spouseId}`,
            animated: false,
            style: {
              stroke: EDGE_STYLES.spouse.color,
              strokeWidth: 3,
              strokeDasharray: EDGE_STYLES.spouse.dashArray,
            },
            label: EDGE_STYLES.spouse.label,
            labelBgPadding: [8, 4],
            labelBgStyle: { fill: '#FFFDFA', fillOpacity: 0.8 },
            data: { type: 'spouse', label: EDGE_STYLES.spouse.label },
          });
        }
      }
    });

    const siblingsByParent = new Map<string, string[]>();
    filteredMembers.forEach(member => {
      if (member.parentId) {
        if (!siblingsByParent.has(member.parentId)) {
          siblingsByParent.set(member.parentId, []);
        }
        siblingsByParent.get(member.parentId)!.push(member.id);
      }
    });

    siblingsByParent.forEach(siblings => {
      for (let i = 0; i < siblings.length; i++) {
        for (let j = i + 1; j < siblings.length; j++) {
          newEdges.push({
            id: `sibling-${siblings[i]}-${siblings[j]}`,
            source: `member-${siblings[i]}`,
            target: `member-${siblings[j]}`,
            animated: false,
            style: {
              stroke: EDGE_STYLES.sibling.color,
              strokeWidth: 1.5,
              strokeDasharray: EDGE_STYLES.sibling.dashArray,
            },
            data: { type: 'sibling', label: EDGE_STYLES.sibling.label },
          });
        }
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [ancestors, members, branches, searchTerm, selectedGeneration, selectedBranch, showOnlyAncestors, showOnlyAlive, setNodes, setEdges]);

  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<GraphNodeData>) => {
      const { detailUrl } = node.data;
      navigate(detailUrl);
    },
    [navigate]
  );

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleFitView = () => {
    fitView({ duration: 300 });
  };

  const stats = useMemo(() => {
    const ancestorCount = nodes.filter(n => n.data.type === 'ancestor').length;
    const memberCount = nodes.filter(n => n.data.type === 'member').length;
    const edgeCount = edges.filter(e => !e.hidden).length;
    return { ancestorCount, memberCount, edgeCount };
  }, [nodes, edges]);

  return (
    <div className="animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800 flex items-center gap-2">
            <Network className="w-6 h-6 text-gold-500" />
            关系图谱
          </h1>
          <p className="text-brown-500 text-sm mt-1">
            可视化展示先人与家属之间的血缘、婚姻关系网络
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm bg-cream-100 px-4 py-2 rounded-xl">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-brown-500" />
              先人 {stats.ancestorCount}
            </span>
            <span className="text-brown-300">|</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              家属 {stats.memberCount}
            </span>
            <span className="text-brown-300">|</span>
            <span className="flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-brown-500" />
              关系 {stats.edgeCount}
            </span>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
            <input
              type="text"
              placeholder="搜索姓名、关系..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-brown-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-brown-400" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-brown-100' : ''}`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-cream-100 hover:bg-cream-200 rounded-lg transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-5 h-5 text-brown-600" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-cream-100 hover:bg-cream-200 rounded-lg transition-colors"
              title="放大"
            >
              <ZoomIn className="w-5 h-5 text-brown-600" />
            </button>
            <button
              onClick={handleFitView}
              className="p-2 bg-cream-100 hover:bg-cream-200 rounded-lg transition-colors"
              title="适应视图"
            >
              <Maximize2 className="w-5 h-5 text-brown-600" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-brown-100 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-medium text-brown-700 mb-2">按辈分筛选</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGeneration(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedGeneration === null
                        ? 'bg-brown-600 text-white'
                        : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    全部
                  </button>
                  {generations.map(gen => (
                    <button
                      key={gen}
                      onClick={() => setSelectedGeneration(selectedGeneration === gen ? null : gen)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedGeneration === gen
                          ? 'bg-brown-600 text-white'
                          : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                      }`}
                    >
                      {getGenerationName(gen)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {branches.length > 0 && (
              <div>
                <p className="text-sm font-medium text-brown-700 mb-2">按分支筛选</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBranch(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedBranch === null
                        ? 'bg-brown-600 text-white'
                        : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    全部分支
                  </button>
                  {branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranch(selectedBranch === branch.id ? null : branch.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedBranch === branch.id
                          ? 'bg-brown-600 text-white'
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

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAncestors}
                  onChange={(e) => setShowOnlyAncestors(e.target.checked)}
                  className="w-4 h-4 rounded border-brown-300 text-brown-600 focus:ring-brown-500"
                />
                <span className="text-sm text-brown-700">仅显示先人</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAlive}
                  onChange={(e) => setShowOnlyAlive(e.target.checked)}
                  className="w-4 h-4 rounded border-brown-300 text-brown-600 focus:ring-brown-500"
                />
                <span className="text-sm text-brown-700">仅显示在世成员</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="card flex-1 p-0 overflow-hidden">
          {nodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-4">
                <Network className="w-10 h-10 text-brown-400" />
              </div>
              <h3 className="font-serif text-xl text-brown-800 mb-2">暂无数据</h3>
              <p className="text-brown-500">添加先人和家属成员后，关系图谱将自动生成</p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              proOptions={{ hideAttribution: true }}
              className="bg-gradient-to-br from-cream-50 to-brown-50"
            >
              <Background gap={20} color="#D4C4B0" style={{ opacity: 0.3 }} />
              <Controls
                className="!bg-white !rounded-xl !shadow-lg !border !border-brown-200"
                showInteractive={false}
              />
              <MiniMap
                nodeStrokeColor="#8B7355"
                nodeColor={(node) => {
                  if (node.data.type === 'ancestor') return '#8B7355';
                  return node.data.gender === 'male' ? '#60A5FA' : '#F472B6';
                }}
                className="!bg-white !rounded-xl !shadow-lg !border !border-brown-200"
                maskColor="rgba(139, 115, 85, 0.1)"
              />
            </ReactFlow>
          )}
        </div>

        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-500" />
              图例说明
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brown-400 to-brown-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">先人</p>
                  <p className="text-xs text-brown-500">已逝世的家族长辈</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">男性家属</p>
                  <p className="text-xs text-brown-500">在世男性家族成员</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">女性家属</p>
                  <p className="text-xs text-brown-500">在世女性家族成员</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 grayscale flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">已逝世</p>
                  <p className="text-xs text-brown-500">灰色样式表示已逝世</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-gold-500" />
              关系类型
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-brown-600 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-brown-700">血缘关系</p>
                  <p className="text-xs text-brown-500">父母与子女</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-amber-500 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #D4A574, #D4A574 4px, transparent 4px, transparent 8px)' }} />
                <div>
                  <p className="text-sm font-medium text-brown-700">婚姻关系</p>
                  <p className="text-xs text-brown-500">配偶之间</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-amber-800 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #A0522D, #A0522D 2px, transparent 2px, transparent 5px)' }} />
                <div>
                  <p className="text-sm font-medium text-brown-700">兄弟姐妹</p>
                  <p className="text-xs text-brown-500">同父母的兄弟姐妹</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-brown-800 mb-4">操作提示</h3>
            <div className="space-y-2 text-sm text-brown-600">
              <p>🖱️ <span className="font-medium">拖拽节点</span>：调整位置</p>
              <p>🔍 <span className="font-medium">滚轮缩放</span>：放大缩小视图</p>
              <p>👆 <span className="font-medium">点击节点</span>：查看详细信息</p>
              <p>🖐️ <span className="font-medium">拖拽空白</span>：平移视图</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RelationshipGraph() {
  return (
    <ReactFlowProvider>
      <RelationshipGraphContent />
    </ReactFlowProvider>
  );
}

import { useState, useRef } from 'react';
import { 
  Settings, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Info,
  GitBranch,
  Plus,
  Edit3,
  X,
  Palette,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyBranch } from '@/types';

export default function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    clearAllData,
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
  } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<FamilyBranch | null>(null);
  const [showDeleteBranchConfirm, setShowDeleteBranchConfirm] = useState<string | null>(null);
  const [branchFormData, setBranchFormData] = useState<Partial<FamilyBranch>>({
    name: '',
    description: '',
    color: '#dc2626',
  });

  const colorPresets = [
    '#dc2626',
    '#ea580c',
    '#d97706',
    '#65a30d',
    '#0891b2',
    '#2563eb',
    '#7c3aed',
    '#db2777',
  ];

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `家族祭祀数据_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const success = importData(jsonStr);
        setImportStatus(success ? 'success' : 'error');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    setBranchFormData({ name: '', description: '', color: '#dc2626' });
    setShowBranchForm(true);
  };

  const handleEditBranch = (branch: FamilyBranch) => {
    setEditingBranch(branch);
    setBranchFormData(branch);
    setShowBranchForm(true);
  };

  const handleSaveBranch = () => {
    if (!branchFormData.name?.trim()) return;
    
    if (editingBranch) {
      updateBranch(editingBranch.id, branchFormData);
    } else {
      addBranch(branchFormData as Omit<FamilyBranch, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    setShowBranchForm(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (id: string) => {
    deleteBranch(id);
    setShowDeleteBranchConfirm(null);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-800">系统设置</h1>
        <p className="text-brown-500 text-sm mt-1">
          管理应用设置和数据
        </p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gold-100 rounded-xl">
              <Bell className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-brown-800">纪念日提醒</h3>
              <p className="text-sm text-brown-500">设置纪念日提前提醒天数</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-3">
                提前提醒天数
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.reminderDays}
                  onChange={(e) => updateSettings({ reminderDays: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-brown-200 rounded-lg appearance-none cursor-pointer accent-brown-600"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-brown-800 font-serif">
                    {settings.reminderDays}
                  </span>
                  <span className="text-sm text-brown-500"> 天</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-brown-400 mt-1">
                <span>1天</span>
                <span>15天</span>
                <span>30天</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brown-100 rounded-lg">
                  <Info className="w-4 h-4 text-brown-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-700">提醒范围</p>
                  <p className="text-xs text-brown-500">
                    系统将在纪念日到来前 {settings.reminderDays} 天开始显示提醒
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <GitBranch className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brown-800">家族分支管理</h3>
                <p className="text-sm text-brown-500">管理家族的各个分支（长房、二房等）</p>
              </div>
            </div>
            <button
              onClick={handleAddBranch}
              className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              添加分支
            </button>
          </div>

          {branches.length === 0 ? (
            <div className="text-center py-8 text-brown-400">
              <div className="text-4xl mb-2">🌿</div>
              <p>暂无分支信息</p>
              <p className="text-xs mt-1">点击上方按钮添加第一个家族分支</p>
            </div>
          ) : (
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-4 bg-cream-50 rounded-xl border border-brown-100 hover:border-brown-200 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-soft"
                      style={{ backgroundColor: branch.color || '#dc2626' }}
                    >
                      {branch.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-brown-800">{branch.name}</h4>
                      {branch.description && (
                        <p className="text-sm text-brown-500">{branch.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditBranch(branch)}
                      className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-4 h-4 text-brown-500" />
                    </button>
                    <button
                      onClick={() => setShowDeleteBranchConfirm(branch.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-brown-800">数据管理</h3>
              <p className="text-sm text-brown-500">导出和导入家族数据</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-brown-700">导出数据</p>
                <p className="text-xs text-brown-500">
                  将所有家族数据导出为 JSON 文件进行备份
                </p>
              </div>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-brown-700">导入数据</p>
                <p className="text-xs text-brown-500">
                  从 JSON 文件恢复家族数据
                </p>
              </div>
              <div className="flex items-center gap-3">
                {importStatus === 'success' && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    导入成功
                  </div>
                )}
                {importStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    导入失败
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  导入
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div>
                <p className="text-sm font-medium text-red-700">清空所有数据</p>
                <p className="text-xs text-red-500">
                  删除所有先人、祭祀记录和家属信息
                </p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-brown-800">关于</h3>
              <p className="text-sm text-brown-500">应用信息</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
              <span className="text-brown-500">应用名称</span>
              <span className="text-brown-800 font-medium">家族祭祀管理平台</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
              <span className="text-brown-500">版本</span>
              <span className="text-brown-800">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
              <span className="text-brown-500">存储方式</span>
              <span className="text-brown-800">浏览器本地存储 (localStorage)</span>
            </div>
            <div className="p-4 bg-brown-50 rounded-xl border border-brown-100">
              <p className="text-xs text-brown-500 leading-relaxed">
                💡 温馨提示：本应用数据存储在您的浏览器本地，请定期导出数据进行备份，
                避免因清除浏览器数据导致信息丢失。
              </p>
            </div>
          </div>
        </div>
      </div>

      {showBranchForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-brown-800">
                {editingBranch ? '编辑分支' : '添加分支'}
              </h3>
              <button
                onClick={() => setShowBranchForm(false)}
                className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-brown-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  分支名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={branchFormData.name || ''}
                  onChange={(e) => setBranchFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="如：长房、二房"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  value={branchFormData.description || ''}
                  onChange={(e) => setBranchFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="如：长子一脉"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    标识颜色
                  </div>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBranchFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                        branchFormData.color === color ? 'ring-2 ring-offset-2 ring-brown-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-brown-100">
              <button
                type="button"
                onClick={() => setShowBranchForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveBranch}
                className="btn-primary"
                disabled={!branchFormData.name?.trim()}
              >
                {editingBranch ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteBranchConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brown-800">确认删除</h3>
            </div>
            <p className="text-brown-600 mb-6">
              确定要删除此分支吗？删除后，相关先人和成员的分支归属将被清除，但数据本身不会被删除。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteBranchConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteBranch(showDeleteBranchConfirm)}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brown-800">确认清空</h3>
            </div>
            <p className="text-brown-600 mb-6">
              此操作将永久删除所有先人信息、祭祀记录和家属成员数据，且无法恢复。
              建议您先导出数据进行备份。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

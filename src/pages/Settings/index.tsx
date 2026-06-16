import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Cloud,
  CloudOff,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  User,
  LogOut,
  LogIn,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FamilyBranch, ConflictResolution } from '@/types';
import ConflictResolverDialog from '@/components/ConflictResolverDialog';

const formatSyncTime = (iso: string | null): string => {
  if (!iso) return '尚未同步';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return '刚刚同步';
  if (diffMins < 60) return `${diffMins} 分钟前同步`;
  if (diffHours < 24) return `${diffHours} 小时前同步`;
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SettingsPage() {
  const navigate = useNavigate();
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
    user,
    syncState,
    pendingConflicts,
    setAutoSyncEnabled,
    syncNow,
    forceUpload,
    forceDownload,
    logout,
    resolveConflicts,
    dismissConflicts,
    refreshPendingChanges,
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

  const [isSyncAction, setIsSyncAction] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    refreshPendingChanges();
  }, [refreshPendingChanges]);

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
        if (success && user) {
          refreshPendingChanges();
        }
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
    if (user) {
      refreshPendingChanges();
    }
  };

  const handleDeleteBranch = (id: string) => {
    deleteBranch(id);
    setShowDeleteBranchConfirm(null);
    if (user) {
      refreshPendingChanges();
    }
  };

  const handleSyncNow = async () => {
    setIsSyncAction(true);
    setSyncError(null);
    try {
      const result = await syncNow();
      if (!result.success) {
        setSyncError(result.error || '同步失败');
      }
    } finally {
      setIsSyncAction(false);
    }
  };

  const handleForceUpload = async () => {
    setIsSyncAction(true);
    setSyncError(null);
    try {
      const result = await forceUpload();
      if (!result.success) {
        setSyncError(result.error || '上传失败');
      }
    } finally {
      setIsSyncAction(false);
    }
  };

  const handleForceDownload = async () => {
    setIsSyncAction(true);
    setSyncError(null);
    try {
      const result = await forceDownload();
      if (!result.success) {
        setSyncError(result.error || '下载失败');
      }
    } finally {
      setIsSyncAction(false);
    }
  };

  const handleResolveConflicts = async (resolutions: Map<string, ConflictResolution>) => {
    setIsSyncAction(true);
    try {
      await resolveConflicts(resolutions);
    } finally {
      setIsSyncAction(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getSyncStatusDisplay = () => {
    switch (syncState.status) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: '同步中...',
          color: 'text-blue-600 bg-blue-50 border-blue-200',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: '同步成功',
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: '同步失败',
          color: 'text-red-600 bg-red-50 border-red-200',
        };
      case 'conflict':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: '存在冲突',
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        };
      default:
        if (!user) {
          return {
            icon: <CloudOff className="w-4 h-4" />,
            text: '未启用同步',
            color: 'text-brown-400 bg-brown-50 border-brown-200',
          };
        }
        if (syncState.pendingChanges > 0) {
          return {
            icon: <WifiOff className="w-4 h-4" />,
            text: `${syncState.pendingChanges} 项待同步`,
            color: 'text-orange-600 bg-orange-50 border-orange-200',
          };
        }
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: '已连接云端',
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        };
    }
  };

  const syncStatusDisplay = getSyncStatusDisplay();

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${user ? 'bg-sky-100' : 'bg-brown-100'}`}>
                <User className={`w-5 h-5 ${user ? 'text-sky-600' : 'text-brown-500'}`} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brown-800">账户信息</h3>
                <p className="text-sm text-brown-500">
                  {user ? '登录账户以启用云端同步' : '登录后可跨设备同步数据'}
                </p>
              </div>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-brown-800">{user.username}</div>
                  <div className="text-xs text-brown-500">{user.email}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-soft">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                登录 / 注册
              </button>
            )}
          </div>

          {user && (
            <div className="space-y-3 text-sm bg-cream-50 rounded-xl p-4 border border-brown-100">
              <div className="flex items-center justify-between">
                <span className="text-brown-500">用户ID</span>
                <span className="text-brown-700 font-mono text-xs">{user.id.substring(0, 16)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brown-500">注册时间</span>
                <span className="text-brown-700">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brown-500">最近登录</span>
                <span className="text-brown-700">
                  {new Date(user.lastLoginAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Cloud className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brown-800">云端同步</h3>
                <p className="text-sm text-brown-500">多设备间自动同步家族数据</p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${syncStatusDisplay.color}`}
            >
              {syncStatusDisplay.icon}
              {syncStatusDisplay.text}
            </div>
          </div>

          {user ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-cream-50 rounded-xl border border-brown-100">
                  <div className="flex items-center gap-2 mb-1 text-brown-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    最近同步
                  </div>
                  <div className="text-brown-800 font-medium">
                    {formatSyncTime(syncState.lastSyncAt)}
                  </div>
                </div>
                <div className="p-4 bg-cream-50 rounded-xl border border-brown-100">
                  <div className="flex items-center gap-2 mb-1 text-brown-500 text-xs">
                    <WifiOff className="w-3.5 h-3.5" />
                    待同步变更
                  </div>
                  <div className="text-brown-800 font-medium">
                    {syncState.pendingChanges} 项
                    {syncState.pendingChanges > 0 && (
                      <button
                        onClick={handleSyncNow}
                        disabled={isSyncAction}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-700 font-normal inline-flex items-center gap-0.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncAction ? 'animate-spin' : ''}`} />
                        立即同步
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {syncState.lastSyncError && (
                <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">同步出错</div>
                    <div className="text-xs mt-0.5">{syncState.lastSyncError}</div>
                  </div>
                </div>
              )}

              {syncError && (
                <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{syncError}</span>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-cream-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <RefreshCw className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brown-700">自动同步</p>
                      <p className="text-xs text-brown-500">数据变更后自动上传到云端</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncState.autoSyncEnabled}
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brown-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                <button
                  onClick={handleSyncNow}
                  disabled={isSyncAction}
                  className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-200 rounded-lg group-hover:bg-indigo-300 transition-colors">
                      <CloudUpload className="w-4 h-4 text-indigo-700" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-indigo-700">立即同步</p>
                      <p className="text-xs text-indigo-500">合并云端数据并上传变更</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-400" />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleForceUpload}
                    disabled={isSyncAction}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-50 text-sm text-blue-700 font-medium"
                  >
                    <CloudUpload className="w-4 h-4" />
                    强制上传
                  </button>
                  <button
                    onClick={handleForceDownload}
                    disabled={isSyncAction}
                    className="flex items-center justify-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors disabled:opacity-50 text-sm text-purple-700 font-medium"
                  >
                    <CloudDownload className="w-4 h-4" />
                    强制下载
                  </button>
                </div>
              </div>

              <div className="p-4 bg-brown-50 rounded-xl border border-brown-100">
                <p className="text-xs text-brown-500 leading-relaxed">
                  💡 <span className="font-medium text-brown-600">温馨提示：</span>
                  同步功能可防止本地数据丢失，并支持多设备访问。
                  建议配合数据导出功能，定期手动备份重要数据。
                  导入导出功能与云端同步互不冲突，可同时使用。
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brown-100 flex items-center justify-center">
                <CloudOff className="w-8 h-8 text-brown-400" />
              </div>
              <p className="text-brown-600 mb-2">登录账户后即可启用云端同步</p>
              <p className="text-sm text-brown-400 mb-4 max-w-sm mx-auto">
                支持多设备数据同步、自动备份、永不丢失
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                立即登录
              </button>
            </div>
          )}
        </div>

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
              <p className="text-sm text-brown-500">导出和导入家族数据（同步的补充手段）</p>
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
                  从 JSON 文件恢复家族数据，导入后将自动同步
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
              <span className="text-brown-800">
                {user ? '本地存储 + 云端同步' : '浏览器本地存储 (localStorage)'}
              </span>
            </div>
            <div className="p-4 bg-brown-50 rounded-xl border border-brown-100">
              <p className="text-xs text-brown-500 leading-relaxed">
                💡 温馨提示：建议同时使用云端同步与定期导出备份功能，
                双重保障珍贵家族数据的安全。
              </p>
            </div>
          </div>
        </div>
      </div>

      {pendingConflicts && pendingConflicts.length > 0 && (
        <ConflictResolverDialog
          conflicts={pendingConflicts}
          onResolve={handleResolveConflicts}
          onDismiss={dismissConflicts}
          isResolving={isSyncAction}
        />
      )}

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

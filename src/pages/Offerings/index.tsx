import { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Package,
  AlertTriangle,
  Filter,
  Search,
  PlusCircle,
  MinusCircle,
  ShoppingCart,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { OfferingItem } from '@/types';

const CATEGORIES = ['全部', '食品', '酒水', '祭祀用品', '其他'];

const categoryColors: Record<string, { bg: string; text: string }> = {
  '食品': { bg: 'bg-green-100', text: 'text-green-700' },
  '酒水': { bg: 'bg-amber-100', text: 'text-amber-700' },
  '祭祀用品': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '其他': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function OfferingsPage() {
  const { offerings, settings, addOffering, updateOffering, deleteOffering } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showForm, setShowForm] = useState(false);
  const [editingOffering, setEditingOffering] = useState<OfferingItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showStockAdjust, setShowStockAdjust] = useState<OfferingItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  
  const [formData, setFormData] = useState<Partial<OfferingItem>>({
    name: '',
    category: '食品',
    quantity: 0,
    unit: '份',
    description: '',
    lowStockThreshold: settings.lowStockThreshold,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLowStock = (offering: OfferingItem) => {
    const threshold = offering.lowStockThreshold ?? settings.lowStockThreshold;
    return offering.quantity <= threshold;
  };

  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || offering.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = offerings.filter(isLowStock).length;

  const handleAdd = () => {
    setEditingOffering(null);
    setFormData({
      name: '',
      category: '食品',
      quantity: 0,
      unit: '份',
      description: '',
      lowStockThreshold: settings.lowStockThreshold,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (offering: OfferingItem) => {
    setEditingOffering(offering);
    setFormData({ ...offering });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = '请输入供品名称';
    }
    if (!formData.category) {
      newErrors.category = '请选择分类';
    }
    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = '请输入有效的库存数量';
    }
    if (!formData.unit?.trim()) {
      newErrors.unit = '请输入计量单位';
    }
    if (formData.lowStockThreshold !== undefined && formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = '预警阈值不能为负数';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingOffering) {
      updateOffering(editingOffering.id, formData);
    } else {
      addOffering(formData as Omit<OfferingItem, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteOffering(id);
    setShowDeleteConfirm(null);
  };

  const handleAdjustStock = () => {
    if (!showStockAdjust) return;
    
    const newQuantity = adjustType === 'add' 
      ? showStockAdjust.quantity + adjustQuantity
      : Math.max(0, showStockAdjust.quantity - adjustQuantity);
    
    updateOffering(showStockAdjust.id, { 
      quantity: newQuantity,
      lastPurchasedDate: adjustType === 'add' ? new Date().toISOString().split('T')[0] : undefined,
    });
    setShowStockAdjust(null);
    setAdjustQuantity(1);
  };

  const openStockAdjust = (offering: OfferingItem) => {
    setShowStockAdjust(offering);
    setAdjustQuantity(1);
    setAdjustType('add');
  };

  const getStockStatus = (offering: OfferingItem) => {
    if (offering.quantity === 0) {
      return { label: '缺货', color: 'text-red-600 bg-red-100' };
    }
    if (isLowStock(offering)) {
      return { label: '库存不足', color: 'text-amber-600 bg-amber-100' };
    }
    return { label: '库存充足', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">供品库存管理</h1>
          <p className="text-brown-500 text-sm mt-1">
            管理祭祀供品的库存，避免重复购买或临场短缺
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          添加供品
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">库存提醒</p>
            <p className="text-sm text-amber-700 mt-0.5">
              有 {lowStockCount} 种供品库存不足，请及时采购补充。
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索供品名称..."
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brown-400" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-brown-600 text-white'
                      : 'bg-brown-100 text-brown-600 hover:bg-brown-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredOfferings.length === 0 ? (
          <div className="text-center py-12 text-brown-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无供品记录</p>
            <p className="text-sm">点击上方"添加供品"按钮开始管理库存</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfferings.map((offering, index) => {
              const status = getStockStatus(offering);
              const categoryColor = categoryColors[offering.category] || categoryColors['其他'];
              return (
                <div
                  key={offering.id}
                  className={`p-5 rounded-2xl border-2 transition-all hover:shadow-soft ${
                    isLowStock(offering) 
                      ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' 
                      : 'border-brown-100 bg-gradient-to-br from-cream-50 to-white hover:border-brown-200'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColor.bg}`}>
                        <Package className={`w-6 h-6 ${categoryColor.text}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-brown-800">{offering.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor.bg} ${categoryColor.text}`}>
                          {offering.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openStockAdjust(offering)}
                        className="p-1.5 hover:bg-brown-100 rounded-lg transition-colors"
                        title="调整库存"
                      >
                        <ShoppingCart className="w-4 h-4 text-brown-500" />
                      </button>
                      <button
                        onClick={() => handleEdit(offering)}
                        className="p-1.5 hover:bg-brown-100 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4 text-brown-500" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(offering.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-brown-800 font-serif">
                        {offering.quantity}
                        <span className="text-lg font-normal text-brown-500 ml-1">{offering.unit}</span>
                      </p>
                      <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${status.color}`}>
                        {status.label}
                      </p>
                    </div>
                    <div className="text-right text-xs text-brown-500">
                      <p>预警阈值: {offering.lowStockThreshold ?? settings.lowStockThreshold} {offering.unit}</p>
                      {offering.lastPurchasedDate && (
                        <p className="mt-0.5">上次采购: {offering.lastPurchasedDate}</p>
                      )}
                    </div>
                  </div>

                  {offering.description && (
                    <p className="text-sm text-brown-500 line-clamp-2 border-t border-brown-100 pt-3">
                      {offering.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setShowStockAdjust(offering);
                        setAdjustType('add');
                        setAdjustQuantity(1);
                      }}
                      className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <PlusCircle className="w-4 h-4" />
                      入库
                    </button>
                    <button
                      onClick={() => {
                        setShowStockAdjust(offering);
                        setAdjustType('subtract');
                        setAdjustQuantity(1);
                      }}
                      className="flex-1 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <MinusCircle className="w-4 h-4" />
                      出库
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-brown-800">
                {editingOffering ? '编辑供品' : '添加供品'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-brown-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  供品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="如：水果、糕点、白酒"
                  className={`input-field ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`input-field ${errors.category ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                >
                  <option value="">请选择分类</option>
                  <option value="食品">食品</option>
                  <option value="酒水">酒水</option>
                  <option value="祭祀用品">祭祀用品</option>
                  <option value="其他">其他</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    当前库存 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className={`input-field ${errors.quantity ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    计量单位 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="份、瓶、包"
                    className={`input-field ${errors.unit ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                  />
                  {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  低库存预警阈值
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                  placeholder={`默认: ${settings.lowStockThreshold}`}
                  className={`input-field ${errors.lowStockThreshold ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                <p className="text-xs text-brown-500 mt-1">
                  当库存低于此数量时将显示预警提醒，留空使用系统默认值
                </p>
                {errors.lowStockThreshold && <p className="text-red-500 text-xs mt-1">{errors.lowStockThreshold}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  备注说明
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="供品的详细描述、规格等"
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-brown-100">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingOffering ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brown-800">确认删除</h3>
            </div>
            <p className="text-brown-600 mb-6">
              确定要删除此供品吗？删除后将无法恢复。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showStockAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-brown-800">调整库存</h3>
              <button
                onClick={() => setShowStockAdjust(null)}
                className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-brown-500" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-brown-600 mb-1">{showStockAdjust.name}</p>
              <p className="text-3xl font-bold text-brown-800 font-serif">
                当前库存: {showStockAdjust.quantity} {showStockAdjust.unit}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustType('add')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    adjustType === 'add'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <PlusCircle className="w-5 h-5" />
                  入库
                </button>
                <button
                  onClick={() => setAdjustType('subtract')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    adjustType === 'subtract'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <MinusCircle className="w-5 h-5" />
                  出库
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  数量 ({showStockAdjust.unit})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdjustQuantity(Math.max(1, adjustQuantity - 1))}
                    className="w-12 h-12 bg-brown-100 text-brown-700 rounded-xl text-xl font-bold hover:bg-brown-200 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field text-center text-xl font-bold flex-1"
                  />
                  <button
                    onClick={() => setAdjustQuantity(adjustQuantity + 1)}
                    className="w-12 h-12 bg-brown-100 text-brown-700 rounded-xl text-xl font-bold hover:bg-brown-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 bg-cream-50 rounded-xl text-center">
                <p className="text-sm text-brown-500">调整后库存</p>
                <p className="text-2xl font-bold text-brown-800 font-serif mt-1">
                  {adjustType === 'add' 
                    ? showStockAdjust.quantity + adjustQuantity
                    : Math.max(0, showStockAdjust.quantity - adjustQuantity)} {showStockAdjust.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-brown-100">
              <button
                onClick={() => setShowStockAdjust(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAdjustStock}
                className={`px-6 py-2.5 text-white rounded-lg font-medium transition-colors ${
                  adjustType === 'add' ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

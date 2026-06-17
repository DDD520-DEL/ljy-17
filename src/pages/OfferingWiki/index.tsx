import { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Lightbulb,
  ImagePlus,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  OfferingWiki,
  OFFERING_WIKI_CATEGORIES,
  OFFERING_WIKI_CATEGORY_META,
  OFFERING_OCCASIONS,
} from '@/types';

const CATEGORIES = ['全部', ...OFFERING_WIKI_CATEGORIES];

const getCategoryMeta = (category: string) => {
  return (
    OFFERING_WIKI_CATEGORY_META[category as keyof typeof OFFERING_WIKI_CATEGORY_META] || {
      label: category,
      icon: '📦',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
    }
  );
};

export default function OfferingWikiPage() {
  const { wiki, addWiki, updateWiki, deleteWiki } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [detailItem, setDetailItem] = useState<OfferingWiki | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<OfferingWiki | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newOccasion, setNewOccasion] = useState('');

  const [formData, setFormData] = useState<Partial<OfferingWiki>>({
    name: '',
    category: OFFERING_WIKI_CATEGORIES[0],
    image: '',
    meaning: '',
    occasions: [],
    description: '',
    usageNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredWiki = wiki.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.meaning.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.occasions.some((o) => o.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: OFFERING_WIKI_CATEGORIES[0],
      image: '',
      meaning: '',
      occasions: [],
      description: '',
      usageNotes: '',
    });
    setNewOccasion('');
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (item: OfferingWiki) => {
    setEditingItem(item);
    setFormData({ ...item });
    setNewOccasion('');
    setErrors({});
    setDetailItem(null);
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
    if (!formData.meaning?.trim()) {
      newErrors.meaning = '请输入文化寓意';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...formData,
      occasions: formData.occasions || [],
    };
    if (editingItem) {
      updateWiki(editingItem.id, payload);
    } else {
      addWiki(payload as Omit<OfferingWiki, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteWiki(id);
    setShowDeleteConfirm(null);
    setDetailItem(null);
  };

  const addOccasion = (occasion: string) => {
    const trimmed = occasion.trim();
    if (trimmed && !formData.occasions?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        occasions: [...(prev.occasions || []), trimmed],
      }));
    }
    setNewOccasion('');
  };

  const removeOccasion = (occasion: string) => {
    setFormData((prev) => ({
      ...prev,
      occasions: prev.occasions?.filter((o) => o !== occasion) || [],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">供品百科</h1>
          <p className="text-brown-500 text-sm mt-1">
            了解传统供品的文化寓意与使用场合，传承祭祀礼仪
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          添加百科
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索供品名称、寓意、场合..."
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-brown-400" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const meta = category !== '全部' ? getCategoryMeta(category) : null;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      selectedCategory === category
                        ? 'bg-brown-600 text-white'
                        : 'bg-brown-100 text-brown-600 hover:bg-brown-200'
                    }`}
                  >
                    {meta && <span>{meta.icon}</span>}
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredWiki.length === 0 ? (
          <div className="text-center py-12 text-brown-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无百科内容</p>
            <p className="text-sm">点击上方"添加百科"按钮录入供品知识</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWiki.map((item, index) => {
              const meta = getCategoryMeta(item.category);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border-2 border-brown-100 bg-gradient-to-br from-cream-50 to-white overflow-hidden hover:shadow-card hover:border-brown-200 transition-all cursor-pointer group"
                  onClick={() => setDetailItem(item)}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="aspect-video bg-brown-100 overflow-hidden relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlus className="w-10 h-10 text-brown-300" />
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${meta.bgColor} ${meta.color} flex items-center gap-1`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-brown-800 text-lg">{item.name}</h3>
                    <p className="text-sm text-brown-500 line-clamp-2 mt-1">{item.meaning}</p>
                    {item.occasions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.occasions.slice(0, 3).map((o) => (
                          <span
                            key={o}
                            className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full"
                          >
                            {o}
                          </span>
                        ))}
                        {item.occasions.length > 3 && (
                          <span className="text-xs px-2 py-0.5 text-brown-400">
                            +{item.occasions.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 bg-brown-100 rounded-t-2xl overflow-hidden">
              {detailItem.image ? (
                <img src={detailItem.image} alt={detailItem.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlus className="w-12 h-12 text-brown-300" />
                </div>
              )}
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-brown-800">{detailItem.name}</h3>
                  {(() => {
                    const meta = getCategoryMeta(detailItem.category);
                    return (
                      <span className={`inline-block text-xs px-2 py-0.5 mt-2 rounded-full ${meta.bgColor} ${meta.color} flex items-center gap-1 w-fit`}>
                        {meta.icon} {meta.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="p-4 bg-cream-50 rounded-xl border border-brown-100">
                <p className="text-sm font-medium text-brown-700 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  文化寓意
                </p>
                <p className="text-sm text-brown-600 leading-relaxed">{detailItem.meaning}</p>
              </div>

              {detailItem.occasions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-brown-700 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-brown-500" />
                    适用祭祀场合
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detailItem.occasions.map((o) => (
                      <span
                        key={o}
                        className="text-sm px-3 py-1 bg-gold-100 text-gold-700 rounded-full"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detailItem.description && (
                <div>
                  <p className="text-sm font-medium text-brown-700 mb-2">说明</p>
                  <p className="text-sm text-brown-600 leading-relaxed">{detailItem.description}</p>
                </div>
              )}

              {detailItem.usageNotes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm font-medium text-amber-700 flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    使用须知
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed">{detailItem.usageNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brown-100">
                <button
                  onClick={() => handleEdit(detailItem)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(detailItem.id)}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-brown-800">
                {editingItem ? '编辑百科' : '添加百科'}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="如：三牲、五果、香烛"
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className={`input-field ${errors.category ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                >
                  {OFFERING_WIKI_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {getCategoryMeta(c).icon} {c}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  图片链接
                </label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="输入图片网址（可选）"
                  className="input-field"
                />
                {formData.image && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-brown-100">
                    <img src={formData.image} alt="预览" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  文化寓意 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.meaning || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meaning: e.target.value }))}
                  rows={3}
                  placeholder="阐述该供品的文化寓意、象征意义"
                  className={`input-field resize-none ${errors.meaning ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                {errors.meaning && <p className="text-red-500 text-xs mt-1">{errors.meaning}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  适用祭祀场合
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {OFFERING_OCCASIONS.map((o) => {
                    const selected = formData.occasions?.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => (selected ? removeOccasion(o) : addOccasion(o))}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? 'bg-gold-500 text-white'
                            : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}
                        {o}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOccasion(newOccasion);
                      }
                    }}
                    placeholder="自定义场合，回车添加"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => addOccasion(newOccasion)}
                    className="btn-secondary px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.occasions && formData.occasions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.occasions
                      .filter((o) => !OFFERING_OCCASIONS.includes(o as (typeof OFFERING_OCCASIONS)[number]))
                      .map((o) => (
                        <span
                          key={o}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-100 text-gold-700 rounded-full text-xs"
                        >
                          {o}
                          <button
                            type="button"
                            onClick={() => removeOccasion(o)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  说明
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="供品的组成、形制等说明（可选）"
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  使用须知
                </label>
                <textarea
                  value={formData.usageNotes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, usageNotes: e.target.value }))}
                  rows={2}
                  placeholder="摆放方式、禁忌、注意事项等（可选）"
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-brown-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingItem ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除此百科条目吗？删除后将无法恢复。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary">
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
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Check,
  Sparkles,
  Calendar,
  Lightbulb,
  ImagePlus,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  OfferingWiki,
  OFFERING_WIKI_CATEGORIES,
  OFFERING_WIKI_CATEGORY_META,
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

interface OfferingWikiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
  selectedOfferings?: string[];
}

export default function OfferingWikiPicker({
  open,
  onClose,
  onSelect,
  selectedOfferings = [],
}: OfferingWikiPickerProps) {
  const { wiki } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [detailItem, setDetailItem] = useState<OfferingWiki | null>(null);

  const filteredWiki = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return wiki.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.meaning.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.occasions.some((o) => o.toLowerCase().includes(term));
      const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [wiki, searchTerm, selectedCategory]);

  const handlePick = (item: OfferingWiki) => {
    onSelect(item.name);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-brown-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brown-800">供品百科参考</h3>
              <p className="text-xs text-brown-500">了解供品寓意，选择合适的祭品</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-brown-500" />
          </button>
        </div>

        <div className="p-4 border-b border-brown-100">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索供品名称、寓意、场合..."
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((category) => {
              const meta = category !== '全部' ? getCategoryMeta(category) : null;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
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

        <div className="flex-1 overflow-y-auto p-4">
          {filteredWiki.length === 0 ? (
            <div className="text-center py-12 text-brown-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无匹配的百科内容</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredWiki.map((item) => {
                const meta = getCategoryMeta(item.category);
                const isSelected = selectedOfferings.includes(item.name);
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border-2 overflow-hidden transition-all flex flex-col ${
                      isSelected
                        ? 'border-gold-400 bg-gold-50'
                        : 'border-brown-100 bg-white hover:border-brown-300 hover:shadow-soft'
                    }`}
                  >
                    <div className="flex gap-3 p-3 flex-1">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-brown-100 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImagePlus className="w-6 h-6 text-brown-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-brown-800 text-sm truncate">{item.name}</h4>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${meta.bgColor} ${meta.color}`}
                          >
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-brown-500 line-clamp-2 mt-1">{item.meaning}</p>
                        {item.occasions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.occasions.slice(0, 2).map((o) => (
                              <span
                                key={o}
                                className="text-xs px-1.5 py-0.5 bg-gold-100 text-gold-700 rounded-full"
                              >
                                {o}
                              </span>
                            ))}
                            {item.occasions.length > 2 && (
                              <span className="text-xs text-brown-400">
                                +{item.occasions.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 pb-3">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="flex-1 text-xs text-brown-600 hover:text-brown-800 bg-cream-100 hover:bg-cream-200 rounded-lg py-1.5 transition-colors"
                      >
                        查看详情
                      </button>
                      <button
                        onClick={() => handlePick(item)}
                        className={`flex-1 text-xs rounded-lg py-1.5 font-medium transition-colors flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gold-500 text-white hover:bg-gold-600'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            已添加
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            添加供品
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brown-100 flex items-center justify-between">
          <p className="text-xs text-brown-400">
            共 {filteredWiki.length} 条记录
          </p>
          <button onClick={onClose} className="btn-secondary">
            完成
          </button>
        </div>
      </div>

      {detailItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-40 bg-brown-100 rounded-t-2xl overflow-hidden">
              {detailItem.image ? (
                <img
                  src={detailItem.image}
                  alt={detailItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlus className="w-10 h-10 text-brown-300" />
                </div>
              )}
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-brown-800">{detailItem.name}</h3>
                {(() => {
                  const meta = getCategoryMeta(detailItem.category);
                  return (
                    <span
                      className={`inline-block text-xs px-2 py-0.5 mt-2 rounded-full ${meta.bgColor} ${meta.color} flex items-center gap-1 w-fit`}
                    >
                      {meta.icon} {meta.label}
                    </span>
                  );
                })()}
              </div>

              <div className="p-3 bg-cream-50 rounded-xl border border-brown-100">
                <p className="text-sm font-medium text-brown-700 flex items-center gap-2 mb-1">
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
                  <p className="text-sm font-medium text-brown-700 mb-1">说明</p>
                  <p className="text-sm text-brown-600 leading-relaxed">{detailItem.description}</p>
                </div>
              )}

              {detailItem.usageNotes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm font-medium text-amber-700 flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    使用须知
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed">{detailItem.usageNotes}</p>
                </div>
              )}

              <button
                onClick={() => {
                  handlePick(detailItem);
                  setDetailItem(null);
                }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加此供品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

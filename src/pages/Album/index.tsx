import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Filter, ChevronDown, X, ZoomIn, Flame, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { AlbumPhoto } from '@/types';
import { formatDate } from '@/utils/dateUtils';

type FilterType = 'all' | 'ancestor' | 'ritual';

export default function Album() {
  const { ancestors, rituals } = useAppStore();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedAncestorId, setSelectedAncestorId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allPhotos = useMemo<AlbumPhoto[]>(() => {
    const photos: AlbumPhoto[] = [];

    ancestors.forEach((ancestor) => {
      (ancestor.photos || []).forEach((url) => {
        photos.push({
          url,
          sourceType: 'ancestor',
          sourceId: ancestor.id,
          sourceName: ancestor.name,
          date: ancestor.createdAt,
          description: `${ancestor.name} - ${ancestor.relationship}`,
        });
      });
    });

    rituals.forEach((ritual) => {
      const ancestorName = ritual.ancestorName || ancestors.find((a) => a.id === ritual.ancestorId)?.name || '';
      (ritual.photos || []).forEach((url) => {
        photos.push({
          url,
          sourceType: 'ritual',
          sourceId: ritual.id,
          sourceName: ancestorName,
          date: ritual.date,
          description: `${ancestorName} 祭祀 - ${ritual.location}`,
        });
      });
    });

    return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ancestors, rituals]);

  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((photo) => {
      if (filterType === 'ancestor' && photo.sourceType !== 'ancestor') return false;
      if (filterType === 'ritual' && photo.sourceType !== 'ritual') return false;
      if (selectedAncestorId) {
        if (photo.sourceType === 'ancestor' && photo.sourceId !== selectedAncestorId) return false;
        if (photo.sourceType === 'ritual') {
          const ritual = rituals.find((r) => r.id === photo.sourceId);
          if (ritual && ritual.ancestorId !== selectedAncestorId) return false;
        }
      }
      return true;
    });
  }, [allPhotos, filterType, selectedAncestorId, rituals]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, AlbumPhoto[]> = {};
    filteredPhotos.forEach((photo) => {
      const d = new Date(photo.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(photo);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredPhotos]);

  const totalPhotos = allPhotos.length;
  const ancestorPhotoCount = allPhotos.filter((p) => p.sourceType === 'ancestor').length;
  const ritualPhotoCount = allPhotos.filter((p) => p.sourceType === 'ritual').length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">家族相册</h1>
          <p className="text-brown-500 text-sm mt-1">
            共 {totalPhotos} 张照片，记录家族珍贵记忆
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary inline-flex items-center gap-2 ${showFilters ? 'bg-brown-100 border-brown-400' : ''}`}
          >
            <Filter className="w-4 h-4" />
            筛选
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card mb-6 animate-fade-in">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-3">照片类型</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setFilterType('all'); setSelectedAncestorId(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-brown-600 text-white shadow-soft'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  全部 ({totalPhotos})
                </button>
                <button
                  onClick={() => { setFilterType('ancestor'); setSelectedAncestorId(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
                    filterType === 'ancestor'
                      ? 'bg-brown-600 text-white shadow-soft'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  先人照片 ({ancestorPhotoCount})
                </button>
                <button
                  onClick={() => { setFilterType('ritual'); setSelectedAncestorId(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
                    filterType === 'ritual'
                      ? 'bg-brown-600 text-white shadow-soft'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  祭祀现场 ({ritualPhotoCount})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-700 mb-3">按先人筛选</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedAncestorId(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAncestorId === null
                      ? 'bg-gold-500 text-white shadow-soft'
                      : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                  }`}
                >
                  全部先人
                </button>
                {ancestors.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAncestorId(a.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedAncestorId === a.id
                        ? 'bg-gold-500 text-white shadow-soft'
                        : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredPhotos.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto bg-cream-100 rounded-full flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-brown-400" />
          </div>
          <h3 className="font-serif text-xl text-brown-800 mb-2">暂无照片</h3>
          <p className="text-brown-500 mb-6">为先人或祭祀记录添加照片，开始记录家族影像</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/ancestors" className="btn-secondary inline-flex items-center gap-2">
              <User className="w-4 h-4" />
              管理先人
            </Link>
            <Link to="/rituals" className="btn-primary inline-flex items-center gap-2">
              <Flame className="w-4 h-4" />
              祭祀记录
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByMonth.map(([monthKey, photos]) => {
            const [year, month] = monthKey.split('-');
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            return (
              <div key={monthKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-gold-500 shadow-glow" />
                  <h2 className="font-serif text-lg font-semibold text-brown-800">
                    {year}年{monthNames[parseInt(month) - 1]}
                  </h2>
                  <span className="text-sm text-brown-400">({photos.length} 张)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo.sourceId}-${index}`}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-brown-100 hover:border-gold-300 transition-all duration-300 hover:shadow-card cursor-pointer bg-cream-50"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium truncate">{photo.sourceName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              photo.sourceType === 'ancestor'
                                ? 'bg-blue-500/80 text-white'
                                : 'bg-gold-500/80 text-white'
                            }`}>
                              {photo.sourceType === 'ancestor' ? '先人' : '祭祀'}
                            </span>
                            <span className="text-white/80 text-xs">{formatDate(photo.date, 'short')}</span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.description}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedPhoto.sourceType === 'ancestor'
                    ? 'bg-blue-500/80 text-white'
                    : 'bg-gold-500/80 text-white'
                }`}>
                  {selectedPhoto.sourceType === 'ancestor' ? '先人照片' : '祭祀现场'}
                </span>
                <span className="text-white/90 font-medium">{selectedPhoto.sourceName}</span>
                <span className="text-white/60 text-sm">{formatDate(selectedPhoto.date)}</span>
              </div>
              {selectedPhoto.description && (
                <p className="text-white/70 text-sm mt-2">{selectedPhoto.description}</p>
              )}
              <div className="mt-3">
                <Link
                  to={selectedPhoto.sourceType === 'ancestor'
                    ? `/ancestors/${selectedPhoto.sourceId}/edit`
                    : `/rituals/${selectedPhoto.sourceId}/edit`
                  }
                  className="text-sm text-gold-400 hover:text-gold-300 underline"
                  onClick={() => setSelectedPhoto(null)}
                >
                  查看原始记录 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  MapPin,
  Search,
  ImagePlus,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MemorialLocation } from '@/types';

export default function LocationsPage() {
  const { locations, ancestors, addLocation, updateLocation, deleteLocation } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MemorialLocation | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<MemorialLocation>>({
    name: '',
    address: '',
    ancestorIds: [],
    photos: [],
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getAncestorNames = (ancestorIds: string[]) => {
    return ancestorIds
      .map(id => ancestors.find(a => a.id === id)?.name)
      .filter(Boolean)
      .join('、');
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      ancestorIds: [],
      photos: [],
      notes: '',
    });
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (location: MemorialLocation) => {
    setEditingLocation(location);
    setFormData({ ...location });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = '请输入地点名称';
    }
    if (!formData.address?.trim()) {
      newErrors.address = '请输入详细地址';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingLocation) {
      updateLocation(editingLocation.id, formData);
    } else {
      addLocation(formData as Omit<MemorialLocation, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteLocation(id);
    setShowDeleteConfirm(null);
  };

  const toggleAncestor = (ancestorId: string) => {
    setFormData(prev => {
      const ids = prev.ancestorIds || [];
      if (ids.includes(ancestorId)) {
        return { ...prev, ancestorIds: ids.filter(id => id !== ancestorId) };
      } else {
        return { ...prev, ancestorIds: [...ids, ancestorId] };
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...(prev.photos || []), result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">祭祀地点管理</h1>
          <p className="text-brown-500 text-sm mt-1">
            管理陵园墓区、乡村祖坟、家中祠堂等祭祀地点信息
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          添加地点
        </button>
      </div>

      <div className="card">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索地点名称、地址..."
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-12 text-brown-400">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">暂无祭祀地点</p>
            <p className="text-sm">点击上方"添加地点"按钮开始管理祭祀地点</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location, index) => {
              const ancestorNames = getAncestorNames(location.ancestorIds || []);
              const coverPhoto = location.photos?.[0];
              return (
                <div
                  key={location.id}
                  className="group rounded-2xl border-2 border-brown-100 bg-gradient-to-br from-cream-50 to-white hover:border-brown-200 transition-all hover:shadow-soft overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {coverPhoto ? (
                    <div className="relative h-40 bg-brown-100">
                      <img
                        src={coverPhoto}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(location)}
                          className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-md"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4 text-brown-600" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(location.id)}
                          className="p-1.5 bg-white/90 hover:bg-red-50 rounded-lg transition-colors shadow-md"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-40 bg-gradient-to-br from-brown-100 to-brown-200 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-brown-400" />
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(location)}
                          className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-md"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4 text-brown-600" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(location.id)}
                          className="p-1.5 bg-white/90 hover:bg-red-50 rounded-lg transition-colors shadow-md"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-brown-800 text-lg mb-1">{location.name}</h3>
                    <p className="text-sm text-brown-500 flex items-start gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{location.address}</span>
                    </p>

                    {location.ancestorIds && location.ancestorIds.length > 0 && (
                      <div className="flex items-start gap-1.5 mb-3">
                        <Users className="w-3.5 h-3.5 mt-0.5 text-brown-400 flex-shrink-0" />
                        <span className="text-xs text-brown-500 line-clamp-1">
                          {ancestorNames}
                        </span>
                      </div>
                    )}

                    {location.notes && (
                      <p className="text-xs text-brown-400 line-clamp-2 border-t border-brown-100 pt-3 mt-3">
                        {location.notes}
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(location)}
                        className="flex-1 py-2 bg-brown-50 text-brown-700 rounded-lg text-sm font-medium hover:bg-brown-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(location.id)}
                        className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-brown-800">
                {editingLocation ? '编辑祭祀地点' : '添加祭祀地点'}
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
                  地点名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="如：南山陵园、李家祖坟、家中祠堂"
                  className={`input-field ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  详细地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="请输入详细地址"
                  className={`input-field ${errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  关联先人
                </label>
                {ancestors.length === 0 ? (
                  <p className="text-sm text-brown-400">暂无先人信息，请先添加先人</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-cream-50 rounded-xl border border-brown-100">
                    {ancestors.map(ancestor => {
                      const isSelected = formData.ancestorIds?.includes(ancestor.id);
                      return (
                        <label
                          key={ancestor.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-gold-100' : 'hover:bg-brown-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAncestor(ancestor.id)}
                            className="w-4 h-4 text-gold-600 rounded focus:ring-gold-500"
                          />
                          <div>
                            <p className="font-medium text-brown-800 text-sm">{ancestor.name}</p>
                            <p className="text-xs text-brown-500">{ancestor.relationship}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  环境照片
                </label>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="grid grid-cols-4 gap-2">
                  {(formData.photos || []).map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-brown-100 group"
                    >
                      <img
                        src={photo}
                        alt={`照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-brown-200 flex flex-col items-center justify-center gap-1 text-brown-400 hover:text-brown-600 hover:border-brown-400 transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs">添加</span>
                  </button>
                </div>
                <p className="text-xs text-brown-500 mt-2">可上传多张地点环境照片</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  备注
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="记录地点的特殊说明、注意事项等..."
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
                {editingLocation ? '保存' : '添加'}
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
              确定要删除此祭祀地点吗？删除后将无法恢复。
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
    </div>
  );
}

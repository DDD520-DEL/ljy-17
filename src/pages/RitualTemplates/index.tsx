import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileText, MapPin, Users, Gift, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RitualTemplate } from '@/types';

export default function RitualTemplatesList() {
  const { templates, deleteTemplate, ancestors } = useAppStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteTemplate(id)) {
      setDeleteConfirm(null);
    }
  };

  const getAncestorName = (ancestorId?: string) => {
    if (!ancestorId) return '-';
    const ancestor = ancestors.find(a => a.id === ancestorId);
    return ancestor?.name || '-';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">祭祀模板管理</h1>
        <Link to="/ritual-templates/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建模板
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-16 h-16 text-brown-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-brown-700 mb-2">暂无祭祀模板</h3>
          <p className="text-brown-500 mb-6">创建常用的祭祀配置模板，记录祭祀时快速填充</p>
          <Link to="/ritual-templates/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            创建第一个模板
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: RitualTemplate) => (
            <div key={template.id} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-semibold text-brown-800 mb-1">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-brown-500 line-clamp-2">{template.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/ritual-templates/${template.id}/edit`}
                    className="p-2 hover:bg-brown-100 rounded-lg transition-colors"
                    title="编辑模板"
                  >
                    <Edit2 className="w-4 h-4 text-brown-500" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(template.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除模板"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-brown-600">
                  <MapPin className="w-4 h-4 text-brown-400 flex-shrink-0" />
                  <span className="truncate">{template.location}</span>
                </div>
                <div className="flex items-center gap-2 text-brown-600">
                  <Users className="w-4 h-4 text-brown-400 flex-shrink-0" />
                  <span>{template.participants.length} 人参与</span>
                </div>
                <div className="flex items-center gap-2 text-brown-600">
                  <Gift className="w-4 h-4 text-brown-400 flex-shrink-0" />
                  <span>{template.offerings.length} 样供品</span>
                </div>
                <div className="flex items-center gap-2 text-brown-600">
                  <FileText className="w-4 h-4 text-brown-400 flex-shrink-0" />
                  <span>适用：{getAncestorName(template.ancestorId)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-brown-100">
                <Link
                  to={`/rituals/new?templateId=${template.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-cream-100 hover:bg-cream-200 text-brown-700 rounded-lg transition-colors text-sm font-medium"
                >
                  使用此模板记录
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {template.participants.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-brown-500 mb-2">参与人员：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.participants.slice(0, 5).map((p, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-cream-100 text-brown-600 rounded text-xs"
                      >
                        {p}
                      </span>
                    ))}
                    {template.participants.length > 5 && (
                      <span className="inline-block px-2 py-0.5 text-brown-400 text-xs">
                        +{template.participants.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {template.offerings.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-brown-500 mb-2">供品：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.offerings.slice(0, 5).map((o, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-gold-100 text-gold-700 rounded text-xs"
                      >
                        {o}
                      </span>
                    ))}
                    {template.offerings.length > 5 && (
                      <span className="inline-block px-2 py-0.5 text-brown-400 text-xs">
                        +{template.offerings.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-fade-in">
            <h3 className="font-serif text-xl font-bold text-brown-800 mb-3">确认删除</h3>
            <p className="text-brown-600 mb-6">
              确定要删除这个祭祀模板吗？此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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

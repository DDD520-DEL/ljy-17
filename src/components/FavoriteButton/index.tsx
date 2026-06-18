import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FavoriteEntityType } from '@/types';

interface FavoriteButtonProps {
  entityType: FavoriteEntityType;
  entityId: string;
  name: string;
  subtitle?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FavoriteButton({
  entityType,
  entityId,
  name,
  subtitle,
  size = 'sm',
  className = '',
}: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const [favorited, setFavorited] = useState(() => isFavorite(entityType, entityId));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(entityType, entityId, name, subtitle);
    setFavorited(newState);
  };

  const sizeClasses = size === 'sm' ? 'w-4 h-4 p-1.5' : 'w-5 h-5 p-2';

  return (
    <button
      onClick={handleClick}
      title={favorited ? '取消收藏' : '添加收藏'}
      className={`rounded-lg transition-all ${sizeClasses} ${
        favorited
          ? 'text-gold-500 hover:bg-gold-50'
          : 'text-brown-300 hover:text-gold-500 hover:bg-gold-50'
      } ${className}`}
    >
      <Star className={`w-full h-full ${favorited ? 'fill-gold-500' : ''}`} />
    </button>
  );
}

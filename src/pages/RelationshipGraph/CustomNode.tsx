import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { User, Heart } from 'lucide-react';
import type { GraphNodeData } from '@/types';

function CustomNode({ data, selected }: NodeProps<GraphNodeData>) {
  const { label, type, gender, avatar, isAlive, branchColor, relationship } = data;

  const getGenderGradient = () => {
    if (type === 'ancestor') {
      return 'from-brown-400 to-brown-600';
    }
    return gender === 'male'
      ? 'from-blue-400 to-blue-600'
      : 'from-pink-400 to-pink-600';
  };

  const getTypeBadge = () => {
    if (type === 'ancestor') {
      return (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-brown-600 text-white text-xs rounded-full shadow-soft">
          先人
        </span>
      );
    }
    return (
      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full shadow-soft">
        家属
      </span>
    );
  };

  return (
    <div
      className={`relative px-4 py-3 rounded-xl shadow-lg transition-all duration-200 cursor-pointer ${
        selected
          ? 'ring-4 ring-gold-400 ring-opacity-70 scale-105'
          : 'hover:shadow-xl hover:scale-102'
      } ${!isAlive ? 'opacity-90' : ''}`}
      style={{
        background: '#FFFDFA',
        border: branchColor ? `3px solid ${branchColor}` : '3px solid #8B7355',
        minWidth: '140px',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-brown-400 !border-2 !border-white"
      />
      
      {getTypeBadge()}

      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-soft bg-gradient-to-br ${getGenderGradient()} ${
            !isAlive ? 'opacity-60 grayscale' : ''
          }`}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={label}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`font-semibold text-sm ${
                isAlive ? 'text-brown-800' : 'text-brown-400'
              }`}
            >
              {label}
            </span>
            {!isAlive && <Heart className="w-3.5 h-3.5 text-brown-400" />}
          </div>
          {relationship && (
            <p className="text-xs text-brown-500 mt-0.5">{relationship}</p>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-brown-400 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(CustomNode);

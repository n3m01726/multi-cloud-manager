import { X } from 'lucide-react';

const TAG_COLORS = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
};

export default function TagBadge({ 
  tag, 
  color = 'blue', 
  onRemove = null, 
  size = 'md',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const colorClass = TAG_COLORS[color] || TAG_COLORS.blue;

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label={`Retirer le tag ${tag}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
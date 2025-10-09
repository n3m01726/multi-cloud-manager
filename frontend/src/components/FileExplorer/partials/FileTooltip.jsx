import { useState, useEffect, useRef } from 'react';
import { Calendar, HardDrive, Tag as TagIcon, Star, FileText } from 'lucide-react';

export default function FileTooltip({ file, metadata, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMouseEnter = (e) => {
    timeoutRef.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      let y = rect.top - tooltipHeight - 10;
      
      // Ajustements si hors écran
      if (x < 10) x = 10;
      if (x + tooltipWidth > window.innerWidth - 10) {
        x = window.innerWidth - tooltipWidth - 10;
      }
      if (y < 10) {
        y = rect.bottom + 10;
      }
      
      setPosition({ x, y });
      setIsVisible(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const displayName = metadata?.customName || file.name;
  const tags = metadata?.tags || [];
  const starred = metadata?.starred || false;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[100] animate-in fade-in duration-200"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-2xl p-4 w-80 border border-gray-700">
            {/* Header */}
            <div className="flex items-start gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-tight break-words">
                  {displayName}
                </h4>
                {metadata?.customName && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    Original: {file.name}
                  </p>
                )}
              </div>
              {starred && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              )}
            </div>

            {/* Description */}
            {metadata?.description && (
              <div className="mb-3 pb-3 border-b border-gray-700">
                <p className="text-xs text-gray-300 line-clamp-2">
                  {metadata.description}
                </p>
              </div>
            )}

            {/* Métadonnées */}
            <div className="space-y-2 text-xs">
              {/* Taille */}
              {file.size && (
                <div className="flex items-center gap-2 text-gray-300">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span>{formatFileSize(file.size)}</span>
                </div>
              )}

              {/* Date de modification */}
              {file.modifiedTime && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(file.modifiedTime)}</span>
                </div>
              )}

              {/* Provider */}
              <div className="flex items-center gap-2 text-gray-300">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                <span className="capitalize">{file.provider?.replace('_', ' ')}</span>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-start gap-2 text-gray-300">
                  <TagIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, idx) => {
                      const color = metadata?.tagColors?.[tag] || 'blue';
                      const colorClasses = {
                        blue: 'bg-blue-500/20 text-blue-300',
                        green: 'bg-green-500/20 text-green-300',
                        red: 'bg-red-500/20 text-red-300',
                        yellow: 'bg-yellow-500/20 text-yellow-300',
                        purple: 'bg-purple-500/20 text-purple-300',
                        pink: 'bg-pink-500/20 text-pink-300',
                        indigo: 'bg-indigo-500/20 text-indigo-300',
                        gray: 'bg-gray-500/20 text-gray-300'
                      };
                      
                      return (
                        <span 
                          key={idx} 
                          className={`px-2 py-0.5 rounded text-xs ${colorClasses[color] || colorClasses.blue}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Flèche */}
            <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px]"
              style={{ 
                width: 0, 
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid rgb(17 24 39 / 0.95)'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
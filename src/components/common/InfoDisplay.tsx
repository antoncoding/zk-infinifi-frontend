import React from 'react';
import { DisplayInfo } from '@/types/modal';

type InfoDisplayProps = {
  info: DisplayInfo;
  className?: string;
}

const INFO_ICONS: Record<string, string> = {
  progress: '⚡',
  tip: '💡',
  technical: '🔧',
  warning: '⚠️'
};

const INFO_STYLES: Record<string, string> = {
  default: 'border-gray-200 bg-muted/30',
  warning: 'border-yellow-200 bg-yellow-50',
  info: 'border-blue-200 bg-blue-50',
  success: 'border-green-200 bg-green-50'
};

export function InfoDisplay({ info, className = '' }: InfoDisplayProps) {
  const icon = INFO_ICONS[info.type] || INFO_ICONS.progress;
  const variant = info.variant ?? 'default';
  const styleClasses = INFO_STYLES[variant] ?? INFO_STYLES.default;

  return (
    <div className={`rounded border p-4 ${styleClasses} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-lg flex-shrink-0 mt-0.5">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {info.title && (
            <h4 className="text-sm font-medium text-secondary-foreground mb-1">
              {info.title}
            </h4>
          )}
          
          <div className="text-sm text-muted-foreground">
            {info.content}
          </div>

          {info.items && info.items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {info.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-xs mt-1 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoDisplay;
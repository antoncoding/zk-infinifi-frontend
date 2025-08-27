import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { ModalError } from '@/types/modal';

type ErrorDisplayProps = {
  error: ModalError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ERROR_ICONS: Record<string, string> = {
  network: '📡',
  proof: '🛡️',
  wallet: '👛',
  timeout: '⏱️',
  sdk: '⚙️',
  unknown: '⚠️'
};

const ERROR_COLORS: Record<string, string> = {
  network: 'border-yellow-200 bg-yellow-50',
  proof: 'border-red-200 bg-red-50',
  wallet: 'border-orange-200 bg-orange-50',
  timeout: 'border-yellow-200 bg-yellow-50',
  sdk: 'border-red-200 bg-red-50',
  unknown: 'border-red-200 bg-red-50'
};

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const icon = ERROR_ICONS[error.type] || ERROR_ICONS.unknown;
  const colorClasses = ERROR_COLORS[error.type] ?? ERROR_COLORS.unknown;

  return (
    <div className={`rounded-lg border p-4 ${colorClasses}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-secondary-foreground mb-1">
                {error.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {error.message}
              </p>
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-secondary-foreground p-1 -m-1 rounded"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            )}
          </div>

          {error.details && (
            <div className="mt-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-muted-foreground hover:text-secondary-foreground underline"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
              
              {showDetails && (
                <div className="mt-2 p-3 rounded bg-muted/50 text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                  {error.details}
                </div>
              )}
            </div>
          )}

          {error.recoverable && onRetry && (
            <div className="mt-3 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
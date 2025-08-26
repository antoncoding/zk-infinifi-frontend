"use client";
import React from 'react';
import { useState } from 'react';

type KeyBadgeProps = {
  value: string;
  className?: string;
};

export function KeyBadge({ value, className = '' }: KeyBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const abbreviate = (full: string) => {
    const prefix = 'macipk.';
    const startLen = 10;
    const endLen = 8;
    if (!full.startsWith(prefix)) {
      // Generic fallback: show first/last with ellipsis
      const head = full.slice(0, startLen);
      const tail = full.slice(-endLen);
      return `${head}.... ${tail}`;
    }
    const rest = full.slice(prefix.length);
    const head = rest.slice(0, startLen);
    const tail = rest.slice(-endLen);
    return `${prefix}${head}.... ${tail}`;
  };

  const display = expanded ? value : abbreviate(value);

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className={`inline-block max-w-full rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground border ${expanded ? 'whitespace-normal break-all' : 'whitespace-nowrap'} cursor-pointer text-left ${className}`}
      title={expanded ? 'Click to collapse' : 'Click to expand'}
    >
      {display}
    </button>
  );
}

export default KeyBadge;



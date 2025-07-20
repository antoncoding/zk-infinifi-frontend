import React from 'react';
import { Button } from './common/Button';

export const ButtonTest: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Button Hover Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="cta">CTA</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="interactive">Interactive</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Secondary Button (Docs Button)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" size="lg">Documentation</Button>
          <Button variant="secondary" size="md">Secondary</Button>
          <Button variant="secondary" size="sm">Small</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">With Different Backgrounds</h2>
        <div className="space-y-4">
          <div className="p-4 bg-background border border-border rounded">
            <Button variant="secondary">Secondary on Background</Button>
          </div>
          <div className="p-4 bg-card border border-border rounded">
            <Button variant="secondary">Secondary on Card</Button>
          </div>
          <div className="p-4 bg-muted border border-border rounded">
            <Button variant="secondary">Secondary on Muted</Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
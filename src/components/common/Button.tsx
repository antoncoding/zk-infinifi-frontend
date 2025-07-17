import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends Omit<React.ComponentProps<typeof ShadcnButton>, 'variant' | 'size'> {
  variant?: 'default' | 'cta' | 'secondary' | 'interactive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'base';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'default', size = 'md', radius = 'base', fullWidth, isLoading, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-surface hover:bg-surface/80 transition-all duration-200 ease-in-out',
      cta: 'bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-200 ease-in-out',
      secondary: 'bg-hovered text-foreground',
      interactive: 'bg-hovered text-foreground hover:bg-primary hover:text-white transition-all duration-200 ease-in-out',
      ghost: 'bg-transparent hover:bg-surface/5 transition-all duration-200 ease-in-out',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs min-w-[64px] h-8',
      md: 'px-4 py-2 text-sm min-w-[80px] h-10',
      lg: 'px-6 py-3 text-md min-w-[96px] h-12',
    };

    const radiusClasses = {
      none: 'rounded-none',
      base: 'rounded-sm',
    };

    const fullWidthClass = fullWidth ? 'w-full' : '';
    const loadingClass = isLoading ? 'cursor-not-allowed gap-2 [&>span]:opacity-0 [&>svg]:opacity-0 [&>*:not(.loading-spinner)]:opacity-0' : '';

    return (
      <ShadcnButton
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          radiusClasses[radius],
          fullWidthClass,
          loadingClass,
          className
        )}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="loading-spinner h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </ShadcnButton>
    );
  }
);

Button.displayName = 'Button';

export type ButtonProps = CustomButtonProps;

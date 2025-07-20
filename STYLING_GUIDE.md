# Styling Guide

This guide covers how to use shadcn/ui components effectively in this project, following best practices for consistent styling and theming.

## 🎯 Overview

This project uses **shadcn/ui** as the primary component library, which provides:
- Pre-built, accessible components
- Automatic theme integration
- Consistent design patterns
- TypeScript support

## 📦 Available shadcn/ui Components

### Core Components
- `Button` - Various button variants and sizes
- `Switch` - Toggle switches
- `DropdownMenu` - Dropdown menus and navigation
- `Tooltip` - Tooltips and hints

### Component Location
All shadcn/ui components are located in `src/components/ui/`:
```
src/components/ui/
├── button.tsx
├── switch.tsx
├── dropdown-menu.tsx
└── tooltip.tsx
```

## 🎨 Using shadcn/ui Components

### Basic Usage

```tsx
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Switch />
    </div>
  );
}
```

### Button Variants

shadcn/ui buttons come with built-in variants that automatically use your theme:

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Component Sizing

Most components support different sizes:

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## 🎨 Custom Components with shadcn/ui

### Creating Custom Components

When building custom components, leverage shadcn/ui's design system:

```tsx
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CustomCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CustomCard({ title, children, className }: CustomCardProps) {
  return (
    <div className={cn(
      "bg-card text-card-foreground p-6 rounded-lg border border-border",
      className
    )}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
      <Button variant="default" className="mt-4">
        Action
      </Button>
    </div>
  );
}
```

### Using the `cn` Utility

The `cn` utility helps combine Tailwind classes conditionally:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className // Allows parent to override
)}>
```

## 🎨 Styling Best Practices

### 1. Use Theme Colors

✅ **Good** - Use theme-aware colors:
```tsx
<div className="bg-card text-card-foreground p-4 rounded-lg">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

❌ **Avoid** - Hardcoded colors:
```tsx
<div className="bg-white text-black p-4 rounded-lg">
  <p className="text-gray-600">Secondary text</p>
</div>
```

### 2. Follow Color Hierarchy

Use the proper background hierarchy:
```tsx
<div className="bg-background">     {/* Main background */}
  <div className="bg-card">         {/* Elevated content */}
    <div className="bg-muted">      {/* Subtle background */}
      Content
    </div>
  </div>
</div>
```

### 3. Use Semantic Spacing

Leverage Tailwind's spacing scale:
```tsx
<div className="p-4">     {/* 16px padding */}
<div className="p-6">     {/* 24px padding */}
<div className="space-y-4"> {/* 16px gap between children */}
<div className="gap-4">   {/* 16px gap in flex/grid */}
```

### 4. Consistent Border Radius

Use the theme's border radius:
```tsx
<div className="rounded-sm">   {/* Small radius */}
<div className="rounded-md">   {/* Medium radius */}
<div className="rounded-lg">   {/* Large radius */}
```

## 🎨 Component Composition

### Building Complex Components

Combine shadcn/ui components to build complex interfaces:

```tsx
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ActionBar() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actions</h3>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Secondary
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" size="sm">
            Primary Action
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Responsive Design

### Mobile-First Approach

Use Tailwind's responsive prefixes:

```tsx
<div className="
  p-4                    /* Mobile: 16px padding */
  md:p-6                 /* Medium+: 24px padding */
  lg:p-8                 /* Large+: 32px padding */
">
  <div className="
    grid grid-cols-1     /* Mobile: 1 column */
    md:grid-cols-2       /* Medium+: 2 columns */
    lg:grid-cols-3       /* Large+: 3 columns */
    gap-4
  ">
    {/* Content */}
  </div>
</div>
```

### Responsive Components

```tsx
export function ResponsiveCard() {
  return (
    <div className="
      bg-card 
      p-4 md:p-6 lg:p-8
      rounded-lg 
      border border-border
    ">
      <h3 className="
        text-lg md:text-xl lg:text-2xl 
        font-semibold 
        mb-2 md:mb-4
      ">
        Title
      </h3>
      <p className="text-muted-foreground">
        Content
      </p>
    </div>
  );
}
```

## 🎨 Dark Mode Support

### Automatic Dark Mode

shadcn/ui components automatically support dark mode:

```tsx
// No additional work needed - components adapt automatically
<Button variant="default">Works in light and dark</Button>
<div className="bg-card text-card-foreground">Adapts automatically</div>
```

### Manual Dark Mode Classes

For custom styling, use dark mode variants:

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-black dark:text-white
  border-gray-200 dark:border-gray-700
">
  Custom dark mode styling
</div>
```

## 🎨 Adding New shadcn/ui Components

### Installation

1. Use the shadcn/ui CLI:
```bash
npx shadcn@latest add [component-name]
```

2. Components will be added to `src/components/ui/`

### Example: Adding a Card Component

```bash
npx shadcn@latest add card
```

This creates `src/components/ui/card.tsx`:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content</p>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Customizing shadcn/ui Components

### Overriding Styles

Use the `className` prop to override styles:

```tsx
<Button 
  variant="default" 
  className="bg-red-500 hover:bg-red-600"
>
  Custom styled button
</Button>
```

### Extending Components

Create wrapper components for common patterns:

```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function IconButton({ 
  icon, 
  children, 
  variant = "default",
  size = "default",
  className 
}: IconButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size}
      className={cn("flex items-center gap-2", className)}
    >
      {icon}
      {children}
    </Button>
  );
}
```

## 🎨 Common Patterns

### Form Layouts

```tsx
export function FormSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Label</label>
        <input className="
          flex h-10 w-full rounded-md border border-input 
          bg-background px-3 py-2 text-sm 
          ring-offset-background file:border-0 
          file:bg-transparent file:text-sm file:font-medium 
          placeholder:text-muted-foreground 
          focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50
        " />
      </div>
    </div>
  );
}
```

### Page Layouts

```tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Testing Your Styles

### Visual Testing

Use the test components to verify your styling:

```tsx
import { ThemeTest } from './components/ThemeTest';
import { ColorHierarchyTest } from './components/ColorHierarchyTest';

// Add to any page to test
<ThemeTest />
<ColorHierarchyTest />
```

### Browser Testing

1. Test in both light and dark modes
2. Test on different screen sizes
3. Test with different content lengths
4. Verify accessibility (focus states, contrast)

## 🎨 Troubleshooting

### Component Not Styling Correctly

1. Check if you're importing from the correct path
2. Verify the component is using theme variables
3. Ensure Tailwind is processing your classes

### Theme Not Applying

1. Check that CSS variables are defined in `app/global.css`
2. Verify the component is using `hsl(var(--variable))` format
3. Ensure the dark mode class is applied to the HTML element

### Responsive Issues

1. Use mobile-first approach
2. Test on actual devices
3. Check Tailwind's responsive breakpoints

## 📚 Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Theme System Guide](./THEME_GUIDE.md) - Complete theming documentation
- [Next.js Documentation](https://nextjs.org/docs)

## 🎯 Key Takeaways

1. **Use shadcn/ui components** as the foundation
2. **Follow the theme system** for consistent colors
3. **Use semantic class names** instead of hardcoded colors
4. **Test in both light and dark modes**
5. **Build responsive layouts** from mobile up
6. **Leverage the `cn` utility** for conditional styling
7. **Compose components** rather than building from scratch 
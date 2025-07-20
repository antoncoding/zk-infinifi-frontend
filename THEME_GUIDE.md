# Theme System Guide

This guide covers the **unified theming system** that powers both Tailwind CSS and shadcn/ui components in this project.

## 🎯 Overview

This project uses a **single source of truth** for colors through CSS custom properties (CSS variables). All components automatically inherit these colors, ensuring consistency across your entire application.

## 📚 Related Documentation

- **[Styling Guide](./STYLING_GUIDE.md)** - How to use shadcn/ui components and styling best practices
- **[shadcn/ui Documentation](https://ui.shadcn.com/)** - Official component documentation

## 🎨 Color System

### Color Hierarchy

The system follows a **hierarchical approach** where each color serves a specific purpose:

#### Light Mode
```
Background: Pure white (100% lightness)
    ↓
Card: Very light grey (98% lightness) - for elevation
    ↓
Muted: Even lighter grey (96.9% lightness) - for subtle backgrounds
    ↓
Secondary: Light grey (95.9% lightness) - for secondary elements
```

#### Dark Mode
```
Background: Very dark (3.9% lightness)
    ↓
Card: Slightly lighter dark (6% lightness) - for elevation
    ↓
Muted: Even lighter (18% lightness) - for subtle backgrounds
    ↓
Secondary: Medium dark (15.9% lightness) - for secondary elements
```

### Available Colors

#### Core Colors
- `--background` / `--foreground` - Main background and text colors
- `--card` / `--card-foreground` - Card backgrounds and text (slightly elevated)
- `--popover` / `--popover-foreground` - Popover/dropdown backgrounds and text
- `--primary` / `--primary-foreground` - Primary brand colors (Dark Blue)
- `--secondary` / `--secondary-foreground` - Secondary brand colors
- `--muted` / `--muted-foreground` - Muted/subtle colors (lightest background)
- `--accent` / `--accent-foreground` - Accent colors
- `--destructive` / `--destructive-foreground` - Error/danger colors

#### Utility Colors
- `--border` - Border colors
- `--input` - Input field colors
- `--ring` - Focus ring colors
- `--radius` - Border radius values

#### Chart Colors
- `--chart-1` through `--chart-5` - Chart color palette

## 🛠️ Usage

### 1. Direct Tailwind Classes

Use Tailwind classes directly with the theme system:

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground p-4 rounded-lg">
    Card content with subtle elevation
  </div>
  <div className="bg-muted text-muted-foreground p-4 rounded-lg">
    Muted background for subtle sections
  </div>
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
    Primary Button
  </button>
</div>
```

### 2. Custom Utility Classes

We provide custom utility classes that map to theme colors:

```tsx
<div className="bg-main">        {/* Maps to bg-background */}
<div className="bg-hovered">     {/* Maps to bg-muted */}
<div className="text-primary">   {/* Maps to text-foreground */}
<div className="text-secondary"> {/* Maps to text-muted-foreground */}
```

### 3. shadcn/ui Components

**✅ All shadcn/ui components automatically inherit the theme system!**

```tsx
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

// These automatically use your theme colors
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Switch />
```

For detailed shadcn/ui usage, see the **[Styling Guide](./STYLING_GUIDE.md)**.

## 🌙 Dark Mode

Dark mode is automatically handled by the CSS variables. Simply add the `dark` class to your root element:

```tsx
// In your layout or theme provider
<html className="dark">
  {/* Your app */}
</html>
```

## 🎯 Best Practices

### 1. Use Proper Color Hierarchy
✅ **Good** - Follow the hierarchy:
```tsx
<div className="bg-background">     {/* Main background */}
  <div className="bg-card">         {/* Elevated content */}
    <div className="bg-muted">      {/* Subtle background */}
      Content
    </div>
  </div>
</div>
```

❌ **Avoid** - Don't mix hierarchy:
```tsx
<div className="bg-muted">         {/* Too light for main background */}
  <div className="bg-background">  {/* Should be card or muted */}
    Content
  </div>
</div>
```

### 2. Always Use Theme Colors
❌ Don't use hardcoded colors:
```tsx
<div className="bg-white text-black"> {/* Hardcoded */}
```

✅ Use theme colors:
```tsx
<div className="bg-background text-foreground"> {/* Theme-aware */}
```

### 3. Leverage Color Pairs
Always use the appropriate foreground color with background colors:

```tsx
<div className="bg-primary text-primary-foreground">
<div className="bg-card text-card-foreground">
<div className="bg-muted text-muted-foreground">
```

## 🔧 Customization

### Quick Theme Changes

To change the primary color, edit `app/global.css`:

```css
:root {
  --primary: 220 100% 25%; /* Change this to your brand color */
}
```

### Adding New Colors

1. Add the CSS variable to `app/global.css` in the `:root` and `.dark` sections:

```css
:root {
  --your-color: 220 13% 91%;
  --your-color-foreground: 220 9% 46%;
}

.dark {
  --your-color: 215 27% 16%;
  --your-color-foreground: 215 20% 65%;
}
```

2. Add the Tailwind configuration in `tailwind.config.ts`:

```ts
colors: {
  'your-color': {
    DEFAULT: 'hsl(var(--your-color))',
    foreground: 'hsl(var(--your-color-foreground))'
  }
}
```

### HSL Color Values

Colors use HSL format for easy manipulation:
- `220` = Hue (Blue)
- `100%` = Saturation (Full saturation for vibrant color)
- `25%` = Lightness (Dark for light mode)

### Color Examples

```css
/* Try different colors: */
--primary: 220 100% 25%; /* Dark blue (current) */
--primary: 120 100% 25%; /* Dark green */
--primary: 0 100% 50%;   /* Red */
--primary: 280 100% 50%; /* Purple */
```

## 🧪 Testing

### Test Components

Use these components to verify your theme:

```tsx
import { ThemeTest } from './src/components/ThemeTest';
import { ColorHierarchyTest } from './src/components/ColorHierarchyTest';

// Add to any page to test
<ThemeTest />
<ColorHierarchyTest />
```

### What to Test

1. **Color Hierarchy** - Verify cards have proper elevation
2. **Dark Mode** - Test color switching
3. **Component Integration** - Ensure shadcn/ui components work
4. **Custom Colors** - Test any new colors you add

## 📁 File Structure

- `app/global.css` - CSS variables and theme definitions
- `tailwind.config.ts` - Tailwind configuration with theme colors
- `src/components/ThemeTest.tsx` - Theme testing component
- `src/components/ColorHierarchyTest.tsx` - Color hierarchy testing

## 🚀 Benefits

1. **Consistency** - All components use the same color system
2. **Dark Mode** - Automatic dark mode support
3. **Maintainability** - Single source of truth for colors
4. **Flexibility** - Easy to customize and extend
5. **Performance** - CSS variables are efficient
6. **Accessibility** - Proper contrast ratios built-in
7. **shadcn/ui Integration** - Seamless compatibility
8. **Visual Hierarchy** - Proper elevation and depth

## 🔍 Troubleshooting

### Colors Not Visible
If `bg-card` or other colors don't seem to have an effect:
1. Check that the CSS variables are properly defined in `global.css`
2. Verify the color hierarchy is being followed
3. Use the `ColorHierarchyTest` component to see the differences

### Theme Not Applying
If a component isn't responding to theme changes:
1. Check if it's using hardcoded colors instead of theme variables
2. Verify the component is using the correct CSS variable names
3. Ensure the component is importing from the correct path

### Dark Mode Issues
1. Verify the `dark` class is applied to the HTML element
2. Check that dark mode variables are defined in `global.css`
3. Test with the `ColorHierarchyTest` component

## 📚 Next Steps

- **[Styling Guide](./STYLING_GUIDE.md)** - Learn how to use shadcn/ui components effectively
- **[shadcn/ui Documentation](https://ui.shadcn.com/)** - Explore available components
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - Master utility classes 
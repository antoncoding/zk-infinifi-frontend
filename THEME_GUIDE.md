# Theme Guide

Quick guide to customize colors and fonts in your project.

## 🎨 Change Colors

### Primary Color
Edit `app/global.css` to change your main brand color:

```css
:root {
  --primary: 220 100% 25%; /* Change this to your brand color */
}
```

**Color Examples:**
```css
--primary: 220 100% 25%; /* Dark blue (current) */
--primary: 120 100% 25%; /* Dark green */
--primary: 0 100% 50%;   /* Red */
--primary: 280 100% 50%; /* Purple */
```

### All Available Colors
```css
:root {
  --background: 0 0% 98%;           /* Main background */
  --foreground: 240 10% 3.9%;       /* Main text */
  --card: 0 0% 100%;                /* Card background */
  --card-foreground: 240 10% 3.9%;  /* Card text */
  --primary: 240 10% 3.9%;          /* Primary brand color */
  --primary-foreground: 0 0% 100%;  /* Text on primary */
  --secondary: 240 4.8% 95.9%;      /* Secondary background */
  --muted: 240 4.8% 96.9%;          /* Subtle background */
  --accent: 240 4.8% 95.9%;         /* Accent background */
  --border: 240 5.9% 90%;           /* Border color */
  --input: 240 5.9% 90%;            /* Input field color */
}
```

## 🔤 Change Fonts

### 1. Add Font Files
Place your font files in `src/fonts/YourFont/`:
```
src/fonts/YourFont/
├── YourFont-Regular.ttf
├── YourFont-Bold.ttf
└── YourFont-Light.ttf
```

### 2. Configure in `app/fonts.ts`
```ts
import localFont from 'next/font/local';

export const yourFont = localFont({
  src: [
    {
      path: '../src/fonts/YourFont/YourFont-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../src/fonts/YourFont/YourFont-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-yourfont',
});
```

### 3. Update `tailwind.config.ts`
```ts
fontFamily: {
  yourfont: ['var(--font-yourfont)'],
  // ... existing fonts
}
```

### 4. Use in CSS
```css
:root {
  --font-family: var(--font-yourfont);
}
```

## 🌙 Dark Mode

Dark mode is automatic. Add the `dark` class to your HTML element:

```tsx
<html className="dark">
  {/* Your app */}
</html>
```

## 🧪 Test Your Changes

Use these components to verify your theme:

```tsx
import { ThemeTest } from './src/components/ThemeTest';
import { ColorHierarchyTest } from './src/components/ColorHierarchyTest';

// Add to any page to test
<ThemeTest />
<ColorHierarchyTest />
```

## 📁 Files to Edit

- `app/global.css` - Color variables
- `app/fonts.ts` - Font configuration  
- `tailwind.config.ts` - Font family mapping
- `src/fonts/` - Font files directory 
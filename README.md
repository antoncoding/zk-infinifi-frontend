# Web3 Next.js Template

A modern web3 template built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 **Tailwind CSS & shadcn/ui** - Unified theming system
- 🔗 Wagmi for Ethereum interactions
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 🔧 TypeScript

## Quick Start

1. Clone and install:
```bash
git clone https://github.com/your-username/web3-next-template.git
cd web3-next-template
pnpm install
```

2. Set up environment:
```bash
cp .env.example .env.local
# Add your NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

3. Run development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🎨 Theming & Styling

This project uses a **unified theming system** that works seamlessly with both Tailwind CSS and shadcn/ui components.

### Quick Theme Customization

To change the primary color, edit `app/global.css`:

```css
:root {
  --primary: 220 100% 25%; /* Change this to your brand color */
}
```

### 📚 Documentation

- **[Theme System Guide](./THEME_GUIDE.md)** - Complete theming documentation
- **[Styling Guide](./STYLING_GUIDE.md)** - shadcn/ui component usage and best practices

### 🧪 Test Components

Use these components to verify your theme:

```tsx
import { ThemeTest } from './src/components/ThemeTest';
import { ColorHierarchyTest } from './src/components/ColorHierarchyTest';

// Add to any page to test
<ThemeTest />
<ColorHierarchyTest />
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   └── global.css         # Theme variables & global styles
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── common/        # Custom components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   └── store/             # Wagmi config
├── THEME_GUIDE.md         # Complete theming documentation
├── STYLING_GUIDE.md       # shadcn/ui styling guide
└── tailwind.config.ts     # Tailwind + shadcn/ui config
```

## License

MIT License
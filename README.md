# Web3 Next.js Template

A modern web3 template built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

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

## 🎨 Customization

- **[Theme Guide](./THEME_GUIDE.md)** - Change colors and fonts
- **[Styling Guide](./STYLING_GUIDE.md)** - Use components and styling patterns

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS & shadcn/ui
- 🔗 Wagmi for Ethereum interactions
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 🔧 TypeScript

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
├── THEME_GUIDE.md         # Theme customization
├── STYLING_GUIDE.md       # Component usage guide
└── tailwind.config.ts     # Tailwind + shadcn/ui config
```

## License

MIT License
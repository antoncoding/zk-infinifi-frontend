# Web3 Next.js Template

A modern web3 template built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS & shadcn/ui
- 🔗 Wagmi for Ethereum interactions
- 🌙 Dark/Light mode
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

## Project Structure

```
├── app/                    # Next.js App Router pages
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilities
│   └── store/             # Wagmi config
└── public/                # Static assets
```

## License

MIT License
# Web3 Next.js Template

A modern web3 template built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Quick Start

1. **Clone and install:**
```bash
git clone https://github.com/your-username/web3-next-template.git
cd web3-next-template
pnpm install
```

2. **Set up environment:**
```bash
cp .env.example .env.local
```
Add your environment variables:
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com  # Optional: for production
```

3. **Create Open Graph image (optional):**
```bash
# Add a 1200x630 pixel image for social media cards
public/og-image.png
```

4. **Run development server:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS & shadcn/ui
- 🔗 Wagmi for Ethereum interactions
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 🔧 TypeScript

## Customization

- **[Theme Guide](./THEME_GUIDE.md)** - Change colors and fonts
- **[Styling Guide](./STYLING_GUIDE.md)** - Use components and styling patterns

## License

MIT License
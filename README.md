# Web3 Next.js Template

A modern, production-ready web3 template built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for styling
- 🧩 **shadcn/ui** components
- 🔗 **Wagmi** for Ethereum interactions
- 🌙 **Dark/Light mode** support
- 📱 **Responsive design**
- 🔧 **TypeScript** for type safety
- ⚛️ **React Query** for data fetching
- 🎯 **ESLint** and **Prettier** for code quality

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/web3-next-template.git
cd web3-next-template
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your environment variables:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
├── app/                    # Next.js App Router pages
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── store/             # Wagmi configuration
│   └── contexts/          # React contexts
├── public/                # Static assets
└── tailwind.config.ts     # Tailwind configuration
```

## Key Components

### Web3 Integration

- **Wagmi**: Ethereum wallet connection and interactions
- **Viem**: Low-level Ethereum interface
- **WalletConnect**: Multi-wallet support

### UI Components

- **shadcn/ui**: Pre-built, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI primitives

### State Management

- **React Query**: Server state management
- **React Context**: Client state management
- **Local Storage**: Persistent settings

## Customization

### Adding New Chains

Update the supported networks in `src/utils/networks.ts`:

```typescript
export enum SupportedNetworks {
  Mainnet = 1,
  Base = 8453,
  Polygon = 137,
  Arbitrum = 42161,
  Optimism = 10,
}
```

### Adding New Components

1. Install shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

2. Create custom components in `src/components/`

### Styling

- Use Tailwind CSS classes for styling
- Customize the design system in `tailwind.config.ts`
- Add custom CSS variables in `app/global.css`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The template works with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📖 [Documentation](https://github.com/your-username/web3-next-template)
- 💬 [Discord](https://discord.gg/your-discord)
- 🐛 [Issues](https://github.com/your-username/web3-next-template/issues)

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Wagmi](https://wagmi.sh/)
- [Viem](https://viem.sh/)
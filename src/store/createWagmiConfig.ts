import { http, createConfig } from 'wagmi';
import { mainnet, base, polygon } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) throw new Error('Project ID is not defined');

const metadata = {
  name: 'Web3 Next.js Template',
  description: 'A modern web3 template built with Next.js, TypeScript, and Tailwind CSS',
  url: 'https://github.com/your-username/web3-next-template',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const config = createConfig({
  chains: [mainnet, base, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId, metadata, showQrModal: false }),
  ],
});

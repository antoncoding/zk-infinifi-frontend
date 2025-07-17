import { generateMetadata } from '@/utils/generateMetadata';
import HomePage from './home/HomePage';

export const metadata = generateMetadata({
  title: 'Web3 Next.js Template',
  description: 'A modern web3 template built with Next.js, TypeScript, and Tailwind CSS',
});

export default function Page() {
  return <HomePage />;
}

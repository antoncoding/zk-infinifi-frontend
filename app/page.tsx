import { generateMetadata } from '@/utils/generateMetadata';
import VotingDashboard from './voting/VotingDashboard';

export const metadata = generateMetadata({
  title: 'ZK Core Voting',
  description: 'Anonymous voting powered by Semaphore zero-knowledge proofs',
});

export default function Page() {
  return <VotingDashboard />;
}

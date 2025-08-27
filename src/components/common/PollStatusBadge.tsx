import { Badge } from './Badge';

export type PollStatus = 'not-initialized' | 'upcoming' | 'active' | 'ended' | 'finalized';

type PollStatusBadgeProps = {
  status: PollStatus;
  className?: string;
};

const statusConfig = {
  'not-initialized': {
    label: 'Not Initialized',
    variant: 'default' as const,
  },
  'upcoming': {
    label: 'Upcoming',
    variant: 'primary' as const,
  },
  'active': {
    label: 'Active',
    variant: 'success' as const,
  },
  'ended': {
    label: 'Ended',
    variant: 'danger' as const,
  },
  'finalized': {
    label: 'Finalized',
    variant: 'default' as const,
  },
};

export function PollStatusBadge({ status, className }: PollStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
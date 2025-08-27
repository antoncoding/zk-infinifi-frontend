import moment from 'moment';
import { PollStatus } from '@/components/common/PollStatusBadge';

export function formatPollTime(timestamp: bigint): string {
  if (timestamp === BigInt(0)) return 'Not set';
  
  const date = moment.unix(Number(timestamp));
  const now = moment();
  const duration = moment.duration(Math.abs(date.diff(now)));
  
  const years = Math.floor(duration.asYears());
  const months = Math.floor(duration.asMonths() % 12);
  const days = Math.floor(duration.asDays() % 30);
  const hours = Math.floor(duration.asHours() % 24);
  const minutes = Math.floor(duration.asMinutes() % 60);
  
  let timeString = '';
  
  if (years > 0) {
    timeString = `${years}y`;
    if (months > 0) timeString += ` ${months}mo`;
  } else if (months > 0) {
    timeString = `${months}mo`;
    if (days > 0) timeString += ` ${days}d`;
  } else if (days > 0) {
    timeString = `${days}d`;
    if (hours > 0) timeString += ` ${hours}h`;
  } else if (hours > 0) {
    timeString = `${hours}h`;
    if (minutes > 0) timeString += ` ${minutes}m`;
  } else if (minutes > 0) {
    timeString = `${minutes}m`;
  } else {
    timeString = 'Just now';
  }
  
  return timeString;
}

export function formatPollStatus(startDate: bigint, endDate: bigint): string {
  const now = moment();
  const start = moment.unix(Number(startDate));
  const end = moment.unix(Number(endDate));
  
  if (startDate === BigInt(0) && endDate === BigInt(0)) return 'Not scheduled';
  
  if (startDate > BigInt(0) && now.isBefore(start)) {
    return `Starts in ${formatPollTime(startDate)}`;
  }
  
  if (endDate > BigInt(0) && now.isAfter(end)) {
    return `Ended ${formatPollTime(endDate)} ago`;
  }
  
  if (startDate > BigInt(0) && now.isAfter(start)) {
    if (endDate === BigInt(0)) return 'Active';
    if (now.isBefore(end)) return `Ends in ${formatPollTime(endDate)}`;
  }
  
  return 'Active';
}

export function getPollStatus(initialized: boolean, startDate: bigint, endDate: bigint, stateMerged: boolean): PollStatus {
  if (!initialized) return 'not-initialized';
  if (stateMerged) return 'finalized';
  
  const now = moment();
  const start = moment.unix(Number(startDate));
  const end = moment.unix(Number(endDate));
  
  if (startDate > BigInt(0) && now.isBefore(start)) {
    return 'upcoming';
  }
  
  if (endDate > BigInt(0) && now.isAfter(end)) {
    return 'ended';
  }
  
  return 'active';
}
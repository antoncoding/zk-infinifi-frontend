import { clsx, type ClassValue } from "clsx"
import moment from "moment"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEpochNow() {
  return Math.floor(((moment.now() / 1000) - (86400 * 3)) / (86400 * 7))
}
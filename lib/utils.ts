import { format, formatDistanceToNow } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// Jordanian timezone
export const JORDAN_TIMEZONE = 'Asia/Amman';

// Date formatting utilities
export function formatDateJordan(date: Date): string {
  const jordanTime = utcToZonedTime(date, JORDAN_TIMEZONE);
  return format(jordanTime, 'yyyy-MM-dd HH:mm:ss');
}

export function formatDateShort(date: Date): string {
  const jordanTime = utcToZonedTime(date, JORDAN_TIMEZONE);
  return format(jordanTime, 'MMM dd, yyyy');
}

export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getJordanTime(): Date {
  return utcToZonedTime(new Date(), JORDAN_TIMEZONE);
}

export function toUTCFromJordan(date: Date): Date {
  return zonedTimeToUtc(date, JORDAN_TIMEZONE);
}

// Order ID generation utilities
export function generateOrderId(date: Date = new Date()): string {
  const jordanTime = utcToZonedTime(date, JORDAN_TIMEZONE);
  const year = jordanTime.getFullYear().toString().slice(-2); // Last 2 digits
  const month = (jordanTime.getMonth() + 1).toString().padStart(2, '0');
  
  // This should be incremented based on existing orders for the month
  // Implementation will be completed in the order service
  const sequence = '0001'; // Placeholder
  
  return `T${year}${month}${sequence}`;
}

// Validation utilities
export function validateJordanianMobile(mobile: string): boolean {
  // Remove any spaces, dashes, or special characters
  const cleanMobile = mobile.replace(/[\s-]/g, '');
  
  // Check for Jordanian mobile formats
  // 00962xxxxxxxx or 07xxxxxxxx or 08xxxxxxxx or 09xxxxxxxx
  const mobileRegex = /^(00962[789]\d{8}|0[789]\d{8})$/;
  return mobileRegex.test(cleanMobile);
}

export function formatJordanianMobile(mobile: string): string {
  const cleanMobile = mobile.replace(/[\s-]/g, '');
  
  if (cleanMobile.startsWith('00962')) {
    return cleanMobile;
  } else if (cleanMobile.startsWith('0')) {
    return `00962${cleanMobile.slice(1)}`;
  }
  
  return mobile; // Return original if format not recognized
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'JOD'): string {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-JO').format(num);
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Array utilities
export function groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// Status utilities
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    submitted: 'Submitted',
    pending_review: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    active: 'Active',
    inactive: 'Inactive',
  };
  
  return statusTexts[status] || capitalizeFirst(status);
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
} 
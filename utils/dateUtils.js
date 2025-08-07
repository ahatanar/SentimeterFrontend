import { parseISO, format } from 'date-fns';

/**
 * Parse UTC timestamp from backend and format for display in user's local timezone
 * @param {string} utcTimestamp - UTC timestamp from backend (e.g., "2025-08-05T14:30:00+00:00")
 * @param {string} formatStr - date-fns format string (default: 'PPP' for "August 5th, 2025")
 * @returns {string} Formatted date string in user's local timezone
 */
export const formatDateLocal = (utcTimestamp, formatStr = 'PPP') => {
  if (!utcTimestamp) return '';
  return format(parseISO(utcTimestamp), formatStr);
};

/**
 * Parse UTC timestamp and format as date and time in user's local timezone
 * @param {string} utcTimestamp - UTC timestamp from backend
 * @returns {string} Formatted date and time string (e.g., "August 5th, 2025 at 2:30 PM")
 */
export const formatDateTimeLocal = (utcTimestamp) => {
  if (!utcTimestamp) return '';
  return format(parseISO(utcTimestamp), 'PPP p');
};

/**
 * Parse UTC timestamp and get just the year
 * @param {string} utcTimestamp - UTC timestamp from backend
 * @returns {number} Year in user's local timezone
 */
export const getYearLocal = (utcTimestamp) => {
  if (!utcTimestamp) return new Date().getFullYear();
  return parseISO(utcTimestamp).getFullYear();
};

/**
 * Format date for display without year (e.g., "August 5th")
 * @param {string} utcTimestamp - UTC timestamp from backend
 * @returns {string} Formatted date string without year
 */
export const formatDateLocalNoYear = (utcTimestamp) => {
  if (!utcTimestamp) return '';
  return format(parseISO(utcTimestamp), 'MMMM do');
};
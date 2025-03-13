// Copyright (c) 2025 AwayFlayer // License: MIT

/**
 * Formats seconds into HH:MM:SS format
 * @param {Number|null} seconds - Total seconds to format
 * @returns {String} Formatted time string
 */
export const formatTime = seconds => {
  if (seconds == null) return '';
  
  return [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    Math.floor(seconds % 60)
  ]
    .map(num => num.toString().padStart(2, '0'))
    .join(':');
};
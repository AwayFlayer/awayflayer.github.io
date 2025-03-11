/*
 * File Name: fileUtils.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Create and download a file
 * @param {Object|string} data - The data to save
 * @param {string} filename - The filename with extension
 * @param {string} type - The MIME type
 */
export const downloadFile = (data, filename, type = 'application/json') => {
  try {
    // Convert data to string if it's an object
    const content = typeof data === 'string' 
      ? data 
      : JSON.stringify(data, null, 2);
    
    // Create blob with appropriate type
    const blob = new Blob([content], { type: `${type}; charset=utf-8` });
    
    // Create download URL
    const url = URL.createObjectURL(blob);
    
    // Create invisible link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM, click, and clean up
    document.body.appendChild(link);
    link.click();
    
    // Cleanup after small delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error(`Error downloading file "${filename}":`, error);
    return false;
  }
};

/**
 * Export wheel configuration as JSON file
 * @param {Object} config - The wheel configuration
 * @returns {boolean} Success status
 */
export const exportWheelConfig = (config) => {
  return downloadFile(config, 'wheel-config.json');
};

/**
 * Export statistics as JSON file
 * @param {Object} stats - The statistics data
 * @returns {boolean} Success status
 */
export const exportStatsData = (stats) => {
  return downloadFile(stats, 'wheel-stats.json');
};
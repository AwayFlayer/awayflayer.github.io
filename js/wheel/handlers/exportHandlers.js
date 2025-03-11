/*
 * File Name: exportHandlers.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Export functionality handlers
import { exportWheelConfig, exportStatsData } from '../utils/fileUtils.js';
import { getStats } from '../utils/storageUtils.js';

/**
 * Create export handlers
 * @param {Object} appState - Application state
 * @returns {Object} Export handler functions
 */
export const createExportHandlers = (appState) => {
  /**
   * Export wheel configuration
   * @returns {boolean} Success status
   */
  const exportWheel = () => {
    const options = appState.getOptions();
    
    // Validate
    if (options.length === 0) {
      alert("The wheel cannot be empty!");
      return false;
    }
    
    // Create URL with current options
    const wheelUrl = `${location.origin}${location.pathname}?options=${encodeURIComponent(JSON.stringify(options))}`;
    
    // Prompt for name
    const configName = prompt("Enter a name for this wheel:", "Wheel Configuration")?.trim();
    if (!configName) {
      alert("The wheel name cannot be empty!");
      return false;
    }
    
    // Export configuration
    return exportWheelConfig({
      name: configName,
      link: wheelUrl,
      options: options,
      created: new Date().toISOString()
    });
  };
  
  /**
   * Export statistics data
   * @returns {boolean} Success status
   */
  const exportStats = () => {
    const stats = getStats();
    
    // Validate
    if (!stats || Object.keys(stats).length === 0) {
      alert("No statistics data to export!");
      return false;
    }
    
    // Export stats with metadata
    return exportStatsData(stats);
  };
  
  /**
   * Import wheel configuration
   * @param {File} file - The JSON file to import
   * @returns {Promise} Promise resolving to success status
   */
  const importWheel = (file) => {
    return new Promise((resolve, reject) => {
      // Validate file
      if (!file) {
        alert('Please select a .json file');
        resolve(false);
        return;
      }
      
      // Read file
      const fileReader = new FileReader();
      
      // Handle load event
      fileReader.onload = event => {
        try {
          // Parse JSON
          const config = JSON.parse(event.target.result);
          
          // Validate config
          if (!config || !config.link) {
            throw new Error("Invalid wheel configuration file");
          }
          
          // Redirect to wheel URL
          window.location.href = config.link;
          resolve(true);
        } catch (error) {
          console.error("Failed to import wheel:", error);
          alert(`Import failed: ${error.message}`);
          resolve(false);
        }
      };
      
      // Handle errors
      fileReader.onerror = () => {
        alert('Failed to read file');
        resolve(false);
      };
      
      // Start reading
      fileReader.readAsText(file);
    });
  };
  
  return {
    exportWheel,
    exportStats,
    importWheel
  };
};
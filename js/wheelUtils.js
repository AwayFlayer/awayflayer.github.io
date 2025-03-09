// Utility functions for managing sounds, URL parameters, localStorage, and exports.

/**
 * Sound management utility.
 */
export const audioManager = {
    _audioFiles: {
      spin: new Audio("assets/wheelSpin.mp3"),
      result: new Audio("assets/wheelResult.mp3")
    },
    play: soundId => audioManager._audioFiles[soundId]?.play()
  };
  
  /**
   * Gets options from the URL.
   * @returns {Array} The list of options.
   */
  export const parseOptionsFromUrl = () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      return JSON.parse(queryParams.get("options")) ?? [];
    } catch (error) {
      console.error("Error parsing options from URL:", error);
      alert("Failed to load options from the URL. Please check the URL format.");
      return [];
    }
  };
  
  /**
   * Updates the URL with the current options.
   * @param {Array} optionsList - The list of options.
   */
  export const updateUrlWithOptions = optionsList => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("options", JSON.stringify(optionsList));
    window.history.replaceState(null, "", `${window.location.pathname}?${queryParams}`);
  };
  
  /**
   * Stats management utility
   */
  export const statsManager = {
    getStats: () => JSON.parse(localStorage.getItem('stats')) ?? {},
    
    persistStats: statsData => localStorage.setItem('stats', JSON.stringify(statsData)),
  };
  
  /**
   * Saves statistics to localStorage.
   * @param {string} selectedItem - The item to be saved.
   */
  export const saveSelectionStats = selectedItem => {
    const statsData = statsManager.getStats();
    statsData[selectedItem] = (statsData[selectedItem] ?? 0) + 1;
    statsManager.persistStats(statsData);
  };
  
  /**
   * File export utilities
   */
  export const fileExporter = {
    downloadJson: (data, filename) => {
      const jsonBlob = new Blob(
        [JSON.stringify(data, null, 2)], 
        { type: 'application/json; charset=utf-8' }
      );
      const downloadUrl = URL.createObjectURL(jsonBlob);
      
      // Create temp link element, click it, then clean up
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    }
  };
  
  /**
   * Exports wheel data as a JSON file.
   * @param {Object} wheelConfig - The wheel configuration data.
   */
  export const exportWheelConfig = wheelConfig => fileExporter.downloadJson(wheelConfig, 'wheel-config.json');
  
  /**
   * Exports statistics data as a JSON file.
   * @param {Object} statsData - The statistics data.
   */
  export const exportStatsData = statsData => fileExporter.downloadJson(statsData, 'wheel-stats.json');
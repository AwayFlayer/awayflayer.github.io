// Api functions to manage timers and text in localStorage.

/**
 * Centralized error logging function
 * @param {string} message - The error message.
 * @param {Error} error - The error object.
 */
export const handleError = (message, error) => {
    console.error(message, error);
    alert(`An error occurred: ${message}. Please try again.`);
  };
  
  /**
   * Storage service for timer management
   */
  export const storageManager = {
    // Get timers from localStorage with nullish coalescing
    fetchTimers: () => JSON.parse(localStorage.getItem('timers')) ?? [],
    
    // Save timers to localStorage
    persistTimers: timerList => localStorage.setItem('timers', JSON.stringify(timerList)),
    
    // Add or update timer (1 hour = 3600 seconds)
    createOrUpdateTimer: itemName => {
      try {
        const timerList = storageManager.fetchTimers();
        const existingItem = timerList.find(item => item.text === itemName && item.time !== null);
        
        existingItem 
          ? existingItem.time += 3600
          : timerList.push({ text: itemName, time: 3600 });
        
        storageManager.persistTimers(timerList);
      } catch (error) {
        handleError("Failed to add new timer", error);
      }
    },
    
    // Add text entry if not exists
    createTextEntry: itemName => {
      try {
        const timerList = storageManager.fetchTimers();
        
        if (!timerList.some(item => item.text === itemName && item.time === null)) {
          timerList.push({ text: itemName, time: null });
        }
        
        storageManager.persistTimers(timerList);
      } catch (error) {
        handleError("Failed to add new text", error);
      }
    }
  };
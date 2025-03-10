/**
 * Storage module for handling localStorage operations
 */
export const storage = {
    /**
     * Get timers from localStorage
     * @returns {Array} Array of timer objects
     */
    getTimers: () => {
        const timersJSON = localStorage.getItem('timers');
        return timersJSON ? JSON.parse(timersJSON) : [];
    },
    
    /**
     * Save timers to localStorage
     * @param {Array} timers - Array of timer objects
     */
    saveTimers: (timers) => {
        localStorage.setItem('timers', JSON.stringify(timers));
    },
    
    /**
     * Update a single timer in localStorage
     * @param {Number} index - Index of timer to update
     * @param {Object} updatedTimer - Updated timer object
     */
    updateTimer: (index, updatedTimer) => {
        const timers = storage.getTimers();
        timers[index] = updatedTimer;
        storage.saveTimers(timers);
    },
    
    /**
     * Delete a timer from localStorage
     * @param {Number} index - Index of timer to delete
     */
    deleteTimer: (index) => {
        const timers = storage.getTimers();
        timers.splice(index, 1);
        storage.saveTimers(timers);
    },
    
    /**
     * Clear all timers from localStorage
     */
    clearAllTimers: () => {
        localStorage.setItem('timers', '[]');
    }
};
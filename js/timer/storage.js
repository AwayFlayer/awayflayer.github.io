// Copyright (c) 2025 AwayFlayer // License: MIT

/**
 * Retrieves timers from local storage
 * @returns {Array} Array of timer objects
 */
export const getTimers = () => {
    try {
      return JSON.parse(localStorage.getItem('timers')) || [];
    } catch {
      return [];
    }
};

/**
 * Saves timers to local storage
 * @param {Array} timers - Array of timer objects
 */
export const saveTimers = timers => {
    try {
      localStorage.setItem('timers', JSON.stringify(timers));
      return true;
    } catch {
      return false;
    }
};

/**
 * Updates a specific timer in local storage
 * @param {Number} index - Index of timer to update
 * @param {Object} updatedTimer - Updated timer object
 */
export const updateTimer = (index, updatedTimer) => (timers => (timers[index] = updatedTimer, saveTimers(timers)))(getTimers());

/**
 * Deletes a timer from local storage
 * @param {Number} index - Index of timer to delete
 */
export const deleteTimer = index => (timers => (timers.splice(index, 1), saveTimers(timers)))(getTimers());

/**
 * Clears all timers from local storage
 */
export const clearAllTimers = () => saveTimers([]);
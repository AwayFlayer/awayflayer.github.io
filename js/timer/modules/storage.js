/*
 * File Name: storage.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Retrieves timers from local storage
 * @returns {Array} Array of timer objects
 */
export const getTimers = () => {
    try {
        const timersJSON = localStorage.getItem('timers');
        return timersJSON ? JSON.parse(timersJSON) : [];
    } catch (error) {
        console.error('Error getting timers from storage:', error);
        return [];
    }
};

/**
 * Saves timers to local storage
 * @param {Array} timers - Array of timer objects
 */
export const saveTimers = (timers) => {
    try {
        localStorage.setItem('timers', JSON.stringify(timers));
    } catch (error) {
        console.error('Error saving timers to storage:', error);
    }
};

/**
 * Updates a specific timer in local storage
 * @param {Number} index - Index of timer to update
 * @param {Object} updatedTimer - Updated timer object
 */
export const updateTimer = (index, updatedTimer) => {
    const timers = getTimers();
    timers[index] = updatedTimer;
    saveTimers(timers);
};

/**
 * Deletes a timer from local storage
 * @param {Number} index - Index of timer to delete
 */
export const deleteTimer = (index) => {
    const timers = getTimers();
    timers.splice(index, 1);
    saveTimers(timers);
};

// Clears all timers from local storage
export const clearAllTimers = () => {
    saveTimers([]);
};
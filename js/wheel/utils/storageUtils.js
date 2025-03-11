/*
 * File Name: storageUtils.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// LocalStorage utilities
import { STORAGE_KEYS } from "../core/constants.js";

/**
 * Safely get an item from localStorage with JSON parsing
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} The parsed value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage with JSON stringification
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving "${key}" to localStorage:`, error);
    return false;
  }
};

/**
 * Get statistics from localStorage
 * @returns {Object} Statistics object
 */
export const getStats = () => getStorageItem(STORAGE_KEYS.STATS, {});

/**
 * Save statistics to localStorage
 * @param {Object} stats - The stats object to save
 * @returns {boolean} True if successful, false otherwise
 */
export const saveStats = stats => setStorageItem(STORAGE_KEYS.STATS, stats);

/**
 * Save selection statistics
 * @param {string} selectedItem - The selected item
 * @returns {boolean} True if successful, false otherwise
 */
export const saveSelectionStats = (selectedItem) => {
  const stats = getStats();
  stats[selectedItem] = (stats[selectedItem] || 0) + 1;
  return saveStats(stats);
};

/**
 * Get timers from localStorage
 * @returns {Array} Timers array
 */
export const getTimers = () => getStorageItem(STORAGE_KEYS.TIMERS, []);

/**
 * Save timers to localStorage
 * @param {Array} timers - The timers array to save
 * @returns {boolean} True if successful, false otherwise
 */
export const saveTimers = timers => setStorageItem(STORAGE_KEYS.TIMERS, timers);

/**
 * Create or update a timer for an item
 * @param {string} itemName - The item name 
 * @returns {boolean} True if successful, false otherwise
 */
export const createOrUpdateTimer = (itemName) => {
  try {
    const timerList = getTimers();
    const existingItem = timerList.find(item => item.text === itemName && item.time !== null);
    
    if (existingItem) {
      existingItem.time += 3600;
    } else {
      timerList.push({ text: itemName, time: 3600 });
    }
    
    return saveTimers(timerList);
  } catch (error) {
    console.error("Failed to add new timer:", error);
    return false;
  }
};

/**
 * Create a text entry
 * @param {string} itemName - The item name
 * @returns {boolean} True if successful, false otherwise
 */
export const createTextEntry = (itemName) => {
  try {
    const timerList = getTimers();
    
    if (!timerList.some(item => item.text === itemName && item.time === null)) {
      timerList.push({ text: itemName, time: null });
    }
    
    return saveTimers(timerList);
  } catch (error) {
    console.error("Failed to add new text:", error);
    return false;
  }
};
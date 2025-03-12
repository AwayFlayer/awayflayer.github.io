/*
 * File Name: optionsHandlers.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Option management handlers
import { updateUrlWithOptions } from '../utils/urlUtils.js';

/**
 * Create option handlers
 * @param {Object} appState - The application state
 * @param {Function} renderWheel - The wheel renderer function
 * @param {Function} renderOptionsList - The options list renderer function 
 * @returns {Object} Option handler functions
 */
export const createOptionsHandlers = (appState, renderWheel, renderOptionsList) => {
  /**
   * Add a new option
   * @param {string} optionText - The option text to add
   * @returns {boolean} Success status
   */
  const addOption = (optionText) => {
    const trimmedOption = optionText.trim().toLowerCase();
    
    // Validate input
    if (!trimmedOption) {
      alert("Option text cannot be empty!");
      return false;
    }
    
    // Check for duplicates
    if (appState.getOptions().includes(trimmedOption)) {
      alert("This option is already on the list!");
      return false;
    }
    
    // Add option and update UI
    appState.addOption(trimmedOption);
    updateUrlWithOptions(appState.getOptions());
    renderWheel(appState.getOptions());
    renderOptionsList(appState.getOptions());
    
    // Show options container
    document.getElementById("optionsListContainer").hidden = false;
    document.getElementById("importPanel").hidden = true;
    
    return true;
  };
  
  /**
   * Edit an existing option
   * @param {string} optionText - The current option text
   * @param {number} index - The option index
   * @returns {boolean} Success status
   */
  const editOption = (optionText, index) => {
    // Prompt for new text
    const newText = prompt("Edit option:", optionText)?.trim().toLowerCase();
    
    // Validate input
    if (!newText) return false;
    
    // Check for duplicates
    if (appState.getOptions().includes(newText)) {
      alert("This option is already on the list!");
      return false;
    }
    
    // Update option and UI
    appState.updateOption(index, newText);
    updateUrlWithOptions(appState.getOptions());
    renderWheel(appState.getOptions());
    renderOptionsList(appState.getOptions());
    
    return true;
  };
  
  /**
   * Delete an option
   * @param {number} index - The option index
   * @returns {boolean} Success status
   */
  const deleteOption = (index) => {
    // Delete option and update UI
    appState.deleteOption(index);
    updateUrlWithOptions(appState.getOptions());
    renderWheel(appState.getOptions());
    renderOptionsList(appState.getOptions());
    
    return true;
  };
  
  /**
   * Reset the wheel
   * @returns {boolean} Success status
   */
  const resetWheel = () => {
    // Confirm before clearing
    if (!confirm("Are you sure you want to clear all options?")) {
      return false;
    }
    
    // Clear options and state
    appState.clearOptions();
    updateUrlWithOptions([]);
    renderWheel([]);
    renderOptionsList([]);
    localStorage.removeItem("stats");
    
    // Redirect to clean state
    location.href = './wheel.html';
    return true;
  };
  
  return {
    addOption,
    editOption,
    deleteOption,
    resetWheel
  };
};
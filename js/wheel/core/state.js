/*
 * File Name: state.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Application state management
import { parseOptionsFromUrl } from "../utils/urlUtils.js";

/**
 * Create a reactive state object
 * @returns {Object} Application state with reactive props
 */
export const createAppState = () => {
  // Private state object
  const state = {
    options: parseOptionsFromUrl(),
    rotationDegrees: 0,
    integrationEnabled: true,
    isSpinning: false
  };
  
  // Public API with getters and setters
  return {
    // Options
    getOptions: () => [...state.options],
    setOptions: (newOptions) => {
      state.options = [...newOptions];
      return state.options;
    },
    clearOptions: () => {
      state.options = [];
      return state.options;
    },
    addOption: (option) => {
      state.options.push(option);
      return state.options;
    },
    updateOption: (index, newValue) => {
      if (index >= 0 && index < state.options.length) {
        state.options[index] = newValue;
      }
      return state.options;
    },
    deleteOption: (index) => {
      if (index >= 0 && index < state.options.length) {
        state.options.splice(index, 1);
      }
      return state.options;
    },
    hasOptions: () => state.options.length > 0,
    
    // Rotation
    getRotationDegrees: () => state.rotationDegrees,
    setRotationDegrees: (degrees) => {
      state.rotationDegrees = degrees;
      return state.rotationDegrees;
    },
    
    // Integration state
    isIntegrationEnabled: () => state.integrationEnabled,
    setIntegrationEnabled: (enabled) => {
      state.integrationEnabled = enabled;
      return state.integrationEnabled;
    },
    
    // Spin state
    isSpinning: () => state.isSpinning,
    setSpinning: (spinning) => {
      state.isSpinning = spinning;
      return state.isSpinning;
    }
  };
};
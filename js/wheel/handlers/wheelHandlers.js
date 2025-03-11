/*
 * File Name: wheelHandlers.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Wheel spinning and animation handlers
import { DEFAULTS, ANIMATION, AUDIO } from '../core/constants.js';
import { audioManager } from '../utils/audioUtils.js';

/**
 * Create wheel spin handler
 * @param {Object} appState - Application state
 * @param {HTMLCanvasElement} wheelCanvas - The wheel canvas element
 * @param {Function} showResultModal - Function to show result modal
 * @returns {Function} Spin wheel function
 */
export const createSpinHandler = (appState, wheelCanvas, showResultModal) => {
  /**
   * Start wheel spin animation
   */
  return () => {
    const options = appState.getOptions();
    
    // Prevent spinning if no options or already spinning
    if (options.length === 0 || appState.isSpinning()) {
      return false;
    }
    
    // Set spinning state
    appState.setSpinning(true);
    
    // Clear any previous transitions first
    wheelCanvas.style.transition = 'none';
    // Force layout recalculation
    void wheelCanvas.offsetHeight;
    
    // Calculate random spin angle
    const segmentAngle = 360 / options.length;
    const randomSegment = Math.floor(Math.random() * options.length);
    
    // Calculate spin with original logic but always use higher revolutions
    // Ensure at least 8 revolutions for consistently fast spin
    const spinRevolutions = 8 * 360; 
    const targetAngle = 360 - (randomSegment * segmentAngle + segmentAngle / 2) - 90;
    const totalSpin = spinRevolutions + targetAngle;
    
    // Set app state with total rotation
    appState.rotationDegrees = totalSpin;
    
    // Apply original animation style
    wheelCanvas.style.transition = ANIMATION.TRANSITION_TIMING;
    wheelCanvas.style.transform = `rotate(${totalSpin}deg)`;
    
    // Play spin sound
    audioManager.play(AUDIO.SPIN);
    
    // Handle result after animation
    setTimeout(() => {
      // Reset transition and normalize rotation
      wheelCanvas.style.transition = "none";
      wheelCanvas.style.transform = `rotate(${totalSpin % 360}deg)`;
      
      // Get selected option directly from random segment
      const selectedOption = options[randomSegment];
      
      // Play result sound
      audioManager.play(AUDIO.RESULT);
      
      // Show result modal
      showResultModal(selectedOption, appState.isIntegrationEnabled());
      
      // Reset spinning state
      appState.setSpinning(false);
    }, ANIMATION.SPIN_DURATION);
    
    return true;
  };
};
/*
 * File Name: modalManager.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Modal display and management
import { createOrUpdateTimer, createTextEntry } from '../utils/storageUtils.js';
import { saveSelectionStats } from '../utils/storageUtils.js';

/**
 * Create modal manager for result display
 * @param {HTMLElement} modalElement - The modal container element
 * @param {HTMLElement} contentElement - The modal content element
 * @returns {Object} Modal manager interface
 */
export const createModalManager = (modalElement, contentElement) => {
  /**
   * Show the modal with selected option
   * @param {string} selectedOption - The selected option text
   * @param {boolean} integrationEnabled - Whether integration is enabled
   */
  const showResultModal = (selectedOption, integrationEnabled) => {
    // Clear previous content
    contentElement.innerHTML = '';
    
    // Create result text
    const resultText = document.createElement('p');
    resultText.textContent = `Selected: ${selectedOption}`;
    contentElement.appendChild(resultText);
    
    // Add integration buttons if enabled
    if (integrationEnabled) {
      // Create timer button
      const timerBtn = document.createElement('button');
      timerBtn.type = 'button';
      timerBtn.className = 'custom-alert-button';
      timerBtn.textContent = 'Timer';
      timerBtn.addEventListener('click', () => {
        createOrUpdateTimer(selectedOption);
        saveSelectionStats(selectedOption);
        hideModal();
      });
      contentElement.appendChild(timerBtn);
      
      // Create text button
      const textBtn = document.createElement('button');
      textBtn.type = 'button';
      textBtn.className = 'custom-alert-button';
      textBtn.textContent = 'Text';
      textBtn.addEventListener('click', () => {
        createTextEntry(selectedOption);
        saveSelectionStats(selectedOption);
        hideModal();
      });
      contentElement.appendChild(textBtn);
    } else {
      // Close on click if integration not enabled
      document.addEventListener('click', hideModal, { once: true });
    }
    
    // Show the modal
    modalElement.hidden = false;
    modalElement.style.display = 'flex';
  };
  
  /**
   * Hide the modal
   */
  const hideModal = () => {
    modalElement.style.display = 'none';
    modalElement.hidden = true;
  };
  
  return {
    showResultModal,
    hideModal
  };
};
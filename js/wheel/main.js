/*
 * File Name: main.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Main application entry point
import { createAppState } from './core/state.js';
import { updateUrlWithOptions } from './utils/urlUtils.js';
import { createWheelRenderer, resizeCanvas } from './ui/wheelRenderer.js';
import { createOptionsListRenderer } from './ui/optionsListRenderer.js';
import { createModalManager } from './ui/modalManager.js';
import { createOptionsHandlers } from './handlers/optionsHandlers.js';
import { createSpinHandler } from './handlers/wheelHandlers.js';
import { createExportHandlers } from './handlers/exportHandlers.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize application state
  const appState = createAppState();
  
  // Get DOM elements
  const wheelCanvas = document.getElementById('wheelCanvas');
  const optionInput = document.getElementById('optionInput');
  const optionsList = document.getElementById('optionsList');
  const importPanel = document.getElementById('importPanel');
  const modal = document.getElementById('resultModal');
  const modalContent = document.getElementById('modalContent');
  
  // Resize canvas for initial display
  resizeCanvas(wheelCanvas);
  
  // Create UI renderers
  const modalManager = createModalManager(modal, modalContent);
  
  // Create wheel renderer
  const renderWheel = createWheelRenderer(wheelCanvas, importPanel);
  
  // Create options list renderer
  const renderOptionsList = createOptionsListRenderer(
    optionsList,
    (text, index) => optionsHandlers.editOption(text, index),
    (index) => optionsHandlers.deleteOption(index)
  );
  
  // Initialize handlers
  const spinHandler = createSpinHandler(
    appState, 
    wheelCanvas,
    (selectedOption, integrationEnabled) => 
      modalManager.showResultModal(selectedOption, integrationEnabled)
  );
  
  const optionsHandlers = createOptionsHandlers(
    appState,
    renderWheel,
    renderOptionsList
  );
  
  const exportHandlers = createExportHandlers(appState);
  
  // Add event listeners
  document.getElementById('addOptionBtn').addEventListener('click', () => {
    if (optionsHandlers.addOption(optionInput.value)) {
      optionInput.value = '';
    }
  });
  
  document.getElementById('startSpinBtn').addEventListener('click', spinHandler);
  
  document.getElementById('resetWheelBtn').addEventListener('click', optionsHandlers.resetWheel);
  
  document.getElementById('exportWheelBtn').addEventListener('click', exportHandlers.exportWheel);
  
  document.getElementById('exportStatsBtn').addEventListener('click', exportHandlers.exportStats);
  
  document.getElementById('importBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('jsonFileInput');
    exportHandlers.importWheel(fileInput.files[0]);
  });
  
  // Enable integration toggle
  document.getElementById('enableIntegrationToggle').addEventListener('change', (e) => {
    appState.setIntegrationEnabled(e.target.checked);
  });
  
  // Handle enter key in option input
  optionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      if (optionsHandlers.addOption(optionInput.value)) {
        optionInput.value = '';
      }
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas(wheelCanvas);
    renderWheel(appState.getOptions());
  });
  
  // Initial render
  renderWheel(appState.getOptions());
  renderOptionsList(appState.getOptions());
  
  // Set visibility based on initial state
  importPanel.hidden = appState.hasOptions();
  document.getElementById('optionsListContainer').hidden = !appState.hasOptions();
  
  // Log initialization complete
  console.log('Wheel application initialized', {
    options: appState.getOptions().length
  });
});
// Core controller for managing wheel application state and interactions.

import { storageManager } from './wheelApi.js';
import { 
  resizeCanvas, 
  createWheelRenderer,
  createElementFactories,
  createOptionsListRenderer
} from './wheelDisplay.js';
import { 
  audioManager, 
  parseOptionsFromUrl, 
  updateUrlWithOptions, 
  saveSelectionStats 
} from './wheelUtils.js';
import { 
  addOption, 
  editWheelOption, 
  deleteWheelOption, 
  resetWheel,
  initEventListeners 
} from './wheelHandlers.js';

/**
 * Initializes the wheel application
 */
export const initApp = () => {
  // Get DOM elements
  const wheelCanvas = document.getElementById("wheelCanvas");
  const ctx = wheelCanvas.getContext("2d");
  const optionInput = document.getElementById("optionInput");
  const modalContent = document.getElementById("modalContent");
  const integrationToggle = document.getElementById("enableIntegrationToggle");
  const resultModal = document.getElementById("resultModal");
  const importPanel = document.getElementById("importPanel");
  const optionsList = document.getElementById("optionsList");
  const optionsContainer = document.getElementById("optionsListContainer");
  
  // Initialize application state
  const appState = {
    options: parseOptionsFromUrl(),
    rotationDegrees: 0,
    integrationEnabled: integrationToggle.checked
  };
  
  // Create renderer functions with dependencies injected
  const renderWheel = createWheelRenderer(wheelCanvas, ctx, appState.options, importPanel);
  
  // Create handler functions with dependencies injected
  const editOptionHandler = (optionText, index) => {
    editWheelOption({
      optionText,
      index,
      appState,
      updateUrlWithOptions,
      renderWheel,
      renderOptionsList
    });
  };
  
  const deleteOptionHandler = (index) => {
    deleteWheelOption({
      index,
      appState,
      updateUrlWithOptions,
      renderWheel,
      renderOptionsList
    });
  };
  
  // Create factory with properly bound handlers
  const { createOptionItem } = createElementFactories(
    editOptionHandler,
    deleteOptionHandler
  );
  
  // Create options list renderer with factory
  const renderOptionsList = createOptionsListRenderer(
    optionsList, 
    appState.options, 
    { createOptionItem }
  );
  
  // Initialize wheel size and display
  resizeCanvas(wheelCanvas, renderWheel);
  renderWheel();
  renderOptionsList();
  
  // Add resize handler
  window.addEventListener("resize", () => resizeCanvas(wheelCanvas, renderWheel));
  
  // Integration toggle change handler
  integrationToggle.addEventListener("change", () => {
    appState.integrationEnabled = integrationToggle.checked;
  });
  
  // Spin wheel function
  const startSpin = () => {
    if (!appState.options.length) return alert("Add options before spinning the wheel!");
    
    audioManager.play("spin");
    
    // Calculate rotation angles
    const randomIndex = Math.floor(Math.random() * appState.options.length);
    const segmentSize = 360 / appState.options.length;
    const targetAngle = 360 - (randomIndex * segmentSize + segmentSize / 2) - 90;
    const spinRevolutions = (Math.floor(Math.random() * 3) + 3) * 360;
    const totalSpin = spinRevolutions + targetAngle;
    
    // Apply rotation with CSS transition
    appState.rotationDegrees = totalSpin;
    wheelCanvas.style.transition = "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    wheelCanvas.style.transform = `rotate(${appState.rotationDegrees}deg)`;
    
    // Handle result after animation
    setTimeout(() => {
      // Reset transition and normalize rotation
      wheelCanvas.style.transition = "none";
      wheelCanvas.style.transform = `rotate(${appState.rotationDegrees % 360}deg)`;
      
      audioManager.play("result");
      const selectedOption = appState.options[randomIndex];
      
      // Display result
      modalContent.textContent = `Selected: ${selectedOption}`;
      
      // Add integration buttons if enabled
      if (appState.integrationEnabled) {
        // Create timer and text buttons
        const createActionBtn = (actionType, actionHandler) => {
          const button = document.createElement('button');
          button.type = "button";
          button.className = "custom-alert-button";
          button.textContent = actionType;
          button.addEventListener('click', () => {
            actionHandler(selectedOption);
            saveSelectionStats(selectedOption);
            resultModal.style.display = "none";
          });
          return button;
        };
        
        // Add buttons to modal
        modalContent.appendChild(createActionBtn('timer', storageManager.createOrUpdateTimer));
        modalContent.appendChild(createActionBtn('text', storageManager.createTextEntry));
      } else {
        // Close on click if integration not enabled
        document.addEventListener('click', () => resultModal.style.display = "none", { once: true });
      }
      
      // Show popup
      resultModal.style.display = "flex";
    }, 4000);
  };
  
  // Initial setup based on URL parameters
  document.addEventListener("DOMContentLoaded", () => {
    if (!appState.options.length) {
      optionsContainer.style.display = "none";
      importPanel.style.display = "block";
    }
  });
  
  // Set up event handlers with dependencies
  initEventListeners({
    optionInput,
    startSpin,
    appState,
    updateUrlWithOptions,
    renderWheel,
    renderOptionsList
  });
};
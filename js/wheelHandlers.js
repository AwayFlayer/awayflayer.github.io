// User interaction handlers for the wheel application.

import { handleError } from './wheelApi.js';
import { exportWheelConfig, exportStatsData } from './wheelUtils.js';

/**
 * Centralized alert function
 */
export const displayAlert = message => alert(message);

/**
 * Sets up all event listeners for the wheel application
 */
export const initEventListeners = ({
  optionInput,
  startSpin,
  appState,
  updateUrlWithOptions,
  renderWheel,
  renderOptionsList
}) => {
  // Get button elements
  const addOptionBtn = document.getElementById('addOptionBtn');
  const startSpinBtn = document.getElementById('startSpinBtn');
  const resetWheelBtn = document.getElementById('resetWheelBtn');
  const exportWheelBtn = document.getElementById('exportWheelBtn');
  const exportStatsBtn = document.getElementById('exportStatsBtn');
  const importBtn = document.getElementById('importBtn');
  
  // Set up event handlers
  addOptionBtn.addEventListener('click', () => addOption({
    optionInput, appState, updateUrlWithOptions, renderWheel, renderOptionsList
  }));
  
  startSpinBtn.addEventListener('click', startSpin);
  
  resetWheelBtn.addEventListener('click', () => resetWheel({
    appState, updateUrlWithOptions, renderWheel, renderOptionsList
  }));
  
  exportWheelBtn.addEventListener('click', () => exportWheelData({
    appState
  }));
  
  exportStatsBtn.addEventListener('click', exportStats);
  
  importBtn.addEventListener('click', importWheelConfig);
  
  // Handle Enter key in input field
  optionInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
      addOption({
        optionInput, appState, updateUrlWithOptions, renderWheel, renderOptionsList
      });
    }
  });
};

/**
 * Adds a new option to the wheel.
 */
export const addOption = ({ optionInput, appState, updateUrlWithOptions, renderWheel, renderOptionsList }) => {
  const optionText = optionInput.value.trim().toLowerCase();
  
  if (!optionText || appState.options.includes(optionText)) {
    return displayAlert("This option is already on the list or the field is empty!");
  }
  
  // Add new option and update UI
  appState.options.push(optionText);
  updateUrlWithOptions(appState.options);
  renderWheel();
  renderOptionsList();
  
  // Reset input field
  optionInput.value = "";
  
  // Show options list and hide import section
  document.getElementById("optionsListContainer").style.display = "block";
  document.getElementById("importPanel").style.display = "none";
};

/**
 * Edits an existing wheel option.
 */
export const editWheelOption = ({ optionText, index, appState, updateUrlWithOptions, renderWheel, renderOptionsList }) => {
  const updatedText = prompt("Edit option:", optionText)?.trim();
  
  if (!updatedText) return;
  
  if (appState.options.includes(updatedText)) {
    return displayAlert("This option is already on the list!");
  }
  
  // Update option and refresh UI
  appState.options[index] = updatedText;
  updateUrlWithOptions(appState.options);
  renderWheel();
  renderOptionsList();
};

/**
 * Deletes an option from the wheel.
 */
export const deleteWheelOption = ({ index, appState, updateUrlWithOptions, renderWheel, renderOptionsList }) => {
  appState.options.splice(index, 1);
  updateUrlWithOptions(appState.options);
  renderWheel();
  renderOptionsList();
};

/**
 * Clears all options from the wheel.
 */
export const resetWheel = ({ appState, updateUrlWithOptions, renderWheel, renderOptionsList }) => {
  if (!confirm("Are you sure you want to clear all options?")) return;
  
  // Clear options and stats
  appState.options = [];
  updateUrlWithOptions(appState.options);
  renderWheel();
  renderOptionsList();
  localStorage.removeItem("stats");
  
  // Redirect to clean state
  location.href = 'wheel.html';
};

/**
 * Exports wheel data as a JSON file.
 */
export const exportWheelData = ({ appState }) => {
  if (!appState.options.length) return displayAlert("The wheel cannot be empty!");
  
  const wheelUrl = `${location.origin}${location.pathname}?options=${encodeURIComponent(JSON.stringify(appState.options))}`;
  const configName = prompt("Enter a name for this wheel:", "Wheel Name")?.trim();
  
  if (!configName) return displayAlert("The wheel name cannot be empty!");
  
  exportWheelConfig({ name: configName, link: wheelUrl });
};

/**
 * Exports statistics data as a JSON file.
 */
export const exportStats = () => {
  const statsData = JSON.parse(localStorage.getItem('stats'));
  
  if (!statsData) return displayAlert("No statistics to download!");
  
  exportStatsData(statsData);
};

/**
 * Imports wheel data from a JSON file.
 */
export const importWheelConfig = () => {
  const fileInput = document.getElementById('jsonFileInput');
  const selectedFile = fileInput.files[0];
  
  if (!selectedFile) return displayAlert('Please select a .json file');
  
  const fileReader = new FileReader();
  fileReader.onload = event => {
    try {
      window.location.href = JSON.parse(event.target.result).link;
    } catch (error) {
      handleError("Failed to import wheel data", error);
    }
  };
  fileReader.readAsText(selectedFile);
};
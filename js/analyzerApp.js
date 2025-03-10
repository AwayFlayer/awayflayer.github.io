// Main application entry point
import { initFileHandler } from './analyzerHandlers.js';
import { initChartTypeToggle } from './charts/chartToggle.js';

// Initialize the application when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    initFileHandler();
    initChartTypeToggle();
    
    console.log('JSON Analyzer app initialized');
});
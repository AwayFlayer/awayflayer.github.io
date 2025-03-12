/*
 * File Name: main.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Main application entry point
import { initFileHandler } from './analyzerHandlers.js';
import { initChartTypeToggle } from './charts/chartToggle.js';

// Initialize the application when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing application');
    
    try {
        // Initialize file handler
        initFileHandler();
        console.log('File handler initialized');
        
        // Initialize chart type toggle
        initChartTypeToggle();
        console.log('Chart type toggle initialized');
    } catch (error) {
        console.error('Error initializing application:', error);
        
        const existingError = document.getElementsByClassName('error-banner');
        Array.from(existingError).forEach(control => control.remove());

        // Show error message on the page
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-banner';
        errorMsg.textContent = `Initialization error: ${error.message}`;
        document.body.insertBefore(errorMsg, document.body.firstChild);
    }
});
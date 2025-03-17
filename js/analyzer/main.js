/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {initializeFileHandlers} from './file.js';

// Initialize the application
try {
    initializeFileHandlers();
    
    console.log('Application fully initialized');
} catch (error) {
    console.error('Failed to initialize application:', error);
}
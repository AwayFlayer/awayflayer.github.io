/*
 * File Name: index.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

import * as storage from '../storage.js';
import * as timerFunctions from '../timer.js';
import { renderTimers, isLiveMode } from './rendering.js';
import { initEventHandlers, getState } from './events.js';

// UI module for handling DOM interactions and rendering
export const ui = {
    // Initialize UI elements and event handlers
    init: () => {
        // Hide controls in live mode
        if (isLiveMode()) {
            document.getElementById('controlButtons').style.display = 'none';
        }
        
        // Initialize event handlers
        initEventHandlers();
        
        // Initial render
        renderTimers(getState().originalTimers);
    }
};
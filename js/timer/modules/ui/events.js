/*
 * File Name: events.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

import * as storage from '../storage.js';
import * as tts from '../tts.js';
import { renderTimers } from './rendering.js';
import { importTimers, exportTimers } from './fileOperations.js';

// State variables
let isRunning = false;
let timerInterval = null;
let notifications = {};
let originalTimers = {};
let startTime = 0;
let timersSnapshot = [];

// Sets up timer event listeners after rendering
export const setupTimerEventListeners = () => {
    document.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index, 10);
            editTimer(index);
        });
    });
    
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index, 10);
            deleteTimer(index);
        });
    });
};

// nitializes event handlers for the UI
export const initEventHandlers = () => {
    // Set up event listeners
    document.getElementById('startStopBtn').addEventListener('click', toggleStartStop);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
    document.getElementById('exportBtn').addEventListener('click', exportTimers);
    document.getElementById('importBtn').addEventListener('click', 
        () => document.getElementById('importFile').click()
    );
    document.getElementById('importFile').addEventListener('change', importTimers);
    
    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'timers') {
            renderTimers(originalTimers);
        }
    });
    
    // Save original timer values
    const timers = storage.getTimers();
    timers.forEach((timer, index) => {
        originalTimers[index] = timer.time;
    });
};

// Toggles timer start/stop
export const toggleStartStop = () => {
    const btn = document.getElementById('startStopBtn');
    
    if (isRunning) {
        // Stop timers
        isRunning = false;
        btn.textContent = 'Start';
        btn.classList.remove('stop');
        btn.classList.add('start');
        
        // Clear all notification timeouts
        Object.values(notifications).forEach(timeout => clearTimeout(timeout));
        notifications = {};
        
        // Enable export/import buttons
        document.getElementById('exportBtn').disabled = false;
        document.getElementById('importBtn').disabled = false;
        
        // Clear timer interval
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    } else {
        // Start timers
        isRunning = true;
        btn.textContent = 'Stop';
        btn.classList.remove('start');
        btn.classList.add('stop');
        
        // Disable export/import buttons
        document.getElementById('exportBtn').disabled = true;
        document.getElementById('importBtn').disabled = true;
        
        // Save original timer values for new timers
        const timers = storage.getTimers();
        timers.forEach((timer, index) => {
            if (!originalTimers[index] && timer.time !== null && timer.time > 0) {
                originalTimers[index] = timer.time;
            }
        });
        
        startTime = Math.floor(Date.now() / 1000);
        timersSnapshot = timers.map(timer => ({...timer}));
        
        // Set up timer interval - standard approach with second-precision
        timerInterval = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            const elapsedSeconds = currentTime - startTime;
            
            if (elapsedSeconds >= 1) {
                const timers = storage.getTimers();
                let updated = false;
                
                // Update each timer based on snapshot and elapsed time
                timers.forEach((timer, index) => {
                    const snapshotTimer = timersSnapshot[index];
                    
                    if (snapshotTimer && snapshotTimer.time !== null && snapshotTimer.time > 0) {
                        const newTime = Math.max(0, snapshotTimer.time - elapsedSeconds);
                        
                        if (timer.time !== newTime) {
                            timer.time = newTime;
                            updated = true;
                            
                            // Set notification for 10 seconds before end
                            if (timer.time === 10 && !notifications[index]) {
                                notifications[index] = setTimeout(() => {
                                    tts.speak(`Za 10 sekund koniec: ${timer.text}`);
                                }, 0);
                            }
                        }
                    }
                });
                
                // Save updated timers and render
                if (updated) {
                    storage.saveTimers(timers);
                    renderTimers(originalTimers);
                }
            }
        }, 1000);
    }
};

// Clear all timers
export const clearAll = () => {
    if (confirm('Are you sure you want to clear all timers?')) {
        storage.clearAllTimers();
        originalTimers = {};
        renderTimers(originalTimers);
    }
};

/**
 * Edit a timer
 * @param {Number} index - Index of timer to edit
 */
export const editTimer = (index) => {
    // Stop editing if timers are running
    if (isRunning) {
        alert('Please stop timers before editing.');
        return;
    }
    
    const timers = storage.getTimers();
    const timer = timers[index];
    
    const newName = prompt('Enter new timer name:', timer.text);
    if (newName !== null && newName.trim() !== '') {
        timer.text = newName.trim();
        storage.updateTimer(index, timer);
        renderTimers(originalTimers);
    }
};

/**
 * Delete a timer
 * @param {Number} index - Index of timer to delete
 */
export const deleteTimer = (index) => {
    // Stop deletion if timers are running
    if (isRunning) {
        alert('Please stop timers before deleting.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this timer?')) {
        storage.deleteTimer(index);
        delete originalTimers[index];
        renderTimers(originalTimers);
    }
};

// Export state for use in other modules
export const getState = () => ({
    isRunning,
    originalTimers
});

// Update state from other modules
export const updateState = (newState) => {
    if ('isRunning' in newState) isRunning = newState.isRunning;
    if ('originalTimers' in newState) originalTimers = newState.originalTimers;
};
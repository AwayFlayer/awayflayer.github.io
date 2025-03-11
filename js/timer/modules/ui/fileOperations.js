/*
 * File Name: fileOperations.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

import * as storage from '../storage.js';
import { renderTimers } from './rendering.js';
import { getState, updateState } from './events.js';

// Export timers to JSON file
export const exportTimers = () => {
    const { isRunning } = getState();
    
    // Don't allow export if timers are running
    if (isRunning) {
        alert('Please stop timers before exporting.');
        return;
    }
    
    // Get all timers including ones that have finished (time=0)
    const timers = storage.getTimers();
    
    // If no timers exist at all, inform the user
    if (timers.length === 0) {
        alert('No timers found to export.');
        return;
    }
    
    // Create and download the JSON file
    try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timers));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `timers-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (error) {
        console.error('Error exporting timers:', error);
        alert('Failed to export timers. Please try again.');
    }
};

/**
 * Import timers from JSON file
 * @param {Event} event - File input change event
 */
export const importTimers = (event) => {
    const { isRunning } = getState();
    const { originalTimers } = getState();
    
    // Don't allow import if timers are running
    if (isRunning) {
        alert('Please stop timers before importing.');
        event.target.value = '';
        return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const timers = JSON.parse(e.target.result);
            if (Array.isArray(timers)) {
                // Validate timer objects
                const validTimers = timers.filter(timer => 
                    typeof timer === 'object' && 
                    timer !== null && 
                    typeof timer.text === 'string' && 
                    (timer.time === null || typeof timer.time === 'number')
                );
                
                storage.saveTimers(validTimers);
                
                // Update original timers for progress calculation
                const updatedOriginalTimers = { ...originalTimers };
                validTimers.forEach((timer, index) => {
                    updatedOriginalTimers[index] = timer.time;
                });
                
                updateState({ originalTimers: updatedOriginalTimers });
                renderTimers(updatedOriginalTimers);
            } else {
                throw new Error('Invalid format');
            }
        } catch (err) {
            alert('Invalid timer file format.');
            console.error(err);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
};
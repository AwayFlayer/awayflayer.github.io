/*
 * File Name: rendering.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

import { getTimers } from '../storage.js';
import * as timer from '../timer.js';
import { formatTimerText } from './formatter.js';
import { setupTimerEventListeners } from './events.js';

/**
 * Checks if the browser is in live mode
 * @returns {Boolean} True if in live mode
 */
export const isLiveMode = () => new URLSearchParams(window.location.search).get('live') === 'true';

/**
 * Render all timers from localStorage in columns
 * @param {Object} originalTimers - References to original timer values
 */
export const renderTimers = (originalTimers = {}) => {
    const timers = getTimers();
    const container = document.getElementById('timersContainer');
    const liveMode = isLiveMode();
    
    // Clear container using a faster method
    container.textContent = '';
    
    // Filter out timers that have reached zero
    const activeTimers = timers.filter(t => t.time > 0 || t.time === null);
    
    // Display a message if no active timers
    if (activeTimers.length === 0) {
        if (!liveMode) {
            const noTimers = document.createElement('div');
            noTimers.className = 'no-timers';
            noTimers.textContent = 'No active timers';
            container.appendChild(noTimers);
        }
        return;
    }
    
    // Create columns with timers - use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const columns = [];
    let currentColumn = document.createElement('div');
    currentColumn.className = 'timer-column';
    
    // Build columns with timers
    activeTimers.forEach((timerObj, globalIndex) => {
        // Create a new column for every 20 timers
        if (globalIndex > 0 && globalIndex % 20 === 0) {
            columns.push(currentColumn);
            currentColumn = document.createElement('div');
            currentColumn.className = 'timer-column';
        }
        
        // Find the original index of this timer in the storage
        const originalIndex = timers.findIndex(t => t === timerObj);
        
        // Create timer row
        const timerRow = createTimerRow(timerObj, originalIndex, liveMode);
        currentColumn.appendChild(timerRow);
    });
    
    // Add the last column if it has children
    if (currentColumn.children.length > 0) {
        columns.push(currentColumn);
    }
    
    // Append all columns to the fragment
    columns.forEach(column => fragment.appendChild(column));
    
    // Append the fragment to the container (single DOM operation)
    container.appendChild(fragment);
    
    // Add event listeners to edit/delete buttons if not in live mode
    if (!liveMode) {
        setupTimerEventListeners();
    }
};

/**
 * Creates a timer row element
 * @param {Object} timerObj - The timer object
 * @param {Number} originalIndex - The index in the original timers array
 * @param {Boolean} liveMode - Whether we're in live mode
 * @returns {HTMLElement} - The timer row element
 */
const createTimerRow = (timerObj, originalIndex, liveMode) => {
    const timerRow = document.createElement('div');
    timerRow.className = 'timer-row';
    timerRow.dataset.index = originalIndex;
    
    // Add ending class for last 10 seconds
    if (timerObj.time !== null && timerObj.time <= 10) {
        timerRow.classList.add('timer-ending');
    }
    
    // Użycie zaimportowanej funkcji formatTime zamiast metody obiektu
    const formattedTime = timer.formatTime(timerObj.time);
    
    // Format the timer text with line breaks if needed
    const formattedText = formatTimerText(timerObj.text);
    
    // Create timer top section
    const timerTop = document.createElement('div');
    timerTop.className = 'timer-top';
    
    // Add action buttons if not in live mode
    if (!liveMode) {
        const timerActions = document.createElement('div');
        timerActions.className = 'timer-actions';
        
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'action-btn edit';
        editBtn.dataset.index = originalIndex;
        editBtn.textContent = 'Edit';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-btn delete';
        deleteBtn.dataset.index = originalIndex;
        deleteBtn.textContent = 'Delete';
        
        timerActions.appendChild(editBtn);
        timerActions.appendChild(deleteBtn);
        timerTop.appendChild(timerActions);
    }
    
    timerRow.appendChild(timerTop);
    
    // Create timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display';
    
    const timerName = document.createElement('span');
    timerName.className = 'timer-name';
    timerName.innerHTML = formattedText;
    timerDisplay.appendChild(timerName);
    
    if (timerObj.time !== null) {
        const timerTimeElement = document.createElement('span');
        timerTimeElement.className = 'timer-time';
        timerTimeElement.textContent = formattedTime;
        timerDisplay.appendChild(timerTimeElement);
    }
    
    timerRow.appendChild(timerDisplay);
    
    return timerRow;
};
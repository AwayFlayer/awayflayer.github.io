// Copyright (c) 2025 AwayFlayer // License: MIT

import * as storage from '../storage.js';
import * as tts from '../tts.js';
import { renderTimers } from './rendering.js';
import { importTimers, exportTimers } from './fileOperations.js';

// State variables
let [isRunning, timerInterval, notifications, originalTimers, startTime, timersSnapshot] = [false, null, {}, {}, 0, []];

/**
 * Sets up timer event listeners after rendering
 */
export const setupTimerEventListeners = () => {
    document.querySelector('#timersContainer')?.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.action-btn');
      if (!actionBtn) return;
      
      const index = parseInt(actionBtn.dataset.index, 10);
      if (isNaN(index)) return;
      
      if (actionBtn.classList.contains('edit')) {
        editTimer(index);
      } else if (actionBtn.classList.contains('delete')) {
        deleteTimer(index);
      }
    });
};

/**
 * Event handlers for the UI
 */
export const initEventHandlers = () => {
    const eventMap = {
        startStopBtn: toggleStartStop,
        clearAllBtn: clearAll,
        exportBtn: exportTimers,
        importBtn: () => document.getElementById('importFile').click(),
        importFile: importTimers,
    };

    Object.entries(eventMap).forEach(([id, handler]) =>
        document.getElementById(id).addEventListener(id === 'importFile' ? 'change' : 'click', handler)
    );

    window.addEventListener('storage', ({ key }) => key === 'timers' && renderTimers(originalTimers));

    storage.getTimers().forEach((timer, index) => originalTimers[index] = timer.time);
};

/**
 * Toggles timer start/stop
 */
export const toggleStartStop = () => {
    const btn = document.getElementById('startStopBtn');

    const setButtonState = (state) => {
        btn.textContent = state ? 'Stop' : 'Start';
        btn.classList.toggle('stop', state);
        btn.classList.toggle('start', !state);
    };

    if (isRunning) {
        isRunning = false;
        setButtonState(false);
        Object.values(notifications).forEach(clearTimeout);
        notifications = {};
        clearInterval(timerInterval);
        timerInterval = null;
    } else {
        isRunning = true;
        setButtonState(true);
        const timers = storage.getTimers();
        timers.forEach((timer, index) => {
            if (!originalTimers[index] && timer.time > 0) originalTimers[index] = timer.time;
        });

        startTime = Math.floor(Date.now() / 1000);
        timersSnapshot = timers.map(timer => ({ ...timer }));

        timerInterval = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            const elapsedSeconds = currentTime - startTime;
            if (elapsedSeconds < 1) return;

            const timers = storage.getTimers();
            let updated = false;

            timers.forEach((timer, index) => {
                const snapshotTimer = timersSnapshot[index];
                if (snapshotTimer?.time > 0) {
                    const newTime = Math.max(0, snapshotTimer.time - elapsedSeconds);
                    if (timer.time !== newTime) {
                        timer.time = newTime;
                        updated = true;

                        if (newTime === 10 && !notifications[index]) notifications[index] = setTimeout(() => tts.speak(`Za 10 sekund koniec: ${timer.text}`), 0);
                    }
                }
            });

            if (updated) {
                storage.saveTimers(timers);
                renderTimers(originalTimers);
            }
        }, 1000);
    }
};

/**
 * Clears all timers
 * @returns {boolean} True if cleared, false otherwise
 */
export const clearAll = () => {
    if (isRunning) return;
    if (!storage.getTimers().length) {alert('No timers found to clear.'); return;}
    
    confirm('Are you sure you want to clear all timers?') && (storage.clearAllTimers(), originalTimers = Object.create(null), renderTimers(originalTimers), true) || false;
};

/**
 * Edit a timer
 * @param {Number} index - Index of timer to edit
 */
export const editTimer = (index) => {
    if (isRunning) return;
    
    const timer = storage.getTimers()[index];
    const newName = prompt('Enter new timer name:', timer?.text)?.trim();

    if (!newName) return alert('Name is required.');
    if (newName === timer.text) return alert('No changes were made.');
    
    Object.assign(timer, {text: newName, time: timer.time});
    storage.updateTimer(index, timer);
    renderTimers(originalTimers);
};

/**
 * Delete a timer
 * @param {Number} index - Index of timer to delete
 */
export const deleteTimer = (index) => {
    if (isRunning) return;
    
    confirm('Are you sure you want to delete this timer?') && (storage.deleteTimer(index), delete originalTimers[index], renderTimers(originalTimers)) || false;
};

/**
 * Export state for use in other modules
 */
export const getState = () => ({isRunning, originalTimers});

/**
 * Update state from other modules
 */
export const updateState = (newState) => {
    isRunning = newState.isRunning ?? isRunning;
    originalTimers = newState.originalTimers ?? originalTimers;
};
// Copyright (c) 2025 AwayFlayer // License: MIT

import * as storage from '../storage.js';
import { renderTimers } from './rendering.js';
import { getState, updateState } from './events.js';

/**
 * Export timers to JSON file
 */
export const exportTimers = () => {
    const { isRunning } = getState();
    
    if (isRunning) return false;
    
    const timers = storage.getTimers();
    
    if (!timers.length) {
      alert('No timers found to export.');
      return false;
    }
    
    try {
      const blob = new Blob([JSON.stringify(timers)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      Object.assign(downloadLink, {
        href: url,
        download: `timer.json`
      });
      
      downloadLink.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      return true;
    } catch (error) {
      console.error('Error exporting timers:', error);
      alert('Failed to export timers. Please try again.');
      return false;
    }
};

/**
 * Import timers from JSON file
 * @param {Event} event - File input change event
 */
export const importTimers = async (event) => {
    const { isRunning, originalTimers } = getState();
    
    if (isRunning) {
      event.target.value = '';
      return false;
    }
    
    const file = event.target.files?.[0];
    if (!file) return false;
    
    try {
      const text = await file.text();
      const timers = JSON.parse(text);
      
      if (!Array.isArray(timers)) {
        throw new Error('Invalid format: not an array');
      }
      
      const validTimers = timers.filter(timer => 
        typeof timer?.text === 'string' && 
        (timer?.time === null || typeof timer?.time === 'number')
      );
      
      if (!validTimers.length) {
        throw new Error('No valid timers found');
      }
      
      storage.saveTimers(validTimers);
      
      const updatedOriginalTimers = { ...originalTimers };
      validTimers.forEach((timer, index) => {
        updatedOriginalTimers[index] = timer.time;
      });
      
      updateState({ originalTimers: updatedOriginalTimers });
      renderTimers(updatedOriginalTimers);
      
      event.target.value = '';
      return true;
      
    } catch (err) {
      alert(`Import failed: ${err.message || 'Invalid timer file format'}`);
      console.error('Timer import error:', err);
      event.target.value = '';
      return false;
    }
};
/*
 * File Name: timer.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Timer module for timer-related functionality
export const formatTime = (seconds) => {
    if (seconds === null) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    
    // Add hours if not zero
    if (hours > 0) {
        parts.push(`${hours.toString().padStart(2, '0')}h`);
    }
    
    // Add minutes if hours exist or minutes not zero
    if (hours > 0 || minutes > 0) {
        parts.push(`${minutes.toString().padStart(2, '0')}m`);
    }
    
    // Always add seconds
    parts.push(`${secs.toString().padStart(2, '0')}s`);
    
    return parts.join(':');
};
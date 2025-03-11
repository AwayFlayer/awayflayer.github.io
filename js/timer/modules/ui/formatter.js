/*
 * File Name: formatter.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Formats timer text into multiple lines if longer than maxLength
 * @param {String} text - The timer text to format
 * @param {Number} maxLength - Maximum characters per line
 * @return {String} - Formatted HTML with line breaks if needed
 */
export const formatTimerText = (text, maxLength = 30) => {
    // Return original text if it's short enough
    if (!text || text.length <= maxLength) return text || '';
    
    // Split into words
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    // Build lines with appropriate length using for...of for better performance
    for (const word of words) {
        if (currentLine.length + word.length + 1 > maxLength && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            // Add word to current line with space if not first word
            currentLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
        }
    }
    
    // Add the last line if it has content
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }
    
    // Join lines with HTML line breaks
    return lines.join('<br>');
};
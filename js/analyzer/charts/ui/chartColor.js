/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Generate an array of colors for the chart bars
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of hex color codes
 */
export const generateColors = (count) => {
    const baseHue = 220;
    const saturation = 65;
    const lightness = 50;

    return Array.from({length: count}, (_, i) => {
        const hue = (baseHue + (i * 360 / Math.min(count, 20))) % 360;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
};
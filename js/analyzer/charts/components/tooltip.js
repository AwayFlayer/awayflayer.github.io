/*
 * File Name: tooltip.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Chart tooltip component
let tooltipInstances = new Map();

/**
 * Create or get tooltip for a container
 * @param {HTMLElement} container - Container to attach tooltip to
 * @returns {HTMLElement} - Tooltip element
 */
export const getTooltip = (container) => {
    if (!tooltipInstances.has(container)) {
        const tooltipEl = document.createElement('div');
        tooltipEl.classList.add('chart-tooltip');
        tooltipEl.style.display = 'none';
        container.appendChild(tooltipEl);
        tooltipInstances.set(container, tooltipEl);
    }
    
    return tooltipInstances.get(container);
};

/**
 * Show tooltip at position with content
 * @param {HTMLElement} tooltip - Tooltip element
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string|HTMLElement} content - Content to show in tooltip
 */
export const showTooltip = (tooltip, x, y, content) => {
    tooltip.style.display = 'block';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    
    if (typeof content === 'string') {
        tooltip.textContent = content;
    } else {
        tooltip.innerHTML = '';
        tooltip.appendChild(content);
    }
};

/**
 * Hide tooltip
 * @param {HTMLElement} tooltip - Tooltip element to hide
 */
export const hideTooltip = (tooltip) => {
    tooltip.style.display = 'none';
};
/*
 * File Name: pieChart.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Pie chart rendering functionality with zoom and pan support
import { applyViewTransformation, initChartInteractions } from './chartInteraction.js';

// Global variables to store interactions and tooltip
let interactions = null;
let tooltip = null;

/**
 * Render a pie chart on the provided canvas
 * @param {Object} data - Object with key-value pairs to visualize
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 * @param {Object} viewState - Optional zoom and pan state
 */
export const renderPieChart = (data, canvas, viewState = null) => {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on its container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Initialize tooltip if not created yet
    if (!tooltip) {
        tooltip = createTooltip(container);
    }
    
    // Check if we need to reset interactions
    if (window.resetChartInteractions === true) {
        interactions = null;
        window.resetChartInteractions = false;
    }
    
    // Initialize or update interactions
    if (!interactions) {
        interactions = initChartInteractions(canvas, (state) => {
            renderPieChart(data, canvas, state);
        }, { chartType: 'pie', minZoom: 0.5, maxZoom: 5 });
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan transformations if provided
    let restoreCtx = () => {};
    if (viewState) {
        restoreCtx = applyViewTransformation(ctx, viewState);
        
        // Update container class to show we're in zoom mode
        if (viewState.zoomLevel !== 1) {
            container.classList.add('is-zoomed');
        } else {
            container.classList.remove('is-zoomed');
        }
        
        // Update cursor based on dragging state
        if (viewState.isDragging) {
            container.classList.add('is-dragging');
        } else {
            container.classList.remove('is-dragging');
        }
    }
    
    // Calculate center point and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Calculate total value for percentage calculations
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    // Generate color palette for the chart
    const colors = generateColors(Object.keys(data).length);
    
    // Sort data to make the pie chart more stable visually
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    // Store the segments data for tooltip detection
    const segments = [];
    
    // Draw pie slices
    let startAngle = -Math.PI / 2; // Start from the top (12 o'clock position)
    
    sortedData.forEach(([key, value], index) => {
        const sliceAngle = (value / total) * (Math.PI * 2);
        
        // Store segment data for tooltip detection
        segments.push({
            key,
            value,
            startAngle,
            endAngle: startAngle + sliceAngle,
            color: colors[index]
        });
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        // Fill slice
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        // Draw slice border
        ctx.strokeStyle = isDarkMode() ? '#121212' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label positioning
        const middleAngle = startAngle + sliceAngle / 2;
        const percent = Math.round((value / total) * 100);
        
        // Only show labels for larger slices if not zoomed in
        if (percent >= 5 || (viewState && viewState.zoomLevel > 1.5)) { 
            // Position for label is mid-angle, at 70% of radius length
            const labelX = centerX + Math.cos(middleAngle) * radius * 0.7;
            const labelY = centerY + Math.sin(middleAngle) * radius * 0.7;
            
            // Draw percentage labels
            ctx.save();
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = getContrastColor(colors[index]);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percent}%`, labelX, labelY);
            ctx.restore();
        }
        
        // Update start angle for next slice
        startAngle += sliceAngle;
    });
    
    // Add zoom level indicator if zoomed
    if (viewState && viewState.zoomLevel !== 1) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = isDarkMode() ? 'rgba(245, 245, 245, 0.7)' : 'rgba(33, 33, 33, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${Math.round(viewState.zoomLevel * 100)}%`, 10, 20);
    }
    
    // Draw title
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = isDarkMode() ? '#f5f5f5' : '#212121';
    ctx.textAlign = 'center';
    ctx.fillText('Pie Chart', canvas.width / 2, 25);
    
    // Restore context if we modified it for zooming
    if (viewState) {
        restoreCtx();
    }
    
    // Create legend items
    updateLegend(sortedData, colors);
    
    // Store the data for tooltip usage
    canvas.chartData = {
        data: sortedData,
        segments,
        type: 'pie',
        centerX,
        centerY,
        radius
    };
};

/**
 * Generate an array of colors for the chart
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of hex color codes
 */
const generateColors = (count) => {
    const colors = [];
    const baseHues = [0, 60, 120, 180, 240, 300]; // Red, Yellow, Green, Cyan, Blue, Magenta
    
    for (let i = 0; i < count; i++) {
        const hue = baseHues[i % baseHues.length];
        const lightness = 50 + (i % 3) * 10;
        const saturation = 70 - (Math.floor(i / baseHues.length) * 10);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
};

/**
 * Check if dark mode is active
 * @returns {boolean} - True if dark mode is active
 */
const isDarkMode = () => {
    return document.body.classList.contains('dark-mode');
};

/**
 * Get a contrasting color (black or white) based on background
 * @param {string} backgroundColor - Background color
 * @returns {string} - Contrasting color (black or white)
 */
const getContrastColor = (backgroundColor) => {
    // Convert hex or hsl to RGB
    let r, g, b;
    
    if (backgroundColor.startsWith('hsl')) {
        // Extract values from hsl format
        const match = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            // Convert HSL to RGB
            const h = parseInt(match[1]) / 360;
            const s = parseInt(match[2]) / 100;
            const l = parseInt(match[3]) / 100;
            
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            r = Math.round(r * 255);
            g = Math.round(g * 255);
            b = Math.round(b * 255);
        }
    }
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark colors and black for light colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Update the legend with current data
 * @param {Array} data - Array of [key, value] pairs
 * @param {Array} colors - Array of colors used in the chart
 */
const updateLegend = (data, colors) => {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    
    data.forEach(([key, value], index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        
        const colorBox = document.createElement('span');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index];
        
        const label = document.createElement('span');
        label.textContent = key;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
};

/**
 * Create tooltip element
 * @param {HTMLElement} container - Container to append the tooltip to
 * @returns {HTMLElement} - The created tooltip element
 */
const createTooltip = (container) => {
    const tooltipEl = document.createElement('div');
    tooltipEl.classList.add('chart-tooltip');
    container.appendChild(tooltipEl);
    return tooltipEl;
};
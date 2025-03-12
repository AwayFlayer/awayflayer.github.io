/*
 * File Name: barChart.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Bar chart rendering functionality with zoom and pan support
import { applyViewTransformation, initChartInteractions } from './chartInteraction.js';

// Global variables to store interactions
let interactions = null;

/**
 * Render a bar chart on the provided canvas
 * @param {Object} data - Object with key-value pairs to visualize
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 * @param {Object} viewState - Optional zoom and pan state
 */
export const renderBarChart = (data, canvas, viewState = null) => {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on its container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Check if we need to reset interactions
    if (window.resetChartInteractions === true) {
        interactions = null;
        window.resetChartInteractions = false;
    }
    
    // Initialize or update interactions
    if (!interactions) {
        interactions = initChartInteractions(canvas, (state) => {
            // Keep the chart type as bar when re-rendering
            renderBarChart(data, canvas, state);
        }, { chartType: 'bar', minZoom: 0.5, maxZoom: 5 });
    }
    
    // Calculate padding and usable area
    const padding = {
        top: 40,
        right: 20,
        bottom: 60,
        left: 60
    };
    
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    
    // Sort data by value in descending order
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    // Update: don't limit the number of bars when zooming is available
    const barsToShow = sortedData;
    
    // Calculate bar width and spacing
    const totalBars = barsToShow.length;
    const barSpacing = Math.min(20, chartWidth / (totalBars * 2));
    const barWidth = (chartWidth - (barSpacing * (totalBars + 1))) / totalBars;
    
    // Find the maximum value for y-axis scaling
    const maxValue = Math.max(...barsToShow.map(([_, value]) => value));
    
    // Generate colors for bars
    const colors = generateColors(totalBars);
    
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
    
    // Draw title
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#f5f5f5';
    ctx.textAlign = 'center';
    ctx.fillText('Bar Chart', canvas.width / 2, padding.top / 2);
    
    // Add zoom level indicator if zoomed
    if (viewState && viewState.zoomLevel !== 1) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgba(245, 245, 245, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${Math.round(viewState.zoomLevel * 100)}%`, 10, 20);
    }
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();
    
    // Draw y-axis labels and grid lines
    const yTickCount = 5;
    const yTickStep = maxValue / yTickCount;
    
    for (let i = 0; i <= yTickCount; i++) {
        const value = i * yTickStep;
        const yPos = canvas.height - padding.bottom - (i * chartHeight / yTickCount);
        
        // Grid line
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(canvas.width - padding.right, yPos);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
        
        // Y-axis label
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#f5f5f5';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(value).toString(), padding.left - 10, yPos);
    }
    
    // Draw bars
    barsToShow.forEach(([key, value], index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const xPos = padding.left + barSpacing + (index * (barWidth + barSpacing));
        const yPos = canvas.height - padding.bottom - barHeight;
        
        // Draw bar
        ctx.fillStyle = colors[index % colors.length]; // Use modulo to handle many bars
        ctx.fillRect(xPos, yPos, barWidth, barHeight);
        
        // Draw value on top of bar
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#f5f5f5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Only show values on bars that are tall enough
        if (barHeight > 20) {
            ctx.fillText(value, xPos + barWidth / 2, yPos - 5);
        }
        
        // Draw x-axis label
        ctx.save();
        ctx.translate(xPos + barWidth / 2, canvas.height - padding.bottom + 10);
        ctx.rotate(Math.PI / 4); // Rotate text to prevent overlap
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Truncate long labels
        let label = key;
        if (label.length > 30) {
            label = label.substring(0, 30) + '...';
        }
        
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });
    
    // Restore context if we modified it for zooming
    if (viewState) {
        restoreCtx();
    }
    
    // Create legend
    updateLegend(barsToShow, colors);
};

/**
 * Generate an array of colors for the chart bars
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of hex color codes
 */
const generateColors = (count) => {
    const colors = [];
    const baseHue = 220; // Base hue (blue)
    
    for (let i = 0; i < count; i++) {
        // Distribute colors across the spectrum by shifting hue
        const hue = (baseHue + (i * 360 / Math.min(count, 20))) % 360;
        const saturation = 65;
        const lightness = 50;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
};

/**
 * Update the legend with current data
 * @param {Array} data - Array of [key, value] pairs
 * @param {Array} colors - Array of colors used in the chart
 */
const updateLegend = (data, colors) => {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    
    // Limit the legend items to prevent it from becoming too large
    const maxLegendItems = 15;
    const dataToShow = data.slice(0, maxLegendItems);
    
    dataToShow.forEach(([key], index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        
        const colorBox = document.createElement('span');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index % colors.length];
        
        const label = document.createElement('span');
        label.textContent = key;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
    
    // If there are more items than we're showing, add a note
    if (data.length > maxLegendItems) {
        const moreItem = document.createElement('div');
        moreItem.classList.add('legend-more');
        moreItem.textContent = `+ ${data.length - maxLegendItems} more items`;
        legendContainer.appendChild(moreItem);
    }
};
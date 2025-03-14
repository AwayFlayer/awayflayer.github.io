/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {applyViewTransformation, initChartInteractions} from './chartInteraction.js';

let interactions = null;

/**
 * Render a pie chart on the provided canvas
 * @param {Object} data - Object with key-value pairs to visualize
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 * @param {Object} viewState - Optional zoom and pan state
 */
export const renderPieChart = (data, canvas, viewState = null) => {
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    if (window.resetChartInteractions) {
        interactions = null;
        window.resetChartInteractions = false;
    }
    
    if (!interactions) {
        interactions = initChartInteractions(canvas, (state) => {
            renderPieChart(data, canvas, state);
        }, {chartType: 'pie', minZoom: 0.5, maxZoom: 5});
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let restoreCtx = () => {};
    if (viewState) {
        restoreCtx = applyViewTransformation(ctx, viewState);
        updateContainerClass(container, viewState);
    }
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const colors = generateColors(Object.keys(data).length);
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    drawPieSlices(ctx, sortedData, total, colors, centerX, centerY, radius, viewState);
    
    if (viewState && viewState.zoomLevel !== 1) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgba(245, 245, 245, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${Math.round(viewState.zoomLevel * 100)}%`, 10, 20);
    }
    
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#f5f5f5';
    ctx.textAlign = 'center';
    ctx.fillText('Pie Chart', canvas.width / 2, 25);
    
    if (viewState) {
        restoreCtx();
    }
    
    updateLegend(sortedData, colors);
};

const updateContainerClass = (container, viewState) => {
    if (viewState.zoomLevel !== 1) {
        container.classList.add('is-zoomed');
    } else {
        container.classList.remove('is-zoomed');
    }
    
    if (viewState.isDragging) {
        container.classList.add('is-dragging');
    } else {
        container.classList.remove('is-dragging');
    }
};

const drawPieSlices = (ctx, data, total, colors, centerX, centerY, radius, viewState) => {
    let startAngle = -Math.PI / 2;
    
    data.forEach(([key, value], index) => {
        const sliceAngle = (value / total) * (Math.PI * 2);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        const middleAngle = startAngle + sliceAngle / 2;
        const percent = Math.round((value / total) * 100);
        
        if (percent >= 5 || (viewState && viewState.zoomLevel > 1.5)) {
            const labelX = centerX + Math.cos(middleAngle) * radius * 0.7;
            const labelY = centerY + Math.sin(middleAngle) * radius * 0.7;
            
            ctx.save();
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = getContrastColor(colors[index]);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percent}%`, labelX, labelY);
            ctx.restore();
        }
        
        startAngle += sliceAngle;
    });
};

/**
 * Generate an array of colors for the chart
 * @param {number} count - Number of colors needed
 * @param {baseHues} - default Red, Yellow, Green, Cyan, Blue, Magenta
 * @returns {string[]} - Array of hex color codes
 */
const generateColors = (count) => {
    const colors = [];
    const baseHues = [0, 60, 120, 180, 240, 300];

    for (let i = 0; i < count; i++) {
        const hue = baseHues[i % baseHues.length];
        const lightness = 50 + (i % 3) * 10;
        const saturation = 70 - Math.floor(i / baseHues.length) * 10;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
};

/**
 * Get a contrasting color (black or white) based on background
 * @param {string} backgroundColor - Background color
 * @returns {string} - Contrasting color (black or white)
 */
const getContrastColor = (backgroundColor) => {
    let r, g, b;

    if (backgroundColor.startsWith('hsl')) {
        const match = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            const h = parseInt(match[1], 10) / 360;
            const s = parseInt(match[2], 10) / 100;
            const l = parseInt(match[3], 10) / 100;

            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
            g = Math.round(hue2rgb(p, q, h) * 255);
            b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
        }
    }

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

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

    data.forEach(([key], index) => {
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
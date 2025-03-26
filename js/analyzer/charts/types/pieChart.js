/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {applyViewTransformation, initChartInteractions} from '../utils/chartInteraction.js';
import {generateColors} from '../ui/chartColor.js';

let interactions = null;

/**
 * Render a pie chart on the provided canvas
 * @param {Object} data - Object with key-value pairs to visualize
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 * @param {Object} viewState - Optional zoom and pan state
 */
export const renderPieChart = (data, canvas, zoomInfo, viewState = null) => {
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    if (window.resetChartInteractions) {
        interactions = null;
        window.resetChartInteractions = false;
    }
    
    if (!interactions) {
        interactions = initChartInteractions(canvas, zoomInfo, (state) => {
            renderPieChart(data, canvas, zoomInfo, state);
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
        zoomInfo.textContent =  `Zoom: ${Math.round(viewState.zoomLevel * 100)}%`;
    }
    
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.textAlign = 'center';
    ctx.fillText('Pie Chart', canvas.width / 2, 25);
    
    if (viewState) {
        restoreCtx();
    }
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
        const percent = ((value / total) * 100).toFixed(1);
        
        if (percent >= 5 || (viewState && viewState.zoomLevel > 1.5)) {
            const labelX = centerX + Math.cos(middleAngle) * radius * 0.7;
            const labelY = centerY + Math.sin(middleAngle) * radius * 0.7;
            
            ctx.save();
            ctx.font = percent >= 5 
                ? 'bold 14px sans-serif' 
                : (viewState?.zoomLevel > 1.5 && percent <= 5) 
                    ? 'bold 4px sans-serif' 
                    : ctx.font;
            
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percent}%`, labelX, labelY);
            ctx.restore();
        }
        
        startAngle += sliceAngle;
    });
};
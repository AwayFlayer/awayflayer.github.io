/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {applyViewTransformation, initChartInteractions} from './chartInteraction.js';

let interactions = null;

/**
 * Render a bar chart on the provided canvas
 * @param {Object} data - Object with key-value pairs to visualize
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 * @param {Object} viewState - Optional zoom and pan state
 */
export const renderBarChart = async (data, canvas, viewState = null) => {
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    if (window.resetChartInteractions === true) {
        interactions = null;
        window.resetChartInteractions = false;
    }

    if (!interactions) {
        interactions = await initChartInteractions(canvas, async (state) => {
            await renderBarChart(data, canvas, state);
        }, {chartType: 'bar', minZoom: 0.5, maxZoom: 5});
    }

    const padding = {
        top: 40,
        right: 20,
        bottom: 60,
        left: 60
    };

    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const barsToShow = sortedData;
    const totalBars = barsToShow.length;
    const barSpacing = Math.min(20, chartWidth / (totalBars * 2));
    const barWidth = (chartWidth - (barSpacing * (totalBars + 1))) / totalBars;
    const maxValue = Math.max(...barsToShow.map(([_, value]) => value));
    const colors = await generateColors(totalBars);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let restoreCtx = () => {};
    if (viewState) {
        restoreCtx = await applyViewTransformation(ctx, viewState);

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
    }

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#f5f5f5';
    ctx.textAlign = 'center';
    ctx.fillText('Bar Chart', canvas.width / 2, padding.top / 2);

    if (viewState && viewState.zoomLevel !== 1) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgba(245, 245, 245, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${Math.round(viewState.zoomLevel * 100)}%`, 10, 20);
    }

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();

    const yTickCount = 5;
    const yTickStep = maxValue / yTickCount;

    for (let i = 0; i <= yTickCount; i++) {
        const value = i * yTickStep;
        const yPos = canvas.height - padding.bottom - (i * chartHeight / yTickCount);

        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(canvas.width - padding.right, yPos);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#f5f5f5';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(value).toString(), padding.left - 10, yPos);
    }

    await Promise.all(barsToShow.map(async ([key, value], index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const xPos = padding.left + barSpacing + (index * (barWidth + barSpacing));
        const yPos = canvas.height - padding.bottom - barHeight;

        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(xPos, yPos, barWidth, barHeight);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#f5f5f5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        if (barHeight > 20) {
            ctx.fillText(value, xPos + barWidth / 2, yPos - 5);
        }

        ctx.save();
        ctx.translate(xPos + barWidth / 2, canvas.height - padding.bottom + 10);
        ctx.rotate(Math.PI / 4);
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let label = key;
        if (label.length > 30) {
            label = label.substring(0, 30) + '...';
        }

        ctx.fillText(label, 0, 0);
        ctx.restore();
    }));

    if (viewState) {
        restoreCtx();
    }

    await updateLegend(barsToShow, colors);
};

/**
 * Generate an array of colors for the chart bars
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of hex color codes
 */
const generateColors = (count) => {
    const baseHue = 220;
    const saturation = 65;
    const lightness = 50;

    return Array.from({length: count}, (_, i) => {
        const hue = (baseHue + (i * 360 / Math.min(count, 20))) % 360;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
};

/**
 * Update the legend with current data
 * @param {Array} data - Array of [key, value] pairs
 * @param {Array} colors - Array of colors used in the chart
 */
const updateLegend = async (data, colors) => {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    const maxLegendItems = 15;
    const dataToShow = data.slice(0, maxLegendItems);

    const createLegendItem = async ([key], index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        const colorBox = document.createElement('span');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index % colors.length];

        const label = document.createElement('span');
        label.textContent = key;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        return legendItem;
    };

    const legendItems = await Promise.all(dataToShow.map(createLegendItem));
    legendItems.forEach(item => legendContainer.appendChild(item));

    if (data.length > maxLegendItems) {
        const moreItem = document.createElement('div');
        moreItem.classList.add('legend-more');
        moreItem.textContent = `+ ${data.length - maxLegendItems} more items`;
        legendContainer.appendChild(moreItem);
    }
};
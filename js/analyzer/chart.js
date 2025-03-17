/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {renderPieChart} from './charts/types/pieChart.js';
import {renderBarChart} from './charts/types/barChart.js';
import {updateLegend} from './charts/ui/chartLegend.js';
import {generateColors} from './charts/ui/chartColor.js';
import {updateDataSummary} from './charts/ui/dataSummary.js';
import {processJsonData} from './files/utils/processData.js';
import {readFileAsJson} from './files/utils/fileManager.js';

let processedData = null;
let activeChartType = 'pie';

const chartContainer = document.getElementById('chart-container');
const zoomInfo = document.getElementById('zoom-text');

/**
 * Updates the visualization based on the processed data and active chart type.
 * Clears the visualization if there is no processed data.
 * @param {Object} data - The processed data to visualize.
 * @param {string} activeChartType - The type of chart to render ('pie' or 'bar').
 */
export const renderChart = (data, activeChartType) => {
    if (!data || Object.keys(data).length === 0) clearVisualization();

    chartContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);

    if (activeChartType === 'pie') {
        renderPieChart(data, canvas, zoomInfo);
    } else {
        renderBarChart(data, canvas, zoomInfo);
    }
};

/**
 * Initializes the chart with the provided data.
 * @param {Object} data - The processed data to initialize the chart with.
 */
export const initializeChart = (data) => {
    const colors = generateColors(Object.keys(data).length);

    renderChart(data, 'pie');
    updateLegend(Object.entries(data).sort((a, b) => b[1] - a[1]), colors);
    updateDataSummary(data, 'value');
};

/**
 * Clears the current visualization and displays a message prompting the user to select JSON files.
 */
const clearVisualization = () => {
    let emptyChartMessage = chartContainer.querySelector('.empty-chart-message');

    if (!emptyChartMessage) {
        emptyChartMessage = document.createElement('div');
        emptyChartMessage.classList.add('empty-chart-message');
        emptyChartMessage.innerHTML = '<p>Select JSON files to see visualization</p>';
        chartContainer.innerHTML = '';
        chartContainer.appendChild(emptyChartMessage);
    } else {
        emptyChartMessage.style.display = 'block';
    }

    const legendContainer = document.getElementById('chart-legend');
    if (legendContainer) legendContainer.innerHTML = '';
    const dataSummary = document.getElementById('data-summary');
    dataSummary.innerHTML = '<p class="empty-message">No data to display</p>';
};

/**
 * Processes the files array, reading each file as JSON and updating the visualization.
 * @param {File[]} files - Array of files to process.
 */
export const processFiles = async (files) => {
    try {
        const jsonFiles = await Promise.all(files.map(readFileAsJson));
        processedData = processJsonData(jsonFiles);
        initializeChart(processedData);
    } catch (error) {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
        return;
    }
};

/**
 * Sets the active chart type and updates the visualization accordingly.
 * @param {string} type - The type of chart to set as active ('pie' or 'bar').
 */
const setChartType = (type) => {
    if (activeChartType === type) return;

    activeChartType = type;
    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));

    const activeButton = document.querySelector(`[data-chart-type="${type}"]`);
    activeButton?.classList.add('active');
    window.resetChartInteractions = true;

    if (processedData) {
        renderChart(processedData, type);
        zoomInfo.textContent = "Scroll to zoom, drag to pan, double-click to reset view";
    }
};

['pie', 'bar'].forEach(type => {
    const button = document.getElementById(`${type}-chart-btn`);
    if (button) 
        button.addEventListener('click', () => setChartType(type));
});
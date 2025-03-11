/*
 * File Name: analyzerHandlers.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// File handling functionality
import { processJsonData } from './analyzerProcessor.js';
import { renderPieChart } from './charts/pieChart.js';
import { renderBarChart } from './charts/barChart.js';
import { readFileAsJson } from './utils/fileUtils.js';
import { showLoading, hideLoading, showError } from './utils/uiUtils.js';

let files = [];
let activeChartType = 'pie';
let processedData = null;

export const initFileHandler = () => {
    const fileInput = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const chartContainer = document.getElementById('chart-container');
    const dataSummary = document.getElementById('data-summary');

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length === 0) return;

        // Add new files to our files array
        files = [...files, ...selectedFiles];
        
        // Update UI with selected files
        updateFileList();
        
        // Process the files
        processFiles();
        
        // Reset the file input
        fileInput.value = '';
    };

    fileInput.addEventListener('change', handleFileSelect);

    // Set up chart type toggle event listeners
    document.getElementById('pie-chart-btn')?.addEventListener('click', () => setChartType('pie'));
    document.getElementById('bar-chart-btn')?.addEventListener('click', () => setChartType('bar'));

    const updateFileList = () => {
        // Clear the "empty message" if there are files
        const emptyMessage = document.querySelector('#file-list .empty-message');
        if (emptyMessage && files.length > 0) {
            emptyMessage.remove();
        } else if (!emptyMessage && files.length === 0) {
            const li = document.createElement('li');
            li.classList.add('empty-message');
            li.textContent = 'No files selected';
            fileList.appendChild(li);
            return;
        }

        // Clear the current list
        if (files.length > 0) {
            fileList.innerHTML = '';
            
            // Add each file to the list with a remove button
            files.forEach((file, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${file.name}</span>
                    <button class="file-remove" data-index="${index}">✕</button>
                `;
                fileList.appendChild(li);
            });
            
            // Add remove button event listeners
            document.querySelectorAll('.file-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    removeFile(index);
                });
            });
        }
    };

    const removeFile = (index) => {
        // Remove the file from our array
        files.splice(index, 1);
        
        // Update the UI
        updateFileList();
        
        // Reprocess the remaining files
        if (files.length > 0) {
            processFiles();
        } else {
            // If no files left, clear the chart and data summary
            //clearVisualization();
            location.href = "./analyzer.html";
        }
    };

    const processFiles = () => {
        // Show loading indicator
        showLoading();
        
        // Process files asynchronously
        Promise.all(files.map(readFileAsJson))
            .then(jsonFiles => {
                // Process the data
                processedData = processJsonData(jsonFiles);
                
                console.log('Processed data:', processedData);
                
                // Update visualization
                updateVisualization();
            })
            .catch(error => {
                console.error('Error processing files:', error);
                showError(error.message);
            })
            .finally(() => {
                // Hide loading indicator
                hideLoading();
            });
    };

    const updateVisualization = () => {
        if (!processedData || Object.keys(processedData).length === 0) {
            clearVisualization();
            return;
        }
        
        // Clear the empty message
        const emptyChartMessage = chartContainer.querySelector('.empty-chart-message');
        if (emptyChartMessage) {
            emptyChartMessage.style.display = 'none';
        }

        // Make sure we have a canvas to draw on
        let canvas = chartContainer.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            chartContainer.appendChild(canvas);
        }

        // Render the appropriate chart type
        console.log(`Rendering ${activeChartType} chart with data:`, processedData);
        
        try {
            if (activeChartType === 'pie') {
                renderPieChart(processedData, canvas);
            } else {
                renderBarChart(processedData, canvas);
            }
            console.log('Chart rendered successfully');
        } catch (error) {
            console.error('Error rendering chart:', error);
            showError(`Error rendering chart: ${error.message}`);
        }

        // Update the data summary
        updateDataSummary();
    };

    const clearVisualization = () => {
        // Check if we need to show the empty message
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

        // Clear the legend
        const legendContainer = document.getElementById('chart-legend');
        if (legendContainer) {
            legendContainer.innerHTML = '';
        }

        // Clear the data summary
        dataSummary.innerHTML = '<p class="empty-message">No data to display</p>';
    };

    const updateDataSummary = () => {
        if (!processedData || Object.keys(processedData).length === 0) {
            dataSummary.innerHTML = '<p class="empty-message">No data to display</p>';
            return;
        }

        // Calculate total for percentage
        const total = Object.values(processedData).reduce((sum, value) => sum + value, 0);
        
        // Create a table to display the data
        let tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort data by value in descending order
        const sortedData = Object.entries(processedData).sort((a, b) => b[1] - a[1]);
        
        // Add rows to the table
        sortedData.forEach(([key, value]) => {
            const percent = ((value / total) * 100).toFixed(1);
            tableHTML += `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                    <td>${percent}%</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        dataSummary.innerHTML = tableHTML;
    };

    const setChartType = (type) => {
        // Don't do anything if it's the same type
        if (activeChartType === type) return;
        
        activeChartType = type;
        
        // Update button states
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeButton = document.querySelector(`[data-chart-type="${type}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Reset global chart interaction variables in the chart modules
        // This is crucial - we need to tell the modules to reinitialize
        window.resetChartInteractions = true;
        
        // Update visualization if we have data
        if (processedData) {
            updateVisualization();
        }
    };

    // Inicjalizuj widok
    updateFileList();
};
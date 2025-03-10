// File handling functionality
import { processJsonData } from './analyzerProcessor.js';
import { renderPieChart } from './charts/pieChart.js';
import { renderBarChart } from './charts/barChart.js';

let files = [];
let activeChartType = 'pie';
let processedData = null;

export const initFileHandler = () => {
    const fileInput = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const chartContainer = document.getElementById('chart-container');
    const dataSummary = document.getElementById('data-summary');

    fileInput.addEventListener('change', handleFileSelect);

    // Set up chart type toggle event listeners
    document.getElementById('pie-chart-btn').addEventListener('click', () => setChartType('pie'));
    document.getElementById('bar-chart-btn').addEventListener('click', () => setChartType('bar'));

    function handleFileSelect(event) {
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
    }

    function updateFileList() {
        // Clear the "empty message" if there are files
        const emptyMessage = document.querySelector('#file-list .empty-message');
        if (emptyMessage && files.length > 0) {
            emptyMessage.remove();
        } else if (!emptyMessage && files.length === 0) {
            const li = document.createElement('li');
            li.classList.add('empty-message');
            li.textContent = 'No files selected';
            fileList.appendChild(li);
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
    }

    function removeFile(index) {
        // Remove the file from our array
        files.splice(index, 1);
        
        // Update the UI
        updateFileList();
        
        // Reprocess the remaining files
        if (files.length > 0) {
            processFiles();
        } else {
            // If no files left, clear the chart and data summary
            clearVisualization();
        }
    }

    function processFiles() {
        // Show loading indicator
        showLoading();
        
        // Process files asynchronously
        Promise.all(files.map(readFileAsJson))
            .then(jsonFiles => {
                // Process the data
                processedData = processJsonData(jsonFiles);
                
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
    }

    function readFileAsJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve({ name: file.name, data });
                } catch (error) {
                    reject(new Error(`Invalid JSON in file: ${file.name}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error(`Failed to read file: ${file.name}`));
            };
            
            reader.readAsText(file);
        });
    }

    function updateVisualization() {
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
        if (activeChartType === 'pie') {
            renderPieChart(processedData, canvas);
        } else {
            renderBarChart(processedData, canvas);
        }

        // Update the data summary
        updateDataSummary();
    }

    function clearVisualization() {
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
    }

    function updateDataSummary() {
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
    }

    function setChartType(type) {
        // Don't do anything if it's the same type
        if (activeChartType === type) return;
        
        activeChartType = type;
        
        // Update button states
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart-type="${type}"]`).classList.add('active');
        
        // Reset global chart interaction variables in the chart modules
        // This is crucial - we need to tell the modules to reinitialize
        window.resetChartInteractions = true;
        
        // Update visualization if we have data
        if (processedData) {
            updateVisualization();
        }
    }

    function showLoading() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.classList.add('loading-indicator');
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Processing files...</p>';
        document.body.appendChild(loadingIndicator);
    }

    function hideLoading() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    function showError(message) {
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.innerHTML = `<p>${message}</p><button class="close-btn">✕</button>`;
        document.body.appendChild(errorMessage);
        
        // Add close button functionality
        errorMessage.querySelector('.close-btn').addEventListener('click', () => {
            errorMessage.remove();
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(errorMessage)) {
                errorMessage.remove();
            }
        }, 5000);
    }
};
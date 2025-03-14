/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {processJsonData} from './analyzerProcessor.js';
import {renderPieChart} from './charts/pieChart.js';
import {renderBarChart} from './charts/barChart.js';
import {readFileAsJson} from './utils/fileUtils.js';

let files = [];
let activeChartType = 'pie';
let processedData = null;

/**
 * Initializes the file handler by setting up event listeners for file input and chart type buttons.
 */
export const initFileHandler = () => {
    const fileInput = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const chartContainer = document.getElementById('chart-container');
    const dataSummary = document.getElementById('data-summary');

    /**
     * Handles the file selection event, updating the file list and processing the files.
     * @param {Event} event - The file selection event.
     */
    const handleFileSelect = (event) => {
        const {files: selectedFiles} = event.target;

        if (selectedFiles.length === 0) return;

        files = [...files, ...Array.from(selectedFiles)];
        updateFileList();
        processFiles();
        event.target.value = '';
    };

    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };
  
    fileInput.addEventListener('change', debounce(handleFileSelect, 300));

    ['pie', 'bar'].forEach(type => {
        const button = document.getElementById(`${type}-chart-btn`);
        if (button) 
            button.addEventListener('click', () => setChartType(type));
    });

    /**
    * Updates the file list displayed in the UI.
    * Removes the empty message if there are files, otherwise displays it.
    * Creates list items for each selected file with a remove button.
    */
    const updateFileList = () => {
      const fileList = document.querySelector('#file-list');
      const emptyMessage = fileList?.querySelector('.empty-message');
  
      if (emptyMessage && files.length > 0) {
        emptyMessage.remove();
      } else if (!emptyMessage && files.length === 0) {
        const li = document.createElement('li');
        li.classList.add('empty-message');
        li.textContent = 'No files selected';
        fileList?.appendChild(li);
  
        return;
      }
  
      if (files.length > 0) {
        fileList.innerHTML = files.map((file, index) => `
          <li>
            <span>${file.name}</span>
            <button type="button" title="Remove file" class="file-remove" data-index="${index}">
              <svg width='24' height='24' viewBox='0 0 16 16'>
                <rect width='8' height='10' x='4' y='5' rx='1' ry='1' fill='red' stroke='black' />
                <rect width='12' height='2' x='2' y='2' rx='1' ry='1' fill='red' stroke='black' />
                <line x1='6' y1='7' x2='6' y2='14' stroke='black' />
                <line x1='8' y1='7' x2='8' y2='14' stroke='black' />
                <line x1='10' y1='7' x2='10' y2='14' stroke='black' />
              </svg>
            </button>
          </li>`).join('');
  
        fileList.addEventListener('click', (e) => {
          if (e.target.closest('.file-remove')) {
            const index = parseInt(e.target.closest('.file-remove').dataset.index);
            removeFile(index);
          }
        });
      }
    };

    /**
    * Removes a file from the files array at the specified index and updates the file list.
    * Processes remaining files if any, otherwise redirects to the index page.
    * @param {number} index - The index of the file to remove.
    */
    const removeFile = (index) => {
        files.splice(index, 1);
        updateFileList();

        if (files.length > 0) {
          processFiles();
        } else {
          location.href = './analyzer.html';
        }
    };

    /**
    * Processes the files array, reading each file as JSON and updating the visualization.
    */
    const processFiles = async () => {
      try {
          const jsonFiles = await Promise.all(files.map(readFileAsJson));
          processedData = processJsonData(jsonFiles);
  
          requestIdleCallback(updateVisualization);
      } catch (error) {
          fileList.innerHTML = '';
  
          return;
      }
    };

    /**
    * Updates the visualization based on the processed data and active chart type.
    * Clears the visualization if there is no processed data.
    */
    const updateVisualization = () => {
        if (!processedData || Object.keys(processedData).length === 0) {
          clearVisualization();

          return;
        }
        
        const emptyChartMessage = chartContainer.querySelector('.empty-chart-message');
        if (emptyChartMessage) {
          emptyChartMessage.style.display = 'none';
        }

        let canvas = chartContainer.querySelector('canvas');
        if (!canvas) {
          canvas = document.createElement('canvas');
          chartContainer.appendChild(canvas);
        }
        
        try {
          if (activeChartType === 'pie') {
            renderPieChart(processedData, canvas);
          } else {
            renderBarChart(processedData, canvas);
          }
          console.log('Chart rendered successfully');
        } catch (error) {
          console.error('Error rendering chart:', error);
        }
        
        updateDataSummary('value');
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
        dataSummary.innerHTML = '<p class="empty-message">No data to display</p>';
    };

    /**
    * Updates the data summary table based on the provided sorting method.
    * @param {string} method - The method to sort the data by, either "value" or "key".
    */
    const updateDataSummary = (method) => {
        if (!processedData || Object.keys(processedData).length === 0) {
          dataSummary.innerHTML = '<p class="empty-message">No data to display</p>';
          
          return;
        }

        const total = Object.values(processedData).reduce((sum, value) => sum + value, 0);

        /**
        * Creates a table row for the data summary table.
        * @param {string} key - The key of the data.
        * @param {number} value - The value of the data.
        * @param {number} total - The total sum of all values.
        * @returns {string} The HTML string for the table row.
        */
        const createTableRow = (key, value, total) => {
          const percent = ((value / total) * 100).toFixed(1);
          return `
            <tr>
              <td>${key}</td>
              <td>${value}</td>
              <td>${percent}%</td>
            </tr>
          `;
        };
      
        let tableHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th id="sorted-key">Key</th>
                <th id="sorted-value">Value</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
        `;

        const sortedData = Object.entries(processedData).sort((a, b) => {
            if (method === "value") {
              return b[1] - a[1];
            } else if (method === "key") {
              return a[0].localeCompare(b[0]);
            }
          });
          
        tableHTML += sortedData.map(([key, value]) => createTableRow(key, value, total)).join('');
        
        tableHTML += `
            <tr>
              <td><strong>SUMMARY</strong></td>
              <td><strong>${total}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
            </tbody>
          </table>
        `;
        
        dataSummary.innerHTML = tableHTML;

        ['key', 'value'].forEach(type => {
          const button = document.getElementById(`sorted-${type}`);
          if (button) 
              button.addEventListener('click', () => updateDataSummary(type));
        }); 
    };

    /**
    * Sets the chart type and updates the visualization accordingly.
    * @param {string} type - The type of the chart to set.
    */
    const setChartType = (type) => {
        if (activeChartType === type) return;
      
        activeChartType = type;
        document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
      
        const activeButton = document.querySelector(`[data-chart-type="${type}"]`);
        activeButton?.classList.add('active');
        window.resetChartInteractions = true;

        if (processedData) {
          updateVisualization();
        }
    };

    updateFileList();
};
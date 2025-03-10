// File handling functionality
import { processJsonData } from './analyzerProcessor.js';
import { renderPieChart } from './charts/pieChart.js';
import { renderBarChart } from './charts/barChart.js';

let files = [];
let activeChartType = 'pie';

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
        const emptyMessage = document.querySelector('#selected-files .empty-message');
        if (emptyMessage && files.length > 0) {
            emptyMessage.style.display = 'none';
        } else if (emptyMessage && files.length === 0) {
            emptyMessage.style.display = 'block';
        }

        // Clear the current list
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

    function removeFile(index) {
        files = files.filter((_, i) => i !== index);
        updateFileList();
        
        if (files.length === 0) {
            resetChartAndSummary();
        } else {
            processFiles();
        }
    }

    function resetChartAndSummary() {
        // Reset chart container
        chartContainer.innerHTML = `
            <div class="empty-chart-message">
                <p>Wybierz pliki JSON, aby zobaczyć wizualizację</p>
            </div>
        `;
        
        // Reset data summary
        dataSummary.innerHTML = `<p class="empty-message">Brak danych do wyświetlenia</p>`;
        
        // Reset legend
        document.getElementById('chart-legend').innerHTML = '';
    }

    function processFiles() {
        // Start reading all JSON files
        const fileReadPromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        resolve({
                            name: file.name,
                            data: jsonData
                        });
                    } catch (error) {
                        reject({
                            file: file.name,
                            error: 'Invalid JSON format'
                        });
                    }
                };
                
                reader.onerror = () => reject({
                    file: file.name,
                    error: 'Error reading file'
                });
                
                reader.readAsText(file);
            });
        });
        
        // Process all files once they are read
        Promise.allSettled(fileReadPromises)
            .then(results => {
                // Filter successful reads and failed ones
                const validData = results
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value);
                
                const errors = results
                    .filter(result => result.status === 'rejected')
                    .map(result => result.reason);
                
                if (errors.length > 0) {
                    console.error('Some files could not be processed:', errors);
                    // Show errors in UI if needed
                }
                
                if (validData.length > 0) {
                    // Process the JSON data
                    const processedData = processJsonData(validData);
                    
                    // Update the chart based on the current active chart type
                    updateVisualization(processedData);
                    
                    // Update the data summary
                    updateDataSummary(processedData);
                } else {
                    resetChartAndSummary();
                }
            });
    }

    function setChartType(type) {
        activeChartType = type;
        
        // Update UI buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.chartType === type);
        });
        
        // If there are files, update the visualization
        if (files.length > 0) {
            processFiles();
        }
    }

    function updateVisualization(data) {
        // Clear the chart container
        chartContainer.innerHTML = '';
        
        // Create a canvas for the chart
        const canvas = document.createElement('canvas');
        canvas.id = 'chart-canvas';
        chartContainer.appendChild(canvas);
        
        // Render the appropriate chart based on active type
        if (activeChartType === 'pie') {
            renderPieChart(data, canvas);
        } else {
            renderBarChart(data, canvas);
        }
    }

    function updateDataSummary(processedData) {
        // Format and display the summarized data
        dataSummary.innerHTML = '';
        
        if (!processedData || Object.keys(processedData).length === 0) {
            dataSummary.innerHTML = '<p class="empty-message">Brak danych do wyświetlenia</p>';
            return;
        }
        
        // Create a table to display the data
        const table = document.createElement('table');
        table.classList.add('data-table');
        
        // Add table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Nazwa</th>
                <th>Wartość</th>
                <th>Procent</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Calculate total
        const total = Object.values(processedData).reduce((sum, value) => sum + value, 0);
        
        // Add table body
        const tbody = document.createElement('tbody');
        
        // Sort data by value (descending)
        const sortedData = Object.entries(processedData)
            .sort((a, b) => b[1] - a[1]);
            
        sortedData.forEach(([key, value]) => {
            const percent = (value / total * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${value}</td>
                <td>${percent}%</td>
            `;
            tbody.appendChild(row);
        });
        
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td><strong>SUMA</strong></td>
            <td><strong>${total}</strong></td>
            <td><strong>100.0%</strong></td>
        `;
        tbody.appendChild(totalRow);
        
        table.appendChild(tbody);
        dataSummary.appendChild(table);
    }
};
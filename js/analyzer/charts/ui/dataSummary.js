/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Updates the data summary table based on the provided sorting method.
 * @param {Object} processedData - The processed data to display in the summary table.
 * @param {string} method - The method to sort the data by, either "value" or "key".
 */
export const updateDataSummary = (processedData, method) => {
    const dataSummary = document.getElementById('data-summary');
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
          button.addEventListener('click', () => updateDataSummary(processedData, type));
    }); 
};
/**
 * Chart legend component
 */

/**
 * Update the legend with current data
 * @param {Array} data - Array of [key, value] pairs
 * @param {Array} colors - Array of colors used in the chart
 * @param {string} chartType - Type of chart ('pie' or 'bar')
 */
export const updateLegend = (data, colors, chartType = 'bar') => {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    
    // For bar charts, limit the number of legend items
    let dataToShow = data;
    let showMoreIndicator = false;
    
    if (chartType === 'bar') {
        const maxLegendItems = 15;
        if (data.length > maxLegendItems) {
            dataToShow = data.slice(0, maxLegendItems);
            showMoreIndicator = true;
        }
    }
    
    dataToShow.forEach(([key, value], index) => {
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
    if (showMoreIndicator) {
        const moreItem = document.createElement('div');
        moreItem.classList.add('legend-more');
        moreItem.textContent = `+ ${data.length - dataToShow.length} more items`;
        legendContainer.appendChild(moreItem);
    }
};
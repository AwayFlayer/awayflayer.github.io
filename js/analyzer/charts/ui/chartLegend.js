/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Update the legend with current data
 * @param {Array} data - Array of [key, value] pairs
 * @param {Array} colors - Array of colors used in the chart
 */
export const updateLegend = (data, colors) => {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    const maxLegendItems = 15;
    const dataToShow = data.slice(0, maxLegendItems);

    const createLegendItem = ([key], index) => {
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

    const legendItems = (dataToShow.map(createLegendItem));
    legendItems.forEach(item => legendContainer.appendChild(item));

    if (data.length > maxLegendItems) {
        const moreItem = document.createElement('div');
        moreItem.classList.add('legend-more');
        moreItem.textContent = `+ ${data.length - maxLegendItems} more items`;
        legendContainer.appendChild(moreItem);
    }
};
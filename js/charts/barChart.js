// Bar chart rendering functionality without using external libraries

/**
 * Render a bar chart on the provided canvas
 * @param {Object} data - Object with key-value pairs to visualize
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 */
export const renderBarChart = (data, canvas) => {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on its container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Calculate padding and usable area
    const padding = {
        top: 40,
        right: 20,
        bottom: 60,
        left: 60
    };
    
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    
    // Sort data by value in descending order
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    // Limit number of bars to display to prevent overcrowding
    const maxBars = Math.min(sortedData.length, 15);
    const barsToShow = sortedData.slice(0, maxBars);
    
    // Calculate bar width and spacing
    const totalBars = barsToShow.length;
    const barSpacing = Math.min(20, chartWidth / (totalBars * 2));
    const barWidth = (chartWidth - (barSpacing * (totalBars + 1))) / totalBars;
    
    // Find the maximum value for y-axis scaling
    const maxValue = Math.max(...barsToShow.map(([_, value]) => value));
    
    // Generate colors for bars
    const colors = generateColors(totalBars);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = isDarkMode() ? '#f5f5f5' : '#212121';
    ctx.textAlign = 'center';
    ctx.fillText('Wykres słupkowy', canvas.width / 2, padding.top / 2);
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.strokeStyle = isDarkMode() ? '#555' : '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();
    
    // Draw y-axis labels and grid lines
    const yTickCount = 5;
    const yTickStep = maxValue / yTickCount;
    
    for (let i = 0; i <= yTickCount; i++) {
        const value = i * yTickStep;
        const yPos = canvas.height - padding.bottom - (i * chartHeight / yTickCount);
        
        // Grid line
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(canvas.width - padding.right, yPos);
        ctx.strokeStyle = isDarkMode() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.stroke();
        
        // Y-axis label
        ctx.font = '12px sans-serif';
        ctx.fillStyle = isDarkMode() ? '#f5f5f5' : '#212121';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(value).toString(), padding.left - 10, yPos);
    }
    
    // Draw bars
    barsToShow.forEach(([key, value], index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const xPos = padding.left + barSpacing + (index * (barWidth + barSpacing));
        const yPos = canvas.height - padding.bottom - barHeight;
        
        // Draw bar
        ctx.fillStyle = colors[index];
        ctx.fillRect(xPos, yPos, barWidth, barHeight);
        
        // Draw value on top of bar
        ctx.font = '12px sans-serif';
        ctx.fillStyle = isDarkMode() ? '#f5f5f5' : '#212121';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(value, xPos + barWidth / 2, yPos - 5);
        
        // Draw x-axis label
        ctx.save();
        ctx.translate(xPos + barWidth / 2, canvas.height - padding.bottom + 10);
        ctx.rotate(Math.PI / 4); // Rotate text to prevent overlap
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Truncate long labels
        let label = key;
        if (label.length > 12) {
            label = label.substring(0, 10) + '...';
        }
        
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });
    
    // Create legend
    updateLegend(barsToShow, colors);
};

/**
 * Generate an array of colors for the chart bars
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of hex color codes
 */
const generateColors = (count) => {
    const colors = [];
    const baseHue = 220; // Base hue (blue)
    
    for (let i = 0; i < count; i++) {
        // Distribute colors across the spectrum by shifting hue
        const hue = (baseHue + (i * 360 / count)) % 360;
        const saturation = 65;
        const lightness = 50;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
};

/**
 * Check if dark mode is active
 * @returns {boolean} - True if dark mode is active
 */
const isDarkMode = () => {
    return document.body.classList.contains('dark-mode');
};

/**
 * Update the legend with current data
 * @param {Array} data - Array of [key, value] pairs
 * @param {Array} colors - Array of colors used in the chart
 */
const updateLegend = (data, colors) => {
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    
    data.forEach(([key, value], index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        
        const colorBox = document.createElement('span');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index];
        
        const label = document.createElement('span');
        label.textContent = key;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
};
/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Initializes the chart type toggle by setting up event listeners for chart buttons.
 * When a button is clicked, it toggles the active state and dispatches a 'chartTypeChanged' event.
 */
export const initChartTypeToggle = () => {
    const chartButtons = document.querySelectorAll('.chart-btn');

    chartButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;
            
            document.querySelectorAll('.chart-btn.active').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const chartType = button.dataset.chartType;
            document.dispatchEvent(new CustomEvent('chartTypeChanged', {
                detail: {chartType}
            }));
        });
    });
};
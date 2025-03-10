// Chart type toggle functionality

export const initChartTypeToggle = () => {
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    chartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            chartButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Dispatch event for chart type change
            const chartType = button.dataset.chartType;
            const event = new CustomEvent('chartTypeChanged', {
                detail: { chartType }
            });
            document.dispatchEvent(event);
        });
    });
    
    // Listen for chart type change event
    document.addEventListener('chartTypeChanged', (event) => {
        console.log(`Chart type changed to: ${event.detail.chartType}`);
    });
};
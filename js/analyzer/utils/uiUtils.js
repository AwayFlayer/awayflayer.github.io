/**
 * UI utility functions
 */

/**
 * Shows a loading indicator
 */
export const showLoading = () => {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Processing files...</p>';
    document.body.appendChild(loadingIndicator);
};

/**
 * Hides the loading indicator
 */
export const hideLoading = () => {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
};

/**
 * Shows an error message
 * @param {string} message - The error message to display
 */
export const showError = (message) => {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.innerHTML = `<p>${message}</p><button class="close-btn">✕</button>`;
    document.body.appendChild(errorMessage);
    
    // Add close button functionality
    errorMessage.querySelector('.close-btn').addEventListener('click', () => {
        errorMessage.remove();
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (document.body.contains(errorMessage)) {
            errorMessage.remove();
        }
    }, 10000);
};
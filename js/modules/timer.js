/**
 * Timer module for timer-related functionality
 */
export const timerModule = {
    /**
     * Format seconds into Xh:Ym:Zs format, skipping zero components
     * @param {Number} seconds - Total seconds
     * @returns {String} Formatted time string
     */
    formatTime: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        let formattedTime = '';
        
        // Add hours if not zero
        if (hours > 0) {
            formattedTime += `${hours.toString().padStart(2, '0')}h:`;
        }
        
        // Add minutes if hours exist or minutes not zero
        if (hours > 0 || minutes > 0) {
            formattedTime += `${minutes.toString().padStart(2, '0')}m:`;
        }
        
        // Always add seconds
        formattedTime += `${secs.toString().padStart(2, '0')}s`;
        
        return formattedTime;
    },
    
    /**
     * Calculate progress percentage
     * @param {Number} currentTime - Current time in seconds
     * @param {Number} totalTime - Total time in seconds
     * @returns {Number} Progress percentage (0-100)
     */
    calculateProgress: (currentTime, totalTime) => {
        return (currentTime / totalTime) * 100;
    }
};
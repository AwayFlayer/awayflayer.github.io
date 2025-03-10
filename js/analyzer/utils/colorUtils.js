/**
 * Color utility functions
 */

/**
 * Check if dark mode is active
 * @returns {boolean} - True if dark mode is active
 */
export const isDarkMode = () => {
    return document.body.classList.contains('dark-mode');
};

/**
 * Generate colors for charts
 * @param {number} count - Number of colors needed
 * @param {string} type - Type of chart ('pie' or 'bar')
 * @returns {Array} - Array of color codes
 */
export const generateChartColors = (count, type = 'bar') => {
    if (type === 'pie') {
        return generatePieChartColors(count);
    }
    return generateBarChartColors(count);
};

/**
 * Generate colors for pie charts
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of color codes
 */
const generatePieChartColors = (count) => {
    const colors = [];
    const baseHues = [0, 60, 120, 180, 240, 300]; // Red, Yellow, Green, Cyan, Blue, Magenta
    
    for (let i = 0; i < count; i++) {
        const hue = baseHues[i % baseHues.length];
        const lightness = 50 + (i % 3) * 10;
        const saturation = 70 - (Math.floor(i / baseHues.length) * 10);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
};

/**
 * Generate colors for bar charts
 * @param {number} count - Number of colors needed
 * @returns {Array} - Array of color codes
 */
const generateBarChartColors = (count) => {
    const colors = [];
    const baseHue = 220; // Base hue (blue)
    
    for (let i = 0; i < count; i++) {
        // Distribute colors across the spectrum by shifting hue
        const hue = (baseHue + (i * 360 / Math.min(count, 20))) % 360;
        const saturation = 65;
        const lightness = 50;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
};

/**
 * Get a contrasting color (black or white) based on background
 * @param {string} backgroundColor - Background color
 * @returns {string} - Contrasting color (black or white)
 */
export const getContrastColor = (backgroundColor) => {
    // Convert hex or hsl to RGB
    let r, g, b;
    
    if (backgroundColor.startsWith('hsl')) {
        // Extract values from hsl format
        const match = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
            // Convert HSL to RGB
            const h = parseInt(match[1]) / 360;
            const s = parseInt(match[2]) / 100;
            const l = parseInt(match[3]) / 100;
            
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            r = Math.round(r * 255);
            g = Math.round(g * 255);
            b = Math.round(b * 255);
        }
    }
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark colors and black for light colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
};
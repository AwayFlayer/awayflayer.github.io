/**
 * Utility functions for file handling
 */

/**
 * Read a file as JSON
 * @param {File} file - File object to read
 * @returns {Promise} - Promise resolving to {name, data} object
 */
export const readFileAsJson = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                resolve({ name: file.name, data });
            } catch (error) {
                reject(new Error(`Invalid JSON in file: ${file.name}`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };
        
        reader.readAsText(file);
    });
};
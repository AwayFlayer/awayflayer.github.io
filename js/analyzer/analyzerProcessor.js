// Data processing functionality

/**
 * Process JSON data from multiple files
 * @param {Array} jsonFiles - Array of objects containing filename and parsed JSON data
 * @returns {Object} - Aggregated data for visualization
 */
export const processJsonData = (jsonFiles) => {
    // Initialize the result object to store aggregated data
    const aggregatedData = {};
    
    // Process each JSON file
    jsonFiles.forEach(jsonFile => {
        const { name, data } = jsonFile;
        
        // Handle different possible JSON structures
        if (Array.isArray(data)) {
            // If data is an array of objects or values
            processArrayData(data, aggregatedData);
        } else if (typeof data === 'object' && data !== null) {
            // If data is an object with key-value pairs
            processObjectData(data, aggregatedData);
        }
    });
    
    return aggregatedData;
};

/**
 * Process array data from a JSON file
 * @param {Array} array - Array of data to process
 * @param {Object} result - Result object to update
 */
const processArrayData = (array, result) => {
    array.forEach(item => {
        if (typeof item === 'object' && item !== null) {
            // If array contains objects, process each object
            processObjectData(item, result);
        } else if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            // If array contains primitive values, count occurrences
            const key = String(item);
            result[key] ??= 0; // Nullish coalescing assignment operator
            result[key]++;
        }
    });
};

/**
 * Process object data from a JSON file
 * @param {Object} obj - Object to process
 * @param {Object} result - Result object to update
 */
const processObjectData = (obj, result) => {
    // Check if the object has numeric values that can be summed
    const numericValues = {};
    let hasNumericValues = false;
    
    Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'number') {
            numericValues[key] = value;
            hasNumericValues = true;
        }
    });
    
    if (hasNumericValues) {
        // If object has numeric values, add them to the result
        Object.entries(numericValues).forEach(([key, value]) => {
            result[key] ??= 0; // Nullish coalescing assignment operator
            result[key] += value;
        });
    } else {
        // If object has no numeric values, try to count occurrences of keys or nested values
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // If value is an object or array, recursively process it
                if (Array.isArray(obj[key])) {
                    processArrayData(obj[key], result);
                } else {
                    processObjectData(obj[key], result);
                }
            } else {
                // Count occurrence of this key
                result[key] ??= 0; // Nullish coalescing assignment operator
                result[key]++;
            }
        });
    }
};
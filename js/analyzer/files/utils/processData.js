/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Process JSON data from multiple files
 * @param {Array} jsonFiles - Array of objects containing filename and parsed JSON data
 * @returns {Object} - Aggregated data for visualization
 */
export const processJsonData = (jsonFiles) => {
    const aggregatedData = {};
  
    for (const {data} of jsonFiles) {
      if (Array.isArray(data)) {
        processArrayData(data, aggregatedData);
      } else if (data && typeof data === 'object') {
        processObjectData(data, aggregatedData);
      }
    }
  
    return aggregatedData;
  };
  
/**
 * Process array data from a JSON file
 * @param {Array} array - Array of data to process
 * @param {Object} result - Result object to update
 */
const processArrayData = (array, result) => {
  array.forEach(item => {
      if (item && typeof item === 'object') {
          processObjectData(item, result);
      } else if (item !== null && item !== undefined) {
          const key = String(item);
          result[key] = (result[key] ?? 0) + 1;
      }
  });
};
  
/**
 * Process object data from a JSON file
 * @param {Object} obj - Object to process
 * @param {Object} result - Result object to update
 */
const processObjectData = (obj, result) => {
  const numericEntries = Object.entries(obj).filter(([, value]) => typeof value === 'number');
  
  if (numericEntries.length) {
    for (const [key, value] of numericEntries) {
      result[key] = (result[key] ?? 0) + value;
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        Array.isArray(value) 
          ? processArrayData(value, result) 
          : processObjectData(value, result);
      } else {
        result[key] = (result[key] ?? 0) + 1;
      }
    }
  }
};
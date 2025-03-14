/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Read a file as JSON
 * @param {File} file - File object to read
 * @returns {Promise<{name: string, data: any}>} - Promise resolving to {name, data} object
 */
export const readFileAsJson = async (file) => {
    try {
        const reader = new FileReader();
        const result = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsText(file);
        });
        const data = JSON.parse(result ?? '');
        return { name: file.name, data };
    } catch (error) {
        console.error(`Invalid JSON in file: ${file.name}`);
        alert(`Invalid JSON in file: ${file.name}`);
        location.href = "./analyzer.html";
    }
};
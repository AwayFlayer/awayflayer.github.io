/*
 * File Name: fileHandlers.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Displays the selected file name below the input element
 * @param {Event} event - The change event from the file input
 * @since ES2024
 */
export const displayFileName = (event) => {
    // Get the selected file and display element in one go
    const selectedFile = event.target.files[0];
    const displayElement = document.getElementById('fileNameDisplay');
    
    // Use ternary operator for more concise code
    displayElement.textContent = selectedFile 
        ? `Selected file: ${selectedFile.name}` 
        : '';
};
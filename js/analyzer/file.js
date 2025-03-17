/* Copyright (c) 2025 AwayFlayer ** License: MIT */

import {updateFileList} from './files/ui/fileList.js';

export const initializeFileHandlers = () => {
    const fileInput = document.getElementById('file-upload');
    let files = [];

    /**
     * Load CSS file dynamically.
     * @param {string} path - Path to the CSS file.
     */
    const loadCSS = (path) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        document.head.appendChild(link);
    };

    /**
     * Handle file selection.
     * @param {Event} event - The file input change event.
     */
    const handleFileSelect = async (event) => {
        try {
            const selectedFiles = Array.from(event.target.files);
            files = [...files, ...selectedFiles];
            const { processFiles } = await import('./chart.js');
            updateFileList(files, processFiles);

            await processFiles(files);

            loadCSS('../../css/analyzer/chart.css');
        } catch (error) {
            console.error('Error processing files:', error);
        }
    };
    
    fileInput.addEventListener('change', handleFileSelect);
};
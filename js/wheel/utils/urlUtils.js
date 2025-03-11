/*
 * File Name: urlUtils.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Get options from the URL parameters
 * @returns {Array} The parsed options array or empty array
 */
export const parseOptionsFromUrl = () => {
  try {
    const queryParams = new URLSearchParams(window.location.search);
    const options = queryParams.get("options");
    return options ? JSON.parse(options) : [];
  } catch (error) {
    console.error("Error parsing options from URL:", error);
    return [];
  }
};

/**
 * Update the URL with options without page reload
 * @param {Array} options - The options array to encode in the URL
 */
export const updateUrlWithOptions = (options) => {
  try {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("options", JSON.stringify(options));
    
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    return true;
  } catch (error) {
    console.error("Error updating URL with options:", error);
    return false;
  }
};
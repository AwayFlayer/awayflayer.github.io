/*
 * File Name: tts.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Checks if the browser is in live mode
 * @returns {Boolean} True if in live mode
 */
const isLiveMode = () => new URLSearchParams(window.location.search).get('live') === 'true';

/**
 * Speaks a message using the browser's speech synthesis API
 * @param {String} message - Message to be spoken
 */
export const speak = (message) => {
    // Fail silently if speech synthesis is not supported or in live mode
    if (!('speechSynthesis' in window) || isLiveMode()) {
        return;
    }
    
    // Create utterance with optimized settings
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pl-Pl';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel();
    
    // Speak the message
    window.speechSynthesis.speak(utterance);
};
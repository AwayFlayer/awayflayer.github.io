/*
 * File Name: audioUtils.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Creates an audio manager for loading and playing application sounds
 * @returns {Object} Audio manager interface
 */
export const createAudioManager = () => {
  // Preload audio files
  const audioFiles = {
    spin: new Audio("assets/wheel/spin.mp3"),
    result: new Audio("assets/wheel/result.mp3")
  };

  // Configure audio elements
  Object.values(audioFiles).forEach(audio => {
    audio.preload = "auto";
  });
  
  return {
    /**
     * Play a sound by its ID
     * @param {string} soundId - The ID of the sound to play
     * @returns {Promise} Promise that resolves when sound starts or rejects on error
     */
    play: async (soundId) => {
      const audio = audioFiles[soundId];
      if (!audio) throw new Error(`Sound "${soundId}" not found`);
      
      // Reset audio to beginning if already playing
      audio.currentTime = 0;
      
      try {
        // Await the playback to start
        await audio.play();
      } catch (error) {
        console.warn(`Failed to play sound "${soundId}":`, error.message);
        // Silently continue if sound fails (common on mobile)
      }
    }
  };
};

// Create singleton instance
export const audioManager = createAudioManager();
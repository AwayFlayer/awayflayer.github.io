// Copyright (c) 2025 AwayFlayer // License: MIT

/**
 * Speaks a message using the browser's speech synthesis API
 * @param {String} message - Message to be spoken
 */
export const speak = message => {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'pl-PL';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
    
  speechSynthesis.speak(utterance);
};
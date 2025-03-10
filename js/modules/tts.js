/**
 * Text-to-speech module
 */
export const tts = {
    /**
     * Speak a message using the browser's speech synthesis API
     * @param {String} message - Message to be spoken
     */
    speak: (message) => {
        // Check if speech synthesis is supported
        if (!'speechSynthesis' in window) {
            console.error('Text-to-speech not supported in this browser');
            return;
        }

        // Check if we're in live mode (don't speak in live mode)
        if (new URLSearchParams(window.location.search).get('live') === 'true') {
            return;
        }
        
        // Create and configure speech utterance
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pl-Pl';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Speak the message
        window.speechSynthesis.speak(utterance);
    }
};
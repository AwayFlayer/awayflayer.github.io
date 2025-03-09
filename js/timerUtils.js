// Utility functions for handling various timer-related tasks such as speaking text, handling timer end, and importing/exporting timers.

/**
 * Centralized error logging function
 * @param {string} message - The error message.
 * @param {Error} error - The error object.
 */
const logError = (message, error) => {
    console.error(message, error);
    alert(`An error occurred: ${message}. Please try again.`);
};

/**
 * Speak text using text-to-speech
 * @param {string} text - The text to speak.
 */
const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    window.speechSynthesis.speak(utterance);
};

/**
 * Handle the end of a timer
 * @param {Object} timer - The timer object.
 * @param {number} index - The index of the timer.
 */
const handleTimerEnd = (timer, index) => {
    if (!timer.notified) {
        const urlParams = new URLSearchParams(window.location.search);
        const getLive = urlParams.get('live') === 'true';
        if(!getLive) speak(`Time's up: ${timer.text}`);
        timer.notified = true;
    }
    timers.splice(index, 1);
    localStorage.setItem('timers', JSON.stringify(timers));
    updateTimers();
};

/**
 * Export timers to a JSON file
 */
const exportTimers = () => {
    const button = document.getElementById('startStop');

    if (button.textContent === 'Start') {
        const timersJson = localStorage.getItem('timers');
        let timers = JSON.parse(timersJson) || [];

        if (Array.isArray(timers) && timers.length === 0) return logError('No timers to download', null);
        if (!timersJson) return logError('Error processing JSON file', null);

        const data = JSON.stringify(timers, null, 2);
        const blob = new Blob([data], { type: 'application/json; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'timer.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

/**
 * Import timers from a JSON file
 */
const importTimers = () => {
    const button = document.getElementById('startStop');

    if (button.textContent === 'Start') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.addEventListener('change', async event => {
            const file = event.target.files[0];

            if (!file) return;

            try {
                const content = await file.text();
                const importedTimers = JSON.parse(content);

                localStorage.setItem('timers', JSON.stringify(importedTimers));
                timers = importedTimers;
                updateTimers();
                alert('Timers loaded!');
            } catch (error) {
                console.error('Error loading file:', error);
                logError('Error loading file', error);
            }
        });

        input.click();
    }
};
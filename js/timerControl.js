// Control functions to control the main timer operations such as starting/stopping timers, handling storage events, and initializing the app.

let timers = JSON.parse(localStorage.getItem('timers')) || [];
let running = false;
let interval;

/**
 * Start or stop the timers
 */
const startStopTimers = () => {
    running = !running;
    const button = document.getElementById('startStop');
    button.textContent = running ? 'Stop' : 'Start';

    if (running) {
        interval = setInterval(() => {
            timers.forEach(timer => {
                if (timer.time > 0) {
                    timer.time--;
                }
            });
            localStorage.setItem('timers', JSON.stringify(timers));
            updateTimers();
        }, 1000);
    } else {
        clearInterval(interval);
    }
};

/**
 * Handle storage events
 */
window.addEventListener('storage', event => {
    if (event.key === 'timers') {
        timers = JSON.parse(event.newValue) || [];
        updateTimers();
    }
});

/**
 * Periodically update timers display
 */
setInterval(() => {
    if (running) {
        updateTimers();
    }
}, 1000);

/**
 * Initial setup on DOM content loaded
 */
document.addEventListener('DOMContentLoaded', updateTimers);
document.addEventListener('DOMContentLoaded', hideButtonsIfLive);
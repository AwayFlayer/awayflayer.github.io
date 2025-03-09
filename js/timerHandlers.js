// Event handler functions to handle events related to timers such as adding event listeners, confirming actions, and updating timers.

/**
 * Add event listeners to buttons
 * @param {HTMLElement} button - The button element.
 * @param {string} eventType - The type of event.
 * @param {Function} handler - The event handler function.
 */
const addEventListenerToButton = (button, eventType, handler) => {
    if (button) {
        button.addEventListener(eventType, handler);
    }
};

/**
 * Add event listeners to timer buttons
 * @param {HTMLElement} timerDiv - The timer div element.
 * @param {number} index - The index of the timer.
 */
const eventListeners = (timerDiv, index) => {
    addEventListenerToButton(timerDiv.querySelector(".editButton"), 'click', event => {
        event.stopPropagation();
        confirmAndEditTimer(index);
    });

    addEventListenerToButton(timerDiv.querySelector(".deleteButton"), 'click', event => {
        event.stopPropagation();
        confirmAndDeleteTimer(index);
    });
};

/**
 * Confirm and delete a timer
 * @param {number} index - The index of the timer.
 */
const confirmAndDeleteTimer = (index) => {
    if (confirm("Are you sure you want to delete this timer?")) {
        timers.splice(index, 1);
        localStorage.setItem('timers', JSON.stringify(timers));
        updateTimers();
    }
};

/**
 * Confirm and edit a timer
 * @param {number} index - The index of the timer.
 */
const confirmAndEditTimer = (index) => {
    const newName = prompt(`Enter a new name for this timer:`, timers[index].text);

    if (newName) {
        timers[index].text = newName.trim();
        localStorage.setItem('timers', JSON.stringify(timers));
        updateTimers();
    }
};

/**
 * Confirm and clear all timers
 */
const confirmAndClearAllTimers = () => {
    if (confirm("Are you sure you want to delete all timers?")) {
        timers = [];
        localStorage.removeItem('timers');
        updateTimers();
    }
};
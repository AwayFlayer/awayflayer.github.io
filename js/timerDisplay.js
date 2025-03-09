// Display functions to handle the display of timer elements on the web page.

/**
 * Format time in hh:mm:ss
 * @param {number} seconds - The number of seconds to format.
 * @returns {string} - The formatted time string.
 */
const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');

    return (h > 0 ? `${h}h:` : '') + `${m}m:${s}s`;
};

/**
 * Create a column div element
 * @returns {HTMLDivElement} - The created column div element.
 */
const createColumn = () => {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column';
    return columnDiv;
};

/**
 * Create a timer div element
 * @param {Object} timer - The timer object.
 * @param {number} index - The index of the timer.
 * @returns {HTMLDivElement} - The created timer div element.
 */
const createTimerDiv = (timer, index) => {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer';
    timerDiv.innerHTML = timer.time === null 
        ? `${timer.text} <span class="editButton">edit</span><span class="deleteButton">✖</span>` 
        : `${timer.text} ${formatTime(timer.time)} <span class="editButton">edit</span><span class="deleteButton">✖</span>`;

    eventListeners(timerDiv, index);
    return timerDiv;
};

/**
 * Update the display of timers
 */
const updateTimers = () => {
    const timersDiv = document.getElementById('timers');
    timersDiv.innerHTML = '';
    const timersPerColumn = 16;
    let currentColumn = createColumn();
    timersDiv.appendChild(currentColumn);

    timers.forEach((timer, index) => {
        if (timer.time === 0) {
            handleTimerEnd(timer, index);
            return;
        }

        if (index % timersPerColumn === 0 && index > 0) {
            currentColumn = createColumn();
            timersDiv.appendChild(currentColumn);
        }

        const timerDiv = createTimerDiv(timer, index);
        currentColumn.appendChild(timerDiv);
    });
};

/**
 * Hide buttons if live mode is active
 */
const hideButtonsIfLive = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const getLive = urlParams.get('live') === 'true';

    if (getLive) {
        hideElements('button');
        hideElements('span');
    }
};

/**
 * Hide elements by tag name
 * @param {string} tagName - The tag name of elements to hide.
 */
const hideElements = (tagName) => {
    document.querySelectorAll(tagName).forEach(element => {
        element.style.display = 'none';
    });
};
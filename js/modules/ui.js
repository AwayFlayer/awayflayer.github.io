import { storage } from './storage.js';
import { timerModule } from './timer.js';
import { tts } from './tts.js';

/**
 * UI module for handling DOM interactions and rendering
 */
export const ui = {
    // Track if timers are running
    isRunning: false,
    
    // Store notification timeouts
    notifications: {},

    // Store original timer data to track progress
    originalTimers: {},
    
    /**
     * Initialize UI elements and event handlers
     */
    init: () => {
        const isLiveMode = new URLSearchParams(window.location.search).get('live') === 'true';
        
        // Hide controls in live mode
        if (isLiveMode) {
            document.getElementById('controlButtons').style.display = 'none';
        }
        
        // Set up event listeners
        document.getElementById('startStopBtn').addEventListener('click', ui.toggleStartStop);
        document.getElementById('clearAllBtn').addEventListener('click', ui.clearAll);
        document.getElementById('exportBtn').addEventListener('click', ui.exportTimers);
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', ui.importTimers);
        
        // Save original timer values
        const timers = storage.getTimers();
        timers.forEach((timer, index) => {
            ui.originalTimers[index] = timer.time;
        });
        
        // Initial render
        ui.renderTimers();
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'timers') {
                ui.renderTimers();
            }
        });
    },
    
    /**
     * Format timer text into multiple lines if longer than maxLength
     * @param {String} text - The timer text to format
     * @param {Number} maxLength - Maximum characters per line (default: 30)
     * @return {String} - Formatted HTML with line breaks if needed
     */
    formatTimerText: (text, maxLength = 30) => {
        // Return original text if it's short enough
        if (text.length <= maxLength) return text;
        
        // Split into words
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        // Build lines with appropriate length
        for (const word of words) {
            // If adding this word would exceed max length, start a new line
            if (currentLine.length + word.length + 1 > maxLength && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                // Add word to current line with space if not first word
                currentLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
            }
        }
        
        // Add the last line if it has content
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        
        // Join lines with HTML line breaks
        return lines.join('<br>');
    },
    
    /**
     * Render all timers from localStorage in columns
     */
    renderTimers: () => {
        const timers = storage.getTimers();
        const container = document.getElementById('timersContainer');
        const isLiveMode = new URLSearchParams(window.location.search).get('live') === 'true';
        
        // Clear container
        container.innerHTML = '';
        
        // Filter out timers that have reached zero
        const activeTimers = timers.filter(timer => timer.time > 0);
        
        // Display a message if no active timers
        if (activeTimers.length === 0) {
            if (!isLiveMode) {
                const noTimers = document.createElement('div');
                noTimers.className = 'no-timers';
                noTimers.textContent = 'No active timers';
                container.appendChild(noTimers);
            }
            return;
        }
        
        // Create columns with 20 timers each
        const columns = [];
        let currentColumn = document.createElement('div');
        currentColumn.className = 'timer-column';
        
        activeTimers.forEach((timer, globalIndex) => {
            // Create a new column for every 20 timers
            if (globalIndex > 0 && globalIndex % 20 === 0) {
                columns.push(currentColumn);
                currentColumn = document.createElement('div');
                currentColumn.className = 'timer-column';
            }
            
            // Find the original index of this timer in the storage
            const originalIndex = timers.findIndex(t => t === timer);
            
            // Create timer row
            const timerRow = document.createElement('div');
            timerRow.className = 'timer-row';
            timerRow.dataset.index = originalIndex;
            
            // Add ending class for last 10 seconds
            if (timer.time <= 10) {
                timerRow.classList.add('timer-ending');
            }
            
            const formattedTime = timerModule.formatTime(timer.time);
            
            // Format the timer text with line breaks if needed
            const formattedText = ui.formatTimerText(timer.text);
            
            // Create timer content with the desired format: name_timer 00h:00m:00s
            let timerContent = `
                <div class="timer-top">
                    ${!isLiveMode ? `
                        <div class="timer-actions">
                            <button class="action-btn edit" data-index="${originalIndex}">Edit</button>
                            <button class="action-btn delete" data-index="${originalIndex}">Delete</button>
                        </div>
                    ` : ''}
                </div>
                <div class="timer-display">
                    <span class="timer-name">${formattedText}</span> <span class="timer-time">${formattedTime}</span>
                </div>
            `;
            
            timerRow.innerHTML = timerContent;
            currentColumn.appendChild(timerRow);
        });
        
        // Add the last column
        if (currentColumn.children.length > 0) {
            columns.push(currentColumn);
        }
        
        // Append all columns to the container
        columns.forEach(column => container.appendChild(column));
        
        // Add event listeners to edit/delete buttons if not in live mode
        if (!isLiveMode) {
            document.querySelectorAll('.edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    ui.editTimer(index);
                });
            });
            
            document.querySelectorAll('.delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    ui.deleteTimer(index);
                });
            });
        }
    },
    
    /**
     * Toggle timer start/stop
     */
    toggleStartStop: () => {
        const btn = document.getElementById('startStopBtn');
        
        if (ui.isRunning) {
            // Stop timers
            ui.isRunning = false;
            btn.textContent = 'Start';
            btn.classList.remove('stop');
            btn.classList.add('start');
            
            // Clear all notification timeouts
            Object.values(ui.notifications).forEach(timeout => clearTimeout(timeout));
            ui.notifications = {};
            
            // Enable export/import buttons
            document.getElementById('exportBtn').disabled = false;
            document.getElementById('importBtn').disabled = false;
            
            if (ui.timerInterval) {
                clearInterval(ui.timerInterval);
                ui.timerInterval = null;
            }
        } else {
            // Start timers
            ui.isRunning = true;
            btn.textContent = 'Stop';
            btn.classList.remove('start');
            btn.classList.add('stop');
            
            // Disable export/import buttons
            document.getElementById('exportBtn').disabled = true;
            document.getElementById('importBtn').disabled = true;
            
            // Save original timer values
            const timers = storage.getTimers();
            timers.forEach((timer, index) => {
                if (!ui.originalTimers[index] && timer.time > 0) {
                    ui.originalTimers[index] = timer.time;
                }
            });
            
            // Set up timer interval
            ui.timerInterval = setInterval(() => {
                const timers = storage.getTimers();
                let updated = false;
                
                // Update each timer
                timers.forEach((timer, index) => {
                    if (timer.time > 0) {
                        timer.time--;
                        updated = true;
                        
                        // Set notification for 10 seconds before end
                        if (timer.time === 10) {
                            ui.notifications[index] = setTimeout(() => {
                                tts.speak(`Za 10 sekund koniec: ${timer.text}`);
                            }, 0);
                        }
                    }
                });
                
                // Save updated timers
                if (updated) {
                    storage.saveTimers(timers);
                    ui.renderTimers();
                }
            }, 1000);
        }
    },
    
    /**
     * Clear all timers
     */
    clearAll: () => {
        if (confirm('Are you sure you want to clear all timers?')) {
            storage.clearAllTimers();
            ui.originalTimers = {};
            ui.renderTimers();
        }
    },
    
    /**
     * Edit a timer
     * @param {Number} index - Index of timer to edit
     */
    editTimer: (index) => {
        // Stop editing if timers are running
        if (ui.isRunning) {
            alert('Please stop timers before editing.');
            return;
        }
        
        const timers = storage.getTimers();
        const timer = timers[index];
        
        const newName = prompt('Enter new timer name:', timer.text);
        if (newName !== null && newName.trim() !== '') {
            timer.text = newName.trim();
            storage.updateTimer(index, timer);
            ui.renderTimers();
        }
    },
    
    /**
     * Delete a timer
     * @param {Number} index - Index of timer to delete
     */
    deleteTimer: (index) => {
        // Stop deletion if timers are running
        if (ui.isRunning) {
            alert('Please stop timers before deleting.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this timer?')) {
            storage.deleteTimer(index);
            delete ui.originalTimers[index];
            ui.renderTimers();
        }
    },
    
    /**
     * Export timers to JSON file
     */
    exportTimers: () => {
        // Don't allow export if timers are running
        if (ui.isRunning) {
            alert('Please stop timers before exporting.');
            return;
        }
        
        // Get all timers including ones that have finished (time=0)
        const timers = storage.getTimers();
        
        // If no timers exist at all, inform the user
        if (timers.length === 0) {
            alert('No timers found to export.');
            return;
        }
        
        // Export all timers, even those with time=0
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timers));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "timers.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },
    
    /**
     * Import timers from JSON file
     * @param {Event} event - File input change event
     */
    importTimers: (event) => {
        // Don't allow import if timers are running
        if (ui.isRunning) {
            alert('Please stop timers before importing.');
            event.target.value = '';
            return;
        }
        
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const timers = JSON.parse(e.target.result);
                if (Array.isArray(timers)) {
                    storage.saveTimers(timers);
                    
                    // Update original timers for progress calculation
                    timers.forEach((timer, index) => {
                        ui.originalTimers[index] = timer.time;
                    });
                    
                    ui.renderTimers();
                } else {
                    throw new Error('Invalid format');
                }
            } catch (err) {
                alert('Invalid timer file format.');
                console.error(err);
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
};
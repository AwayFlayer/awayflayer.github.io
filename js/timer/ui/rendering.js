// Copyright (c) 2025 AwayFlayer // License: MIT

import { getTimers } from '../storage.js';
import * as timer from '../timer.js';
import { formatTimerText } from './formatter.js';
import { setupTimerEventListeners } from './events.js';

/**
 * Checks if the browser is in live mode
 * @returns {Boolean} True if in live mode
 */
export const isLiveMode = () => new URLSearchParams(window.location.search).get('live') === 'true';

/**
 * Render all timers from localStorage in columns
 * @param {Object} originalTimers - References to original timer values
 */
export const renderTimers = () => {
  const timers = getTimers();
  const liveMode = isLiveMode();
  const container = document.querySelector('#timersContainer');
  
  container.textContent = '';
  
  const activeTimers = timers.filter(timer => timer?.time > 0 || timer?.time === null);
  
  if (!activeTimers.length) {
    if (!liveMode) {
      container.innerHTML = `<div class="no-timers">No active timers</div>`;
    }
    return;
  }
  
  const fragment = new DocumentFragment();
  
  const columns = Array.from(
    {length: Math.ceil(activeTimers.length / 15)},
    (_, colIndex) => activeTimers.slice(colIndex * 15, (colIndex + 1) * 15)
  );
  
  for (const columnTimers of columns) {
    const column = document.createElement('div');
    column.className = 'timer-column';
    column.append(
      ...columnTimers.map(timerObj => {
        const originalIndex = timers.indexOf(timerObj);
        return createTimerRow(timerObj, originalIndex, liveMode);
      })
    );
    
    fragment.appendChild(column);
  }
  
  container.appendChild(fragment);
  if (!liveMode) setupTimerEventListeners();
};

/**
 * Creates a timer row element
 * @param {Object} timerObj - The timer object
 * @param {Number} originalIndex - The index in the original timers array
 * @param {Boolean} liveMode - Whether we're in live mode
 */
const createTimerRow = (timerObj, originalIndex, liveMode) => {
  const svg = Object.freeze({
    edit: String.raw`<svg width='20' height='20' viewBox='0 0 20 20'>
      <path d='M2 18 L5 15 L15 5 L18 8 L8 18 L2 18 Z' fill='blueviolet' stroke='black'/>
      <path d='M14 4 L16 6 L18 4 L16 2 Z' fill='blueviolet' stroke='black'/>
    </svg>`,
    delete: String.raw`<svg width='16' height='16' viewBox='0 0 16 16'>
      <rect width='8' height='10' x='4' y='5' rx='1' ry='1' fill='red' stroke='black'/>
      <rect width='12' height='2' x='2' y='2' rx='1' ry='1' fill='red' stroke='black'/>
      <line x1='6' y1='7' x2='6' y2='14' stroke='black'/>
      <line x1='8' y1='7' x2='8' y2='14' stroke='black'/>
      <line x1='10' y1='7' x2='10' y2='14' stroke='black'/>
    </svg>`
  });

  const isEnding = timerObj?.time <= 10;
  const formattedTime = timer.formatTime(timerObj?.time ?? 0);
  const formattedText = formatTimerText(timerObj?.text ?? '');
  const fragment = document.createDocumentFragment();
  const timerRow = document.createElement('div');
  
  timerRow.className = `timer-row${isEnding ? ' timer-ending' : ''}`;
  timerRow.dataset.index = originalIndex;
  
  timerRow.innerHTML = `
    <div class="timer-top">
      ${!liveMode ? `
        <div class="timer-actions">
          <button type="button" class="action-btn edit" data-index="${originalIndex}" title="edit">
            ${svg.edit}
          </button>
          <button type="button" class="action-btn delete" data-index="${originalIndex}" title="delete">
            ${svg.delete}
          </button>
        </div>
      ` : ''}
    </div>
    <div class="timer-display">
      <span class="timer-name">${formattedText}</span>
      ${timerObj?.time != null ? `<span class="timer-time">${formattedTime}</span>` : ''}
    </div>
  `;
  
  fragment.appendChild(timerRow);
  return fragment.firstElementChild;
};
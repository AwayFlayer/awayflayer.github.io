// Copyright (c) 2025 AwayFlayer // License: MIT

import { renderTimers, isLiveMode } from './ui/rendering.js';
import { initEventHandlers, getState } from './ui/events.js';

/**
 * UI module for handling DOM interactions and rendering
 */
const ui = {
    init: () => {
      if (isLiveMode()) {
        ['exportBtn', 'importBtn'].forEach(id => 
          document.getElementById(id)?.style.setProperty('display', 'none')
        );
      }
      
      initEventHandlers();
      renderTimers(getState().originalTimers);
    }
  };
  
/**
 * Initialize UI
 */
document.addEventListener('DOMContentLoaded', ui.init, {once: true});
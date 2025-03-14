// Copyright (c) 2025 AwayFlayer // License: MIT

import {initFileHandler} from './analyzerHandlers.js';
import {initChartTypeToggle} from './charts/chartToggle.js';

// Initialize the application
const initializeApp = async () => {
  try {
      await Promise.all([
          initFileHandler(),
          initChartTypeToggle(),
      ]);

      console.log('Application fully initialized');
  } catch (error) {
      console.error('Failed to initialize application:', error);
  }
};

initializeApp();
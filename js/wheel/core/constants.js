/*
 * File Name: contants.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Color scheme for wheel segments
export const COLOR_SCHEME = [
  "#1A535C", "#4ECDC4", "#FF6B6B", "#FFE66D", 
  "#2E294E", "#6B5CA5", "#72A1E5", "#364156", 
  "#394648", "#432E36"
];

// Animation durations in milliseconds
export const ANIMATION = {
  SPIN_DURATION: 4000,
  TRANSITION_TIMING: "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)"
};

// Audio asset IDs
export const AUDIO = {
  SPIN: "spin",
  RESULT: "result"
};

// localStorage keys
export const STORAGE_KEYS = {
  TIMERS: "timers",
  STATS: "stats"
};

// Default settings
export const DEFAULTS = {
  MIN_REVOLUTIONS: 3,
  MAX_REVOLUTIONS: 5,
  MAX_CANVAS_SIZE: 500,
  CANVAS_SIZE_RATIO: 0.8
};
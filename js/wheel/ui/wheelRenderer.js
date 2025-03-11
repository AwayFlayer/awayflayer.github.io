/*
 * File Name: wheelRenderer.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

// Wheel rendering functionality
import { COLOR_SCHEME, DEFAULTS } from '../core/constants.js';

/**
 * Resize canvas based on window size
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {Object} The canvas dimensions
 */
export const resizeCanvas = (canvas) => {
  const maxSize = Math.min(window.innerWidth * DEFAULTS.CANVAS_SIZE_RATIO, DEFAULTS.MAX_CANVAS_SIZE);
  canvas.width = maxSize;
  canvas.height = maxSize;
  return { width: maxSize, height: maxSize };
};

/**
 * Draw a segment on the wheel
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} startAngle - Starting angle in radians
 * @param {number} endAngle - Ending angle in radians
 * @param {string} color - Segment color
 */
const renderSegment = (ctx, startAngle, endAngle, color) => {
  const radius = ctx.canvas.width / 2;
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.arc(radius, radius, radius, startAngle, endAngle);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
};

/**
 * Draw text on a segment
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} label - Text to display
 * @param {number} angle - Angle in radians
 * @param {number} radius - Canvas radius
 */
const renderSegmentLabel = (ctx, label, angle, radius) => {
  const fontSize = Math.min(20, radius * 0.7 / label.length);
  const displayText = label.length > 15 ? `${label.slice(0, 15)}...` : label;
  
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle);
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.fillText(displayText, radius - 10, 10);
  ctx.restore();
};

/**
 * Create wheel renderer function
 * @param {HTMLCanvasElement} canvas - The wheel canvas element
 * @param {HTMLElement} importPanel - The import panel element
 * @returns {Function} The render function
 */
export const createWheelRenderer = (canvas, importPanel) => {
  // Get canvas context once
  const ctx = canvas.getContext('2d');
  
  /**
   * Render wheel with provided options
   * @param {Array} options - Options to display on the wheel
   */
  return (options) => {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Toggle import panel visibility
    importPanel.hidden = options.length > 0;
    
    // Handle empty wheel state
    if (options.length === 0) {
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#333";
      ctx.fillText("Add options to start", radius, radius);
      return;
    }
    
    // Draw wheel segments
    const segmentAngle = (2 * Math.PI) / options.length;
    
    options.forEach((option, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      const segmentColor = COLOR_SCHEME[index % COLOR_SCHEME.length];
      
      renderSegment(ctx, startAngle, endAngle, segmentColor);
      renderSegmentLabel(ctx, option, startAngle + segmentAngle / 2, radius);
    });
  };
};
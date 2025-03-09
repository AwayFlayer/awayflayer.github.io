// Display functions for managing the wheel canvas and rendering.

import { handleError } from './wheelApi.js';

/**
 * Adjusts the canvas size based on the window size.
 */
export const resizeCanvas = (canvas, renderFunction) => {
  const maxSize = Math.min(window.innerWidth * 0.8, 500);
  canvas.width = maxSize;
  canvas.height = maxSize;
  renderFunction();
};

/**
 * Draws a segment on the wheel.
 */
export const renderSegment = (ctx, startAngle, endAngle, color) => {
  const radius = ctx.canvas.width / 2;
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.arc(radius, radius, radius, startAngle, endAngle);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
};

/**
 * Draws text on a segment of the wheel.
 */
export const renderSegmentLabel = (ctx, label, angle, radius) => {
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
 * Creates a function to render the wheel with current options.
 */
export const createWheelRenderer = (canvas, ctx, optionsList, importPanel) => () => {
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Show/hide import section based on options
  importPanel.style.display = optionsList.length > 0 ? "none" : "block";

  if (optionsList.length === 0) {
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.fillText("Add options to start", radius, radius);
    return;
  }

  const segmentAngle = (2 * Math.PI) / optionsList.length;
  const colorScheme = ["#1A535C", "#4ECDC4", "#FF6B6B", "#FFE66D", "#2E294E","#6B5CA5", "#72A1E5", "#364156", "#394648", "#432E36"];
  
  optionsList.forEach((option, index) => {
    const startAngle = index * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const segmentColor = colorScheme[index % colorScheme.length];
    
    renderSegment(ctx, startAngle, endAngle, segmentColor);
    renderSegmentLabel(ctx, option, startAngle + segmentAngle / 2, radius);
  });
};

/**
 * Creates UI element factory functions
 */
export const createElementFactories = (editOptionHandler, deleteOptionHandler) => {
  // Create a button with specified attributes
  const createActionButton = (type, text, cssClass, clickHandler) => {
    const button = document.createElement("button");
    button.type = type;
    button.textContent = text;
    button.className = cssClass;
    button.addEventListener('click', clickHandler);
    return button;
  };

  // Create edit button for an option
  const createEditBtn = (optionText, optionIndex) => 
    createActionButton("button", "edit", "editButton", () => editOptionHandler(optionText, optionIndex));

  // Create delete button for an option
  const createDeleteBtn = optionIndex => 
    createActionButton("button", "X", "deleteButton", () => deleteOptionHandler(optionIndex));
    
  // Create list item for an option
  const createOptionItem = (optionText, optionIndex) => {
    const listItem = document.createElement("li");
    
    const fragment = document.createDocumentFragment();
    
    // Create and append index label
    const indexLabel = document.createElement("strong");
    indexLabel.textContent = `${optionIndex + 1}. `;
    fragment.appendChild(indexLabel);
    
    // Create and append option text
    const textElement = document.createElement("span");
    textElement.textContent = optionText;
    fragment.appendChild(textElement);
    
    // Append buttons
    fragment.appendChild(createEditBtn(optionText, optionIndex));
    fragment.appendChild(createDeleteBtn(optionIndex));
    
    listItem.appendChild(fragment);
    return listItem;
  };
  
  return { createActionButton, createEditBtn, createDeleteBtn, createOptionItem };
};

/**
 * Updates the options list display.
 */
export const createOptionsListRenderer = (listContainer, optionsList, elementFactories) => () => {
  try {
    // Clear current content
    listContainer.innerHTML = "";
    
    // Use fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Add all option items to fragment
    optionsList.forEach((optionText, index) => {
      fragment.appendChild(elementFactories.createOptionItem(optionText, index));
    });
    
    // Add fragment to DOM in one operation
    listContainer.appendChild(fragment);
  } catch (error) {
    handleError("Failed to update options list", error);
  }
};
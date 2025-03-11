/*
 * File Name: optionListRenderer.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Create a function to render the options list
 * @param {HTMLElement} listContainer - The list container element
 * @param {Function} onEdit - Edit option callback
 * @param {Function} onDelete - Delete option callback
 * @returns {Function} The render function
 */
export const createOptionsListRenderer = (listContainer, onEdit, onDelete) => {
  /**
   * Create a button with specified properties
   * @param {string} type - Button type
   * @param {string} text - Button text
   * @param {string} cssClass - CSS class name
   * @param {Function} clickHandler - Click event handler
   * @returns {HTMLButtonElement} The created button
   */
  const createButton = (type, text, cssClass, clickHandler) => {
    const button = document.createElement("button");
    button.type = type;
    button.textContent = text;
    button.className = cssClass;
    button.addEventListener('click', clickHandler);
    return button;
  };
  
  /**
   * Create an option list item
   * @param {string} optionText - The option text
   * @param {number} index - The option index
   * @returns {HTMLLIElement} The created list item
   */
  const createOptionItem = (optionText, index) => {
    const listItem = document.createElement("li");
    
    // Create fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Create index label
    const indexLabel = document.createElement("strong");
    indexLabel.textContent = `${index + 1}. `;
    fragment.appendChild(indexLabel);
    
    // Create text element
    const textElement = document.createElement("span");
    textElement.textContent = optionText;
    fragment.appendChild(textElement);
    
    // Create edit button
    const editBtn = createButton(
      "button", 
      "edit", 
      "editButton", 
      () => onEdit(optionText, index)
    );
    fragment.appendChild(editBtn);
    
    // Create delete button
    const deleteBtn = createButton(
      "button", 
      "X", 
      "deleteButton", 
      () => onDelete(index)
    );
    fragment.appendChild(deleteBtn);
    
    // Add all elements to list item
    listItem.appendChild(fragment);
    return listItem;
  };
  
  /**
   * Render the options list
   * @param {Array} options - The options array to render
   */
  return (options) => {
    try {
      // Clear current list
      listContainer.innerHTML = "";
      
      if (options.length === 0) return;
      
      // Create document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Add all options to fragment
      options.forEach((optionText, index) => {
        fragment.appendChild(createOptionItem(optionText, index));
      });
      
      // Add fragment to DOM in one operation
      listContainer.appendChild(fragment);
    } catch (error) {
      console.error("Failed to update options list:", error);
    }
  };
};
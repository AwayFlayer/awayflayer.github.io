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
   * @param {string} title - Button title
   * @param {string} cssClass - CSS class name
   * @param {Function} clickHandler - Click event handler
   * @returns {HTMLButtonElement} The created button
   */
  const createButton = (type, title, cssClass, clickHandler) => {
    const button = document.createElement("button");
    button.type = type;
    button.title = title
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
    editBtn.insertAdjacentHTML('afterbegin', `<svg width='20' height='20' viewBox='0 0 20 20'>
      <path d='M2 18 L5 15 L15 5 L18 8 L8 18 L2 18 Z' fill='blueviolet' stroke='black' />
      <path d='M14 4 L16 6 L18 4 L16 2 Z' fill='blueviolet' stroke='black' />
    </svg>`);
    fragment.appendChild(editBtn);
    
    // Create delete button
    const deleteBtn = createButton(
      "button",
      "delete",
      "deleteButton",
      () => onDelete(index)
    );
    deleteBtn.insertAdjacentHTML('afterbegin', `<svg width='16' height='16' viewBox='0 0 16 16'>
      <rect width='8' height='10' x='4' y='5' rx='1' ry='1' fill='red' stroke='black' />
      <rect width='12' height='2' x='2' y='2' rx='1' ry='1' fill='red' stroke='black' />
      <line x1='6' y1='7' x2='6' y2='14' stroke='black' />
      <line x1='8' y1='7' x2='8' y2='14' stroke='black' />
      <line x1='10' y1='7' x2='10' y2='14' stroke='black' />
    </svg>`);
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
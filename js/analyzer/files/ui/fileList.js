/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Updates the file list displayed in the UI.
 * Removes the empty message if there are files, otherwise displays it.
 * Creates list items for each selected file with a remove button.
 */
export const updateFileList = (files, processFiles) => {
  const fileList = document.querySelector('#file-list');
  const emptyMessage = fileList?.querySelector('.empty-message');
  
  if (emptyMessage && files.length > 0) {
    emptyMessage.remove();
  } else if (!emptyMessage && files.length === 0) {
    const li = document.createElement('li');
    li.classList.add('empty-message');
    li.textContent = 'No files selected';
    fileList?.appendChild(li);
  
    return;
  }
  
  if (files.length > 0) {
    fileList.innerHTML = files.map((file, index) => `
    <li>
    <span>${file.name}</span>
    <button type="button" title="Remove file" class="file-remove" data-index="${index}">
      <svg width='24' height='24' viewBox='0 0 16 16'>
        <rect width='8' height='10' x='4' y='5' rx='1' ry='1' fill='red' stroke='black' />
        <rect width='12' height='2' x='2' y='2' rx='1' ry='1' fill='red' stroke='black' />
        <line x1='6' y1='7' x2='6' y2='14' stroke='black' />
        <line x1='8' y1='7' x2='8' y2='14' stroke='black' />
        <line x1='10' y1='7' x2='10' y2='14' stroke='black' />
      </svg>
    </button>
    </li>`).join('');
  
    fileList.addEventListener('click', (e) => {
      if (e.target.closest('.file-remove')) {
        const index = parseInt(e.target.closest('.file-remove').dataset.index);
        removeFile(index, files, processFiles);
      }
    });
  }

  /**
   * Removes a file from the files array at the specified index and updates the file list.
   * Processes remaining files if any, otherwise redirects to the index page.
   * @param {number} index - The index of the file to remove.
   * @param {Array} files - Array of files
   */
  const removeFile = (index, files, processFiles) => {
    files.splice(index, 1);
    updateFileList(files, processFiles);

    if (files.length > 0) {
      processFiles(files);
    } else {
      location.href = './analyzer.html';
    }
  };
};
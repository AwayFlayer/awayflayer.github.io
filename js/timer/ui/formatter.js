// Copyright (c) 2025 AwayFlayer // License: MIT

/**
 * Formats timer text into multiple lines if longer than maxLength
 * @param {String} text - The timer text to format
 * @param {Number} maxLength - Maximum characters per line
 * @return {String} - Formatted HTML with line breaks if needed
 */
export const formatTimerText = (text, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text || '';
    
    return text.split(' ')
      .reduce((lines, word) => {
        const currentLine = lines.at(-1) ?? '';
        
        if (word.length > maxLength) {
          const chunks = word.match(new RegExp(`.{1,${maxLength}}`, 'g')) ?? [];
          
          if (currentLine.length) {

            lines[lines.length - 1] = `${currentLine}<br/>${chunks[0]}`;

            lines.push(...chunks.slice(1));
          } else {

            lines.push(...chunks);
          }
        }
        else if ((currentLine + ' ' + word).trim().length > maxLength) {
          lines.push(word);
        }
        else {
          lines[lines.length - 1] = currentLine ? `${currentLine} ${word}`.trim() : word;
        }

        return lines;
      }, [''])
      .join('<br/>');
};
/**
 * Parses a CSV string into a 2D array of strings.
 * Handles quoted fields, escaped quotes, and different line endings.
 * 
 * @param text - The CSV string to parse
 * @returns A 2D array where each inner array represents a row of the CSV
 * 
 * @example
 * ```typescript
 * const csv = 'Name,Age\n"Doe, John",30\n"Smith, Jane",25';
 * const result = parseCSV(csv);
 * // Returns: [['Name', 'Age'], ['Doe, John', '30'], ['Smith, Jane', '25']]
 * ```
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  // Normalize line endings and trim
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (inQuotes) {
      if (char === '"') {
        // Check if this is an escaped quote ("")
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        // End of row
        currentRow.push(currentField.trim());
        currentField = '';
        
        // Only push non-empty rows
        if (currentRow.some(field => field !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }
  
  // Add the last field and row if they exist
  currentField = currentField.trim();
  if (currentField !== '' || (text[text.length - 1] === ',' && !inQuotes)) {
    currentRow.push(currentField);
  }
  
  if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
    rows.push(currentRow);
  }
  
  return rows;
}
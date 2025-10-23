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
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          // Handle escaped quote ("")
          currentField += '"';
          i++;
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
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        // Handle line endings (both \n and \r\n)
        if (char === '\r' && text[i + 1] === '\n') {
          i++; // Skip the \n in \r\n
        }
        // End of row
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }
  
  // Add the last field and row if they exist
  if (currentField !== '' || text[text.length - 1] === ',') {
    currentRow.push(currentField);
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}
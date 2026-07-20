/**
 * Parses raw CSV string content into structured JSON objects.
 * Handles quoted fields, commas inside quotes, and escaped quotes.
 * 
 * @param {string} csvContent - Raw CSV text data.
 * @returns {Array<Object>} Array of parsed record objects mapping headers to values.
 */
export function parseCSV(csvContent) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double quotes inside a quoted field
        currentField += '"';
        i++; // Skip the next quote character
      } else {
        // Toggle the quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator outside quotes
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // Row separator outside quotes
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip LF if carriage return was followed by line feed
      }
      currentLine.push(currentField.trim());
      // Add line if it contains non-empty elements
      if (currentLine.some(f => f !== '')) {
        lines.push(currentLine);
      }
      currentField = '';
      currentLine = [];
    } else {
      currentField += char;
    }
  }

  // Handle last line if no trailing newline was present
  if (currentField !== '' || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some(f => f !== '')) {
      lines.push(currentLine);
    }
  }

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0];
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const record = {};
    headers.forEach((header, index) => {
      let val = row[index] !== undefined ? row[index] : null;
      // Convert standard SQL NULL strings to JavaScript null
      if (val === 'NULL' || val === 'null' || val === '') {
        val = null;
      }
      record[header] = val;
    });
    records.push(record);
  }

  return records;
}

/**
 * Normalizes a row of data by transforming specific fields based on their
 * type or key patterns. Handles null, undefined, long strings, buffers,
 * ID-like fields, email fields, and date-time fields.
 *
 * @param row - The original row object containing key-value pairs to normalize.
 * @param rowIndex - The index of the current row, used for generating unique
 *                   identifiers for ID and email fields.
 * @returns A new row object with normalized values.
 */

export function normalizeRow(
  row: Record<string, any>,
  rowIndex: number
): Record<string, any> {
  const newRow: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      newRow[key] = "NULL";
    } else if (typeof value === "string" && value.length > 50) {
      newRow[key] = value.slice(0, 20) + "...";
    } else if (Buffer.isBuffer(value)) {
      newRow[key] = "[BLOB]";
    } else if (/id/i.test(key) && typeof value === "string") {
      newRow[key] = `ID_${rowIndex + 1}`;
    } else if (/email/i.test(key)) {
      newRow[key] = `user${rowIndex + 1}@domain.com`;
    } else if (/date|time/i.test(key) && value instanceof Date) {
      newRow[key] = "2023-01-01";
    } else {
      newRow[key] = String(value);
    }
  }
  return newRow;
}

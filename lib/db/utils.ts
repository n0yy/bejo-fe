interface NormalizeOptions {
  maxStringLength?: number;
  truncateSuffix?: string;
  defaultDate?: string;
  maskEmails?: boolean;
  maskIds?: boolean;
  redactSensitive?: boolean;
}

export function normalizeRow(
  row: Record<string, any>,
  rowIndex: number,
  options: NormalizeOptions = {}
): Record<string, any> {
  const {
    maxStringLength = 50,
    truncateSuffix = "...",
    defaultDate = "2023-01-01",
    maskEmails = true,
    maskIds = true,
    redactSensitive = true,
  } = options;

  const newRow: Record<string, any> = {};

  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      newRow[key] = "NULL";
    } else if (Buffer.isBuffer(value)) {
      newRow[key] = "[BLOB]";
    } else if (redactSensitive && /(password|token|secret)/i.test(key)) {
      newRow[key] = "[REDACTED]";
    } else if (
      /date|time/i.test(key) &&
      (value instanceof Date ||
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(value)))
    ) {
      newRow[key] = defaultDate;
    } else if (maskIds && /id/i.test(key) && typeof value === "string") {
      newRow[key] = `ID_${rowIndex + 1}`;
    } else if (maskEmails && /email/i.test(key)) {
      newRow[key] = `user${rowIndex + 1}@domain.com`;
    } else if (typeof value === "string") {
      newRow[key] =
        value.length > maxStringLength
          ? value.slice(0, maxStringLength / 2) + truncateSuffix
          : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      newRow[key] = value;
    } else if (Array.isArray(value)) {
      newRow[key] =
        JSON.stringify(value).slice(0, maxStringLength) + truncateSuffix;
    } else if (typeof value === "object") {
      newRow[key] =
        JSON.stringify(value).slice(0, maxStringLength) + truncateSuffix;
    } else {
      newRow[key] = String(value);
    }
  }

  return newRow;
}

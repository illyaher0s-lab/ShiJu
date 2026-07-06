/**
 * Database Row Transformer
 * 
 * Converts PostgreSQL snake_case column names to JavaScript camelCase.
 * 
 * Best Practice: REST APIs should return camelCase for JavaScript clients,
 * regardless of backend database naming convention.
 * Reference: Google JSON Style Guide, Airbnb JavaScript Style Guide
 * 
 * Safety: Keys without underscores are returned as-is (idempotent).
 */

/**
 * Convert a single snake_case key to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform DB rows from snake_case to camelCase
 * 
 * @param rows - Array of database rows (objects with snake_case keys)
 * @returns Array with camelCase keys
 */
export function toCamelCase<T = any>(rows: any[]): T[] {
  return rows.map(row => {
    const transformed: any = {};
    for (const [key, value] of Object.entries(row)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = value;
    }
    return transformed;
  });
}

/**
 * Transform a single DB row from snake_case to camelCase
 */
export function toCamelCaseRow<T = any>(row: any): T {
  const transformed: any = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = snakeToCamel(key);
    transformed[camelKey] = value;
  }
  return transformed;
}

/**
 * Convert string numbers to actual numbers
 * PostgreSQL COUNT() returns bigint as string in node-postgres
 * 
 * @param obj - Object with potentially string number fields
 * @param fields - Array of field names to convert
 */
export function stringToNumber(obj: any, fields: string[]): any {
  const result = { ...obj };
  for (const field of fields) {
    if (field in result && typeof result[field] === 'string') {
      result[field] = Number(result[field]);
    }
  }
  return result;
}

/**
 * Convert string numbers to actual numbers in array of objects
 * 
 * @param rows - Array of objects
 * @param fields - Array of field names to convert
 */
export function stringToNumberArray(rows: any[], fields: string[]): any[] {
  return rows.map(row => stringToNumber(row, fields));
}

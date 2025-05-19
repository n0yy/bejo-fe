import OracleDB from "oracledb";
import { DBType, ProcessStatus } from "./types";
import { normalizeRow } from "./utils";

/**
 * Retrieves a list of tables from the database.
 *
 * @param connection - A valid database connection
 * @param type - The type of database ("mysql" or "oracle")
 * @param emitStatus - An optional callback to report the progress (status and message)
 * @returns A promise that resolves to a list of table names
 */
export async function getTables(
  connection: any,
  type: DBType,
  emitStatus?: (status: ProcessStatus, message: string) => void
): Promise<string[]> {
  emitStatus?.(ProcessStatus.GETTING_TABLES, "Retrieving database tables...");

  if (type === "mysql") {
    const [rows] = await connection.execute("SHOW TABLES");
    return rows.map((row: any) => Object.values(row)[0] as string);
  } else {
    const result = await connection.execute(
      "SELECT table_name FROM user_tables",
      [],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows.map((row: any) => row.TABLE_NAME as string);
  }
}

/**
 * Retrieves the schema of a given table from the database.
 *
 * @param connection - A valid database connection
 * @param type - The type of database ("mysql" or "oracle")
 * @param tableName - The name of the table to retrieve the schema for
 * @returns A promise that resolves to a string representing the table schema,
 *          with each column on a new line in the format "<column_name>: <data_type>[, not null]"
 */
export async function getTableSchema(
  connection: any,
  type: DBType,
  tableName: string
): Promise<string> {
  let rows;

  if (type === "mysql") {
    // Escape backticks correctly in MySQL query
    const [result] = await connection.execute(`DESCRIBE \`${tableName}\``);
    rows = result;
  } else {
    const result = await connection.execute(
      "SELECT column_name, data_type, nullable FROM user_tab_columns WHERE table_name = UPPER(:table)",
      { table: tableName },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    rows = result.rows;
  }

  let schema = `Table "${tableName}":\n`;
  for (const row of rows) {
    if (type === "mysql") {
      schema += `- ${row.Field}: ${row.Type}${
        row.Null === "NO" ? ", not null" : ""
      }\n`;
    } else {
      schema += `- ${row.COLUMN_NAME.toLowerCase()}: ${row.DATA_TYPE.toLowerCase()}${
        row.NULLABLE === "N" ? ", not null" : ""
      }\n`;
    }
  }
  return schema;
}

/**
 * Retrieves a limited number of rows from the specified table, and returns
 * a string representation of the data in a Markdown table format.
 *
 * @param connection - A valid database connection
 * @param type - The type of database ("mysql" or "oracle")
 * @param tableName - The name of the table to retrieve sample data from
 * @param limit - The maximum number of rows to retrieve (default is 5)
 * @returns A promise that resolves to a string representing the sample data,
 *          with each row on a new line in the format "<column1> | <column2> | ... | <columnN>"
 */
export async function getSampleData(
  connection: any,
  type: DBType,
  tableName: string,
  limit: number = 5
): Promise<string> {
  let rows;

  if (type === "mysql") {
    // Escape backticks correctly in MySQL query
    const [result] = await connection.execute(
      `SELECT * FROM \`${tableName}\` LIMIT ${limit}`
    );
    rows = result;
  } else {
    const result = await connection.execute(
      `SELECT * FROM ${tableName} FETCH FIRST ${limit} ROWS ONLY`,
      [],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    rows = result.rows;
  }

  if (!rows || rows.length === 0) return "No sample data available.\n";

  const headers = Object.keys(rows[0]);
  const table = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];

  for (let i = 0; i < rows.length; i++) {
    const normalized = normalizeRow(rows[i], i);
    const rowStr = headers
      .map((h) =>
        normalized[h] !== null && normalized[h] !== undefined
          ? normalized[h]
          : ""
      )
      .join(" | ");
    table.push(`| ${rowStr} |`);
  }
  return table.join("\n") + "\n";
}

/**
 * Extracts the schema and sample data for all tables in the specified database.
 *
 * @param connection - A valid database connection.
 * @param type - The type of database ("mysql" or "oracle").
 * @param emitStatus - An optional callback to report the progress, which includes
 *                     the current status, message, the specific table being processed,
 *                     and progress details (current and total).
 * @returns A promise that resolves to a string containing the schema and sample data
 *          for each table, formatted with the schema followed by the sample data.
 *          Each table's data is separated by two newline characters.
 *          If an error occurs while processing a table, the error message is included
 *          in the output for that table.
 * @throws An error if the schema extraction fails completely.
 */

export async function extractSchemaWithSamples(
  connection: any,
  type: DBType,
  emitStatus?: (
    status: ProcessStatus,
    message: string,
    table?: string,
    progress?: { current: number; total: number }
  ) => void
): Promise<string> {
  try {
    const tables = await getTables(connection, type, emitStatus);
    let result = "";

    emitStatus?.(
      ProcessStatus.GETTING_SCHEMA,
      `Found ${tables.length} tables. Retrieving schema and sample data...`
    );

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      try {
        emitStatus?.(
          ProcessStatus.GETTING_SCHEMA,
          `Processing table ${i + 1}/${tables.length}: ${table}`,
          table,
          { current: i + 1, total: tables.length }
        );

        const schema = await getTableSchema(connection, type, table);
        const samples = await getSampleData(connection, type, table);
        const tableData = schema + "\nSample Data:\n" + samples + "\n\n";
        result += tableData;
      } catch (error: any) {
        result += `Error processing table ${table}: ${error.message}\n\n`;
        emitStatus?.(
          ProcessStatus.ERROR,
          `Error processing table ${table}: ${error.message}`,
          table
        );
      }
    }

    return result.trim();
  } catch (error: any) {
    emitStatus?.(
      ProcessStatus.ERROR,
      `Failed to extract schema: ${error.message}`
    );
    throw new Error(`Failed to extract schema: ${error.message}`);
  }
}

import MemoryClient from "mem0ai";
import { ProcessStatus } from "../db/types";

const CUSTOM_PROMPT = `
    Please only extract entities containing database schema, table information, and data of the database. 
Here are some few shot examples:

Input: Error processing table.
Output: {"facts": []}

Input: Failed to extract schema:
Output: {"facts": []}

Input: Table \"chimei_lifetime\":\n- Mesin: text\n- Kode Part: text\n- Part: text\n- Qty: double\n- Category: text\n- Penggantian Terakhir: text\n- Lifetime (Bulan): double\n- Penggantian Selanjutnya: text\n- STATUS: text\n\nSample Data:\n| Mesin | Kode Part | Part | Qty | Category | Penggantian Terakhir | Lifetime (Bulan) | Penggantian Selanjutnya | STATUS |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| CHIMEI 1 | SPMEBE0296 | Bearing CF 8 A | NULL | Vital | 21/03/2024 | 6 | 21/09/2024 | Melewati Jadwal Penggantian |\n| CHIMEI 1 | SPWRCY0003 | Cylinder JG32X5 Chanto | NULL | Vital | 25/02/2025 | 24 | 25/02/2027 | 652 Hari Lagi |\n| CHIMEI 1 | SPECSW0149 | Magnet Catches Switch HMGR-T-150 Misumi | NULL | Essential | 19/04/2024 | 24 | 19/04/2026 | 340 Hari Lagi |\n| CHIMEI 1 | SPECSW0050 | Emergency Stop Button | NULL | Vital | 15/11/2023 | 36 | 15/11/2026 | 550 Hari Lagi |\n| CHIMEI 1 | SPMESG0061 | Per Tarik dia. kawat 1.5 dia. 12 x 10 | NULL | Vital | 16/04/2025 | 6 | 16/10/2025 | 155 Hari Lagi |\n\n\n
Output: {"facts": [
    "Database contains table 'chimei_lifetime' which tracks machine parts maintenance schedule and status",
    "Table 'chimei_lifetime' has 9 columns: Mesin, Kode Part, Part, Qty, Category, Penggantian Terakhir, Lifetime (Bulan), Penggantian Selanjutnya, and STATUS",
    "Column 'Mesin' is text type and stores machine identifiers (example value: 'CHIMEI 1')",
    "Column 'Kode Part' is text type and contains standardized part codes (format: SP + department code + item type + sequence number)",
    "Column 'Part' is text type and describes the specific component name and specifications (e.g., 'Bearing CF 8 A', 'Cylinder JG32X5 Chanto')",
    "Column 'Qty' is double type and indicates quantity, though sample shows NULL values",
    "Column 'Category' is text type with values like 'Vital' or 'Essential' indicating part importance level",
    "Column 'Penggantian Terakhir' is text type storing dates of last part replacement in DD/MM/YYYY format",
    "Column 'Lifetime (Bulan)' is double type representing part lifespan in months (values range from 6 to 36)",
    "Column 'Penggantian Selanjutnya' is text type showing scheduled next replacement date in DD/MM/YYYY format",
    "Column 'STATUS' is text type displaying maintenance status like 'Melewati Jadwal Penggantian' or '652 Hari Lagi'",
    "Table appears to be for maintenance scheduling system in Indonesian language",
    "The system calculates days remaining until next replacement based on installation date and lifetime",
    "Parts can be categorized as 'Vital' or 'Essential' which likely determines maintenance priority",
    "Most recent recorded maintenance was performed on 16/04/2025 for part 'Per Tarik dia. kawat 1.5 dia. 12 x 10'",
    "The table uses Indonesian terms where 'Penggantian Terakhir' means 'Last Replacement' and 'Penggantian Selanjutnya' means 'Next Replacement'"
]}

Input: Table \"inventory_status\":\n- product_id: integer (primary key)\n- product_name: varchar(100)\n- category: varchar(50)\n- quantity_in_stock: integer\n- reorder_level: integer\n- unit_price: decimal(10,2)\n- supplier_id: integer (foreign key)\n- last_updated: timestamp\n\nSample Data:\n| product_id | product_name | category | quantity_in_stock | reorder_level | unit_price | supplier_id | last_updated |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| 1001 | Laptop Dell XPS 13 | Electronics | 45 | 10 | 1299.99 | 5 | 2024-05-01 10:15:23 |\n| 1002 | Office Chair Ergonomic | Furniture | 23 | 5 | 189.50 | 8 | 2024-04-28 14:30:45 |\n| 1003 | Printer Ink Black | Office Supplies | 78 | 25 | 24.99 | 3 | 2024-05-02 09:45:12 |\n| 1004 | Wireless Mouse | Electronics | 5 | 15 | 34.50 | 5 | 2024-05-03 16:20:33 |\n| 1005 | Filing Cabinet | Furniture | 12 | 3 | 125.75 | 8 | 2024-04-15 11:05:19 |\n\n
Output: {"facts": [
    "Database contains table 'inventory_status' tracking product inventory information and stock levels",
    "Table 'inventory_status' has 8 columns: product_id, product_name, category, quantity_in_stock, reorder_level, unit_price, supplier_id, and last_updated",
    "Column 'product_id' is integer type and serves as the primary key for unique product identification",
    "Column 'product_name' is varchar(100) type storing descriptive product names (e.g., 'Laptop Dell XPS 13', 'Office Chair Ergonomic')",
    "Column 'category' is varchar(50) type categorizing products into groups like 'Electronics', 'Furniture', 'Office Supplies'",
    "Column 'quantity_in_stock' is integer type showing current available inventory for each product",
    "Column 'reorder_level' is integer type indicating threshold quantity at which new stock should be ordered",
    "Column 'unit_price' is decimal(10,2) type storing product price with precision to 2 decimal places",
    "Column 'supplier_id' is integer type and serves as foreign key linking to supplier information stored in another table",
    "Column 'last_updated' is timestamp type recording when inventory record was last modified (format: YYYY-MM-DD HH:MM:SS)",
    "The 'Wireless Mouse' product (ID 1004) is below its reorder level with only 5 units in stock while reorder level is 15",
    "Electronics category products are supplied by supplier with ID 5 based on sample data",
    "Furniture category products are supplied by supplier with ID 8 based on sample data",
    "Most expensive product in sample is 'Laptop Dell XPS 13' at $1299.99 per unit",
    "Most recently updated inventory record is for 'Wireless Mouse' on May 3, 2024",
    "Table structure suggests inventory management system with automated reordering capabilities based on defined thresholds"
]}

Return the facts and database information in a json format as shown above.
`;

/**
 * Creates an instance of the Mem0Client class using the MEM0_API_KEY environment
 * variable and a custom prompt for the AI to generate database information.
 *
 * @returns an instance of Mem0Client
 */
export function createMem0Client() {
  const mem0Client = new MemoryClient({
    apiKey: process.env.MEM0_API_KEY!,
    customPrompt: CUSTOM_PROMPT,
  });

  return mem0Client;
}

/**
 * Embeds a table of data into the user's knowledge base.
 *
 * The `tableData` parameter is expected to be a string containing a table of
 * data in the format produced by `getTableSchema` and `getSampleData`. The
 * `tableName` parameter is used to identify the table being embedded and is
 * used to construct the metadata for the embedded data.
 *
 * The `emitStatus` parameter is an optional callback function that is called
 * with status updates as the data is being embedded. The callback function
 * should accept three parameters: `status`, `message`, and `table`. The
 * `status` parameter is a value from the `ProcessStatus` enum and the `message`
 * parameter is a string describing the status. The `table` parameter is the
 * name of the table being embedded, or undefined if the status update is not
 * specific to a particular table.
 *
 * If an error occurs during embedding, the function will throw the error.
 *
 * @param mem0Client - an instance of the MemoryClient class
 * @param tableData - a string containing a table of data
 * @param userId - the ID of the user whose knowledge base is being updated
 * @param tableName - the name of the table being embedded
 * @param emitStatus - an optional callback function for status updates
 */
export async function embedTableData(
  mem0Client: MemoryClient,
  tableData: string,
  userId: string,
  tableName: string,
  emitStatus?: (status: ProcessStatus, message: string, table?: string) => void
): Promise<void> {
  try {
    emitStatus?.(
      ProcessStatus.EMBEDDING,
      `Embedding data for table ${tableName}...`,
      tableName
    );

    await mem0Client.add(tableData, {
      user_id: userId,
      metadata: {
        category: "database",
        tableName: tableName,
      },
    });

    emitStatus?.(
      ProcessStatus.EMBEDDING,
      `Successfully embedded data for table ${tableName}`,
      tableName
    );
  } catch (error: any) {
    emitStatus?.(
      ProcessStatus.ERROR,
      `Failed to embed data for table ${tableName}: ${error.message}`,
      tableName
    );
    throw error;
  }
}

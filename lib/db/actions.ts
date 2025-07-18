import { Pool } from "pg";
import { v4 as uuid } from "uuid";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const tableUserName = "tbl_mst_users_bejo";
const tableHistoryName = "tbl_trx_chat_history_bejo";

interface User {
  name: string;
  email: string;
  password: string;
  division: string;
  status: string;
  category?: string;
  role?: string;
}

interface ChatHistory {
  userId: string;
  threadId: string;
  messages: {
    role: string;
    content: string;
    timestamp: number;
  }[];
}

export async function getChatHistoryByThreadId(threadId: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM ${tableHistoryName} WHERE thread_id = $1 ORDER BY created_at ASC`,
      [threadId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error getting chat hustory by Thread ID: ", error);
    throw error;
  }
}

export async function getChatHistoryByUserId(userId: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM ${tableHistoryName} WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error getting chat hustory by User ID: ", error);
    throw error;
  }
}

export async function insertChatHistory(chatHistory: ChatHistory) {
  try {
    const existingThread = await pool.query(
      `SELECT * FROM ${tableHistoryName} WHERE thread_id = $1`,
      [chatHistory.threadId]
    );

    if (existingThread.rows.length > 0) {
      const result = await pool.query(
        `UPDATE ${tableHistoryName} SET messages = $1 WHERE thread_id = $2 RETURNING *}`,
        [JSON.stringify(chatHistory.messages), chatHistory.threadId]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO ${tableHistoryName} (id, thread_id, user_id, messages, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING *`,
        [
          chatHistory.threadId,
          chatHistory.userId,
          JSON.stringify(chatHistory.messages),
        ]
      );
      return result.rows[0];
    }
  } catch (error) {
    await pool.query(`ROLLBACK`);
    console.error("Error inserting chat history: ", error);
    throw error;
  } finally {
    await pool.query(`COMMIT`);
  }
}

export async function deleteChatHistory(threadId: string) {
  try {
    const result = await pool.query(
      `DELETE FROM ${tableHistoryName} WHERE thread_id = $1`,
      [threadId]
    );
    return result;
  } catch (error) {
    console.error("Error deleting chat history: ", error);
    throw error;
  }
}

export async function createUser(user: User) {
  const id = uuid();
  const { name, email, password, division, status, role, category } = user;
  const result = await pool.query(
    `INSERT INTO ${tableUserName} (id, name, email, password, division, status, role, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, name, email, password, division, status, role, category]
  );
  return result;
}

export async function getAllUsers() {
  const result = await pool.query(`SELECT * FROM ${tableUserName}`);
  return result.rows;
}

export async function getUserByEmail(email: string) {
  const result = await pool.query(
    `SELECT * FROM ${tableUserName} WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

export async function getByQuery(query: string) {
  const result = await pool.query(query);
  return result;
}

export async function updateUserStatuses(
  updates: {
    userId: string;
    status: User["status"];
    category?: User["category"];
    role?: User["role"];
  }[]
): Promise<void> {
  if (!updates?.length) {
    throw new Error("No updates provided");
  }

  const validStatuses: User["status"][] = ["approved", "pending", "rejected"];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const { userId, status, category, role } of updates) {
      if (!userId) {
        throw new Error("User ID is required");
      }

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(status);
      paramIndex++;

      if (category !== undefined) {
        updateFields.push(`category = $${paramIndex}`);
        updateValues.push(category);
        paramIndex++;
      }

      if (role !== undefined) {
        updateFields.push(`role = $${paramIndex}`);
        updateValues.push(role);
        paramIndex++;
      }

      updateValues.push(userId);

      const updateQuery = `
        UPDATE ${tableUserName} 
        SET ${updateFields.join(", ")} 
        WHERE id = $${paramIndex}
      `;

      const result = await client.query(updateQuery, updateValues);

      if (result.rowCount === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Failed to update statuses: ${(error as Error).message}`);
  } finally {
    client.release();
  }
}

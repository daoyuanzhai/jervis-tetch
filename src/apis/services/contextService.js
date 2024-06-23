import pool from "../clients/mysqlClient";
import { v4 as uuidv4 } from "uuid";

export async function setContext(appId, userId, conversationId, systemContext) {
  let conversation_id = conversationId;

  if (!conversation_id) {
    conversation_id = uuidv4();
  }

  const query = `
    INSERT INTO chat_context (app_id, user_id, conversation_id, system_context, modified_at)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      system_context = VALUES(system_context),
      modified_at = VALUES(modified_at)
  `;

  await pool.execute(query, [appId, userId, conversation_id, systemContext]);

  return conversation_id;
}

export async function getPresetContexts() {
  const query = `
    SELECT * FROM chat_context
    WHERE user_id = 'preset'
  `;

  const [rows] = await pool.execute(query);

  return rows;
}

export async function getContextById(id) {
  const query = `
    SELECT * FROM chat_context
    WHERE id = ?
  `;

  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) {
    throw new Error(`No record found with id: ${id}`);
  }

  return rows[0];
}

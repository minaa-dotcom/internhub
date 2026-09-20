const db = require("../config/dbConnection");

// Send a message
const sendMessage = async (messageData) => {
  const { 
    sender_id, 
    sender_email, 
    sender_name, 
    sender_role,
    receiver_id, 
    receiver_email, 
    receiver_name, 
    receiver_role,
    subject, 
    message 
  } = messageData;
  
  const query = `
    INSERT INTO public.messages (
      sender_id, sender_email, sender_name, sender_role,
      receiver_id, receiver_email, receiver_name, receiver_role,
      subject, message
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  
  const result = await db.query(query, [
    sender_id, sender_email, sender_name, sender_role,
    receiver_id, receiver_email, receiver_name, receiver_role,
    subject, message
  ]);
  
  return result.rows[0];
};

// Get all conversations for a user
const getConversations = async (userId) => {
  const query = `
    WITH latest_messages AS (
      SELECT DISTINCT ON (
        CASE 
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END
      )
        CASE 
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END as other_user_id,
        CASE 
          WHEN sender_id = $1 THEN receiver_email
          ELSE sender_email
        END as other_user_email,
        CASE 
          WHEN sender_id = $1 THEN receiver_name
          ELSE sender_name
        END as other_user_name,
        CASE 
          WHEN sender_id = $1 THEN receiver_role
          ELSE sender_role
        END as other_user_role,
        message as last_message,
        created_at as last_message_at,
        sender_id,
        is_read
      FROM public.messages
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY 
        CASE 
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END,
        created_at DESC
    )
    SELECT 
      lm.*,
      (
        SELECT COUNT(*)
        FROM public.messages
        WHERE receiver_id = $1 
        AND sender_id = lm.other_user_id
        AND is_read = FALSE
      ) as unread_count
    FROM latest_messages lm
    ORDER BY lm.last_message_at DESC
  `;
  
  const result = await db.query(query, [userId]);
  return result.rows;
};

// Get messages between two users
const getMessagesBetweenUsers = async (user1Id, user2Id) => {
  const query = `
    SELECT *
    FROM public.messages
    WHERE 
      (sender_id = $1 AND receiver_id = $2) OR
      (sender_id = $2 AND receiver_id = $1)
    ORDER BY created_at ASC
  `;
  
  const result = await db.query(query, [user1Id, user2Id]);
  return result.rows;
};

// Mark message as read
const markAsRead = async (messageId, userId) => {
  const query = `
    UPDATE public.messages
    SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND receiver_id = $2
    RETURNING *
  `;
  
  const result = await db.query(query, [messageId, userId]);
  return result.rows[0];
};

// Mark all messages from a user as read
const markAllAsRead = async (receiverId, senderId) => {
  const query = `
    UPDATE public.messages
    SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE
    RETURNING *
  `;
  
  const result = await db.query(query, [receiverId, senderId]);
  return result.rows;
};

// Get unread message count
const getUnreadCount = async (userId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM public.messages
    WHERE receiver_id = $1 AND is_read = FALSE
  `;
  
  const result = await db.query(query, [userId]);
  return parseInt(result.rows[0].count);
};

// Search messages
const searchMessages = async (userId, searchTerm) => {
  const query = `
    SELECT *
    FROM public.messages
    WHERE 
      (sender_id = $1 OR receiver_id = $1) AND
      (message ILIKE $2 OR subject ILIKE $2 OR sender_name ILIKE $2 OR receiver_name ILIKE $2)
    ORDER BY created_at DESC
    LIMIT 50
  `;
  
  const result = await db.query(query, [userId, `%${searchTerm}%`]);
  return result.rows;
};

// Delete message
const deleteMessage = async (messageId, userId) => {
  const query = `
    DELETE FROM public.messages
    WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
    RETURNING *
  `;
  
  const result = await db.query(query, [messageId, userId]);
  return result.rows[0];
};

module.exports = {
  sendMessage,
  getConversations,
  getMessagesBetweenUsers,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  searchMessages,
  deleteMessage
};

const db = require('../config/dbConnection');

async function createMessagesTable() {
  try {
    console.log('Creating messages table...\n');

    // Create messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL,
        sender_email VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        receiver_id UUID NOT NULL,
        receiver_email VARCHAR(255) NOT NULL,
        receiver_name VARCHAR(255) NOT NULL,
        receiver_role VARCHAR(50) NOT NULL,
        subject VARCHAR(500),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Messages table created successfully');

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
    `);

    console.log('✅ Indexes created successfully');

    // Create conversations view for easier querying
    await db.query(`
      CREATE OR REPLACE VIEW public.conversations AS
      SELECT DISTINCT
        CASE 
          WHEN sender_id < receiver_id THEN sender_id
          ELSE receiver_id
        END as user1_id,
        CASE 
          WHEN sender_id < receiver_id THEN receiver_id
          ELSE sender_id
        END as user2_id,
        CASE 
          WHEN sender_id < receiver_id THEN sender_email
          ELSE receiver_email
        END as user1_email,
        CASE 
          WHEN sender_id < receiver_id THEN receiver_email
          ELSE sender_email
        END as user2_email,
        CASE 
          WHEN sender_id < receiver_id THEN sender_name
          ELSE receiver_name
        END as user1_name,
        CASE 
          WHEN sender_id < receiver_id THEN receiver_name
          ELSE sender_name
        END as user2_name,
        MAX(created_at) as last_message_at
      FROM public.messages
      GROUP BY user1_id, user2_id, user1_email, user2_email, user1_name, user2_name;
    `);

    console.log('✅ Conversations view created successfully');

    console.log('\n✅ Messages system setup complete!');
    console.log('\nYou can now:');
    console.log('- Send messages between users');
    console.log('- View conversation history');
    console.log('- Track read/unread status');

  } catch (error) {
    console.error('❌ Error creating messages table:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createMessagesTable();

-- Setup script for user roles in chat system
-- Run these commands in your Supabase SQL editor
-- 1. Add role column to user_profiles table (if it doesn't exist)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'housekeeper';

-- 2. Update existing users with roles (replace with your actual user IDs)
-- You can find user IDs in your Supabase dashboard
-- Example: Update specific users with roles
-- UPDATE user_profiles SET role = 'manager' WHERE id = 'your-manager-user-id';
-- UPDATE user_profiles SET role = 'supervisor' WHERE id = 'your-supervisor-user-id';
-- UPDATE user_profiles SET role = 'housekeeper' WHERE id = 'your-housekeeper-user-id';
-- 3. Check current users and their roles
SELECT
  id,
  first_name,
  last_name,
  role,
  created_at
FROM
  user_profiles
ORDER BY
  created_at DESC;

-- 4. Create chat_messages table (if it doesn't exist)
CREATE TABLE
  IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    sender_id UUID REFERENCES user_profiles (id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES user_profiles (id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'direct' CHECK (message_type IN ('text', 'support', 'direct')),
    chat_room_id UUID,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
  );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages (sender_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages (receiver_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at);

-- 6. Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;

CREATE POLICY "Users can view their own messages" ON chat_messages FOR
SELECT
  USING (
    auth.uid () = sender_id
    OR auth.uid () = receiver_id
  );

DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;

CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT
WITH
  CHECK (auth.uid () = sender_id);

DROP POLICY IF EXISTS "Users can update their sent messages" ON chat_messages;

CREATE POLICY "Users can update their sent messages" ON chat_messages FOR
UPDATE USING (auth.uid () = sender_id);

-- 8. Test query to see all users with roles
SELECT
  id,
  first_name,
  last_name,
  role,
  CASE
    WHEN role = 'manager' THEN '🔴 Manager'
    WHEN role = 'supervisor' THEN '🟢 Supervisor'
    WHEN role = 'housekeeper' THEN '🔵 Housekeeper'
    ELSE '❓ Unknown Role'
  END as role_display
FROM
  user_profiles
ORDER BY
  role,
  first_name;

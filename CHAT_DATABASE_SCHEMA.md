# Chat Database Schema

## Required Tables for Role-Based Chat System

### 1. Update `user_profiles` table
Add a `role` column to your existing `user_profiles` table:

```sql
ALTER TABLE user_profiles
ADD COLUMN role VARCHAR(20) DEFAULT 'housekeeper';

-- Update existing users with roles (example)
UPDATE user_profiles SET role = 'manager' WHERE id = 'user-id-1';
UPDATE user_profiles SET role = 'supervisor' WHERE id = 'user-id-2';
UPDATE user_profiles SET role = 'housekeeper' WHERE id = 'user-id-3';
```

### 2. Create `chat_messages` table
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'direct' CHECK (message_type IN ('text', 'support', 'direct')),
  chat_room_id UUID,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

### 3. Row Level Security (RLS) Policies
Enable RLS and create policies for the `chat_messages` table:

```sql
-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON chat_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Policy: Users can only insert messages where they are the sender
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update messages they sent (for read status)
CREATE POLICY "Users can update their sent messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);
```

## Role-Based Visibility

The system supports three roles:
- **Manager**: Can see and chat with Manager, Supervisor, and Housekeeper
- **Supervisor**: Can see and chat with Manager, Supervisor, and Housekeeper
- **Housekeeper**: Can see and chat with Manager, Supervisor, and Housekeeper

All roles can see each other as requested.

## Usage

1. **Support Chat**: Uses existing `chat_support` table (unchanged)
2. **Direct Chat**: Uses new `chat_messages` table for real-time messaging between users
3. **Role Visibility**: Users can see colleagues based on their role permissions

## Testing

After setting up the database:

1. Update user profiles with roles
2. Test the chat functionality in the app
3. Verify that users can see appropriate colleagues
4. Test sending and receiving messages

## Notes

- The existing `chat_support` table remains unchanged for support messages
- The new `chat_messages` table handles direct user-to-user messaging
- All users with the three roles can see and chat with each other
- Messages are stored with timestamps and read status







are completely shift from redux to tanstack and zustand like the new
   project. You are to fix errors in the old project to ensure it compiles
   and builds smoothly. The old project codebase:
   /Users/anwarsadat/Desktop/WORK/4-Our-Life-App, the new project codebase:
   /Users/anwarsadat/Desktop/WORK/4OL_full/apps/mobile, investigate and make
   the transition. The tab navigation of the old project is located at:
   @/Users/anwarsadat/Desktop/WORK/4-Our-Life-App/src/navigation/BottomTabNav
   igation.tsx, you must refactor this codebase to look like the tab
   navigation of the new codebase and move it into the (auth)/(tabs) of the
   old codebase 
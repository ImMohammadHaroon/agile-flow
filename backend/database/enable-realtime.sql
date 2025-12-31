-- Enable Realtime for tables
-- Run this in your Supabase SQL Editor

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for community_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

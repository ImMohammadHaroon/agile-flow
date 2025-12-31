-- Add created_by column to users table to track who added each user
-- Run this in your Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_created_by ON public.users(created_by);

-- Update existing users to have NULL created_by (they were created during initial setup)
-- New users created through the system will have this field populated

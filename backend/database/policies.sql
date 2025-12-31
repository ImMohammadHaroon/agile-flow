-- Row Level Security (RLS) Policies for Agile Flow
-- Run this in your Supabase SQL Editor after schema.sql

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Users can read all users (for displaying names, etc.)
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Only HOD can insert new users (through admin functions)
CREATE POLICY "HOD can insert users"
    ON public.users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'HOD'
        )
    );

-- ==========================================
-- TASKS TABLE POLICIES
-- ==========================================

-- Users can view tasks assigned to them
CREATE POLICY "Users can view assigned tasks"
    ON public.tasks FOR SELECT
    USING (
        assigned_to = auth.uid() 
        OR assigned_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('HOD', 'Professor')
        )
    );

-- HOD can create tasks for anyone
CREATE POLICY "HOD can create tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'HOD'
        )
    );

-- Professors can create tasks for Students and Supporting Staff
CREATE POLICY "Professors can create tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u1
            WHERE u1.id = auth.uid() AND u1.role = 'Professor'
        )
        AND EXISTS (
            SELECT 1 FROM public.users u2
            WHERE u2.id = assigned_to AND u2.role IN ('Student', 'Supporting Staff')
        )
    );

-- Assigned users can update task status
CREATE POLICY "Assigned users can update task status"
    ON public.tasks FOR UPDATE
    USING (assigned_to = auth.uid())
    WITH CHECK (assigned_to = auth.uid());

-- Assigners can update their tasks
CREATE POLICY "Assigners can update tasks"
    ON public.tasks FOR UPDATE
    USING (assigned_by = auth.uid())
    WITH CHECK (assigned_by = auth.uid());

-- ==========================================
-- MESSAGES TABLE POLICIES (Private Chat)
-- ==========================================

-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their messages"
    ON public.messages FOR SELECT
    USING (
        sender_id = auth.uid() 
        OR receiver_id = auth.uid()
    );

-- HOD and Professors can send messages to each other
CREATE POLICY "HOD and Professors can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u1
            WHERE u1.id = auth.uid() AND u1.role IN ('HOD', 'Professor')
        )
        AND EXISTS (
            SELECT 1 FROM public.users u2
            WHERE u2.id = receiver_id AND u2.role IN ('HOD', 'Professor')
        )
        AND sender_id = auth.uid()
    );

-- Users can update read status of messages they receive
CREATE POLICY "Users can update received messages"
    ON public.messages FOR UPDATE
    USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());

-- ==========================================
-- COMMUNITY MESSAGES TABLE POLICIES
-- ==========================================

-- All authenticated users can view community messages
CREATE POLICY "All users can view community messages"
    ON public.community_messages FOR SELECT
    USING (true);

-- All authenticated users can send community messages
CREATE POLICY "All users can send community messages"
    ON public.community_messages FOR INSERT
    WITH CHECK (user_id = auth.uid());

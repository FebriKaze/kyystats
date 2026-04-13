-- Step 1: Check if statistics table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'statistics';

-- Step 2: Check current table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'statistics' ORDER BY ordinal_position;

-- Step 3: Try to add column with explicit schema
ALTER TABLE public.statistics ADD COLUMN chart_data TEXT;

-- If above fails, try this alternative:
-- Step 4: Check your permissions
SELECT current_user, session_user;

-- Step 5: Try with explicit user permission (if needed)
-- Note: This might require admin access

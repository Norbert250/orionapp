-- Fix duplicate progress entries

-- First, clean up existing duplicates by keeping only the latest entry per user/form_type
DELETE FROM form_progress 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, form_type) id 
  FROM form_progress 
  ORDER BY user_id, form_type, last_activity DESC
);

-- Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_form_session 
ON form_progress (user_id, form_type, session_id);

-- Alternative: If you want one active session per user/form_type
-- CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_form 
-- ON form_progress (user_id, form_type) 
-- WHERE status = 'in_progress';

SELECT 'Duplicates cleaned up and unique constraint added' as result;
-- Remove the unique constraint that prevents multiple sessions
DROP INDEX IF EXISTS unique_user_form_type;

-- Add a session_id column to track different form sessions
ALTER TABLE form_progress ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT gen_random_uuid();

-- Create unique constraint only for active sessions to prevent duplicates within same session
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_session 
ON form_progress (user_id, form_type, session_id) 
WHERE status = 'in_progress';

-- Check current records
SELECT user_id, form_type, session_id, step_name, status, created_at 
FROM form_progress 
ORDER BY created_at DESC;
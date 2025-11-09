-- Remove all constraints to allow simple inserts
DROP INDEX IF EXISTS unique_user_form_type;
DROP INDEX IF EXISTS unique_active_session;

-- Add session_id column if it doesn't exist
ALTER TABLE form_progress ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT gen_random_uuid();

-- Test insert
INSERT INTO form_progress (user_id, form_type, session_id, step_name, current_step, total_steps, progress_percentage, phone_number) 
VALUES ('53bf969e-f1ca-40db-a145-5b58541539c5', 'informal', gen_random_uuid(), 'Test Step', 0, 4, 0, '123456789');

-- Check records
SELECT user_id, form_type, session_id, step_name, created_at 
FROM form_progress 
ORDER BY created_at DESC;
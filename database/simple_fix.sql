-- Remove unique constraint and allow simple inserts
DROP INDEX IF EXISTS unique_active_form_progress;

-- Clear existing data
TRUNCATE TABLE form_progress;

-- Test insert
INSERT INTO form_progress (user_id, form_type, step_name, current_step, total_steps, progress_percentage, phone_number) 
VALUES ('53bf969e-f1ca-40db-a145-5b58541539c5', 'informal', 'Test Step', 0, 4, 0, '123456789');

-- Check if it worked
SELECT * FROM form_progress;
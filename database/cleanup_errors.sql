-- Minimal cleanup to stop PATCH errors

-- Remove any existing functions that might be running cleanup
DROP FUNCTION IF EXISTS cleanup_abandoned_sessions();
DROP FUNCTION IF EXISTS auto_abandon_old_sessions();

-- Remove any triggers that might be causing issues
DROP TRIGGER IF EXISTS auto_abandon_trigger ON form_progress;

-- Simple cleanup: mark very old sessions as abandoned (older than 1 hour)
UPDATE form_progress 
SET status = 'abandoned'
WHERE status = 'in_progress' 
  AND last_activity < NOW() - INTERVAL '1 hour';

-- Show current sessions
SELECT user_id, form_type, step_name, status, last_activity
FROM form_progress 
ORDER BY last_activity DESC;
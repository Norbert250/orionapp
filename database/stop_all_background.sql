-- Stop ALL background processes that could be making PATCH requests

-- Drop any functions that might be running
DROP FUNCTION IF EXISTS cleanup_abandoned_sessions() CASCADE;
DROP FUNCTION IF EXISTS auto_abandon_old_sessions() CASCADE;
DROP FUNCTION IF EXISTS mark_abandoned_sessions() CASCADE;

-- Drop any triggers
DROP TRIGGER IF EXISTS auto_abandon_trigger ON form_progress CASCADE;
DROP TRIGGER IF EXISTS cleanup_trigger ON form_progress CASCADE;

-- If using pg_cron extension, remove any scheduled jobs
-- SELECT cron.unschedule('abandon-cleanup') WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron');

-- Check for any existing cron jobs (if pg_cron is installed)
-- SELECT * FROM cron.job WHERE jobname LIKE '%abandon%' OR command LIKE '%form_progress%';

-- Show what's currently in the table
SELECT COUNT(*) as total_records, 
       COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_sessions,
       COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_sessions
FROM form_progress;
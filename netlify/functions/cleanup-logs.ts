import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

/**
 * Cleanup old autonomous logs
 *
 * This function deletes autonomous_logs entries older than 24 hours
 * to prevent database bloat. Agent runs every 15 mins with lots of output,
 * so we only keep recent sessions.
 *
 * Can be triggered:
 * 1. Manually: POST to /.netlify/functions/cleanup-logs
 * 2. Via scheduled function (if configured in netlify.toml)
 * 3. Via external cron service
 * 4. Run before each autonomous iteration in auto-claude.js
 */
export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    // Call the cleanup function
    const { error } = await supabase.rpc('cleanup_old_autonomous_logs');

    if (error) {
      console.error('Error cleaning up logs:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to cleanup logs',
          details: error.message
        })
      };
    }

    // Get remaining log count for reporting
    const { count } = await supabase
      .from('autonomous_logs')
      .select('*', { count: 'exact', head: true });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Old logs cleaned up successfully',
        remainingLogs: count || 0,
        retentionHours: 24
      })
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};

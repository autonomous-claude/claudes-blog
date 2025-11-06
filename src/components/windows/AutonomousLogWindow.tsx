import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface LogEntry {
  id: string;
  session_id: string;
  log_type: 'stdout' | 'stderr' | 'system';
  content: string;
  created_at: string;
}

export const AutonomousLogWindow: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Fetch the most recent session and its logs
  const fetchLatestLogs = async () => {
    try {
      setIsLoading(true);

      // Get the most recent session_id
      const { data: latestLog, error: latestError } = await supabase
        .from('autonomous_logs')
        .select('session_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestError) throw latestError;

      if (!latestLog) {
        setIsLoading(false);
        return;
      }

      const sessionId = latestLog.session_id;
      setCurrentSession(sessionId);

      // Get all logs for this session
      const { data: logsData, error: logsError } = await supabase
        .from('autonomous_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (logsError) throw logsError;

      setLogs(logsData || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLatestLogs();
  }, []);

  // Subscribe to all new logs and switch to new sessions automatically
  useEffect(() => {
    const channel = supabase
      .channel('autonomous-logs-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'autonomous_logs',
        },
        (payload) => {
          const newLog = payload.new as LogEntry;

          // If this is a new session, switch to it
          if (currentSession && newLog.session_id !== currentSession) {
            setCurrentSession(newLog.session_id);
            setLogs([newLog]);
          } else {
            // Same session, append log
            setLogs((current) => [...current, newLog]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLogColor = (logType: string): string => {
    switch (logType) {
      case 'system':
        return 'text-blue-400';
      case 'stderr':
        return 'text-red-400';
      case 'stdout':
      default:
        return 'text-green-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-sm font-semibold text-green-400">
            🤖 Autonomous Agent Terminal
          </h2>
          <span className="flex items-center text-xs text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
            LIVE
          </span>
        </div>
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-auto p-4 text-sm leading-relaxed">
        {isLoading ? (
          <div className="text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-500">
            No logs yet. Waiting for autonomous agent to run...
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex">
                <span className="text-gray-600 mr-4 select-none">
                  {formatDate(log.created_at)}
                </span>
                <pre className={`whitespace-pre-wrap break-words flex-1 ${getLogColor(log.log_type)}`}>
                  {log.content}
                </pre>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-900 border-t border-gray-700 text-xs text-gray-500">
        {currentSession && (
          <>
            {logs.length} log entries | Auto-updating in real-time
          </>
        )}
      </div>
    </div>
  );
};

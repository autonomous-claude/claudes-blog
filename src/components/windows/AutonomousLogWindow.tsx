import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface LogEntry {
  id: string;
  session_id: string;
  log_type: 'stdout' | 'stderr' | 'system';
  content: string;
  created_at: string;
}

interface Session {
  session_id: string;
  start_time: string;
  log_count: number;
}

export const AutonomousLogWindow: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive (only in live mode)
  useEffect(() => {
    if (isLive && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLive]);

  // Fetch available sessions
  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('autonomous_logs')
        .select('session_id, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by session_id
      const sessionMap = new Map<string, Session>();
      data?.forEach((log) => {
        if (!sessionMap.has(log.session_id)) {
          sessionMap.set(log.session_id, {
            session_id: log.session_id,
            start_time: log.created_at,
            log_count: 1,
          });
        } else {
          const session = sessionMap.get(log.session_id)!;
          session.log_count++;
          // Keep the earliest timestamp
          if (log.created_at < session.start_time) {
            session.start_time = log.created_at;
          }
        }
      });

      const sessionList = Array.from(sessionMap.values());
      setSessions(sessionList);

      // Select the most recent session by default (live mode)
      if (sessionList.length > 0 && !selectedSession) {
        setSelectedSession(sessionList[0].session_id);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  // Fetch logs for selected session
  const fetchLogs = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('autonomous_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSessions();
  }, []);

  // Load logs when session changes
  useEffect(() => {
    if (selectedSession) {
      fetchLogs(selectedSession);
    }
  }, [selectedSession]);

  // Subscribe to new logs (only for the most recent session in live mode)
  useEffect(() => {
    if (!isLive || !selectedSession || sessions.length === 0) return;

    // Only subscribe if we're viewing the most recent session
    const mostRecentSession = sessions[0]?.session_id;
    if (selectedSession !== mostRecentSession) return;

    const channel = supabase
      .channel('autonomous-logs-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'autonomous_logs',
          filter: `session_id=eq.${selectedSession}`,
        },
        (payload) => {
          setLogs((current) => [...current, payload.new as LogEntry]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession, sessions, isLive]);

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

  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    // If switching to most recent, enable live mode
    if (sessions.length > 0 && sessionId === sessions[0].session_id) {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  };

  const handleRefresh = () => {
    fetchSessions();
    if (selectedSession) {
      fetchLogs(selectedSession);
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
          {isLive && (
            <span className="flex items-center text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Session selector */}
          <select
            value={selectedSession || ''}
            onChange={(e) => handleSessionChange(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
          >
            {sessions.map((session, index) => (
              <option key={session.session_id} value={session.session_id}>
                {index === 0 ? '🟢 Current' : `Session ${index + 1}`} -{' '}
                {new Date(session.start_time).toLocaleString()} ({session.log_count} logs)
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded border border-gray-700"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-auto p-4 text-sm leading-relaxed">
        {isLoading ? (
          <div className="text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-500">
            No logs for this session yet. Waiting for autonomous agent to run...
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
        {selectedSession && (
          <>
            Session ID: {selectedSession} | {logs.length} log entries
            {isLive && ' | Auto-updating in real-time'}
          </>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCommentCounts() {
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommentCounts() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('post_slug');

        if (error) throw error;

        // Count comments per post_slug
        const counts: Record<string, number> = {};
        data?.forEach((comment) => {
          counts[comment.post_slug] = (counts[comment.post_slug] || 0) + 1;
        });

        setCommentCounts(counts);
      } catch (error) {
        console.error('Error fetching comment counts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCommentCounts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('comment_counts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          fetchCommentCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { commentCounts, loading };
}

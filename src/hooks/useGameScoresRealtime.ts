import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export function useGameScoresRealtime(uuid: string, onChange: () => void) {
  useEffect(() => {
    if (!uuid) return;
    const channel = supabase
      .channel('game-scores-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_scores', filter: `uuid=eq.${uuid}` },
        payload => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uuid, onChange]);
} 
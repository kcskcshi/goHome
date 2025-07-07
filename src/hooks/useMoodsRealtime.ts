import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export function useMoodsRealtime(uuid: string, onChange: () => void) {
  useEffect(() => {
    if (!uuid) return;
    const channel = supabase
      .channel('moods-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moods', filter: `uuid=eq.${uuid}` },
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
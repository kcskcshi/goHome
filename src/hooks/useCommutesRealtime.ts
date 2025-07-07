import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export function useCommutesRealtime(uuid: string, onChange: () => void) {
  useEffect(() => {
    if (!uuid) return;
    const channel = supabase
      .channel('commutes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commutes', filter: `uuid=eq.${uuid}` },
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
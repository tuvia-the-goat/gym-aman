
import { useMemo } from 'react';
import { Entry, Trainee } from '@/types';

export const useSummaryStats = (filteredEntries: Entry[], filteredTrainees: Trainee[]) => {
  // Average entries per trainee
  const avgEntriesPerTrainee = useMemo(() => {
    if (filteredTrainees.length === 0) return 0;
    return (filteredEntries.length / filteredTrainees.length).toFixed(1);
  }, [filteredEntries, filteredTrainees]);

  return {
    avgEntriesPerTrainee
  };
};

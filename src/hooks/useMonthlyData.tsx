
import { useMemo } from 'react';
import { Entry } from '@/types';

export const useMonthlyData = (filteredEntries: Entry[]) => {
  // Data for monthly entries - calculates averages
  const monthlyData = useMemo(() => {
    const monthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    
    const monthCounts = Array(12).fill(0);
    // Track unique dates (days) for each month to calculate averages
    const monthDateTracker: Record<number, Set<string>> = {};
    for (let i = 0; i < 12; i++) {
      monthDateTracker[i] = new Set();
    }
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const monthIndex = date.getMonth();
      monthCounts[monthIndex]++;
      monthDateTracker[monthIndex].add(entry.entryDate);
    });
    
    return monthNames.map((month, index) => {
      const uniqueDatesCount = monthDateTracker[index].size;
      return {
        name: month,
        value: monthCounts[index],
        average: uniqueDatesCount > 0 
          ? parseFloat((monthCounts[index] / uniqueDatesCount).toFixed(1)) 
          : 0
      };
    });
  }, [filteredEntries]);

  return monthlyData;
};


import { useMemo } from 'react';
import { Entry } from '@/types';

export const useWeekdayData = (filteredEntries: Entry[]) => {
  // Data for days of week chart - calculates averages
  const weekdaysData = useMemo(() => {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    // Track unique dates for each day of the week
    const dayDateTracker: Record<number, Set<string>> = {
      0: new Set(), 1: new Set(), 2: new Set(), 
      3: new Set(), 4: new Set(), 5: new Set(), 6: new Set()
    };
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayIndex = date.getDay();
      dayCounts[dayIndex]++;
      dayDateTracker[dayIndex].add(entry.entryDate);
    });
    
    return dayNames.map((day, index) => {
      const uniqueDatesCount = dayDateTracker[index].size;
      return {
        name: day,
        value: dayCounts[index],
        average: uniqueDatesCount > 0 
          ? parseFloat((dayCounts[index] / uniqueDatesCount).toFixed(1)) 
          : 0
      };
    });
  }, [filteredEntries]);

  return weekdaysData;
};


import { useMemo } from 'react';
import { isWithinInterval, parseISO, subMonths } from 'date-fns';
import { Trainee, Entry } from '@/types';
import { TraineeAnalytics } from '@/components/EntriesHistory/types';

export const useTraineeAnalytics = (trainee: Trainee | null, entries: Entry[], trainees: Trainee[]): TraineeAnalytics | null => {
  return useMemo(() => {
    if (!trainee) return null;

    const sixMonthsAgo = subMonths(new Date(), 6);
    
    // Filter entries for this trainee and from the last 6 months
    const traineeEntries = entries.filter(entry => 
      entry.traineeId === trainee._id && 
      isAfter(parseISO(entry.entryDate), sixMonthsAgo)
    );
    
    // Calculate hourly distribution
    const hourCounts: Record<string, number> = {};
    traineeEntries.forEach(entry => {
      const hour = entry.entryTime.split(':')[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const hourData = Object.keys(hourCounts)
      .map(hour => ({
        name: `${hour}:00`,
        count: hourCounts[hour]
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
    
    // Calculate daily distribution
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayCounts: Record<string, number> = {};
    
    traineeEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayOfWeek = dayNames[date.getDay()];
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
    });
    
    const dayData = dayNames.map(day => ({
      name: day,
      count: dayCounts[day] || 0
    }));
    
    // Calculate monthly average (over the last 6 months)
    const monthsMap = new Set<string>();
    traineeEntries.forEach(entry => {
      monthsMap.add(entry.entryDate.substring(0, 7)); // YYYY-MM format
    });
    
    const monthCount = monthsMap.size || 1;
    const monthlyAverage = traineeEntries.length / monthCount;
    
    // Calculate percentile among all trainees
    const allTraineeEntryCounts = trainees.map(t => {
      const count = entries.filter(e => 
        e.traineeId === t._id && 
        isAfter(parseISO(e.entryDate), sixMonthsAgo)
      ).length;
      
      return {
        traineeId: t._id,
        count
      };
    }).sort((a, b) => b.count - a.count);
    
    const rank = allTraineeEntryCounts.findIndex(t => t.traineeId === trainee._id) + 1;
    const percentile = Math.round((1 - rank / trainees.length) * 100);
    
    return {
      hourData,
      dayData,
      monthlyAverage: monthlyAverage.toFixed(1),
      percentile: percentile > 0 ? percentile : 0,
      totalEntries: traineeEntries.length
    };
  }, [trainee, entries, trainees]);
};

function isAfter(date: Date, dateToCompare: Date): boolean {
  return date.getTime() > dateToCompare.getTime();
}

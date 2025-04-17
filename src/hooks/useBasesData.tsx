
import { useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { useAdmin } from '../context/AdminContext';

export const useBasesData = (startDate?: Date, endDate?: Date) => {
  const { admin, entries, bases, departments } = useAdmin();
  const isGeneralAdmin = admin?.role === 'generalAdmin';
  
  // Helper function to get base name
  function getBaseName(id: string): string {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  }
  
  // Helper function to get department name
  function getDepartmentName(id: string): string {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  }
  

  // Bases data (only for all bases admin)
  const basesData = useMemo(() => {
    if (admin?.role !== 'generalAdmin') return [];
    
    // Filter entries only by date range if date filters are active
    let entriesForChart = entries;
    
    if (startDate && endDate) {
      entriesForChart = entriesForChart.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }
    
    // Filter to include only successful entries
    entriesForChart = entriesForChart.filter(entry => entry.status === 'success');
    
    const baseCounts: { [key: string]: number } = {};
    
    entriesForChart.forEach(entry => {
      const baseId = entry.baseId;
      baseCounts[baseId] = (baseCounts[baseId] || 0) + 1;
    });
    
    return Object.entries(baseCounts)
      .map(([baseId, count]) => ({
        name: getBaseName(baseId),
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [admin, entries, startDate, endDate]);

  return {
    basesData,
    isGeneralAdmin,
    getBaseName,
    getDepartmentName,
  };
};

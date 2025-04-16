
import { useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { Entry, Trainee } from '@/types';
import { useAdmin } from '../context/AdminContext';

export const useTopPerformers = (
  filteredEntries: Entry[], 
  filteredTrainees: Trainee[], 
  hasSpecificFilters: boolean, 
  startDate?: Date, 
  endDate?: Date
) => {
  const { admin, entries, departments, bases } = useAdmin();
  
  // Helper functions to get names
  function getDepartmentName(id: string): string {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  }
  
  function getBaseName(id: string): string {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  }

  // Top trainees data - uses filtered entries when specific trainees are selected
  const topTraineesData = useMemo(() => {
    // Use filteredTrainees and filteredEntries if specific filters are active
    const traineeCounts = filteredTrainees.map(trainee => {
      const count = filteredEntries.filter(entry => entry.traineeId === trainee._id).length;
      return { 
        id: trainee._id, 
        name: trainee.fullName, 
        count, 
        departmentId: trainee.departmentId,
        baseId: trainee.baseId
      };
    });
    
    return traineeCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(trainee => ({
        name: trainee.name,
        value: trainee.count,
        departmentName: getDepartmentName(trainee.departmentId),
        baseName: getBaseName(trainee.baseId)
      }));
  }, [filteredEntries, filteredTrainees]);
  
  // Top departments data - always show top 5 regardless of trainee/department filters
  const topDepartmentsData = useMemo(() => {
    // Filter entries only by date range if date filters are active
    let entriesForTopChart = entries;
    
    // Apply only date filters and admin role filter for top charts
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      entriesForTopChart = entriesForTopChart.filter(entry => entry.baseId === admin.baseId);
    }
    
    if (startDate && endDate) {
      entriesForTopChart = entriesForTopChart.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }
    
    // Filter to include only successful entries
    entriesForTopChart = entriesForTopChart.filter(entry => entry.status === 'success');
    
    const departmentCounts: { [key: string]: number } = {};
    
    entriesForTopChart.forEach(entry => {
      const deptId = entry.departmentId;
      departmentCounts[deptId] = (departmentCounts[deptId] || 0) + 1;
    });
    
    return Object.entries(departmentCounts)
      .map(([deptId, count]) => ({
        id: deptId,
        name: getDepartmentName(deptId),
        value: count,
        baseId: departments.find(d => d._id === deptId)?.baseId || '',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(dept => ({
        name: dept.name,
        value: dept.value,
        baseName: getBaseName(dept.baseId)
      }));
  }, [entries, departments, admin, startDate, endDate]);

  return {
    topTraineesData,
    topDepartmentsData,
    getDepartmentName,
    getBaseName
  };
};

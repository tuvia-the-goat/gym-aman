import { useMemo } from 'react';
import { isWithinInterval, parseISO, differenceInYears } from 'date-fns';
import { useAdmin } from '../context/AdminContext';

export const useAnalyticsData = (
  filteredEntries: any[],
  filteredTrainees: any[],
  startDate?: Date,
  endDate?: Date,
  hasSpecificFilters = false
) => {
  const { admin, entries, departments, bases } = useAdmin();
  const isGeneralAdmin = admin?.role === 'generalAdmin';

  // Data for days of week chart - now calculates averages
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
  
  // Data for monthly entries - now calculates averages
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
  
  // Gender distribution data for trainees
  const genderDistributionData = useMemo(() => {
    const maleFemaleCount = {
      male: 0,
      female: 0
    };
    
    filteredTrainees.forEach(trainee => {
      if (trainee.gender === 'male') {
        maleFemaleCount.male++;
      } else if (trainee.gender === 'female') {
        maleFemaleCount.female++;
      }
    });
    
    return [
      { name: 'זכר', value: maleFemaleCount.male, color: '#3b82f6' },
      { name: 'נקבה', value: maleFemaleCount.female, color: '#ec4899' }
    ];
  }, [filteredTrainees]);
  
  // Gender distribution data for entries
  const genderEntriesDistributionData = useMemo(() => {
    const maleFemaleEntries = {
      male: 0,
      female: 0
    };
    
    // Map of trainee ID to gender
    const traineeGenderMap = new Map();
    filteredTrainees.forEach(trainee => {
      traineeGenderMap.set(trainee._id, trainee.gender);
    });
    
    // Count entries by gender
    filteredEntries.forEach(entry => {
      const gender = traineeGenderMap.get(entry.traineeId);
      if (gender === 'male') {
        maleFemaleEntries.male++;
      } else if (gender === 'female') {
        maleFemaleEntries.female++;
      }
    });
    
    return [
      { name: 'זכר', value: maleFemaleEntries.male, color: '#3b82f6' },
      { name: 'נקבה', value: maleFemaleEntries.female, color: '#ec4899' }
    ];
  }, [filteredEntries, filteredTrainees]);
  
  // Age distribution data
  const ageDistributionData = useMemo(() => {
    const today = new Date();
    const ageMap = new Map<number, number>();
    
    filteredTrainees.forEach(trainee => {
      if (trainee.birthDate) {
        const birthDate = parseISO(trainee.birthDate);
        const age = differenceInYears(today, birthDate);
        
        ageMap.set(age, (ageMap.get(age) || 0) + 1);
      }
    });
    
    return Array.from(ageMap.entries()).map(([age, count]) => ({
      age,
      count
    }));
  }, [filteredTrainees]);
  
  // Detailed trainee data for personal info display
  const detailedTraineeAgeData = useMemo(() => {
    const today = new Date();
    
    return filteredTrainees
      .filter(trainee => trainee.birthDate)
      .map(trainee => {
        const birthDate = parseISO(trainee.birthDate);
        const age = differenceInYears(today, birthDate);
        
        return {
          _id: trainee._id,
          age,
          fullName: trainee.fullName,
          gender: trainee.gender,
          medicalProfile: trainee.medicalProfile,
          departmentName: getDepartmentName(trainee.departmentId)
        };
      });
  }, [filteredTrainees]);
  
  // Top trainees data - now uses filtered entries when specific trainees are selected
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
  
  // Average entries per trainee
  const avgEntriesPerTrainee = useMemo(() => {
    if (filteredTrainees.length === 0) return 0;
    return (filteredEntries.length / filteredTrainees.length).toFixed(1);
  }, [filteredEntries, filteredTrainees]);
  
  // Helper functions to get names
  function getDepartmentName(id: string): string {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  }
  
  function getBaseName(id: string): string {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  }

  return {
    weekdaysData,
    monthlyData,
    topTraineesData,
    topDepartmentsData,
    basesData,
    genderDistributionData,
    genderEntriesDistributionData,
    ageDistributionData,
    detailedTraineeAgeData,
    avgEntriesPerTrainee,
    isGeneralAdmin,
    getDepartmentName,
    getBaseName
  };
};

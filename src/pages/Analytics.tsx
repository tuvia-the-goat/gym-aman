
import React, { useMemo, useState } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';

// Import refactored components
import FilterHeader from '../components/analytics/FilterHeader';
import FilterDialog from '../components/analytics/FilterDialog';
import ActiveFilters from '../components/analytics/ActiveFilters';
import SummaryStats from '../components/analytics/SummaryStats';
import WeekdayChart from '../components/analytics/WeekdayChart';
import MonthlyChart from '../components/analytics/MonthlyChart';
import TopTraineesChart from '../components/analytics/TopTraineesChart';
import TopDepartmentsChart from '../components/analytics/TopDepartmentsChart';
import BasesChart from '../components/analytics/BasesChart';

const Analytics = () => {
  const { admin, entries, trainees, departments, bases } = useAdmin();
  
  // Filtering state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  
  // Filter data based on admin role and filters
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    
    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }
    
    // Department filter
    if (selectedDepartmentIds.length > 0) {
      filtered = filtered.filter(entry => selectedDepartmentIds.includes(entry.departmentId));
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(entry => selectedTrainees.includes(entry.traineeId));
    }
    
    return filtered;
  }, [admin, entries, startDate, endDate, selectedDepartmentIds, selectedTrainees]);
  
  const filteredTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    // Department filter
    if (selectedDepartmentIds.length > 0) {
      filtered = filtered.filter(trainee => selectedDepartmentIds.includes(trainee.departmentId));
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(trainee => selectedTrainees.includes(trainee._id));
    }
    
    return filtered;
  }, [admin, trainees, selectedDepartmentIds, selectedTrainees]);
  
  // Get available departments for filtering
  const availableDepartments = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return departments.filter(dept => dept.baseId === admin.baseId);
    }
    return departments;
  }, [admin, departments]);
  
  // Get available trainees for filtering
  const availableTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    return filtered;
  }, [admin, trainees]);
  
  // Group trainees by department for the UI
  const traineesByDepartment = useMemo(() => {
    const grouped: Record<string, typeof trainees> = {};
    
    // Filter trainees by selected departments if any are selected
    let filteredTrainees = availableTrainees;
    
    // Group the trainees by department
    filteredTrainees.forEach(trainee => {
      if (!grouped[trainee.departmentId]) {
        grouped[trainee.departmentId] = [];
      }
      grouped[trainee.departmentId].push(trainee);
    });
    
    return grouped;
  }, [availableTrainees]);
  
  // Check if specific filters are active
  const hasDateFilters = Boolean(startDate || endDate);
  const hasSpecificFilters = selectedDepartmentIds.length > 0 || selectedTrainees.length > 0;
  
  // Data for days of week chart - always visible even with filters
  const weekdaysData = useMemo(() => {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const dayIndex = date.getDay();
      dayCounts[dayIndex]++;
    });
    
    return dayNames.map((day, index) => ({
      name: day,
      value: dayCounts[index],
    }));
  }, [filteredEntries]);
  
  // Data for monthly entries - always visible even with filters
  const monthlyData = useMemo(() => {
    const monthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    
    const monthCounts = Array(12).fill(0);
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.entryDate);
      const monthIndex = date.getMonth();
      monthCounts[monthIndex]++;
    });
    
    return monthNames.map((month, index) => ({
      name: month,
      value: monthCounts[index],
    }));
  }, [filteredEntries]);
  
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
  
  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDepartmentIds([]);
    setSelectedTrainees([]);
  };
  
  // Clear individual filter groups
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const clearDepartmentFilters = () => {
    setSelectedDepartmentIds([]);
  };
  
  const clearTraineeFilters = () => {
    setSelectedTrainees([]);
  };
  
  // Handle trainee selection toggle
  const toggleTrainee = (traineeId: string) => {
    setSelectedTrainees(prev => 
      prev.includes(traineeId) 
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  };
  
  // Toggle entire department selection
  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartmentIds(prev => {
      if (prev.includes(departmentId)) {
        // If department is already selected, remove it
        return prev.filter(id => id !== departmentId);
      } else {
        // If department is not selected, add it
        return [...prev, departmentId];
      }
    });
    
    // Also update trainee selection based on department toggle
    const departmentTrainees = traineesByDepartment[departmentId] || [];
    const traineeIds = departmentTrainees.map(trainee => trainee._id);
    
    if (selectedDepartmentIds.includes(departmentId)) {
      // If department is already selected, remove all its trainees
      setSelectedTrainees(prev => prev.filter(id => !traineeIds.includes(id)));
    }
  };

  const hasActiveFilters = Boolean(startDate || endDate || selectedDepartmentIds.length > 0 || selectedTrainees.length > 0);
  const isGeneralAdmin = admin?.role === 'generalAdmin';

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-8 animate-fade-up">
        {/* Filter Header */}
        <FilterHeader 
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          openFilterDialog={() => setShowFilterDialog(true)}
        />
        
        {/* Filter Dialog */}
        <FilterDialog 
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          selectedDepartmentIds={selectedDepartmentIds}
          setSelectedDepartmentIds={setSelectedDepartmentIds}
          selectedTrainees={selectedTrainees}
          setSelectedTrainees={setSelectedTrainees}
          availableDepartments={availableDepartments}
          traineesByDepartment={traineesByDepartment}
          clearFilters={clearFilters}
          toggleDepartment={toggleDepartment}
          toggleTrainee={toggleTrainee}
          getDepartmentName={getDepartmentName}
          getBaseName={getBaseName}
          isGeneralAdmin={isGeneralAdmin}
        />
        
        {/* Active Filters Display */}
        <ActiveFilters 
          startDate={startDate}
          endDate={endDate}
          selectedDepartmentIds={selectedDepartmentIds}
          selectedTrainees={selectedTrainees}
          clearDateFilters={clearDateFilters}
          clearDepartmentFilters={clearDepartmentFilters}
          clearTraineeFilters={clearTraineeFilters}
        />
        
        {/* Summary Stats */}
        <SummaryStats 
          entriesCount={filteredEntries.length}
          traineesCount={filteredTrainees.length}
          avgEntriesPerTrainee={avgEntriesPerTrainee}
        />
        
        {/* Main Charts - always visible, even with specific filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entries by Day of Week */}
          <WeekdayChart data={weekdaysData} />
          
          {/* Monthly Entries */}
          <MonthlyChart data={monthlyData} />
        </div>
        
        {/* Top Trainees and Departments - always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Trainees */}
          <TopTraineesChart 
            data={topTraineesData} 
            hasSpecificFilters={hasSpecificFilters}
            showBaseColumn={isGeneralAdmin}
          />
          
          {/* Top Departments - only show if no specific filters active */}
          {!hasSpecificFilters && (
            <TopDepartmentsChart 
              data={topDepartmentsData}
              showBaseColumn={isGeneralAdmin}
            />
          )}
        </div>
        
        {/* Bases Chart (only for allBasesAdmin) and no specific filters */}
        {isGeneralAdmin && !hasSpecificFilters && basesData.length > 0 && (
          <BasesChart data={basesData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

import { useState, useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { useAdmin } from '../context/AdminContext';

export const useAnalyticsFilters = () => {
  const { admin, entries, trainees, departments, subDepartments } = useAdmin();
  
  // Filtering state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedSubDepartmentIds, setSelectedSubDepartmentIds] = useState<string[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  
  // Filter data based on admin role and filters
  const filteredEntries = useMemo(() => {
    // Start with only successful entries
    let filtered = entries.filter(entry => entry.status === 'success');
    
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
    
    // SubDepartment filter
    if (selectedSubDepartmentIds.length > 0) {
      filtered = filtered.filter(entry => 
        entry.subDepartmentId && selectedSubDepartmentIds.includes(entry.subDepartmentId)
      );
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(entry => selectedTrainees.includes(entry.traineeId));
    }
    
    return filtered;
  }, [admin, entries, startDate, endDate, selectedDepartmentIds, selectedSubDepartmentIds, selectedTrainees]);
  
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
    
    // SubDepartment filter
    if (selectedSubDepartmentIds.length > 0) {
      filtered = filtered.filter(trainee => 
        trainee.subDepartmentId && selectedSubDepartmentIds.includes(trainee.subDepartmentId)
      );
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(trainee => selectedTrainees.includes(trainee._id));
    }
    
    return filtered;
  }, [admin, trainees, selectedDepartmentIds, selectedSubDepartmentIds, selectedTrainees]);
  
  // Get available departments for filtering
  const availableDepartments = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return departments.filter(dept => dept.baseId === admin.baseId);
    }
    return departments;
  }, [admin, departments]);
  
  // Get available subDepartments for filtering
  const availableSubDepartments = useMemo(() => {
    let filtered = subDepartments;
    
    // Filter by selected departments if any
    if (selectedDepartmentIds.length > 0) {
      filtered = filtered.filter(subDept => selectedDepartmentIds.includes(subDept.departmentId));
    }
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      const baseDeptsIds = departments
        .filter(dept => dept.baseId === admin.baseId)
        .map(dept => dept._id);
      
      filtered = filtered.filter(subDept => baseDeptsIds.includes(subDept.departmentId));
    }
    
    return filtered;
  }, [admin, departments, subDepartments, selectedDepartmentIds]);
  
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
    
    // Filter trainees by selected departments if any
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
  const hasSpecificFilters = selectedDepartmentIds.length > 0 || 
    selectedSubDepartmentIds.length > 0 ||
    selectedTrainees.length > 0;
  const hasActiveFilters = hasDateFilters || hasSpecificFilters;
  
  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDepartmentIds([]);
    setSelectedSubDepartmentIds([]);
    setSelectedTrainees([]);
  };
  
  // Clear individual filter groups
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const clearDepartmentFilters = () => {
    setSelectedDepartmentIds([]);
    setSelectedSubDepartmentIds([]);
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
  
  // Toggle subDepartment selection
  const toggleSubDepartment = (subDepartmentId: string) => {
    setSelectedSubDepartmentIds(prev => {
      if (prev.includes(subDepartmentId)) {
        // If subDepartment is already selected, remove it
        return prev.filter(id => id !== subDepartmentId);
      } else {
        // If subDepartment is not selected, add it
        return [...prev, subDepartmentId];
      }
    });
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedDepartmentIds,
    setSelectedDepartmentIds,
    selectedSubDepartmentIds,
    setSelectedSubDepartmentIds,
    selectedTrainees,
    setSelectedTrainees,
    showFilterDialog,
    setShowFilterDialog,
    filteredEntries,
    filteredTrainees,
    availableDepartments,
    availableSubDepartments,
    availableTrainees,
    traineesByDepartment,
    hasDateFilters,
    hasSpecificFilters,
    hasActiveFilters,
    clearFilters,
    clearDateFilters,
    clearDepartmentFilters,
    clearTraineeFilters,
    toggleTrainee,
    toggleDepartment,
    toggleSubDepartment
  };
};

import { useState, useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { useAdmin } from '../context/AdminContext';

export const useAnalyticsFilters = () => {
  const { admin, entries, trainees, mainFrameworks } = useAdmin();
  
  // Filtering state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedMainFrameworkIds, setSelectedMainFrameworkIds] = useState<string[]>([]);
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
    
    // Main framework filter
    if (selectedMainFrameworkIds.length > 0) {
      filtered = filtered.filter(entry => selectedMainFrameworkIds.includes(entry.mainFrameworkId));
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(entry => selectedTrainees.includes(entry.traineeId));
    }
    
    return filtered;
  }, [admin, entries, startDate, endDate, selectedMainFrameworkIds, selectedTrainees]);
  
  const filteredTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    // Main framework filter
    if (selectedMainFrameworkIds.length > 0) {
      filtered = filtered.filter(trainee => selectedMainFrameworkIds.includes(trainee.mainFrameworkId));
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(trainee => selectedTrainees.includes(trainee._id));
    }
    
    return filtered;
  }, [admin, trainees, selectedMainFrameworkIds, selectedTrainees]);
  
  // Get available main frameworks for filtering
  const availableMainFrameworks = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return mainFrameworks.filter(framework => framework.baseId === admin.baseId);
    }
    return mainFrameworks;
  }, [admin, mainFrameworks]);
  
  // Get available trainees for filtering
  const availableTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    return filtered;
  }, [admin, trainees]);
  
  // Group trainees by main framework for the UI
  const traineesByMainFramework = useMemo(() => {
    const grouped: Record<string, typeof trainees> = {};
    
    // Filter trainees by selected main frameworks if any are selected
    let filteredTrainees = availableTrainees;
    
    // Group the trainees by main framework
    filteredTrainees.forEach(trainee => {
      if (!grouped[trainee.mainFrameworkId]) {
        grouped[trainee.mainFrameworkId] = [];
      }
      grouped[trainee.mainFrameworkId].push(trainee);
    });
    
    return grouped;
  }, [availableTrainees]);

  // Check if specific filters are active
  const hasDateFilters = Boolean(startDate || endDate);
  const hasSpecificFilters = selectedMainFrameworkIds.length > 0 || selectedTrainees.length > 0;
  const hasActiveFilters = hasDateFilters || hasSpecificFilters;
  
  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedMainFrameworkIds([]);
    setSelectedTrainees([]);
  };
  
  // Clear individual filter groups
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const clearMainFrameworkFilters = () => {
    setSelectedMainFrameworkIds([]);
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
  
  // Toggle entire main framework selection
  const toggleMainFramework = (mainFrameworkId: string) => {
    setSelectedMainFrameworkIds(prev => {
      if (prev.includes(mainFrameworkId)) {
        // If main framework is already selected, remove it
        return prev.filter(id => id !== mainFrameworkId);
      } else {
        // If main framework is not selected, add it
        return [...prev, mainFrameworkId];
      }
    });
    
    // Also update trainee selection based on main framework toggle
    const frameworkTrainees = traineesByMainFramework[mainFrameworkId] || [];
    const traineeIds = frameworkTrainees.map(trainee => trainee._id);
    
    if (selectedMainFrameworkIds.includes(mainFrameworkId)) {
      // If main framework is already selected, remove all its trainees
      setSelectedTrainees(prev => prev.filter(id => !traineeIds.includes(id)));
    }
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedMainFrameworkIds,
    setSelectedMainFrameworkIds,
    selectedTrainees,
    setSelectedTrainees,
    showFilterDialog,
    setShowFilterDialog,
    filteredEntries,
    filteredTrainees,
    availableMainFrameworks,
    availableTrainees,
    traineesByMainFramework,
    hasDateFilters,
    hasSpecificFilters,
    hasActiveFilters,
    clearFilters,
    clearDateFilters,
    clearMainFrameworkFilters,
    clearTraineeFilters,
    toggleTrainee,
    toggleMainFramework
  };
};

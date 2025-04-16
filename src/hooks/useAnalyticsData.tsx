
import { useWeekdayData } from './useWeekdayData';
import { useMonthlyData } from './useMonthlyData';
import { useGenderDistribution } from './useGenderDistribution';
import { useAgeDistribution } from './useAgeDistribution';
import { useTopPerformers } from './useTopPerformers';
import { useBasesData } from './useBasesData';
import { useSummaryStats } from './useSummaryStats';
import { useMedicalProfileDistribution } from './useMedicalProfileDistribution';
import { Entry, Trainee } from '@/types';
import { useAdmin } from '../context/AdminContext';

export const useAnalyticsData = (
  filteredEntries: Entry[],
  filteredTrainees: Trainee[],
  startDate?: Date,
  endDate?: Date,
  hasSpecificFilters = false
) => {
  const { admin } = useAdmin();
  
  // Import data from smaller hooks
  const weekdaysData = useWeekdayData(filteredEntries);
  const monthlyData = useMonthlyData(filteredEntries);
  
  const { genderDistributionData, genderEntriesDistributionData } = 
    useGenderDistribution(filteredTrainees, filteredEntries);
  
  const { ageDistributionData, detailedTraineeAgeData } = 
    useAgeDistribution(filteredTrainees);
  
  const { topTraineesData, topDepartmentsData, getDepartmentName, getBaseName } = 
    useTopPerformers(filteredEntries, filteredTrainees, hasSpecificFilters, startDate, endDate);
  
  const { basesData, isGeneralAdmin } = 
    useBasesData(startDate, endDate);
  
  const { avgEntriesPerTrainee } = 
    useSummaryStats(filteredEntries, filteredTrainees);
    
  const { medicalProfileData } = 
    useMedicalProfileDistribution(filteredTrainees);

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
    medicalProfileData,
    avgEntriesPerTrainee,
    isGeneralAdmin,
    getDepartmentName,
    getBaseName
  };
};


import { useMemo } from 'react';
import { differenceInYears, parseISO } from 'date-fns';
import { Trainee } from '@/types';
import { useAdmin } from '../context/AdminContext';

export const useAgeDistribution = (filteredTrainees: Trainee[]) => {
  const { departments } = useAdmin();
  
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

  // Helper function to get department name
  function getDepartmentName(id: string): string {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  }

  return {
    ageDistributionData,
    detailedTraineeAgeData
  };
};

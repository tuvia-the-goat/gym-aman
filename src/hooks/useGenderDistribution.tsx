
import { useMemo } from 'react';
import { Trainee, Entry } from '@/types';

export const useGenderDistribution = (filteredTrainees: Trainee[], filteredEntries: Entry[]) => {
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

  return {
    genderDistributionData,
    genderEntriesDistributionData
  };
};

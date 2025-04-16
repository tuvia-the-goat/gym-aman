
import { useMemo } from 'react';
import { Trainee } from '@/types';

interface MedicalProfileData {
  name: string;
  value: number;
  color: string;
}

const PROFILE_COLORS = {
  '21': '#10b981', // emerald-500
  '24': '#3b82f6', // blue-500
  '25': '#8b5cf6', // violet-500
  '45': '#f59e0b', // amber-500
  '64': '#ef4444', // red-500
  '72': '#ec4899', // pink-500
  '82': '#6366f1', // indigo-500
  '97': '#0ea5e9', // sky-500
  'other': '#6b7280', // gray-500
};

export const useMedicalProfileDistribution = (trainees: Trainee[]) => {
  const medicalProfileData = useMemo(() => {
    const profileCounts: Record<string, number> = {};
    
    // Count occurrences of each medical profile
    trainees.forEach(trainee => {
      const profile = trainee.medicalProfile;
      if (!profileCounts[profile]) {
        profileCounts[profile] = 0;
      }
      profileCounts[profile]++;
    });
    
    // Convert to chart data format
    const data: MedicalProfileData[] = Object.entries(profileCounts)
      .map(([profile, count]) => ({
        name: profile,
        value: count,
        color: PROFILE_COLORS[profile as keyof typeof PROFILE_COLORS] || PROFILE_COLORS.other
      }))
      .sort((a, b) => b.value - a.value); // Sort by count descending
    
    return data;
  }, [trainees]);
  
  return { medicalProfileData };
};

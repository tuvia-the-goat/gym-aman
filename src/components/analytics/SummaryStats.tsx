
import React from 'react';

interface SummaryStatsProps {
  entriesCount: number;
  traineesCount: number;
  avgEntriesPerTrainee: string | number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ 
  entriesCount, 
  traineesCount, 
  avgEntriesPerTrainee 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <h3 className="text-lg font-medium mb-2">סך הכל כניסות</h3>
        <p className="text-4xl font-bold">{entriesCount}</p>
      </div>
      
      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <h3 className="text-lg font-medium mb-2">סך הכל מתאמנים</h3>
        <p className="text-4xl font-bold">{traineesCount}</p>
      </div>
      
      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <h3 className="text-lg font-medium mb-2">ממוצע כניסות למתאמן</h3>
        <p className="text-4xl font-bold">{avgEntriesPerTrainee}</p>
      </div>
    </div>
  );
};

export default SummaryStats;

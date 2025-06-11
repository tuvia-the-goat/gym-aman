import React from 'react';
import { Loader2 } from 'lucide-react';

interface SummaryStatsProps {
  entriesCount: number;
  traineesCount: number;
  avgEntriesPerTrainee: string | number;
  isLoadingEntries?: boolean;
  isLoadingTrainees?: boolean;
  isLoadingAvg?: boolean;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ 
  entriesCount, 
  traineesCount, 
  avgEntriesPerTrainee,
  isLoadingEntries = false,
  isLoadingTrainees = false,
  isLoadingAvg = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <h3 className="text-lg font-medium mb-2">סך הכל כניסות</h3>
        {isLoadingEntries ? (
          <div className="h-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <p className="text-4xl font-bold">{entriesCount}</p>
        )}
      </div>
      
      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <h3 className="text-lg font-medium mb-2">סך הכל מתאמנים</h3>
        {isLoadingTrainees ? (
          <div className="h-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <p className="text-4xl font-bold">{traineesCount === 0 ? '--' : traineesCount}</p>
        )}
      </div>
      
      {traineesCount > 0 && (
        <div className="bg-card shadow-sm rounded-lg p-6 border">
          <h3 className="text-lg font-medium mb-2">ממוצע כניסות למתאמן</h3>
          {isLoadingAvg ? (
            <div className="h-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-4xl font-bold">{avgEntriesPerTrainee}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryStats;

import React from 'react';
import { Activity } from 'lucide-react';
import { TraineeAnalytics } from './types';

interface ActivityStatsSummaryProps {
  traineeAnalytics: TraineeAnalytics;
}

const ActivityStatsSummary: React.FC<ActivityStatsSummaryProps> = ({ traineeAnalytics }) => {
  return (
    <div className="glass p-3 rounded-lg border border-border/30 shadow-sm">
      <h3 className="font-semibold text-base mb-2 flex items-center">
        <Activity className="h-4 w-4 ml-1.5 text-primary" />
        סטטיסטיקה (6 חודשים אחרונים)
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-primary/5 p-2 rounded-md text-center border border-primary/10 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-primary">
            {traineeAnalytics.monthlyAverage}
          </div>
          <div className="text-xs text-muted-foreground">כניסות בחודש (ממוצע)</div>
        </div>
        
        <div className="bg-primary/5 p-2 rounded-md text-center border border-primary/10">
          <div className="text-xs text-muted-foreground">מתאמן יותר מ-</div>
          <div className="text-2xl font-bold text-primary">
            {traineeAnalytics.percentile}%
          </div>
          <div className="text-xs text-muted-foreground">מהמשתמשים</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatsSummary;

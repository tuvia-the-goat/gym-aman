
import React from 'react';
import { Activity } from 'lucide-react';
import { TraineeAnalytics } from './types';

interface ActivityStatsSummaryProps {
  traineeAnalytics: TraineeAnalytics;
}

const ActivityStatsSummary: React.FC<ActivityStatsSummaryProps> = ({ traineeAnalytics }) => {
  return (
    <div className="glass p-5 rounded-xl border border-border/30 shadow-sm">
      <h3 className="font-semibold text-xl mb-4 flex items-center">
        <Activity className="h-5 w-5 ml-2 text-primary" />
        סטטיסטיקה (6 חודשים אחרונים)
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/10">
          <div className="text-3xl mt-3 font-bold text-primary">
            {traineeAnalytics.monthlyAverage}
          </div>
          <div className="text-sm text-muted-foreground">כניסות בחודש (ממוצע)</div>
        </div>
        
        <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/10">
          <div className="text-sm text-muted-foreground">מתאמן יותר מ-</div>
          <div className="text-3xl font-bold text-primary">
            {traineeAnalytics.percentile}%
          </div>
          <div className="text-sm text-muted-foreground">מהמשתמשים</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatsSummary;

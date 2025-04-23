
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, AlertTriangle } from 'lucide-react';
import { Trainee } from '@/types';
import { useAdmin } from '../../context/AdminContext';
import { useTraineeAnalytics } from '../../hooks/useTraineeAnalytics';

// Import the new components
import TraineeDetailsSection from './TraineeDetailsSection';
import MedicalDetailsSection from './MedicalDetailsSection';
import ActivityStatsSummary from './ActivityStatsSummary';
import WeekdayDistributionChart from './WeekdayDistributionChart';
import HourlyDistributionChart from './HourlyDistributionChart';

interface TraineeProfileDialogProps {
  trainee: Trainee | null;
  updateMedicalApproval: (approved: boolean) => Promise<void>;
}

const TraineeProfileDialog: React.FC<TraineeProfileDialogProps> = ({
  trainee,
  updateMedicalApproval
}) => {
  const { entries, trainees } = useAdmin();
  const traineeAnalytics = useTraineeAnalytics(trainee, entries, trainees);

  if (!trainee) return null;

  return (
    <DialogContent className="w-[1600] h-[1000] max-w-none" style={{ direction: "rtl" }}>
      <DialogHeader style={{ textAlign: "right" }}>
        <DialogTitle className="flex items-center text-2xl font-bold">
          <User className="h-6 w-6 text-primary ml-2" />
          {trainee.fullName}
          {trainee.orthopedicCondition && (
            <span className="inline-flex items-center mr-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md">
              <AlertTriangle className="h-3 w-3 ml-1" />
              סעיף אורטופדי
            </span>
          )}
          {trainee.medicalLimitation && (
            <span className="inline-flex items-center mr-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-md">
              <AlertTriangle className="h-3 w-3 ml-1" />
              מגבלה רפואית
            </span>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
        {/* Left column - Personal details */}
        <div className="space-y-6">
          <TraineeDetailsSection trainee={trainee} />
          <MedicalDetailsSection trainee={trainee} updateMedicalApproval={updateMedicalApproval} />
        </div>
        
        {/* Right column - Activity data */}
        <div className="space-y-6">
          {traineeAnalytics && (
            <>
              <ActivityStatsSummary traineeAnalytics={traineeAnalytics} />
              <WeekdayDistributionChart traineeAnalytics={traineeAnalytics} />
              <HourlyDistributionChart traineeAnalytics={traineeAnalytics} />
            </>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default TraineeProfileDialog;

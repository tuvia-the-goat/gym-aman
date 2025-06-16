import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, AlertTriangle, Loader2 } from "lucide-react";
import { Trainee, PopulatedTrainee } from "@/types";
import { useAdmin } from "../../context/AdminContext";
import { useQuery } from "@tanstack/react-query";
import { traineeService } from "@/services/api";

// Import the new components
import TraineeDetailsSection from "./TraineeDetailsSection";
import MedicalDetailsSection from "./MedicalDetailsSection";
import ActivityStatsSummary from "./ActivityStatsSummary";
import WeekdayDistributionChart from "./WeekdayDistributionChart";
import HourlyDistributionChart from "./HourlyDistributionChart";
import { TraineeAnalytics } from "./types";
import { fetchTraineeAnalytics } from "@/services/api";

interface TraineeProfileDialogProps {
  trainee: Trainee | null;
}

const TraineeProfileDialog: React.FC<TraineeProfileDialogProps> = ({
  trainee,
}) => {
  const { admin } = useAdmin();

  // Fetch populated trainee data
  const { data: populatedTrainee } = useQuery<PopulatedTrainee>({
    queryKey: ['trainee', trainee?._id],
    queryFn: async () => {
      const response = await traineeService.getById(trainee!._id);
      return response as unknown as PopulatedTrainee;
    },
    enabled: !!trainee?._id
  });

  const { data: traineeAnalytics, isLoading } = useQuery({
    queryKey: ['traineeAnalytics', trainee?._id],
    queryFn: () => trainee?._id ? fetchTraineeAnalytics(trainee._id) : null,
    enabled: !!trainee?._id
  });

  if (!trainee || !populatedTrainee) return null;

  return (
    <DialogContent
      className="w-[50vw] max-w-none overflow-y-auto"
      style={{ direction: "rtl" }}
    >
      <DialogHeader style={{ textAlign: "right" }}>
        <DialogTitle className="flex items-center text-2xl font-bold flex-wrap gap-2 mb-1">
          <User className="h-10 w-10 text-primary ml-2" />
          {trainee.fullName}
          {trainee.orthopedicCondition && (
            <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded-md">
              <AlertTriangle className="h-4 w-4 ml-1.5" />
              סעיף אורטופדי
            </span>
          )}
          {trainee.medicalLimitation && (
            <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded-md">
              <AlertTriangle className="h-4 w-4 ml-1.5" />
              מגבלה רפואית
            </span>
          )}

        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 py-1.5 overflow-y-auto">
        {/* Left column - Personal details */}
        <div className="space-y-3">
          <TraineeDetailsSection trainee={populatedTrainee} />
          <MedicalDetailsSection
            trainee={trainee}
          />
        </div>

        {/* Right column - Activity data */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-[100%]">
              <Loader2 className="h-20 w-20 animate-spin text-primary" />
            </div>
          ) : traineeAnalytics ? (
            <>
              <ActivityStatsSummary traineeAnalytics={traineeAnalytics} />
              <WeekdayDistributionChart traineeAnalytics={traineeAnalytics} />
              <HourlyDistributionChart traineeAnalytics={traineeAnalytics} />
            </>
          ) : null}
        </div>
      </div>
    </DialogContent>
  );
};

export default TraineeProfileDialog;

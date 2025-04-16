import React from 'react';
import { format, parseISO } from 'date-fns';
import { Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Trainee } from '@/types';
interface MedicalDetailsSectionProps {
  trainee: Trainee;
  updateMedicalApproval: (approved: boolean) => Promise<void>;
}
const MedicalDetailsSection: React.FC<MedicalDetailsSectionProps> = ({
  trainee,
  updateMedicalApproval
}) => {
  const hasExpiredMedicalApproval = !trainee.medicalApproval.approved || trainee.medicalApproval.expirationDate && new Date(trainee.medicalApproval.expirationDate) < new Date();
  return <div className="glass p-5 rounded-xl border border-border/30 shadow-sm">
      <h3 className="font-semibold text-xl mb-4 flex items-center">
        <Shield className="h-5 w-5 ml-2 text-primary" />
        פרטים רפואיים
      </h3>
      
      <div className="space-y-4">
        <div className={`bg-card/50 p-4 rounded-lg flex items-center gap-3 border ${hasExpiredMedicalApproval ? 'border-destructive/30' : 'border-green-500/30'}`}>
          <div className={`bg-${hasExpiredMedicalApproval ? 'destructive' : 'green-500'}/10 p-2 rounded-full`}>
            <Shield className={`h-4 w-4 ${hasExpiredMedicalApproval ? 'text-destructive' : 'text-green-500'}`} />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">אישור רפואי</div>
            <div className={`font-medium ${hasExpiredMedicalApproval ? 'text-destructive' : 'text-green-600'}`}>
              {trainee.medicalApproval.approved ? trainee.medicalApproval.expirationDate ? `בתוקף עד ${format(parseISO(trainee.medicalApproval.expirationDate), 'dd/MM/yyyy')}` : 'בתוקף' : 'לא בתוקף'}
            </div>
          </div>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            {trainee.orthopedicCondition ? <CheckCircle2 className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">סעיף אורטופדי</div>
            <div className={`font-medium ${trainee.orthopedicCondition ? 'text-amber-600' : ''}`}>
              {trainee.orthopedicCondition ? 'יש' : 'אין'}
            </div>
          </div>
        </div>
        
        {trainee.medicalLimitation && <div className="bg-card/50 p-4 rounded-lg flex items-start gap-3 border border-border/30">
            <div className="bg-amber-500/10 p-2 rounded-full mt-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">מגבלה רפואית</div>
              <div className="font-medium text-amber-600 mt-1">
                {trainee.medicalLimitation}
              </div>
            </div>
          </div>}
        
        
      </div>
    </div>;
};
export default MedicalDetailsSection;
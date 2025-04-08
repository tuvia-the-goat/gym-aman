
import React, { useState } from 'react';
import { Trainee, Department, MedicalFormScore } from '../types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Edit2, Check, X } from 'lucide-react';
import { format, parseISO, addYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { traineeService } from '../services/api';

interface TraineeProfileProps {
  trainee: Trainee;
  departments: Department[];
  onUpdate: (updatedTrainee: Trainee) => void;
  readOnly?: boolean;
}

const TraineeProfile: React.FC<TraineeProfileProps> = ({ 
  trainee, 
  departments, 
  onUpdate,
  readOnly = false 
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [orthopedicCondition, setOrthopedicCondition] = useState(trainee.orthopedicCondition);
  const [medicalFormScore, setMedicalFormScore] = useState<MedicalFormScore>(trainee.medicalFormScore);
  const [medicalCertificateProvided, setMedicalCertificateProvided] = useState(trainee.medicalCertificateProvided || false);
  const [medicalLimitation, setMedicalLimitation] = useState(trainee.medicalLimitation || '');
  
  // Medical approval calculation
  const shouldAutomaticallyApprove = (formScore: MedicalFormScore, certificateProvided: boolean) => {
    return formScore === 'fullScore' || 
           formScore === 'notRequired' || 
           formScore === 'reserve' || 
           (formScore === 'partialScore' && certificateProvided);
  };
  
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(dept => dept._id === departmentId);
    return department ? department.name : 'לא ידוע';
  };
  
  const getMedicalFormScoreText = (score: MedicalFormScore) => {
    switch (score) {
      case 'notRequired': return 'לא נזקק/ה למילוי שאלון';
      case 'fullScore': return '100 נקודות';
      case 'partialScore': return 'פחות מ-100 נקודות';
      case 'reserve': return 'מיל\' או אע"צ, מילא/ה שאלון נפרד';
      default: return '';
    }
  };
  const getPhoneNumberFormat = (phoneNumberToFormat : string) => {
    return `${phoneNumberToFormat.slice(0,3)}-${phoneNumberToFormat.slice(3,10)}`
  }  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    // Reset form fields to original values
    setOrthopedicCondition(trainee.orthopedicCondition);
    setMedicalFormScore(trainee.medicalFormScore);
    setMedicalCertificateProvided(trainee.medicalCertificateProvided || false);
    setMedicalLimitation(trainee.medicalLimitation || '');
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      
      // Determine if medical approval should be granted automatically
      const approved = shouldAutomaticallyApprove(medicalFormScore, medicalCertificateProvided);
      
      // Calculate expiration date (1 year from now if approved)
      const expirationDate = approved ? addYears(new Date(), 1).toISOString().split('T')[0] : null;
      
      // Update medical approval
      const updatedTrainee = await traineeService.updateMedicalApproval(
        trainee._id,
        {
          approved,
          expirationDate,
          medicalFormScore,
          medicalCertificateProvided: medicalFormScore === 'partialScore' ? medicalCertificateProvided : undefined,
          medicalLimitation,
          orthopedicCondition
        }
      );
      
      onUpdate(updatedTrainee);
      
      toast({
        title: "עדכון הצליח",
        description: "פרטי המתאמן עודכנו בהצלחה",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון הפרטים",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'תאריך לא תקין';
    }
  };
  
  const hasExpiredMedicalApproval = 
    !trainee.medicalApproval.approved || 
    (trainee.medicalApproval.expirationDate && 
     new Date(trainee.medicalApproval.expirationDate) < new Date());

  return (
    <div className="glass p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{trainee.fullName}</h2>
        {!readOnly && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSave} 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center ml-2"
                >
                  <Check className="h-4 w-4 ml-1" />
                  שמור
                </Button>
                <Button 
                  onClick={handleCancel} 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center"
                >
                  <X className="h-4 w-4 ml-1" />
                  בטל
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleEdit} 
                size="sm" 
                variant="outline" 
                className="flex items-center"
              >
                <Edit2 className="h-4 w-4 ml-1" />
                ערוך פרופיל
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">מספר אישי</h3>
            <p className="font-medium">{trainee.personalId}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">פרופיל רפואי</h3>
            <p className="font-medium">{trainee.medicalProfile}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">מחלקה</h3>
            <p className="font-medium">{getDepartmentName(trainee.departmentId)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">טלפון</h3>
            <p className="font-medium">{getPhoneNumberFormat(trainee.phoneNumber)}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">מין</h3>
            <p className="font-medium">{trainee.gender === 'male' ? 'זכר' : 'נקבה'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">תאריך לידה</h3>
            <p className="font-medium">{formatDate(trainee.birthDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">סטטוס אישור רפואי</h3>
            <div className={`flex items-center ${hasExpiredMedicalApproval ? 'text-destructive' : 'text-green-600'}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${hasExpiredMedicalApproval ? 'bg-destructive' : 'bg-green-600'}`}></span>
              <p className="font-medium">
                {trainee.medicalApproval.approved 
                  ? (trainee.medicalApproval.expirationDate 
                    ? `בתוקף עד ${formatDate(trainee.medicalApproval.expirationDate)}` 
                    : 'בתוקף')
                  : 'לא בתוקף'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border mt-6 pt-6">
        <h3 className="text-lg font-semibold mb-4">פרטים רפואיים</h3>
        
        <div className="space-y-6">
          {/* Orthopedic Condition */}
          <div className="flex items-center">
            {isEditing ? (
              <div className="flex items-center">
                <input
                  id="orthopedicCondition"
                  type="checkbox"
                  checked={orthopedicCondition}
                  onChange={(e) => setOrthopedicCondition(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ml-2"
                />
                <label htmlFor="orthopedicCondition" className="text-sm font-medium">
                  סעיף פרופיל אורטופדי
                </label>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">סעיף פרופיל אורטופדי</h4>
                <p className="font-medium">{orthopedicCondition ? 'כן' : 'לא'}</p>
              </div>
            )}
          </div>
          
          {/* Medical Form Score */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">ציון שאלון א"ס</h4>
            {isEditing ? (
              <select
                value={medicalFormScore}
                onChange={(e) => setMedicalFormScore(e.target.value as MedicalFormScore)}
                className="input-field w-full"
              >
                <option value="notRequired">לא נזקק/ה למילוי שאלון</option>
                <option value="fullScore">100 נקודות</option>
                <option value="partialScore">פחות מ-100 נקודות</option>
                <option value="reserve">מיל' או אע"צ, מילא/ה שאלון נפרד</option>
              </select>
            ) : (
              <p className="font-medium">{getMedicalFormScoreText(trainee.medicalFormScore)}</p>
            )}
          </div>
          
          {/* Medical Certificate */}
          {(isEditing && medicalFormScore === 'partialScore') || (!isEditing && trainee.medicalFormScore === 'partialScore') ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">הוצג אישור רפואי</h4>
              {isEditing ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center ml-4">
                    <input
                      type="radio"
                      id="certificateYes"
                      name="medicalCertificate"
                      checked={medicalCertificateProvided}
                      onChange={() => setMedicalCertificateProvided(true)}
                      className="ml-2"
                    />
                    <label htmlFor="certificateYes" className="text-sm">
                      כן
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="certificateNo"
                      name="medicalCertificate"
                      checked={!medicalCertificateProvided}
                      onChange={() => setMedicalCertificateProvided(false)}
                      className="ml-2"
                    />
                    <label htmlFor="certificateNo" className="text-sm">
                      לא
                    </label>
                  </div>
                </div>
              ) : (
                <p className="font-medium">{trainee.medicalCertificateProvided ? 'כן' : 'לא'}</p>
              )}
            </div>
          ) : null}
          
          {/* Medical Limitation */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">מגבלה רפואית</h4>
            {isEditing ? (
              <Textarea
                value={medicalLimitation}
                onChange={(e) => setMedicalLimitation(e.target.value)}
                className="min-h-[80px]"
                placeholder="הזן מגבלות רפואיות אם קיימות"
              />
            ) : (
              <p className="font-medium">{trainee.medicalLimitation || 'אין'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraineeProfile;

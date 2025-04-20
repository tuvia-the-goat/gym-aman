// src/components/EntriesHistory/TraineeDetailsSection.tsx

import React from 'react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { 
  User, 
  Phone, 
  Building, 
  Activity, 
  Calendar as CalendarIcon,
  File,
  Layers
} from 'lucide-react';
import { Trainee } from '@/types';
import { useAdmin } from '../../context/AdminContext';

interface TraineeDetailsSectionProps {
  trainee: Trainee;
}

const TraineeDetailsSection: React.FC<TraineeDetailsSectionProps> = ({ trainee }) => {
  const { departments, bases, subDepartments } = useAdmin();
  
  // Get department name
  const getDepartmentName = (id: string) => {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : 'לא ידוע';
  };

  // Get subDepartment name
  const getSubDepartmentName = (id: string) => {
    if (!id) return 'לא ידוע';
    const subDepartment = subDepartments.find(subDept => subDept._id === id);
    return subDepartment ? subDepartment.name : 'לא ידוע';
  };

  // Get base name
  const getBaseName = (id: string) => {
    const base = bases.find(base => base._id === id);
    return base ? base.name : 'לא ידוע';
  };

  // Format phone number
  const formatPhoneNumber = (phoneNumber: string) => {
    return `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3,10)}`;
  };

  // Calculate age
  const calculateAge = (birthDate: string) => {
    try {
      return differenceInYears(new Date(), parseISO(birthDate));
    } catch (error) {
      return 'לא ידוע';
    }
  };

  return (
    <div className="glass p-5 rounded-xl border border-border/30 shadow-sm">
      <h3 className="font-semibold text-xl mb-4 flex items-center">
        <File className="h-5 w-5 ml-2 text-primary" />
        פרטי מתאמן
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <File className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">מספר אישי</div>
            <div className="font-medium">{trainee.personalId}</div>
          </div>
        </div>
        
        <div className="bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">מסגרת</div>
            <div className="font-medium">{getDepartmentName(trainee.departmentId)}</div>
          </div>
        </div>
        
        {/* Add SubDepartment info */}
        <div className="bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">תת-מסגרת</div>
            <div className="font-medium">{trainee.subDepartmentId ? getSubDepartmentName(trainee.subDepartmentId) : 'לא משויך'}</div>
          </div>
        </div>
        
        <div className="bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">בסיס</div>
            <div className="font-medium">{getBaseName(trainee.baseId)}</div>
          </div>
        </div>
        
        <div className="bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">מין</div>
            <div className="font-medium">{trainee.gender === 'male' ? 'זכר' : 'נקבה'}</div>
          </div>
        </div>
        
        <div className="bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <CalendarIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">גיל</div>
            <div className="font-medium">
              {trainee.birthDate ? calculateAge(trainee.birthDate) : 'לא ידוע'}
            </div>
          </div>
        </div>
        
        <div className="bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">טלפון</div>
            <div className="font-medium direction-ltr">
              {formatPhoneNumber(trainee.phoneNumber)}
            </div>
          </div>
        </div>
        
        <div className="col-span-2 bg-card/50 p-3 rounded-lg flex items-center gap-3 border border-border/30">
          <div className="bg-primary/10 p-2 rounded-full">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">פרופיל רפואי</div>
            <div className="font-medium">{trainee.medicalProfile}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraineeDetailsSection;
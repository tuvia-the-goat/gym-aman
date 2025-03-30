
import React, { useState } from 'react';
import { Department, Base, Trainee } from '../../types';
import { traineeService } from '../../services/api';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  selectedBase: Base;
  departments: Department[];
  trainees: Trainee[];
  setTrainees: (trainees: Trainee[]) => void;
}

const RegistrationForm = ({ 
  selectedBase, 
  departments, 
  trainees, 
  setTrainees 
}: RegistrationFormProps) => {
  const { toast } = useToast();
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [departmentId, setDepartmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
  };

  const validatePhoneNumber = (phone: string) => {
    return /^05\d{8}$/.test(phone);
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBase) {
      toast({
        title: "שגיאה",
        description: "יש לבחור בסיס",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePersonalId(personalId)) {
      toast({
        title: "שגיאה",
        description: "מספר אישי חייב להיות בדיוק 7 ספרות",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "שגיאה",
        description: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב-05",
        variant: "destructive",
      });
      return;
    }
    
    const existingTrainee = trainees.find(t => t.personalId === personalId);
    if (existingTrainee) {
      toast({
        title: "שגיאה",
        description: "מספר אישי כבר קיים במערכת",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newTrainee = await traineeService.create({
        personalId,
        fullName,
        medicalProfile: medicalProfile as '97' | '82' | '72' | '64' | '45' | '25',
        departmentId,
        phoneNumber,
        baseId: selectedBase._id
      });
      
      setTrainees([...trainees, newTrainee]);
      
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setDepartmentId('');
      setPhoneNumber('');
      
      toast({
        title: "הרשמה הצליחה",
        description: "המתאמן נרשם בהצלחה למערכת",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הרשמת המתאמן",
        variant: "destructive",
      });
      console.error('Registration error:', error);
    }
  };

  const filteredDepartments = departments.filter(
    dept => selectedBase && dept.baseId === selectedBase._id
  );

  return (
    <div className="glass max-w-xl mx-auto p-8 rounded-2xl animate-fade-up">
      <h3 className="text-xl font-bold mb-4 text-center">הצטרפות למערכת</h3>
      <form onSubmit={handleRegistration} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="personalId" className="block text-sm font-medium">
              מספר אישי (7 ספרות)
            </label>
            <input
              id="personalId"
              type="text"
              inputMode="numeric"
              value={personalId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                setPersonalId(value);
              }}
              className="input-field"
              placeholder="1234567"
              required
              autoComplete="off"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium">
              שם מלא
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="שם פרטי ומשפחה"
              required
              autoComplete="off"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="medicalProfile" className="block text-sm font-medium">
              פרופיל רפואי
            </label>
            <select
              id="medicalProfile"
              value={medicalProfile}
              onChange={(e) => setMedicalProfile(e.target.value)}
              className="input-field"
              required
            >
              <option value="">בחר פרופיל</option>
              <option value="97">97</option>
              <option value="82">82</option>
              <option value="72">72</option>
              <option value="64">64</option>
              <option value="45">45</option>
              <option value="25">25</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="department" className="block text-sm font-medium">
              מחלקה
            </label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">בחר מחלקה</option>
              {filteredDepartments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              מספר טלפון (10 ספרות, מתחיל ב-05)
            </label>
            <input
              id="phoneNumber"
              type="text"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneNumber(value);
              }}
              className="input-field"
              placeholder="05XXXXXXXX"
              required
              autoComplete="off"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium shadow-md
          transition duration-300 hover:bg-primary/90 hover:shadow-lg"
        >
          הצטרף
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;


import React, { useState } from 'react';
import { Department, Base } from '../../types';
import { useToast } from '@/components/ui/use-toast';
import { traineeService } from '../../services/api';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RegistrationFormProps {
  selectedBase: Base;
  departments: Department[];
  onRegistrationSuccess: (newTrainee: any) => void;
}

const RegistrationForm = ({ selectedBase, departments, onRegistrationSuccess }: RegistrationFormProps) => {
  const { toast } = useToast();
  
  // Registration fields
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [departmentId, setDepartmentId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // New fields
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [orthopedicCondition, setOrthopedicCondition] = useState(false);
  
  // Validate personal ID (7 digits)
  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
  };
  
  // Validate phone number (10 digits starting with 05)
  const validatePhoneNumber = (phone: string) => {
    return /^05\d{8}$/.test(phone);
  };
  
  // Handle trainee registration
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
    
    if (!birthDate) {
      toast({
        title: "שגיאה",
        description: "חובה להזין תאריך לידה",
        variant: "destructive",
      });
      return;
    }
    
    if (!gender) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מין",
        variant: "destructive",
      });
      return;
    }
    
    // Validate inputs
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
    
    try {
      // Format birth date to ISO string (YYYY-MM-DD)
      const formattedBirthDate = birthDate.toISOString().split('T')[0];
      
      // Create new trainee via API
      const newTrainee = await traineeService.create({
        personalId,
        fullName,
        medicalProfile: medicalProfile as '97' | '82' | '72' | '64' | '45' | '25',
        departmentId,
        phoneNumber,
        baseId: selectedBase._id,
        gender: gender as 'male' | 'female',
        birthDate: formattedBirthDate,
        orthopedicCondition
      });
      
      // Update state with new trainee through callback
      onRegistrationSuccess(newTrainee);
      
      // Reset form
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setDepartmentId('');
      setPhoneNumber('');
      setGender('');
      setBirthDate(undefined);
      setOrthopedicCondition(false);
      
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

  // Filter departments by selected base
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
            <label htmlFor="gender" className="block text-sm font-medium">
              מין
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
              className="input-field"
              required
            >
              <option value="">בחר מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="birthDate" className="block text-sm font-medium">
              תאריך לידה
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="birthDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-right",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {birthDate ? format(birthDate, "yyyy-MM-dd") : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  initialFocus
                  disabled={(date) => {
                    return date > new Date();
                  }}
                  className={cn("p-3 pointer-events-auto")}
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
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
          
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              מספר טלפון (מתחיל ב-05)
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
          
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <input
                id="orthopedicCondition"
                type="checkbox"
                checked={orthopedicCondition}
                onChange={(e) => setOrthopedicCondition(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="orthopedicCondition" className="text-sm font-medium mr-2">
                סעיף פרופיל אורטופדי
              </label>
            </div>
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

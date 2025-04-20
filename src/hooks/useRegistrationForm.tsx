// src/hooks/useRegistrationForm.tsx

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { addYears } from 'date-fns';
import { MedicalFormScore, Trainee } from '../types';
import { traineeService } from '../services/api';

export const useRegistrationForm = (
  selectedBaseId: string,
  onRegistrationSuccess: (newTrainee: Trainee) => void
) => {
  const { toast } = useToast();
  
  // Form state
  const [personalId, setPersonalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState<string>('');
  const [departmentId, setDepartmentId] = useState('');
  const [subDepartmentId, setSubDepartmentId] = useState(''); // Add this line
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [orthopedicCondition, setOrthopedicCondition] = useState(false);
  const [medicalFormScore, setMedicalFormScore] = useState<MedicalFormScore | ''>('');
  const [medicalCertificateProvided, setMedicalCertificateProvided] = useState(false);
  const [medicalLimitation, setMedicalLimitation] = useState('');
  

  
  // Validate personal ID (7 digits)
  const validatePersonalId = (id: string) => {
    return /^\d{7}$/.test(id);
  };
  
  // Validate phone number (10 digits starting with 05)
  const validatePhoneNumber = (phone: string) => {
    return /^05\d{8}$/.test(phone);
  };
  
  // Determine if medical approval should be automatic based on form score
  const shouldAutomaticallyApprove = (formScore: MedicalFormScore, certificateProvided: boolean) => {
    return formScore === 'fullScore' || 
           formScore === 'notRequired' || 
           formScore === 'reserve' || 
           (formScore === 'partialScore' && certificateProvided);
  };
  
  // Form validation
  const validateForm = () => {
    if (!selectedBaseId) {
      toast({
        title: "שגיאה",
        description: "יש לבחור בסיס",
        variant: "destructive",
      });
      return false;
    }
    
    if (!birthDate) {
      toast({
        title: "שגיאה",
        description: "חובה להזין תאריך לידה",
        variant: "destructive",
      });
      return false;
    }
    
    if (!gender) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מין",
        variant: "destructive",
      });
      return false;
    }
    
    if (!medicalFormScore) {
      toast({
        title: "שגיאה",
        description: "יש לבחור ציון שאלון א\"ס",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate inputs
    if (!validatePersonalId(personalId)) {
      toast({
        title: "שגיאה",
        description: "מספר אישי חייב להיות בדיוק 7 ספרות",
        variant: "destructive",
      });
      return false;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "שגיאה",
        description: "מספר טלפון חייב להיות 10 ספרות ולהתחיל ב-05",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Handle trainee registration
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Format birth date to ISO string (YYYY-MM-DD)
      const formattedBirthDate = birthDate!.toISOString().split('T')[0];
      
      // Determine if medical approval should be granted automatically
      const approved = shouldAutomaticallyApprove(medicalFormScore as MedicalFormScore, medicalCertificateProvided);
      
      // Calculate expiration date (1 year from now if approved)
      const expirationDate = approved ? addYears(new Date(), 1).toISOString().split('T')[0] : null;
      
      // Create new trainee via API
      const newTrainee = await traineeService.create({
        personalId,
        fullName,
        medicalProfile: medicalProfile as '97' | '82' | '72' | '64' | '45' | '25',
        departmentId,
        subDepartmentId: subDepartmentId || undefined, // Add this line
        phoneNumber,
        baseId: selectedBaseId,
        gender: gender as 'male' | 'female',
        birthDate: formattedBirthDate,
        orthopedicCondition,
        medicalFormScore: medicalFormScore as MedicalFormScore,
        ...(medicalFormScore === 'partialScore' && { medicalCertificateProvided }),
        ...(medicalLimitation && { medicalLimitation }),
        medicalApproval: {
          approved,
          expirationDate
        }
      });
      
      // Update state with new trainee through callback
      onRegistrationSuccess(newTrainee);
      
      // Reset form
      setPersonalId('');
      setFullName('');
      setMedicalProfile('');
      setDepartmentId('');
      setSubDepartmentId(''); // Add this line
      setPhoneNumber('');
      setGender('');
      setBirthDate(undefined);
      setOrthopedicCondition(false);
      setMedicalFormScore('');
      setMedicalCertificateProvided(false);
      setMedicalLimitation('');
      
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

  return {
    personalId,
    setPersonalId,
    fullName,
    setFullName,
    medicalProfile,
    setMedicalProfile,
    departmentId,
    setDepartmentId,
    subDepartmentId, // Add this line
    setSubDepartmentId, // Add this line
    phoneNumber,
    setPhoneNumber,
    gender,
    setGender,
    birthDate,
    setBirthDate,
    orthopedicCondition,
    setOrthopedicCondition,
    medicalFormScore,
    setMedicalFormScore,
    medicalCertificateProvided,
    setMedicalCertificateProvided,
    medicalLimitation,
    setMedicalLimitation,
    handleRegistration
  };
};
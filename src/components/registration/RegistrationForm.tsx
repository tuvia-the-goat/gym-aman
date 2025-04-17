
import React from 'react';
import { Base, Department } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { useRegistrationForm } from '../../hooks/useRegistrationForm';
import PersonalDetailsSection from './PersonalDetailsSection';
import MedicalDetailsSection from './MedicalDetailsSection';

interface RegistrationFormProps {
  selectedBase: Base;
  departments: Department[];
  onRegistrationSuccess: (newTrainee: any) => void;
}

const RegistrationForm = ({ selectedBase, departments, onRegistrationSuccess }: RegistrationFormProps) => {
  
  // Use the custom hook to handle form state and submission
  const {
    personalId,
    setPersonalId,
    fullName,
    setFullName,
    medicalProfile,
    setMedicalProfile,
    departmentId,
    setDepartmentId,
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
  } = useRegistrationForm(selectedBase._id, onRegistrationSuccess);

  // Filter departments by selected base
  const filteredDepartments = departments.filter(
    dept => selectedBase && dept.baseId === selectedBase._id
  );
  
  return (
    <div className="glass max-w-xl mx-auto p-8 rounded-2xl animate-fade-up">
      <form onSubmit={handleRegistration} className="space-y-10">
        {/* Personal Details Section */}
        <PersonalDetailsSection 
          personalId={personalId}
          setPersonalId={setPersonalId}
          fullName={fullName}
          setFullName={setFullName}
          gender={gender}
          setGender={setGender}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          departmentId={departmentId}
          setDepartmentId={setDepartmentId}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          filteredDepartments={filteredDepartments}
        />
        
        <div className="md:col-span-2"> </div>
        <div className="md:col-span-2"> </div>
        
        {/* Medical Details Section */}
        <MedicalDetailsSection 
          medicalProfile={medicalProfile}
          setMedicalProfile={setMedicalProfile}
          medicalFormScore={medicalFormScore}
          setMedicalFormScore={setMedicalFormScore}
          medicalCertificateProvided={medicalCertificateProvided}
          setMedicalCertificateProvided={setMedicalCertificateProvided}
          orthopedicCondition={orthopedicCondition}
          setOrthopedicCondition={setOrthopedicCondition}
          medicalLimitation={medicalLimitation}
          setMedicalLimitation={setMedicalLimitation}
        />
        
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

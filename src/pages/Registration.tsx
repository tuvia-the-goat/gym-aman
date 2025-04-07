
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Base } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import BaseSelector from '../components/registration/BaseSelector';
import BaseHeader from '../components/registration/BaseHeader';
import RegistrationForm from '../components/registration/RegistrationForm';

const Registration = () => {
  const navigate = useNavigate();
  const { admin, bases, departments, trainees, setTrainees } = useAdmin();
  
  // Selected base for registration
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  
  // Initialize the selected base based on the admin role
  useEffect(() => {
    if (admin?.role && admin.baseId) {
      const base = bases.find(b => b._id === admin.baseId);
      if (base) {
        setSelectedBase(base);
      }
    } else if (admin?.role === 'generalAdmin' && bases.length > 0) {
      setSelectedBase(null); // Require selection for allBasesAdmin
    }
  }, [admin, bases]);
  
  useEffect(() => {
    // Replace the current history state to prevent going back
    window.history.pushState(null, '', window.location.pathname);
    
    // Add event listener to handle any attempt to go back
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle successful registration
  const handleRegistrationSuccess = (newTrainee: any) => {
    setTrainees([...trainees, newTrainee]);
  };

  return (
    <DashboardLayout activeTab="registration">
      <div className="max-w-4xl mx-auto">
        {/* Base Selection for generalAdmin */}
        {admin?.role === 'generalAdmin' && !selectedBase && (
          <BaseSelector 
            bases={bases} 
            onSelectBase={setSelectedBase} 
          />
        )}
        
        {selectedBase && (
          <div className="space-y-8">
            {/* Base Info */}
            <BaseHeader selectedBase={selectedBase} />
            
            {/* Registration Form */}
            <RegistrationForm 
              selectedBase={selectedBase}
              departments={departments}
              onRegistrationSuccess={handleRegistrationSuccess}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Registration;

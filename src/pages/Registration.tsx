
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Base } from '../types';
import { useToast } from '@/hooks/use-toast';

// Import components
import Header from '../components/registration/Header';
import Footer from '../components/registration/Footer';
import BaseSelector from '../components/registration/BaseSelector';
import ViewToggle from '../components/registration/ViewToggle';
import AdminLoginForm from '../components/registration/AdminLoginForm';
import RegistrationForm from '../components/registration/RegistrationForm';
import EntryForm from '../components/registration/EntryForm';

const Registration = () => {
  const navigate = useNavigate();
  const { admin, bases, departments, trainees, setTrainees, entries, setEntries } = useAdmin();
  const { toast } = useToast();
  
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'entry'>('entry');

  useEffect(() => {
    if (admin?.role && admin.baseId) {
      const base = bases.find(b => b._id === admin.baseId);
      if (base) {
        setSelectedBase(base);
      }
    } else if (admin?.role === 'generalAdmin' && bases.length > 0) {
      setSelectedBase(null);
    }
  }, [admin, bases]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {admin?.role === 'generalAdmin' && !selectedBase && (
            <BaseSelector 
              bases={bases} 
              onBaseSelect={(base) => setSelectedBase(base)}
            />
          )}
          
          {selectedBase && (
            <div className="space-y-8">
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                  בסיס: {selectedBase.name}
                </span>
                <h2 className="text-3xl font-bold">מערכת רישום לחדר כושר</h2>
              </div>
              
              <ViewToggle view={view} setView={setView} />
              
              {view === 'login' && <AdminLoginForm />}
              
              {view === 'register' && (
                <RegistrationForm
                  selectedBase={selectedBase}
                  departments={departments}
                  trainees={trainees}
                  setTrainees={setTrainees}
                />
              )}
              
              {view === 'entry' && (
                <EntryForm
                  trainees={trainees}
                  entries={entries}
                  setEntries={setEntries}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Registration;

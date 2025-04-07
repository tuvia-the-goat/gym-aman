
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Trainee, Base, Department } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, Calendar, Check, X } from 'lucide-react';
import TraineeProfile from '../components/TraineeProfile';

const MedicalApprovals = () => {
  const navigate = useNavigate();
  const { admin, trainees, departments, setTrainees } = useAdmin();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [showOnlyExpired, setShowOnlyExpired] = useState(false);
  
  useEffect(() => {
    if (!admin) {
      navigate('/login');
    }
  }, [admin, navigate]);
  
  useEffect(() => {
    let filtered = [...trainees];
    
    // Filter based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trainee => 
        trainee.fullName.toLowerCase().includes(query) || 
        trainee.personalId.includes(query)
      );
    }
    
    // Filter based on expired approvals
    if (showOnlyExpired) {
      filtered = filtered.filter(trainee => 
        !trainee.medicalApproval.approved || 
        (trainee.medicalApproval.expirationDate && 
         new Date(trainee.medicalApproval.expirationDate) < new Date())
      );
    }
    
    setFilteredTrainees(filtered);
  }, [trainees, searchQuery, showOnlyExpired]);
  
  const handleTraineeSelect = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
  };
  
  const handleTraineeUpdate = (updatedTrainee: Trainee) => {
    const updatedTrainees = trainees.map(t => 
      t._id === updatedTrainee._id ? updatedTrainee : t
    );
    setTrainees(updatedTrainees);
    setSelectedTrainee(updatedTrainee);
    
    // Update filtered trainees as well
    const updatedFiltered = filteredTrainees.map(t => 
      t._id === updatedTrainee._id ? updatedTrainee : t
    );
    setFilteredTrainees(updatedFiltered);
  };
  
  const getMedicalStatusClass = (trainee: Trainee) => {
    if (!trainee.medicalApproval.approved) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    if (trainee.medicalApproval.expirationDate && new Date(trainee.medicalApproval.expirationDate) < new Date()) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    return 'bg-green-100 border-green-300 text-green-800';
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'לא קיים';
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      return 'תאריך לא תקין';
    }
  };
  
  return (
    <DashboardLayout activeTab="medical-approvals">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">ניהול אישורים רפואיים</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם או מספר אישי..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
          
          <Button
            variant={showOnlyExpired ? "default" : "outline"}
            onClick={() => setShowOnlyExpired(!showOnlyExpired)}
            className="w-full md:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showOnlyExpired ? 'הצג את כולם' : 'הצג רק פגי תוקף'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border rounded-lg overflow-hidden h-[calc(100vh-250px)] flex flex-col">
            <div className="p-4 bg-muted font-medium border-b">
              <div className="flex justify-between items-center">
                <span>רשימת מתאמנים</span>
                <span className="text-sm text-muted-foreground">{filteredTrainees.length} מתאמנים</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-grow">
              {filteredTrainees.length > 0 ? (
                <ul className="divide-y">
                  {filteredTrainees.map((trainee) => (
                    <li
                      key={trainee._id}
                      onClick={() => handleTraineeSelect(trainee)}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTrainee?._id === trainee._id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{trainee.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{trainee.personalId}</p>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full border ${getMedicalStatusClass(trainee)}`}>
                          {trainee.medicalApproval.approved 
                            ? `תקף עד ${formatDate(trainee.medicalApproval.expirationDate)}` 
                            : 'לא תקף'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <p className="text-muted-foreground mb-2">לא נמצאו מתאמנים</p>
                  <p className="text-sm text-muted-foreground">נסה לשנות את החיפוש או הסינון</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedTrainee ? (
              <TraineeProfile 
                trainee={selectedTrainee} 
                departments={departments} 
                onUpdate={handleTraineeUpdate} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center glass rounded-xl">
                <Calendar className="h-16 w-16 text-primary opacity-40 mb-4" />
                <h2 className="text-2xl font-bold mb-2">ניהול אישורים רפואיים</h2>
                <p className="text-muted-foreground mb-4">
                  בחר מתאמן מהרשימה כדי לצפות ולעדכן את הפרטים הרפואיים שלו
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedicalApprovals;

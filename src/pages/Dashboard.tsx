
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { admin, trainees, entries } = useAdmin();
  
  // Calculate some stats for dashboard display
  const totalTrainees = trainees.length;
  const totalEntries = entries.length;
  const todayEntries = entries.filter(entry => {
    const today = new Date().toISOString().split('T')[0];
    // Using entryDate instead of date property
    return entry.entryDate.split('T')[0] === today;
  }).length;
  
  // Calculate active trainees (with valid medical approval)
  const activeTrainees = trainees.filter(trainee => {
    if (!trainee.medicalApproval) return false;
    return trainee.medicalApproval.approved && 
      new Date(trainee.medicalApproval.expirationDate) >= new Date();
  }).length;

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">לוח בקרה</h1>
        <p className="text-xl mb-6">שלום {admin?.username || 'משתמש'}, ברוך הבא למערכת ניהול חדר הכושר</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מספר מתאמנים</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainees}</div>
              <p className="text-xs text-muted-foreground">מתאמנים רשומים במערכת</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מתאמנים פעילים</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTrainees}</div>
              <p className="text-xs text-muted-foreground">מתאמנים עם אישור רפואי בתוקף</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">כניסות היום</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayEntries}</div>
              <p className="text-xs text-muted-foreground">כניסות שנרשמו היום</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ כניסות</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">כניסות סה"כ במערכת</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>מה חדש במערכת?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>ניהול אישורים רפואיים לפי ציון שאלון א"ס</li>
              <li>צפייה בהיסטוריית כניסות מתאמנים</li>
              <li>אנליטיקות מתקדמות לניתוח נתונים</li>
              <li>ניהול מחלקות ובסיסים</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

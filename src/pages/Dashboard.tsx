import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAdmin } from "../context/AdminContext";
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  DumbbellIcon,
  Clock,
} from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import TopTraineesCard from "../components/dashboard/TopTraineesCard";
import RecentEntriesCard from "../components/analytics/RecentEntriesCard";
import { traineeService, entryService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { admin } = useAdmin();
  const baseId = admin?.role === "gymAdmin" ? admin.baseId : undefined;

  // Query for trainees who trained last week
  const { data: traineesLastWeek = [] } = useQuery({
    queryKey: ["traineesLastWeek"],
    queryFn: traineeService.traineesLastWeek,
  });

  // Query for total trainees count
  const { data: totalTrainees = 0 } = useQuery({
    queryKey: ["totalTrainees", baseId],
    queryFn: () => traineeService.getPaginated({ baseId, limit: 1 }).then(res => res.pagination.total),
  });

  // Query for today's successful entries
  const { data: todayEntries = { count: 0 } } = useQuery({
    queryKey: ["todayEntries", baseId],
    queryFn: () => entryService.getTodaySuccessfulEntries(baseId),
  });

  // Query for all successful entries today across all bases
  const { data: allTodayEntries = { count: 0 } } = useQuery({
    queryKey: ["allTodayEntries"],
    queryFn: entryService.getTodaySuccessfulEntriesAll,
  });

  // Query for entries in the last hour
  const { data: lastHourEntries = [] } = useQuery({
    queryKey: ["lastHourEntries", baseId],
    queryFn: () => entryService.getLastHourEntries(baseId),
  });

  // Query for medical approval stats
  const { data: medicalApprovalStats = { approved: 0, notApproved: 0 } } = useQuery({
    queryKey: ["medicalApprovalStats", baseId],
    queryFn: () => traineeService.getMedicalApprovalStats(baseId),
  });

  // Query for top trainees
  const { data: topTrainees = [] } = useQuery({
    queryKey: ["topTrainees", baseId],
    queryFn: () => traineeService.getTopTrainees(baseId),
  });

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">לוח בקרה</h1>
        <p className="text-xl mb-6">
          שלום {admin?.username}, ברוך הבא למערכת ניהול חדר הכושר!
        </p>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${
            admin?.role === "gymAdmin" && admin.baseId ? 4 : 3
          } gap-4 mb-8`}
        >
          {admin?.role === "gymAdmin" && admin.baseId && (
            <StatCard
              title="כניסות לחדר הכושר היום"
              value={todayEntries.count}
              description="כניסות שנרשמו היום"
              icon={<Calendar className="h-4 w-4" />}
            />
          )}

          <StatCard
            title='כניסות לחדרי הכושר באמ"ן היום'
            value={allTodayEntries.count}
            description='כמות הכניסות של מתאמנים לחדרי הכושר באמ"ן היום'
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <StatCard
            title="התאמנו בשבוע האחרון"
            value={`${traineesLastWeek.length}/${totalTrainees}`}
            description="מספר הרשומים שהתאמנו בשבוע האחרון מתוך כלל הרשומים"
            icon={<DumbbellIcon className="h-4 w-4" />}
          />

          <StatCard
            title="מתאמנים עם אישור רפואי"
            value={medicalApprovalStats.approved}
            description="מתאמנים עם אישור רפואי בתוקף"
            icon={<CheckCircle className="h-4 w-4" />}
            iconColor="text-green-500"
          />
        </div>

        {/* Top 7 Trainees and Recent Entries Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 lg:col-span-2">
            <TopTraineesCard
              trainees={topTrainees}
              title="7 המתאמנים המובילים בחודש האחרון"
              emptyMessage="אין נתונים זמינים מהחודש האחרון"
            />
          </div>

          <div>
            <RecentEntriesCard
              entries={lastHourEntries}
              title="כניסות בשעה האחרונה"
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              emptyMessage="אין כניסות בשעה האחרונה"
              maxHeight="250px"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

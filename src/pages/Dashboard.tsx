import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAdmin } from "../context/AdminContext";
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  DumbbellIcon,
  XCircle,
  Clock,
} from "lucide-react";
import { isWithinInterval, subMonths, subHours, parseISO } from "date-fns";
import StatCard from "../components/dashboard/StatCard";
import TopTraineesCard from "../components/dashboard/TopTraineesCard";
import RecentEntriesCard from "../components/analytics/RecentEntriesCard";
import { traineeService } from "@/services/api";

const Dashboard = () => {
  const { admin, trainees, entries, departments, bases, subDepartments } =
    useAdmin();

  const [traineesLastWeek, setTraineesLastWeek] = useState([]);

  useEffect(() => {
    const getLastWeekTrainees = async () => {
      try {
        const trainees = await traineeService.traineesLastWeek();
        setTraineesLastWeek(trainees);
      } catch (e) {}
    };
    getLastWeekTrainees();
  }, [traineeService, setTraineesLastWeek]);

  // Current date for calculations
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const totalSuccessfulEntriesToday = useMemo(() => {
    // Successful entries - filter entries with status 'success' today
    const successfulEntries = entries.filter(
      (entry) =>
        entry.status === "success" && entry.entryDate.split("T")[0] === today
    );
    return successfulEntries.length;
  }, [entries, today]);

  // Filter trainees and entries for the current base if admin is a base admin
  const baseFilteredTrainees = useMemo(() => {
    if (admin?.role === "gymAdmin" && admin.baseId) {
      return trainees.filter((trainee) => trainee.baseId === admin.baseId);
    }
    return trainees;
  }, [admin, trainees]);

  const baseFilteredEntries = useMemo(() => {
    if (admin?.role === "gymAdmin" && admin.baseId) {
      return entries.filter((entry) => entry.baseId === admin.baseId);
    }
    return entries;
  }, [admin, entries]);

  // Today's successful entries - only for current base
  const todaySuccessfulEntries = baseFilteredEntries.filter(
    (entry) =>
      entry.entryDate.split("T")[0] === today && entry.status === "success"
  ).length;

  // Entries in the last hour - only for current base
  const entriesLastHour = useMemo(() => {
    return baseFilteredEntries.filter((entry) => {
      const entryDate = parseISO(`${entry.entryDate}T${entry.entryTime}`);
      return isWithinInterval(entryDate, {
        start: subHours(now, 1),
        end: now,
      });
    });
  }, [baseFilteredEntries, now]);

  // Entries in the last month (for top trainees calculation) - only for current base
  // UPDATE: Filter to include only successful entries
  const lastMonthEntries = baseFilteredEntries.filter((entry) => {
    const entryDate = parseISO(entry.entryDate);
    return (
      isWithinInterval(entryDate, {
        start: subMonths(now, 1),
        end: now,
      }) && entry.status === "success"
    ); // Added check for successful entries only
  });

  // Calculate top 7 trainees from the last month - only from current base
  // Now using only successful entries
  const topTrainees = useMemo(() => {
    const traineeEntryCounts = {};

    lastMonthEntries.forEach((entry) => {
      if (entry.traineeId) {
        traineeEntryCounts[entry.traineeId] =
          (traineeEntryCounts[entry.traineeId] || 0) + 1;
      }
    });

    const traineeCountsArray = Object.entries(traineeEntryCounts)
      .map(([traineeId, count]) => {
        const trainee = baseFilteredTrainees.find((t) => t._id === traineeId);

        if (!trainee) {
          return undefined;
        }

        let topTraineeDetails: {
          id: string;
          name: string;
          count: number;
          departmentName: string;
          subDepartmentName: string;
          baseName?: string;
        } = {
          id: traineeId,
          name: trainee?.fullName || "Unknown Trainee",
          count: count as number,
          departmentName: trainee
            ? departments?.find((d) => d._id === trainee.departmentId)?.name ||
              "-"
            : "-",
          subDepartmentName: trainee
            ? subDepartments?.find((d) => d._id === trainee.subDepartmentId)
                ?.name || "-"
            : "-",
        };
        if (admin?.role !== "gymAdmin" && !admin.baseId) {
          topTraineeDetails.baseName = trainee
            ? bases?.find((d) => d._id === trainee.baseId)?.name || "-"
            : "-";
        }
        return topTraineeDetails;
      })
      .filter((trainee) => !!trainee)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    return traineeCountsArray;
  }, [lastMonthEntries, baseFilteredTrainees, departments]);

  // Calculate medical approval stats - only for current base
  const medicalApprovalStats = useMemo(() => {
    let approved = 0;
    let notApproved = 0;

    baseFilteredTrainees.forEach((trainee) => {
      if (
        trainee.medicalApproval &&
        trainee.medicalApproval.approved &&
        new Date(trainee.medicalApproval.expirationDate) >= new Date()
      ) {
        approved++;
      } else {
        notApproved++;
      }
    });

    return { approved, notApproved };
  }, [baseFilteredTrainees]);

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
              value={todaySuccessfulEntries}
              description="כניסות שנרשמו היום"
              icon={<Calendar className="h-4 w-4" />}
            />
          )}

          <StatCard
            title='כניסות לחדרי הכושר באמ"ן היום'
            value={totalSuccessfulEntriesToday}
            description='כמות הכניסות של מתאמנים לחדרי הכושר באמ"ן היום'
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <StatCard
            title="התאמנו בשבוע האחרון"
            value={`${traineesLastWeek.length}/${baseFilteredTrainees.length}`}
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
              entries={entriesLastHour}
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

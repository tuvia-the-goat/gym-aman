import { useMemo } from "react";
import { isWithinInterval, parseISO } from "date-fns";
import { Entry, Trainee } from "@/types";
import { useAdmin } from "../context/AdminContext";

export const useTopPerformers = (
  filteredEntries: Entry[],
  filteredTrainees: Trainee[],
  hasSpecificFilters: boolean,
  startDate?: Date,
  endDate?: Date
) => {
  const { admin, entries, departments, bases } = useAdmin();

  // Helper functions to get names
  function getDepartmentName(id: string): string {
    const department = departments.find((dept) => dept._id === id);
    return department ? department.name : "";
  }

  function getBaseName(id: string): string {
    const base = bases.find((base) => base._id === id);
    return base ? base.name : "";
  }

  // Top trainees data remains unchanged
  const topTraineesData = useMemo(() => {
    const traineeCounts = filteredTrainees.map((trainee) => {
      const count = filteredEntries.filter(
        (entry) => entry.traineeId === trainee._id
      ).length;
      return {
        id: trainee._id,
        name: trainee.fullName,
        count,
        departmentId: trainee.departmentId,
        baseId: trainee.baseId,
      };
    });

    return traineeCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((trainee) => ({
        name: trainee.name,
        value: trainee.count,
        departmentName: getDepartmentName(trainee.departmentId),
        baseName: getBaseName(trainee.baseId),
      }));
  }, [filteredEntries, filteredTrainees]);

  // Modified top departments data to use percentage based on numOfPeople
  const topDepartmentsData = useMemo(() => {
    // Filter entries only by date range if date filters are active
    let entriesForTopChart = entries;

    // Apply only date filters and admin role filter for top charts
    if (admin?.role === "gymAdmin" && admin.baseId) {
      entriesForTopChart = entriesForTopChart.filter(
        (entry) => entry.baseId === admin.baseId
      );
    }

    if (startDate && endDate) {
      entriesForTopChart = entriesForTopChart.filter((entry) => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }

    // Filter to include only successful entries
    entriesForTopChart = entriesForTopChart.filter(
      (entry) => entry.status === "success"
    );

    // Calculate entries per department
    const departmentCounts: { [key: string]: number } = {};
    entriesForTopChart.forEach((entry) => {
      const deptId = entry.departmentId;
      departmentCounts[deptId] = (departmentCounts[deptId] || 0) + 1;
    });

    // Calculate percentage based on department's numOfPeople
    const departmentPercentages = departments
      .filter((dept) => {
        // Only include departments with numOfPeople > 0 to avoid division by zero
        return dept.numOfPeople > 0;
      })
      .map((dept) => {
        const entriesCount = departmentCounts[dept._id] || 0;
        const percentage = (entriesCount / dept.numOfPeople) * 100;
        return {
          id: dept._id,
          name: dept.name,
          value: percentage, // This is now a percentage
          rawValue: entriesCount, // Keep the raw count for display
          baseId: dept.baseId,
          numOfPeople: dept.numOfPeople,
        };
      })
      .sort((a, b) => b.value - a.value) // Sort by percentage
      .slice(0, 5)
      .map((dept) => ({
        name: dept.name,
        value: dept.rawValue, // Keep showing the actual number of entries
        percentage: dept.value.toFixed(1), // Add percentage info
        baseName: getBaseName(dept.baseId),
        numOfPeople: dept.numOfPeople,
      }));

    return departmentPercentages;
  }, [entries, departments, admin, startDate, endDate]);

  return {
    topTraineesData,
    topDepartmentsData,
    getDepartmentName,
    getBaseName,
  };
};

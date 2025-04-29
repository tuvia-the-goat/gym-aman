import { useMemo } from "react";
import { isWithinInterval, parseISO } from "date-fns";
import { Entry } from "@/types";
import { useAdmin } from "../context/AdminContext";

export const useTopSubDepartments = (
  filteredEntries: Entry[],
  startDate?: Date,
  endDate?: Date
) => {
  const { subDepartments, departments, bases } = useAdmin();

  // Helper functions to get names
  function getSubDepartmentName(id: string): string {
    const subDepartment = subDepartments.find((subDept) => subDept._id === id);
    return subDepartment ? subDepartment.name : "";
  }

  function getDepartmentName(id: string): string {
    const department = departments.find((dept) => dept._id === id);
    return department ? department.name : "";
  }

  function getBaseName(id: string): string {
    const base = bases.find((base) => base._id === id);
    return base ? base.name : "";
  }

  // Top sub-departments data - uses filtered entries
  const topSubDepartmentsData = useMemo(() => {
    // Only count successful entries
    const validEntries = filteredEntries.filter(
      (entry) => entry.status === "success"
    );

    // Count entries by sub-department
    const subDepartmentCounts: { [key: string]: number } = {};

    validEntries.forEach((entry) => {
      if (entry.subDepartmentId) {
        subDepartmentCounts[entry.subDepartmentId] =
          (subDepartmentCounts[entry.subDepartmentId] || 0) + 1;
      }
    });

    // Map to required format and sort
    return Object.entries(subDepartmentCounts)
      .map(([subDeptId, count]) => {
        const subDept = subDepartments.find((sd) => sd._id === subDeptId);
        if (!subDept) return null;
        const departmentId = subDept?.departmentId;
        const department = departments.find((d) => d._id === departmentId);

        // Calculate percentage based on numOfPeople
        const percentage =
          subDept.numOfPeople > 0 ? (count / subDept.numOfPeople) * 100 : 0;

        return {
          id: subDeptId,
          name: getSubDepartmentName(subDeptId),
          value: Math.round(percentage), // Use percentage as the main value
          rawValue: count, // Keep the raw count for display
          departmentName: departmentId ? getDepartmentName(departmentId) : "",
          baseId: department?.baseId || "",
          baseName: department?.baseId ? getBaseName(department.baseId) : "",
          numOfPeople: subDept.numOfPeople,
        };
      })
      .filter((sd) => !!sd && sd.numOfPeople > 0) // Only include subdepartments with numOfPeople > 0
      .sort((a, b) => b.value - a.value) // Sort by percentage
      .slice(0, 5); // Get top 5 sub-departments
  }, [filteredEntries, subDepartments, departments]);

  return {
    topSubDepartmentsData,
    getSubDepartmentName,
    getDepartmentName,
    getBaseName,
  };
};

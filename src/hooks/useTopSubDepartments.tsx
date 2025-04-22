import { useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { Entry } from '@/types';
import { useAdmin } from '../context/AdminContext';

export const useTopSubDepartments = (
  filteredEntries: Entry[], 
  startDate?: Date, 
  endDate?: Date
) => {
  const { subDepartments, departments, bases } = useAdmin();
  
  // Helper functions to get names
  function getSubDepartmentName(id: string): string {
    const subDepartment = subDepartments.find(subDept => subDept._id === id);
    return subDepartment ? subDepartment.name : '';
  }
  
  function getDepartmentName(id: string): string {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  }
  
  function getBaseName(id: string): string {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
  }

  // Top sub-departments data - uses filtered entries
  const topSubDepartmentsData = useMemo(() => {
    // Only count successful entries
    const validEntries = filteredEntries.filter(entry => entry.status === 'success');
    
    // Count entries by sub-department
    const subDepartmentCounts: { [key: string]: number } = {};
    
    validEntries.forEach(entry => {
      if (entry.subDepartmentId) {
        subDepartmentCounts[entry.subDepartmentId] = (subDepartmentCounts[entry.subDepartmentId] || 0) + 1;
      }
    });
    
    // Map to required format and sort
    return Object.entries(subDepartmentCounts)
      .map(([subDeptId, count]) => {
        const subDept = subDepartments.find(sd => sd._id === subDeptId);
        const departmentId = subDept?.departmentId;
        const department = departments.find(d => d._id === departmentId);
        
        return {
          id: subDeptId,
          name: getSubDepartmentName(subDeptId),
          value: count,
          departmentName: departmentId ? getDepartmentName(departmentId) : '',
          baseId: department?.baseId || '',
          baseName: department?.baseId ? getBaseName(department.baseId) : ''
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Get top 5 sub-departments
  }, [filteredEntries, subDepartments, departments]);

  return {
    topSubDepartmentsData,
    getSubDepartmentName,
    getDepartmentName,
    getBaseName
  };
};
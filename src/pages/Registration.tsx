import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { Base } from "../types";
import DashboardLayout from "../components/DashboardLayout";
import BaseSelector from "../components/registration/BaseSelector";
import BaseHeader from "../components/registration/BaseHeader";
import RegistrationForm from "../components/registration/RegistrationForm";
import { useQueries } from "@tanstack/react-query";
import { baseService, departmentService } from "../services/api";

const Registration = () => {
  const navigate = useNavigate();
  const { admin } = useAdmin();

  // Selected base for registration
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);

  // Fetch bases, departments, and trainees using TanStack Query
  const [
    { data: bases = [], isLoading: isLoadingBases },
    { data: departments = [], isLoading: isLoadingDepartments },
  ] = useQueries({
    queries: [
      {
        queryKey: ["bases"],
        queryFn: baseService.getAll,
      },
      {
        queryKey: ["departments", selectedBase?._id],
        queryFn: () => departmentService.getAll(),
        enabled: !!selectedBase,
      },
    ],
  });

  // Initialize the selected base based on the admin role
  useEffect(() => {
    if (admin?.role && admin.baseId && bases.length > 0) {
      const base = bases.find((b) => b._id === admin.baseId);
      if (base) {
        setSelectedBase(base);
      }
    } else if (admin?.role === "generalAdmin" && bases.length > 0) {
      setSelectedBase(null); // Require selection for allBasesAdmin
    }
  }, [admin?.role, admin?.baseId, bases]);

  useEffect(() => {
    // Replace the current history state to prevent going back
    window.history.pushState(null, "", window.location.pathname);

    // Add event listener to handle any attempt to go back
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Handle successful registration
  const handleRegistrationSuccess = (newTrainee: any) => {
    // The trainees list will be automatically updated by TanStack Query
    // when the query is invalidated
  };

  // Show loading state if needed
  if (isLoadingBases || isLoadingDepartments) {
    return (
      <DashboardLayout activeTab="registration">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="registration">
      <div className="max-w-4xl mx-auto">
        {/* Base Selection for generalAdmin */}
        {admin?.role === "generalAdmin" && !selectedBase && (
          <BaseSelector bases={bases} onSelectBase={setSelectedBase} />
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

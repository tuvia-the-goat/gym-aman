import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import EntriesHistory from "./pages/EntriesHistory";
import Registration from "./pages/Registration";
import TraineeEntering from "./pages/TraineeEntering";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MedicalApprovals from "./pages/MedicalApprovals";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/trainee-entering" element={<TraineeEntering />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/entries-history" element={<EntriesHistory />} />
            <Route path="/medical-approvals" element={<MedicalApprovals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AdminProvider>
    </QueryClientProvider>
  );
};

export default App;

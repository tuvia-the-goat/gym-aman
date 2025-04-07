
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import EntriesHistory from './pages/EntriesHistory';
import Registration from './pages/Registration';
import TraineeEntering from './pages/TraineeEntering';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import MedicalApprovals from './pages/MedicalApprovals';
import Index from './pages/Index';
import './App.css';

const App = () => {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
      </BrowserRouter>
    </AdminProvider>
  );
};

export default App;

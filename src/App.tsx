
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from './context/AdminContext';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Analytics from './pages/Analytics';
import EntriesHistory from './pages/EntriesHistory';
import Settings from './pages/Settings';
import Index from './pages/Index';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdmin();
  
  // Show loading state
  if (loading) {
    return <div className="flex h-screen items-center justify-center">טוען...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!admin) {
    return <Navigate to="/login" replace={true} />;
  }
  
  // Show protected content when authenticated
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entries"
          element={
            <ProtectedRoute>
              <EntriesHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

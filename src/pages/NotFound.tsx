
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass p-12 rounded-2xl max-w-md w-full text-center animate-fade-up">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl mb-6">הדף המבוקש לא נמצא</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary w-full"
        >
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
};

export default NotFound;

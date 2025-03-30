
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-primary text-primary-foreground shadow-md px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">מערכת אימ"ון</h1>
        <div className="flex items-center">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
          >
            התחברות מנהלים
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

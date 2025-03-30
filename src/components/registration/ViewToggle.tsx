
import React from 'react';

interface ViewToggleProps {
  view: 'login' | 'register' | 'entry';
  setView: (view: 'login' | 'register' | 'entry') => void;
}

const ViewToggle = ({ view, setView }: ViewToggleProps) => {
  return (
    <div className="flex justify-center space-x-4 border-b pb-4">
      <button
        onClick={() => setView('entry')}
        className={`px-6 py-2 rounded-md font-medium ${
          view === 'entry' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        רישום כניסה
      </button>
      <button
        onClick={() => setView('register')}
        className={`px-6 py-2 rounded-md font-medium ${
          view === 'register' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        הצטרפות למערכת
      </button>
    </div>
  );
};

export default ViewToggle;

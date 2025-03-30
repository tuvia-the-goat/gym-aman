
import React from 'react';
import { Base } from '../../types';

interface BaseSelectorProps {
  bases: Base[];
  onBaseSelect: (base: Base) => void;
}

const BaseSelector = ({ bases, onBaseSelect }: BaseSelectorProps) => {
  return (
    <div className="glass p-8 rounded-2xl mb-8 animate-scale-in">
      <h2 className="text-2xl font-bold mb-6 text-center">בחר בסיס לרישום</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bases.map((base) => (
          <button
            key={base._id}
            onClick={() => onBaseSelect(base)}
            className="neomorphic p-6 text-center hover:-translate-y-1 transition-transform duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">{base.name}</h3>
            <p className="text-muted-foreground">{base.location}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BaseSelector;


import React from 'react';
import { Base } from '../../types';

interface BaseHeaderProps {
  selectedBase: Base;
}

const BaseHeader = ({ selectedBase }: BaseHeaderProps) => {
  return (
    <div className="text-center">
      <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
        בסיס: {selectedBase.name}
      </span>
      <h2 className="text-3xl font-bold">רישום מתאמנים</h2>
    </div>
  );
};

export default BaseHeader;

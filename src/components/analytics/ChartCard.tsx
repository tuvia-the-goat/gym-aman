
import React from 'react';
import { Card } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-card shadow-sm rounded-lg p-6 border ${className}`}>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default ChartCard;

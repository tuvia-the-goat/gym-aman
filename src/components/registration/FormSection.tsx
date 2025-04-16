
import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const FormSection = ({ title, children, className = '', icon }: FormSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 space-x-reverse mb-1">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/30 shadow-sm">
        {children}
      </div>
    </div>
  );
};

export default FormSection;

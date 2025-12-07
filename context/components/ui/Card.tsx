
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">{title}</h2>
      {children}
    </div>
  );
};

export default Card;

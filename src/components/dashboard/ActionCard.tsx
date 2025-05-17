
import React from "react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 w-full text-left transition-all hover:shadow-md hover:border-brand-blue/20"
    >
      <div className="flex items-center">
        <div className="text-brand-blue bg-brand-gray p-3 rounded-md">
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;

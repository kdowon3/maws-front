
import React from "react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  onClick,
  variant = "default" 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-sm p-6 border w-full text-left transition-all hover:shadow-md",
        "flex items-center space-x-4",
        variant === "default" && "border-brand-blue/20 hover:border-brand-blue/40",
        variant === "secondary" && "border-gray-100 hover:border-gray-200",
        variant === "outline" && "border-gray-200 hover:border-gray-300 bg-transparent"
      )}
    >
      <div className={cn(
        "p-3 rounded-md flex items-center justify-center",
        variant === "default" && "text-brand-blue bg-brand-gray",
        variant === "secondary" && "text-gray-600 bg-gray-100",
        variant === "outline" && "text-brand-blue bg-transparent border border-current"
      )}>
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </button>
  );
};

export default ActionCard;

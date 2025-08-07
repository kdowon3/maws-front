
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, change, trend }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={cn("text-sm mt-2 flex items-center", {
                "text-green-600": trend === "up",
                "text-red-600": trend === "down",
                "text-gray-500": trend === "neutral"
              })}>
                {trend === "up" && <span className="text-lg mr-1">↑</span>}
                {trend === "down" && <span className="text-lg mr-1">↓</span>}
                {change}
              </p>
            )}
          </div>
          <div className="text-brand-blue bg-brand-gray p-2.5 rounded-md flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;

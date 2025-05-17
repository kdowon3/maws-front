
import React from "react";

interface ActivityItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-medium text-gray-900 mb-4">최근 작업 로그</h2>
      <div className="divide-y divide-gray-100">
        {activities.map((activity) => (
          <div key={activity.id} className="py-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">{activity.action}</span>
              <span className="text-xs text-gray-500">{activity.timestamp}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">{activity.user}</div>
            {activity.details && (
              <div className="mt-1 text-xs text-gray-400">{activity.details}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;

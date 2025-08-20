import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  UserCheck, 
  Activity,
  Database,
  Image,
  Tag,
  Columns,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { AdminDashboardStats } from '@/utils/adminApi';

interface MetricCardsProps {
  stats: AdminDashboardStats;
  isLoading: boolean;
}

interface MetricCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardData> = ({
  title,
  value,
  icon,
  change,
  trend,
  subtitle
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
            {change && (
              <p className={`text-sm mt-2 flex items-center ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend === 'down' && <span className="text-lg mr-1 transform rotate-180 inline-block">↗</span>}
                {change}
              </p>
            )}
          </div>
          <div className="text-blue-600 bg-blue-50 p-2.5 rounded-md flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SkeletonCard: React.FC = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const MetricCards: React.FC<MetricCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  const { system_overview } = stats;

  const metrics: MetricCardData[] = [
    {
      title: '총 갤러리',
      value: system_overview.total_galleries,
      icon: <Building2 className="h-5 w-5" />,
      subtitle: '등록된 전체 갤러리'
    },
    {
      title: '활성 갤러리',
      value: system_overview.active_galleries,
      icon: <Activity className="h-5 w-5" />,
      change: `${Math.round((system_overview.active_galleries / system_overview.total_galleries) * 100)}% 활성`,
      trend: 'neutral',
      subtitle: '현재 운영 중인 갤러리'
    },
    {
      title: '총 사용자',
      value: system_overview.total_users,
      icon: <Users className="h-5 w-5" />,
      subtitle: '등록된 전체 사용자'
    },
    {
      title: '활성 사용자',
      value: system_overview.active_users,
      icon: <UserCheck className="h-5 w-5" />,
      change: `${Math.round((system_overview.active_users / system_overview.total_users) * 100)}% 활성`,
      trend: 'neutral',
      subtitle: '활성화된 사용자'
    },
    {
      title: '관리 고객 수',
      value: system_overview.total_clients,
      icon: <Database className="h-5 w-5" />,
      subtitle: '등록된 고객 정보'
    },
    {
      title: '등록 작품 수',
      value: system_overview.total_artworks,
      icon: <Image className="h-5 w-5" />,
      subtitle: '시스템 내 작품'
    },
    {
      title: '이번 달 신규 갤러리',
      value: system_overview.new_galleries_this_month,
      icon: <UserPlus className="h-5 w-5" />,
      trend: system_overview.new_galleries_this_month > 0 ? 'up' : 'neutral',
      change: system_overview.new_galleries_this_month > 0 ? '신규 가입' : '신규 가입 없음',
      subtitle: '이번 달 가입한 갤러리'
    },
    {
      title: '이번 달 신규 사용자',
      value: system_overview.new_users_this_month,
      icon: <UserPlus className="h-5 w-5" />,
      trend: system_overview.new_users_this_month > 0 ? 'up' : 'neutral',
      change: system_overview.new_users_this_month > 0 ? '신규 가입' : '신규 가입 없음',
      subtitle: '이번 달 가입한 사용자'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default MetricCards;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { AdminDashboardStats } from '@/utils/adminApi';

interface GalleryDistributionChartProps {
  stats: AdminDashboardStats;
  isLoading: boolean;
}

const COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
  secondary: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  accent: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  status: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA']
};

const SkeletonChart: React.FC<{ title: string }> = ({ title }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <div className="text-gray-400">차트 로딩 중...</div>
      </div>
    </CardContent>
  </Card>
);

const GalleryDistributionChart: React.FC<GalleryDistributionChartProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart title="구독 상태별 분포" />
        <SkeletonChart title="갤러리 규모별 분포" />
      </div>
    );
  }

  const { gallery_distribution } = stats;

  // 구독 상태별 데이터
  const subscriptionData = [
    {
      name: '활성',
      value: gallery_distribution.subscription_status.active,
      color: COLORS.primary[0]
    },
    {
      name: '만료 예정',
      value: gallery_distribution.subscription_status.expiring_soon,
      color: COLORS.accent[1]
    },
    {
      name: '만료',
      value: gallery_distribution.subscription_status.expired,
      color: COLORS.status[0]
    }
  ].filter(item => item.value > 0);

  // 사용자 수별 분포 데이터
  const userCountData = Object.entries(gallery_distribution.user_count_distribution).map(([key, value]) => ({
    name: key,
    value: value as number
  }));

  // 가입 방식별 데이터
  const signupMethodData = Object.entries(gallery_distribution.signup_methods).map(([key, value]) => ({
    name: key === 'email' ? '이메일' : key === 'code' ? '초대코드' : key,
    value: value as number
  }));

  // 활동 상태별 데이터
  const activityData = [
    {
      name: '데이터 보유',
      value: gallery_distribution.activity_status.with_data,
      color: COLORS.secondary[0]
    },
    {
      name: '데이터 없음',
      value: gallery_distribution.activity_status.empty,
      color: COLORS.secondary[2]
    }
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0]?.name}: ${payload[0]?.value}개`}</p>
          <p className="text-sm text-gray-500">
            {`전체의 ${((payload[0]?.value / (payload[0]?.payload?.total || 1)) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = subscriptionData.reduce((sum, item) => sum + item.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data?.name}: ${data?.value}개`}</p>
          <p className="text-sm text-gray-500">
            {`전체의 ${((data?.value / total) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 구독 상태 및 활동 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">구독 상태별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">갤러리 활동 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 수별 분포 및 가입 방식 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">갤러리 규모별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userCountData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={COLORS.primary[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {signupMethodData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">가입 방식별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={signupMethodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.secondary[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GalleryDistributionChart;
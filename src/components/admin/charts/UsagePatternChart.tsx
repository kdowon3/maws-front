import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdminDashboardStats } from '@/utils/adminApi';

interface UsagePatternChartProps {
  stats: AdminDashboardStats;
  isLoading: boolean;
}

const COLORS = {
  usage: ['#EF4444', '#F97316', '#EAB308', '#22C55E'], // 빨강, 주황, 노랑, 초록
  timeline: ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7']
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

const UsagePatternChart: React.FC<UsagePatternChartProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart title="사용량 분포" />
        <SkeletonChart title="가입 시기별 분포" />
      </div>
    );
  }

  const { usage_patterns } = stats;

  // 사용량 분포 데이터
  const usageDistributionData = [
    {
      name: '미사용',
      value: usage_patterns.usage_distribution.no_data,
      color: COLORS.usage[0],
      description: '고객 데이터 없음'
    },
    {
      name: '적은 사용',
      value: usage_patterns.usage_distribution.light_users,
      color: COLORS.usage[1],
      description: '1-9명 고객'
    },
    {
      name: '중간 사용',
      value: usage_patterns.usage_distribution.medium_users,
      color: COLORS.usage[2],
      description: '10-50명 고객'
    },
    {
      name: '많은 사용',
      value: usage_patterns.usage_distribution.heavy_users,
      color: COLORS.usage[3],
      description: '50명+ 고객'
    }
  ];

  // 가입 시기별 분포 데이터
  const signupTimelineData = [
    {
      name: '최근 7일',
      value: usage_patterns.signup_timeline.last_7_days,
      color: COLORS.timeline[0]
    },
    {
      name: '최근 30일',
      value: usage_patterns.signup_timeline.last_30_days,
      color: COLORS.timeline[1]
    },
    {
      name: '최근 90일',
      value: usage_patterns.signup_timeline.last_90_days,
      color: COLORS.timeline[2]
    },
    {
      name: '90일 이전',
      value: usage_patterns.signup_timeline.older,
      color: COLORS.timeline[3]
    }
  ];

  // 평균 통계 데이터
  const averageStats = [
    {
      name: '평균 고객 수',
      value: usage_patterns.average_clients_per_gallery,
      unit: '명/갤러리'
    },
    {
      name: '평균 작품 수',
      value: usage_patterns.average_artworks_per_gallery,
      unit: '개/갤러리'
    },
    {
      name: '평균 사용자 수',
      value: usage_patterns.average_users_per_gallery,
      unit: '명/갤러리'
    }
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data?.name}: ${data?.value}개 갤러리`}</p>
          {data?.payload?.description && (
            <p className="text-sm text-gray-500">{data.payload.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = usageDistributionData.reduce((sum, item) => sum + item.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data?.name}: ${data?.value}개`}</p>
          <p className="text-sm text-gray-500">{data?.payload?.description}</p>
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
      {/* 평균 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {averageStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}
                </p>
                <p className="text-xs text-gray-400">{stat.unit}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 사용량 분포 및 가입 시기 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">갤러리 사용량 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {usageDistributionData.map((entry, index) => (
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
            <CardTitle className="text-lg">가입 시기별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={signupTimelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {signupTimelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 상세 사용량 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">사용량 세부 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {usage_patterns.usage_distribution.no_data}
              </div>
              <div className="text-sm text-red-800">미사용 갤러리</div>
              <div className="text-xs text-red-600">고객 데이터 없음</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {usage_patterns.usage_distribution.light_users}
              </div>
              <div className="text-sm text-orange-800">가벼운 사용</div>
              <div className="text-xs text-orange-600">1-9명 고객</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {usage_patterns.usage_distribution.medium_users}
              </div>
              <div className="text-sm text-yellow-800">중간 사용</div>
              <div className="text-xs text-yellow-600">10-50명 고객</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {usage_patterns.usage_distribution.heavy_users}
              </div>
              <div className="text-sm text-green-800">활발한 사용</div>
              <div className="text-xs text-green-600">50명+ 고객</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsagePatternChart;
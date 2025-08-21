import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Lock,
  Mail,
  Key,
  Clock
} from 'lucide-react';
import { AdminDashboardStats } from '@/utils/adminApi';

interface SecurityStatusChartProps {
  stats: AdminDashboardStats;
  isLoading: boolean;
}

const SkeletonCard: React.FC = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const SecurityMetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'danger';
  description: string;
}> = ({ title, value, icon, status, description }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    danger: 'text-red-600 bg-red-50 border-red-200'
  };

  const badgeColors = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  const statusText = {
    good: '정상',
    warning: '주의',
    danger: '위험'
  };

  return (
    <Card className={`border-2 ${statusColors[status]}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-gray-700">{title}</p>
              <Badge variant="secondary" className={badgeColors[status]}>
                {statusText[status]}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className={`p-2.5 rounded-md flex items-center justify-center ${statusColors[status]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SecurityStatusChart: React.FC<SecurityStatusChartProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const { security_metrics, user_analytics } = stats;

  // 보안 메트릭 계산
  const getSecurityStatus = (value: number, type: 'login' | 'locked' | 'unverified' | 'admin') => {
    switch (type) {
      case 'login':
        return value > 100 ? 'good' : value > 50 ? 'warning' : 'danger';
      case 'locked':
        return value === 0 ? 'good' : value < 5 ? 'warning' : 'danger';
      case 'unverified':
        return value === 0 ? 'good' : value < 10 ? 'warning' : 'danger';
      case 'admin':
        return value > 0 ? 'good' : 'warning';
      default:
        return 'good';
    }
  };

  const securityMetrics = [
    {
      title: '24시간 로그인',
      value: security_metrics.login_stats_24h.total_logins,
      icon: <Activity className="h-5 w-5" />,
      status: getSecurityStatus(security_metrics.login_stats_24h.total_logins, 'login'),
      description: '최근 24시간 총 로그인'
    },
    {
      title: '잠긴 계정',
      value: security_metrics.security_alerts.locked_accounts,
      icon: <Lock className="h-5 w-5" />,
      status: getSecurityStatus(security_metrics.security_alerts.locked_accounts, 'locked'),
      description: '현재 잠긴 사용자 계정'
    },
    {
      title: '이메일 미인증',
      value: security_metrics.security_alerts.unverified_emails,
      icon: <Mail className="h-5 w-5" />,
      status: getSecurityStatus(security_metrics.security_alerts.unverified_emails, 'unverified'),
      description: '이메일 인증이 안된 계정'
    },
    {
      title: '관리자 로그인',
      value: security_metrics.access_patterns.admin_logins_24h,
      icon: <Shield className="h-5 w-5" />,
      status: getSecurityStatus(security_metrics.access_patterns.admin_logins_24h, 'admin'),
      description: '24시간 관리자 접속'
    }
  ] as const;

  return (
    <div className="space-y-6">
      {/* 주요 보안 지표 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">보안 현황</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityMetrics.map((metric, index) => (
            <SecurityMetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* 상세 보안 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 로그인 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              로그인 통계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">총 로그인 (24시간)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {security_metrics.login_stats_24h.total_logins}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">고유 사용자 (24시간)</p>
                <p className="text-2xl font-bold text-green-600">
                  {security_metrics.login_stats_24h.unique_users}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900">실패한 로그인</p>
                <p className="text-2xl font-bold text-red-600">
                  {security_metrics.login_stats_24h.failed_attempts}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* 세션 및 접근 패턴 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              세션 및 접근 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-900">활성 세션</p>
                <p className="text-2xl font-bold text-purple-600">
                  {security_metrics.session_stats.active_sessions}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>

            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-indigo-900">7일 총 세션</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {security_metrics.session_stats.total_sessions_7d}
                </p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-lg font-bold text-orange-600">
                  {security_metrics.access_patterns.superuser_count}
                </p>
                <p className="text-xs text-orange-800">슈퍼유저</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <p className="text-lg font-bold text-teal-600">
                  {security_metrics.access_patterns.staff_count}
                </p>
                <p className="text-xs text-teal-800">스태프</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 계정 보안 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            계정 보안 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {user_analytics.security_stats.strong_passwords}
              </div>
              <div className="text-sm text-green-800">강력한 비밀번호</div>
              <div className="text-xs text-green-600">최근 90일 변경</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {user_analytics.activity_stats.email_verified}
              </div>
              <div className="text-sm text-blue-800">이메일 인증 완료</div>
              <div className="text-xs text-blue-600">인증된 계정</div>
            </div>

            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {user_analytics.security_stats.failed_login_attempts}
              </div>
              <div className="text-sm text-red-800">로그인 실패 기록</div>
              <div className="text-xs text-red-600">실패 기록 있는 계정</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {security_metrics.security_alerts.recent_password_changes}
              </div>
              <div className="text-sm text-yellow-800">최근 비밀번호 변경</div>
              <div className="text-xs text-yellow-600">7일 이내 변경</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityStatusChart;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AdminDashboardStats } from '@/utils/adminApi';

interface UserDetailTableProps {
  stats: AdminDashboardStats;
  isLoading: boolean;
}

const UserDetailTable: React.FC<UserDetailTableProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>사용자 상세 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { user_analytics, system_overview } = stats;

  // 퍼센트 계산 함수
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* 사용자 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 현황 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {system_overview.total_users}
              </div>
              <div className="text-sm text-blue-800">총 사용자</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {system_overview.active_users}
              </div>
              <div className="text-sm text-green-800">활성 사용자</div>
              <div className="text-xs text-green-600">
                {getPercentage(system_overview.active_users, system_overview.total_users)}%
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {user_analytics.activity_stats.email_verified}
              </div>
              <div className="text-sm text-purple-800">이메일 인증</div>
              <div className="text-xs text-purple-600">
                {getPercentage(user_analytics.activity_stats.email_verified, system_overview.total_users)}%
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {user_analytics.activity_stats.recent_login}
              </div>
              <div className="text-sm text-orange-800">최근 로그인</div>
              <div className="text-xs text-orange-600">7일 이내</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 역할별 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>역할별 사용자 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(user_analytics.role_distribution).map(([role, count]) => {
              const percentage = getPercentage(count, system_overview.total_users);
              return (
                <div key={role} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {role === 'owner' ? '갤러리 소유자' : 
                       role === 'manager' ? '매니저' :
                       role === 'staff' ? '스태프' : role}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}명</span>
                      <Badge variant="outline">{percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 권한별 분포 */}
      <Card>
        <CardHeader>
          <CardTitle>권한별 사용자 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">관리 권한</h4>
              {Object.entries(user_analytics.permission_stats)
                .filter(([key]) => key.includes('manage'))
                .map(([permission, count]) => {
                const percentage = getPercentage(count, system_overview.total_users);
                const permissionName = {
                  can_manage_clients: '고객 관리',
                  can_manage_artworks: '작품 관리',
                  can_manage_users: '사용자 관리',
                  can_manage_gallery_settings: '갤러리 설정'
                }[permission] || permission;

                return (
                  <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{permissionName}</div>
                      <div className="text-xs text-gray-500">{count}명</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={percentage > 50 ? "default" : "secondary"}>
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">기능 권한</h4>
              {Object.entries(user_analytics.permission_stats)
                .filter(([key]) => !key.includes('manage'))
                .map(([permission, count]) => {
                const percentage = getPercentage(count, system_overview.total_users);
                const permissionName = {
                  can_export_data: '데이터 내보내기',
                  can_send_messages: '메시지 발송',
                  can_view_reports: '리포트 조회'
                }[permission] || permission;

                return (
                  <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{permissionName}</div>
                      <div className="text-xs text-gray-500">{count}명</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={percentage > 50 ? "default" : "secondary"}>
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보안 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 보안 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">계정 상태</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-green-800">이메일 인증 완료</div>
                    <div className="text-xs text-green-600">
                      {user_analytics.activity_stats.email_verified}명
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {getPercentage(user_analytics.activity_stats.email_verified, system_overview.total_users)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-red-800">이메일 미인증</div>
                    <div className="text-xs text-red-600">
                      {user_analytics.activity_stats.email_unverified}명
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {getPercentage(user_analytics.activity_stats.email_unverified, system_overview.total_users)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-yellow-800">계정 잠금</div>
                    <div className="text-xs text-yellow-600">
                      {user_analytics.activity_stats.locked_accounts}명
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {getPercentage(user_analytics.activity_stats.locked_accounts, system_overview.total_users)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">보안 지표</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-blue-800">강력한 비밀번호</div>
                    <div className="text-xs text-blue-600">최근 90일 변경</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {user_analytics.security_stats.strong_passwords}
                    </div>
                    <div className="text-xs text-blue-600">명</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-orange-800">로그인 실패 기록</div>
                    <div className="text-xs text-orange-600">실패 시도가 있는 계정</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      {user_analytics.security_stats.failed_login_attempts}
                    </div>
                    <div className="text-xs text-orange-600">명</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-purple-800">최근 로그인</div>
                    <div className="text-xs text-purple-600">7일 이내 접속</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {user_analytics.activity_stats.recent_login}
                    </div>
                    <div className="text-xs text-purple-600">명</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailTable;
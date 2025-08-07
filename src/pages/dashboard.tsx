import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface DashboardData {
    user: {
        full_name: string;
        role_display: string;
        job_title: string;
        last_login: string;
        last_login_ip: string;
    };
    gallery: {
        name: string;
        users_count: number | null;
        max_users: number | null;
        subscription_active: boolean;
    };
    security: {
        active_sessions: number;
        recent_logins: Array<{
            id: number;
            ip_address: string;
            device_type: string;
            browser: string;
            login_time: string;
            is_active: boolean;
        }>;
    };
}

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/accounts/dashboard/`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error('대시보드 데이터 로딩 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                {/* 헤더 */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                안녕하세요, {user?.first_name} {user?.last_name}님!
                            </h1>
                            <p className="text-gray-600">
                                {dashboardData?.gallery?.name || '갤러리 없음'}
                                {dashboardData?.user?.job_title && ` • ${dashboardData.user.job_title}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">구독 상태</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {dashboardData?.gallery?.subscription_active ? '활성' : '만료'}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {dashboardData?.gallery?.users_count != null && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">사용자 수</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {dashboardData?.gallery?.users_count || 0}/
                                            {dashboardData?.gallery?.max_users || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">활성 세션</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {dashboardData?.security?.active_sessions || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">마지막 로그인</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {dashboardData?.user?.last_login
                                            ? formatDateTime(dashboardData.user.last_login)
                                            : '정보 없음'}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 최근 로그인 이력 */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">최근 로그인 이력</h2>
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        로그인 시간
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP 주소
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        기기
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        브라우저
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상태
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(dashboardData?.security?.recent_logins || []).map((login) => (
                                    <tr key={login.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDateTime(login.login_time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {login.ip_address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {login.device_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {login.browser}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    login.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {login.is_active ? '활성' : '종료'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 권한 정보 */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">권한 정보</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {user?.permissions
                            ? Object.entries(user.permissions).map(([key, value]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                      <div
                                          className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                                      />
                                      <span className="text-sm text-gray-700">
                                          {key === 'manage_clients' && '고객 관리'}
                                          {key === 'manage_artworks' && '작품 관리'}
                                          {key === 'export_data' && '데이터 내보내기'}
                                          {key === 'send_messages' && '메시지 발송'}
                                          {key === 'view_reports' && '리포트 조회'}
                                          {key === 'manage_users' && '사용자 관리'}
                                          {key === 'manage_gallery_settings' && '갤러리 설정'}
                                      </span>
                                  </div>
                              ))
                            : null}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;

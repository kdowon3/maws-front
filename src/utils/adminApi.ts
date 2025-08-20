// 관리자 전용 API 서비스
import { authenticatedFetch } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface AdminDashboardStats {
  system_overview: {
    total_galleries: number;
    active_galleries: number;
    total_users: number;
    active_users: number;
    total_clients: number;
    total_artworks: number;
    total_tags: number;
    total_columns: number;
    new_galleries_this_month: number;
    new_users_this_month: number;
    galleries_with_clients: number;
    galleries_with_artworks: number;
  };
  gallery_distribution: {
    signup_methods: Record<string, number>;
    subscription_status: {
      active: number;
      expiring_soon: number;
      expired: number;
    };
    user_count_distribution: {
      '1-3명': number;
      '4-7명': number;
      '8-10명': number;
      '10명+': number;
    };
    activity_status: {
      with_data: number;
      empty: number;
    };
  };
  user_analytics: {
    role_distribution: Record<string, number>;
    activity_stats: {
      email_verified: number;
      email_unverified: number;
      locked_accounts: number;
      recent_login: number;
    };
    permission_stats: {
      can_manage_clients: number;
      can_manage_artworks: number;
      can_export_data: number;
      can_send_messages: number;
      can_view_reports: number;
      can_manage_users: number;
      can_manage_gallery_settings: number;
    };
    security_stats: {
      strong_passwords: number;
      failed_login_attempts: number;
    };
  };
  usage_patterns: {
    gallery_usage_stats: Array<{
      gallery_id: number;
      client_count: number;
      artwork_count: number;
      user_count: number;
      tag_count: number;
      column_count: number;
      created_days_ago: number;
      signup_method: string;
    }>;
    average_clients_per_gallery: number;
    average_artworks_per_gallery: number;
    average_users_per_gallery: number;
    usage_distribution: {
      heavy_users: number;
      medium_users: number;
      light_users: number;
      no_data: number;
    };
    signup_timeline: {
      last_7_days: number;
      last_30_days: number;
      last_90_days: number;
      older: number;
    };
  };
  security_metrics: {
    login_stats_24h: {
      total_logins: number;
      unique_users: number;
      failed_attempts: number;
    };
    session_stats: {
      active_sessions: number;
      total_sessions_7d: number;
    };
    security_alerts: {
      locked_accounts: number;
      recent_password_changes: number;
      unverified_emails: number;
    };
    access_patterns: {
      superuser_count: number;
      staff_count: number;
      admin_logins_24h: number;
    };
  };
  last_updated: string;
  collection_success: boolean;
  meta?: {
    processing_time_seconds: number;
    timestamp: string;
    version: string;
    data_privacy: string;
  };
}

export interface AdminSystemInfo {
  system_info: {
    django_version: string;
    debug_mode: boolean;
    database_engine: string;
    installed_apps_count: number;
    middleware_count: number;
    admin_dashboard_enabled: boolean;
    time_zone: string;
    language_code: string;
    server_time: string;
  };
  timestamp: string;
}

export interface AdminPermissionCheck {
  has_permission: boolean;
  reason?: string;
  required_action?: string;
  required_permission?: string;
  current_user?: string;
  is_staff?: boolean;
  user?: string;
  permissions?: {
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
  };
}

// 관리자 API 서비스 클래스
export class AdminApiService {
  // 권한 확인
  static async checkAdminPermission(): Promise<AdminPermissionCheck> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/check-permission/`);
    if (!response.ok) {
      throw new Error('권한 확인 실패');
    }
    return response.json();
  }

  // 대시보드 통계 데이터 가져오기
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/dashboard/`);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('관리자 권한이 필요합니다');
      }
      throw new Error('대시보드 데이터 로딩 실패');
    }
    return response.json();
  }

  // 시스템 정보 가져오기
  static async getSystemInfo(): Promise<AdminSystemInfo> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/system/`);
    if (!response.ok) {
      throw new Error('시스템 정보 로딩 실패');
    }
    return response.json();
  }

  // 특정 통계 타입 상세 정보 가져오기
  static async getDetailedStats(statType: 'system' | 'galleries' | 'users' | 'usage' | 'security'): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/stats/${statType}/`);
    if (!response.ok) {
      throw new Error(`${statType} 통계 로딩 실패`);
    }
    return response.json();
  }

  // 시스템 헬스체크
  static async performHealthCheck(): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/dashboard/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'health_check' })
    });
    if (!response.ok) {
      throw new Error('헬스체크 실패');
    }
    return response.json();
  }

  // 캐시 새로고침
  static async refreshCache(): Promise<any> {
    const response = await authenticatedFetch(`${API_BASE_URL}/admin/dashboard/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh_cache' })
    });
    if (!response.ok) {
      throw new Error('캐시 새로고침 실패');
    }
    return response.json();
  }
}

// 편의용 개별 함수들 (기존 패턴과 일치)
export const checkAdminPermission = AdminApiService.checkAdminPermission;
export const getDashboardStats = AdminApiService.getDashboardStats;
export const getSystemInfo = AdminApiService.getSystemInfo;
export const getDetailedStats = AdminApiService.getDetailedStats;
export const performHealthCheck = AdminApiService.performHealthCheck;
export const refreshCache = AdminApiService.refreshCache;

// 권한 확인 유틸리티 함수
export const isUserSuperuser = (): boolean => {
  try {
    const userData = localStorage.getItem('user_data');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.is_superuser === true;
  } catch (error) {
    console.error('사용자 데이터 파싱 오류:', error);
    return false;
  }
};

// 로그아웃 후 관리자 페이지 리다이렉트
export const logoutAndRedirect = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  window.location.href = '/admin/login';
};
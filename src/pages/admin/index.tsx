import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isUserSuperuser, checkAdminPermission } from '@/utils/adminApi';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // 1. localStorage에서 기본 확인
        if (!isUserSuperuser()) {
          router.replace('/admin/login');
          return;
        }

        // 2. 서버에서 권한 재확인
        const permissionCheck = await checkAdminPermission();
        
        if (!permissionCheck.has_permission) {
          setError('관리자 권한이 확인되지 않습니다. 다시 로그인해주세요.');
          setTimeout(() => {
            router.replace('/admin/login');
          }, 3000);
          return;
        }

        setHasPermission(true);
      } catch (error) {
        console.error('권한 확인 오류:', error);
        setError('권한 확인 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.replace('/admin/login');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [router]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 권한 오류
  if (error || !hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || '관리자 권한이 필요합니다'}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 text-center">
            <Button onClick={() => router.push('/admin/login')}>
              <Shield className="h-4 w-4 mr-2" />
              관리자 로그인으로 이동
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 관리자 대시보드 렌더링
  return <AdminDashboard />;
};

export default AdminPage;
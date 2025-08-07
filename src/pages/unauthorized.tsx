import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            접근 권한이 없습니다
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            이 페이지에 접근할 권한이 없습니다.
          </p>
          
          {user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>현재 사용자:</strong> {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>역할:</strong> {user.role_display}
              </p>
              <p className="text-sm text-blue-800">
                <strong>소속 갤러리:</strong> {user.gallery.name}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            대시보드로 이동
          </Link>
          
          <Link
            href="/clients"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            고객 관리로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
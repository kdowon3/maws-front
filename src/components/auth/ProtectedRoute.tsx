import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackUrl?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackUrl = "/auth/login",
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // 인증이 필요한데 로그인하지 않은 경우
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    // 로그인했는데 인증이 필요없는 페이지인 경우 (로그인/회원가입 페이지)
    if (!requireAuth && isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    // 역할 확인
    if (isAuthenticated && user && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }
    }

    // 권한 확인
    if (isAuthenticated && user && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every((permission) => {
        // 오너는 모든 권한
        if (user.role === "owner") return true;

        // 개별 권한 확인
        return (
          user.permissions[permission as keyof typeof user.permissions] || false
        );
      });

      if (!hasAllPermissions) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    user,
    isLoading,
    isAuthenticated,
    router,
    requireAuth,
    requiredRoles,
    requiredPermissions,
    fallbackUrl,
  ]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  // 로그인했는데 인증이 필요없는 페이지인 경우
  if (!requireAuth && isAuthenticated) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  // 모든 조건을 만족하는 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;

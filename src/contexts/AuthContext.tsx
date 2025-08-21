import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

// 타입 정의
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  role: string;
  role_display: string;
  gallery: {
    id: number;
    name: string;
    registration_code?: string;
  };
  permissions: {
    manage_clients: boolean;
    manage_artworks: boolean;
    export_data: boolean;
    send_messages: boolean;
    view_reports: boolean;
    manage_users: boolean;
    manage_gallery_settings: boolean;
  };
  settings: {
    timezone: string;
    language: string;
    theme: string;
  };
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  emergency_contact?: string;
  job_title?: string;
  registration_code: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => Promise<void>;
  checkPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API 기본 설정
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// 토큰 저장소 관리
const TokenStorage = {
  getTokens: (): AuthTokens | null => {
    if (typeof window === "undefined") return null;

    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (access && refresh) {
      return { access, refresh };
    }
    return null;
  },

  setTokens: (tokens: AuthTokens) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  },

  removeTokens: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user: User) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("user_data", JSON.stringify(user));
  },

  removeUser: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("user_data");
  },
};

// API 요청 헬퍼
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // 토큰이 필요한 요청에 Authorization 헤더 추가
  const tokens = TokenStorage.getTokens();
  if (tokens && !endpoint.includes("/auth/")) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${tokens.access}`,
    };
  }

  const response = await fetch(url, config);

  // 인증 오류 처리
  if (response.status === 401) {
    // 토큰 갱신 시도
    const refreshSuccess = await refreshTokenRequest();
    if (refreshSuccess) {
      // 토큰 갱신 성공 시 원래 요청 재시도
      const newTokens = TokenStorage.getTokens();
      if (newTokens) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newTokens.access}`,
        };
        return fetch(url, config);
      }
    } else {
      // 토큰 갱신 실패 시 로그아웃
      TokenStorage.removeTokens();
      TokenStorage.removeUser();
      window.location.href = "/auth/login";
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  return response;
};

// 토큰 갱신 요청
const refreshTokenRequest = async (): Promise<boolean> => {
  const tokens = TokenStorage.getTokens();
  if (!tokens) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      TokenStorage.setTokens({
        access: data.access,
        refresh: tokens.refresh, // refresh 토큰은 그대로 유지
      });

      // 사용자 정보 업데이트 (토큰 갱신 시 함께 전송됨)
      if (data.user) {
        TokenStorage.setUser(data.user);
      }

      return true;
    }
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
  }

  return false;
};

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 초기 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      const savedTokens = TokenStorage.getTokens();
      const savedUser = TokenStorage.getUser();

      if (savedTokens && savedUser) {
        setTokens(savedTokens);
        setUser(savedUser);

        // 토큰 유효성 검증
        try {
          const response = await apiRequest("/accounts/profile/");
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            TokenStorage.setUser(userData);
          } else {
            // 토큰 무효 시 로그아웃 처리
            TokenStorage.removeTokens();
            TokenStorage.removeUser();
            setTokens(null);
            setUser(null);
          }
        } catch (error) {
          console.error("사용자 정보 확인 실패:", error);
          TokenStorage.removeTokens();
          TokenStorage.removeUser();
          setTokens(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 로그인
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "로그인에 실패했습니다.");
      }

      const data = await response.json();

      const newTokens = {
        access: data.access,
        refresh: data.refresh,
      };

      setTokens(newTokens);
      setUser(data.user);

      TokenStorage.setTokens(newTokens);
      TokenStorage.setUser(data.user);

      router.push("/dashboard");
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입
  const register = async (data: RegisterData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const responseData = await response.json();

      // 회원가입 성공 후 자동 로그인
      await login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      if (tokens) {
        await apiRequest("/accounts/auth/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh: tokens.refresh }),
        });
      }
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      TokenStorage.removeTokens();
      TokenStorage.removeUser();
      setTokens(null);
      setUser(null);
      router.push("/auth/login");
    }
  };

  // 토큰 갱신
  const refreshToken = async (): Promise<boolean> => {
    if (!tokens) return false;

    const success = await refreshTokenRequest();
    if (success) {
      const newTokens = TokenStorage.getTokens();
      const newUser = TokenStorage.getUser();
      setTokens(newTokens);
      setUser(newUser);
    }

    return success;
  };

  // 프로필 업데이트
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await apiRequest("/accounts/profile/", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      TokenStorage.setUser(updatedUser);
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      throw error;
    }
  };

  // 비밀번호 변경
  const changePassword = async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    try {
      const response = await apiRequest("/accounts/password/change/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      throw error;
    }
  };

  // 권한 확인
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;

    // 오너는 모든 권한
    if (user.role === "owner") return true;

    // 개별 권한 확인
    return (
      user.permissions[permission as keyof typeof user.permissions] || false
    );
  };

  // 역할 확인
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    checkPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 안에서 사용되어야 합니다.");
  }
  return context;
};

// 권한 확인 훅
export const usePermission = (permission: string) => {
  const { checkPermission } = useAuth();
  return checkPermission(permission);
};

// 역할 확인 훅
export const useRole = (roles: string | string[]) => {
  const { hasRole } = useAuth();
  return hasRole(roles);
};

export default AuthContext;

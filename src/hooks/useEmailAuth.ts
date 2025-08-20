import { useState } from "react";

interface EmailAuthState {
  loading: boolean;
  error: string;
  email: string | null;
  codeSent: boolean;
}

interface EmailVerificationResponse {
  message: string;
  email: string;
}

interface EmailVerifyResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    gallery: {
      id: number;
      name: string;
    };
  };
}

export const useEmailAuth = () => {
  const [state, setState] = useState<EmailAuthState>({
    loading: false,
    error: "",
    email: null,
    codeSent: false,
  });

  // 이메일 인증번호 발송
  const sendVerificationCode = async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"}/accounts/auth/send-email-verification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "",
          email: email,
          codeSent: true,
        }));

        console.log("이메일 인증번호 발송 성공:", data.message);
        return { success: true, message: data.message };
      } else {
        const errorMessage = data.error || "이메일 인증번호 발송에 실패했습니다.";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("이메일 인증번호 발송 오류:", error);
      const errorMessage = error.message || "이메일 인증번호 발송에 실패했습니다.";
      
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // 인증번호 확인
  const verifyCode = async (email: string, code: string) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"}/accounts/auth/verify-email-code/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "",
        }));

        console.log("이메일 인증 성공:", data.message);
        return {
          verified: true,
          user: data.user,
          message: data.message,
        };
      } else {
        const errorMessage = data.error || "인증번호가 올바르지 않습니다.";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("이메일 인증 오류:", error);
      const errorMessage = error.message || "인증번호 확인에 실패했습니다.";
      
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // 이메일 인증번호 재발송
  const resendVerificationCode = async (email: string) => {
    return await sendVerificationCode(email);
  };

  // 상태 초기화
  const resetEmailAuth = () => {
    setState({
      loading: false,
      error: "",
      email: null,
      codeSent: false,
    });
  };

  return {
    ...state,
    sendVerificationCode,
    verifyCode,
    resendVerificationCode,
    resetEmailAuth,
  };
};

// 이메일 형식 검증 유틸리티 함수
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 인증번호 형식 검증 유틸리티 함수
export const validateVerificationCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};
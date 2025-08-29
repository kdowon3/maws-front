// SMS API 유틸리티 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// 토큰 가져오기
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// API 요청 헬퍼
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// 대량 SMS 발송
export interface SendBulkSMSRequest {
  client_ids: number[];
  message: string;
}

export interface SMSResult {
  client_id: number;
  client_name: string;
  phone: string;
  success: boolean;
  sid?: string;
  error?: string;
}

export interface SendBulkSMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    message_id: number;
    total_count: number;
    sent_count: number;
    failed_count: number;
    results?: SMSResult[];
  };
}

export const sendBulkSMS = async (
  clientIds: number[], 
  message: string
): Promise<SendBulkSMSResponse> => {
  return apiRequest('/sms/send/', {
    method: 'POST',
    body: JSON.stringify({
      client_ids: clientIds,
      message: message.trim()
    })
  });
};

// SMS 발송 이력 조회
export interface SMSHistoryItem {
  id: number;
  message_template: string;
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
  sender: string;
}

export interface SMSHistoryResponse {
  success: boolean;
  data?: SMSHistoryItem[];
  error?: string;
}

export const getSMSHistory = async (): Promise<SMSHistoryResponse> => {
  return apiRequest('/sms/history/');
};

// SMS 발송 상세 조회
export interface SMSDeliveryDetail {
  client_name: string;
  phone_number: string;
  status: string;
  twilio_status: string | null;
  sent_at: string | null;
  error_message: string | null;
}

export interface SMSMessageDetail {
  id: number;
  message_template: string;
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
  sender: string;
}

export interface SMSDetailResponse {
  success: boolean;
  data?: {
    message_info: SMSMessageDetail;
    deliveries: SMSDeliveryDetail[];
  };
  error?: string;
}

export const getSMSDetail = async (messageId: number): Promise<SMSDetailResponse> => {
  return apiRequest(`/sms/detail/${messageId}/`);
};

// SMS 발송 가능 여부 확인 (클라이언트 측 유효성 검사)
export const validateSMSData = (clientIds: number[], message: string) => {
  const errors: string[] = [];

  if (!clientIds || clientIds.length === 0) {
    errors.push('발송 대상 고객을 선택해주세요.');
  }

  if (!message || message.trim().length === 0) {
    errors.push('메시지 내용을 입력해주세요.');
  }

  if (message && message.length > 1000) {
    errors.push('메시지는 1000자를 초과할 수 없습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 에러 타입 정의
export class SMSAPIError extends Error {
  constructor(
    message: string, 
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SMSAPIError';
  }
}
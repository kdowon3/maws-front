import { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface PhoneAuthState {
    loading: boolean;
    error: string;
    verificationId: string | null;
    confirmationResult: ConfirmationResult | null;
}

export const usePhoneAuth = () => {
    const [state, setState] = useState<PhoneAuthState>({
        loading: false,
        error: '',
        verificationId: null,
        confirmationResult: null,
    });

    // reCAPTCHA 설정
    const setupRecaptcha = (containerId: string) => {
        if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
                size: 'normal',
                callback: (response: string) => {
                    console.log('reCAPTCHA solved, response:', response);
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                    setState((prev) => ({ ...prev, error: 'reCAPTCHA가 만료되었습니다. 다시 시도해주세요.' }));
                },
            });
        }
        return window.recaptchaVerifier;
    };

    // 전화번호 인증 코드 발송 (Firebase Web SDK 사용)
    const sendVerificationCode = async (phoneNumber: string, containerId: string = 'recaptcha-container') => {
        setState((prev) => ({ ...prev, loading: true, error: '' }));

        try {
            // reCAPTCHA 설정
            const verifier = setupRecaptcha(containerId);
            await verifier.render();

            // 한국 번호 형식으로 변환
            const formattedPhone = formatKoreanPhoneNumber(phoneNumber);

            // Firebase Phone Auth로 SMS 발송
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);

            setState((prev) => ({
                ...prev,
                loading: false,
                error: '',
                confirmationResult: confirmationResult,
            }));

            console.log('SMS sent successfully via Firebase');
            return { success: true };
        } catch (error: any) {
            console.error('Error sending SMS:', error);
            let errorMessage = 'SMS 발송에 실패했습니다.';

            if (error.code === 'auth/too-many-requests') {
                errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMessage = 'SMS 할당량이 초과되었습니다.';
            } else if (error.code === 'auth/invalid-phone-number') {
                errorMessage = '올바르지 않은 전화번호 형식입니다.';
            }

            setState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            throw error;
        }
    };

    // 인증 코드 확인 (Firebase Web SDK 사용)
    const verifyCode = async (code: string, phoneNumber: string) => {
        setState((prev) => ({ ...prev, loading: true, error: '' }));

        try {
            if (!state.confirmationResult) {
                throw new Error('인증번호를 먼저 요청해주세요.');
            }

            // Firebase로 인증 코드 확인
            const result = await state.confirmationResult.confirm(code);

            // ID 토큰 가져오기
            const idToken = await result.user.getIdToken();

            setState((prev) => ({
                ...prev,
                loading: false,
                error: '',
            }));

            console.log('Phone verification successful via Firebase');
            return {
                verified: true,
                phoneNumber: phoneNumber,
                idToken: idToken,
            };
        } catch (error: any) {
            console.error('Error verifying code:', error);
            let errorMessage = '인증번호가 올바르지 않습니다.';

            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = '인증번호가 올바르지 않습니다.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = '인증번호가 만료되었습니다. 새로 요청해주세요.';
            }

            setState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            throw error;
        }
    };

    // reCAPTCHA 초기화
    const resetRecaptcha = () => {
        if (typeof window !== 'undefined' && window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
        setState({
            loading: false,
            error: '',
            verificationId: null,
            confirmationResult: null,
        });
    };

    return {
        ...state,
        sendVerificationCode,
        verifyCode,
        resetRecaptcha,
    };
};

// 한국 전화번호를 국제 형식으로 변환
const formatKoreanPhoneNumber = (phoneNumber: string): string => {
    // 숫자만 추출
    const cleaned = phoneNumber.replace(/\D/g, '');

    // 이미 국가 코드가 있는 경우
    if (cleaned.startsWith('82')) {
        return `+${cleaned}`;
    }

    // 010으로 시작하는 한국 번호
    if (cleaned.startsWith('010')) {
        return `+82${cleaned.substring(1)}`;
    }

    // 기본적으로 한국 국가 코드 추가
    return `+82${cleaned}`;
};

// global 타입 확장
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
    }
}

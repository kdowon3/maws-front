import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEmailAuth, validateEmail, validateVerificationCode } from '@/hooks/useEmailAuth';

interface QuickSignupFormData {
    gallery_name: string;
    first_name: string;
    last_name: string;
    job_title: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    password_confirm: string;
}

interface SignupResponse {
    message: string;
    gallery: {
        id: number;
        name: string;
        registration_code: string;
    };
    user: {
        id: number;
        username: string;
        email: string;
        full_name: string;
        role: string;
        role_code: string;
    };
    next_steps: string[];
}

const QuickSignupForm: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // Email Auth
    const {
        sendVerificationCode,
        verifyCode,
        resendVerificationCode,
        resetEmailAuth,
        loading: emailAuthLoading,
        error: emailAuthError,
        codeSent,
    } = useEmailAuth();
    const [emailVerified, setEmailVerified] = useState(false);

    const [formData, setFormData] = useState<QuickSignupFormData>({
        gallery_name: '',
        first_name: '',
        last_name: '',
        job_title: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        password_confirm: '',
    });

    // 컴포넌트 언마운트 시 이메일 인증 상태 정리
    useEffect(() => {
        return () => {
            resetEmailAuth();
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 이메일 인증번호 발송
    const handleSendVerificationCode = async () => {
        // 인증 절차 임시 보류: 실제 전송 없이 다음 단계로 이동
        if (!formData.email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        if (!validateEmail(formData.email)) {
            setError('올바른 이메일 형식을 입력해주세요.');
            return;
        }

        setError('');
        // setSuccess('다음 단계로 이동합니다.'); // 안내 문구 임시 비활성화
        setEmailVerified(true);
        setStep(2);
    };

    // 이메일 인증번호 확인
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            setError('인증번호를 입력해주세요.');
            return;
        }

        if (!validateVerificationCode(verificationCode)) {
            setError('인증번호는 6자리 숫자여야 합니다.');
            return;
        }

        setError('');
        try {
            const result = await verifyCode(formData.email, verificationCode);
            setEmailVerified(true);
            setSuccess('이메일 인증이 완료되었습니다!');

            // 2초 후 다음 단계로
            setTimeout(() => {
                setStep(2);
            }, 1500);
        } catch (error) {
            console.error('인증 실패:', error);
        }
    };

    // 회원가입 처리
    const handleQuickSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailVerified) {
            setError('이메일 인증을 먼저 완료해주세요.');
            return;
        }

        if (formData.password !== formData.password_confirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/accounts/auth/quick-signup/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                const data: SignupResponse = await response.json();
                setSuccess(data.message);

                setTimeout(() => {
                    router.push('/auth/login?signup=success&gallery=' + encodeURIComponent(data.gallery.name));
                }, 2000);
            } else {
                const errorData = await response.json();
                if (typeof errorData === 'object' && errorData !== null) {
                    const errorMessages = Object.entries(errorData)
                        .filter(([key, value]) => Array.isArray(value))
                        .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                        .join('\n');
                    setError(errorMessages || '회원가입에 실패했습니다.');
                } else {
                    setError(errorData.error || '회원가입에 실패했습니다.');
                }
            }
        } catch (error) {
            setError('회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 현재 에러 메시지 (이메일 인증 에러 우선)
    const currentError = emailAuthError || error;
    const currentLoading = emailAuthLoading || loading;

    // Step 1: 기본 정보 입력 + 이메일 인증
    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">🎨 갤러리 만들기</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            갤러리명, 전화번호, 이메일을 입력하고 인증을 진행해주세요
                        </p>
                    </div>

                    <div className="mt-8 space-y-6">
                        {/* 기본 정보 입력 */}
                        <div>
                            <label htmlFor="gallery_name" className="block text-sm font-medium text-gray-700">
                                갤러리명 *
                            </label>
                            <input
                                id="gallery_name"
                                name="gallery_name"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="예: ABC 갤러리"
                                value={formData.gallery_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                    성 *
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                    이름 *
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                이메일 *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                전화번호 *
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                placeholder="010-1234-5678"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 이메일 인증 섹션 (임시 보류: 버튼만 다음 단계로 이동) */}
                        {!codeSent ? (
                            <div>
                                <button
                                    type="button"
                                    onClick={handleSendVerificationCode}
                                    disabled={
                                        !formData.gallery_name ||
                                        !formData.first_name ||
                                        !formData.last_name ||
                                        !formData.email ||
                                        !formData.phone ||
                                        currentLoading
                                    }
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentLoading ? '처리 중...' : '다음 단계로'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label
                                        htmlFor="verification_code"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        인증번호 (6자리)
                                    </label>
                                    <input
                                        id="verification_code"
                                        name="verification_code"
                                        type="text"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-xl tracking-widest"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <button
                                        onClick={handleVerifyCode}
                                        disabled={currentLoading || verificationCode.length !== 6 || emailVerified}
                                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {currentLoading ? '처리 중...' : '다음 단계로'}
                                    </button>
                                </div>

                                <div>
                                    <button
                                        onClick={() => handleSendVerificationCode()}
                                        disabled={currentLoading}
                                        className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        다시 진행
                                    </button>
                                </div>
                            </>
                        )}

                        {currentError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {currentError}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                                {success}
                            </div>
                        )}

                        <div className="text-center">
                            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 text-sm">
                                이미 계정이 있으신가요? 로그인
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: 계정 설정
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">🔐 계정 설정</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">마지막 단계입니다!</p>
                    {/* 인증 배너 임시 비활성화
                    {emailVerified && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800 text-center">✅ 이메일 인증 완료</p>
                        </div>
                    )}
                    */}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleQuickSignup}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            아이디 *
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                            직책 *
                        </label>
                        <input
                            id="job_title"
                            name="job_title"
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="예: 갤러리 디렉터, 큐레이터, 대표 등"
                            value={formData.job_title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            비밀번호 *
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                            비밀번호 확인 *
                        </label>
                        <input
                            id="password_confirm"
                            name="password_confirm"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                        />
                    </div>

                    {currentError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm whitespace-pre-wrap">
                            {currentError}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                            {success}
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            이전
                        </button>

                        <button
                            type="submit"
                            disabled={currentLoading || !emailVerified}
                            className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    갤러리 생성 중...
                                </>
                            ) : (
                                '🎨 갤러리 생성하고 시작하기'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickSignupForm;

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const RegisterForm: React.FC = () => {
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: '',
        emergency_contact: '',
        job_title: '',
        registration_code: '',
    });
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [codeValidation, setCodeValidation] = useState<{
        valid: boolean;
        message: string;
        gallery?: { name: string; user_count: number; max_users: number };
    } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateRegistrationCode = async () => {
        if (!formData.registration_code) {
            setError('가입 코드를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/accounts/validate-code/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ registration_code: formData.registration_code }),
                }
            );

            const data = await response.json();

            if (data.valid) {
                setCodeValidation(data);
                setError('');
                setStep(2);
            } else {
                setError(data.message);
                setCodeValidation(null);
            }
        } catch (error) {
            setError('가입 코드 확인 중 오류가 발생했습니다.');
            setCodeValidation(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 비밀번호 확인
        if (formData.password !== formData.password_confirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 필수 필드 확인
        if (
            !formData.username ||
            !formData.email ||
            !formData.password ||
            !formData.first_name ||
            !formData.last_name
        ) {
            setError('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            await register(formData);
        } catch (error: any) {
            try {
                const errorData = JSON.parse(error.message);
                const errorMessages = Object.values(errorData).flat().join(' ');
                setError(errorMessages);
            } catch {
                setError(error.message || '회원가입에 실패했습니다.');
            }
        }
    };

    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">MAWS 회원가입</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">갤러리 가입 코드를 입력해주세요</p>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="registration_code" className="block text-sm font-medium text-gray-700">
                                갤러리 가입 코드
                            </label>
                            <input
                                id="registration_code"
                                name="registration_code"
                                type="text"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="8자리 가입 코드 입력"
                                value={formData.registration_code}
                                onChange={handleChange}
                                maxLength={8}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="button"
                                onClick={validateRegistrationCode}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                다음 단계
                            </button>
                        </div>

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">회원 정보 입력</h2>
                    {codeValidation?.gallery && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800">
                                <strong>{codeValidation.gallery.name}</strong>에 가입합니다.
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                사용자 수: {codeValidation.gallery.user_count}/{codeValidation.gallery.max_users}
                            </p>
                        </div>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* 기본 정보 */}
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

                        {/* 계정 정보 */}
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

                        {/* 비밀번호 */}
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

                        {/* 연락처 */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                전화번호
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700">
                                비상연락처
                            </label>
                            <input
                                id="emergency_contact"
                                name="emergency_contact"
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.emergency_contact}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                                직책
                            </label>
                            <input
                                id="job_title"
                                name="job_title"
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="예: 큐레이터, 어시스턴트 등"
                                value={formData.job_title}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
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
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
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
                                    가입 중...
                                </>
                            ) : (
                                '회원가입'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;

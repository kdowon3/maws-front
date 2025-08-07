import React from 'react';
import Link from 'next/link';

const SignupOptions: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                {/* 헤더 */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">MAWS 시작하기</h2>
                    <p className="mt-2 text-lg text-gray-600">갤러리 관리를 더 쉽고 편리하게</p>
                </div>

                {/* 가입 카드 */}
                <div className="mt-10 max-w-lg mx-auto">
                    <Link href="/auth/quick-signup">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative p-8 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex flex-col items-center space-y-6">
                                {/* 배지 */}
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    간편 가입
                                </div>

                                {/* 아이콘 */}
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>

                                {/* 제목 */}
                                <h3 className="text-xl font-bold text-gray-900">갤러리 만들기</h3>

                                {/* 설명 */}
                                <p className="text-sm text-gray-600 text-center leading-relaxed">
                                    갤러리명과 전화번호만 입력하면
                                    <br />
                                    <strong>바로 사용할 수 있어요</strong>
                                </p>

                                {/* 특징들 */}
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>✓ 간단한 정보 입력</li>
                                    <li>✓ 전화번호 인증으로 안전</li>
                                    <li>✓ 즉시 갤러리 관리 시작</li>
                                    <li>✓ 14일 무료 체험</li>
                                </ul>

                                {/* 버튼 */}
                                <div className="pt-4">
                                    <span className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium text-sm group-hover:bg-blue-700 transition-colors">
                                        시작하기 →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 하단 링크 */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        이미 계정이 있으신가요?{' '}
                        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            로그인
                        </Link>
                    </p>
                </div>

                {/* 보안 정보 */}
                <div className="flex justify-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        안전한 가입
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        개인정보 보호
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                            />
                        </svg>
                        24/7 지원
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupOptions;

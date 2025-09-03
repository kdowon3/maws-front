import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-100 opacity-20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="break-keep">키아프&프리즈 2025 참가 갤러리 한정 혜택</span>
        </div>
        
        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight break-keep">
          페어가 끝난 뒤,<br />
          <span className="text-blue-600">고객을 놓치지 마세요.</span>
        </h1>
        
        {/* Sub headline */}
        <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed break-keep">
          무료 등록하면 2025년 내내<br />
          <span className="font-semibold text-gray-800">캡션·보증서·고객 관리까지 자동화됩니다.</span>
        </p>
        
        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/auth/quick-signup">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <span className="break-keep">무료 등록하기</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 break-keep">
            신용카드 불필요 · 3분 만에 시작 · 부담 없이 시작해보세요
          </p>
        </div>
        
        {/* Value proposition */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1 break-keep">2025년</div>
              <div className="text-sm text-gray-600 break-keep">완전 무료</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1 break-keep">3분</div>
              <div className="text-sm text-gray-600 break-keep">설정 완료</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1 break-keep">무제한</div>
              <div className="text-sm text-gray-600 break-keep">모든 기능</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
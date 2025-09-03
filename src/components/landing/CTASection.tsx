import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Gift, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const CTASection = () => {
  const urgencyReasons = [
    '2025년 완전 무료 혜택',
    '3분만에 바로 시작 가능',
    '아트페어 특가 한정 제공',
    '신규 기능 업데이트 포함'
  ];

  return (
    <>
      {/* Main CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          {/* Urgency badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-medium mb-8">
            <Clock className="w-4 h-4" />
            <span className="break-keep">키아프&프리즈 2025 한정 특가 혜택</span>
          </div>
          
          {/* Main headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight break-keep">
            지금 무료 등록하면,<br />
            <span className="text-yellow-300">2025년 내내 모든 기능을</span><br />
            이용할 수 있습니다
          </h2>
          
          {/* Sub headline */}
          <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed break-keep">
            더 이상 엑셀과 수작업으로 고생하지 마세요.<br />
            갤러리 운영이 이렇게 쉬워집니다.
          </p>
          
          {/* Value props */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
            {urgencyReasons.map((reason, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                <span className="text-sm text-blue-100 font-medium break-keep">{reason}</span>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center items-center mb-8">
            <Link href="/auth/quick-signup">
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-gray-50 px-10 py-5 text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 group min-w-[280px]"
              >
                <Gift className="mr-3 w-6 h-6" />
                <span className="break-keep">무료 등록하기</span>
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Additional info */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-blue-100 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm break-keep">신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm break-keep">3분 안에 설정 완료</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="text-sm break-keep">2025년 모든 기능 무료</span>
            </div>
          </div>
          
          {/* Risk-free message */}
          <p className="text-blue-200 text-sm max-w-md mx-auto break-keep">
            무료 체험 기간 동안 충분히 경험해보세요.<br />
            언제든 자유롭게 시작하고 중단할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4 break-keep">MAWS</h3>
              <p className="text-gray-400 leading-relaxed break-keep">
                갤러리 전용 백오피스 SaaS<br />
                Make Awesome!
              </p>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4 break-keep">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p className="break-keep">키아프&프리즈 2025 현장에서 만나요!</p>
                <p className="break-keep">QR코드 스캔으로 바로 가입</p>
              </div>
            </div>
            
            {/* Features */}
            <div>
              <h4 className="text-lg font-semibold mb-4 break-keep">주요 기능</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="break-keep">작품 정보 관리</li>
                <li className="break-keep">고객 데이터베이스</li>
                <li className="break-keep">보증서 자동 발급</li>
                <li className="break-keep">SMS 대량 발송</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm break-keep">
              © 2025 MAWS. 갤러리 운영의 새로운 기준.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CTASection;
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Clock, Zap, ArrowRight, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

const BenefitsSection = () => {
  const benefits = [
    '작품 정보 관리 (무제한)',
    '고객 데이터베이스',
    'VIP 태그 시스템',
    'SMS 대량 발송',
    '보증서 자동 생성',
    '엑셀 데이터 업로드',
    '실시간 검색 기능',
    '갤러리별 독립 관리'
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-sm font-medium mb-6">
            <Gift className="w-4 h-4" />
            <span className="break-keep">키아프&프리즈 2025 참가 갤러리 한정 혜택</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 break-keep">
            <span className="text-blue-600">지금 등록하면</span><br />
            2025년 내내 무료
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto break-keep">
            신규 기능 업데이트 포함해서 모든 기능을 무료로 이용하세요.
          </p>
        </div>

        {/* Main benefit card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 sm:p-12 mb-12 border border-blue-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Value proposition */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 break-keep">2025년 완전 무료</div>
                  <div className="text-blue-600 font-medium break-keep">아트페어 특가 혜택</div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1 break-keep">완전 무료</div>
                  <div className="text-sm text-gray-600 break-keep">2025년 내내</div>
                </div>
              </div>

              <Link href="/auth/quick-signup">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <span className="break-keep">지금 무료 등록하기</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right side - Benefits list */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 break-keep">
                포함된 모든 기능
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium break-keep">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2 break-keep">지금 등록</h4>
            <p className="text-gray-600 text-sm break-keep">3분 만에 간편 가입<br />바로 사용 시작</p>
          </div>
          
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2 break-keep">2025년 내내</h4>
            <p className="text-gray-600 text-sm break-keep">모든 기능 무료<br />신규 업데이트 포함</p>
          </div>
          
          <div className="relative">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2 break-keep">2026년부터</h4>
            <p className="text-gray-600 text-sm break-keep">유료 전환<br />프리미엄 서비스</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
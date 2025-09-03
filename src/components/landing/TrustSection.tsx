import React, { useState } from 'react';
import { Shield, Database, Building, CheckCircle, Lock, Cloud, Eye, EyeOff } from 'lucide-react';

const TrustSection = () => {
  const trustFeatures = [
    {
      icon: Shield,
      title: '계정별 암호화',
      description: '각 갤러리마다 고유한 암호화 키로 데이터를 보호합니다',
      color: 'blue',
      example: {
        original: '김민수 010-1234-5678',
        encrypted: 'gAAAAABhZ2xK7vQ8x9mE...'
      }
    },
    {
      icon: Database,
      title: '갤러리별 독립 DB',
      description: '각 갤러리마다 완전히 분리된 데이터베이스를 제공합니다',
      color: 'green'
    },
    {
      icon: Building,
      title: '갤러리 전용 ERP',
      description: '작가용 툴이 아닌 갤러리 운영에 특화된 시스템입니다',
      color: 'purple'
    }
  ];

  const securityBadges = [
    { icon: Lock, text: 'HTTPS 암호화' },
    { icon: Cloud, text: '클라우드 인프라' },
    { icon: Shield, text: '계정별 암호화 키' },
    { icon: Database, text: '데이터 암호화 저장' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 break-keep">
            <span className="text-blue-600">안전하고 신뢰할 수 있는</span><br />
            갤러리 전용 시스템
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto break-keep">
            갤러리 업계를 완벽히 이해한 전문가가 만든<br />
            갤러리만을 위한 백오피스 솔루션입니다.
          </p>
        </div>

        {/* Trust features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <TrustFeatureCard key={index} feature={feature} IconComponent={IconComponent} getColorClasses={getColorClasses} />
            );
          })}
        </div>

        {/* Security badges */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8 break-keep">
            보안 및 기술 인증
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {securityBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="flex items-center justify-center gap-3 bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 break-keep">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key differentiators */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12 border border-blue-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Why choose us */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 break-keep">
                왜 MAWS를 선택해야 할까요?
              </h3>
              
              <div className="space-y-4">
                {[
                  '갤러리 운영 현실을 깊이 이해한 팀',
                  '아트페어 현장 경험을 바탕으로 설계',
                  '실제 갤러리 운영자들의 피드백 반영',
                  '작가용 툴과 완전히 다른 전용 시스템'
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium break-keep">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Stats or testimonial placeholder */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2 break-keep">100%</div>
                <div className="text-gray-600 mb-4 break-keep">갤러리 전용 설계</div>
                <div className="text-sm text-gray-500 leading-relaxed break-keep">
                  "작가 포트폴리오 관리가 아닌<br />
                  갤러리 백오피스 업무에만 집중한<br />
                  유일한 전문 시스템입니다."
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900 break-keep">2025년</div>
                    <div className="text-sm text-gray-600 break-keep">완전 무료</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 break-keep">5분</div>
                    <div className="text-sm text-gray-600 break-keep">설정 완료</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TrustFeatureCard = ({ feature, IconComponent, getColorClasses }) => {
  const [showExample, setShowExample] = useState(false);
  
  return (
    <div className="text-center group relative">
      <div className={`w-20 h-20 ${getColorClasses(feature.color)} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <IconComponent className="w-10 h-10" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-4 break-keep">
        {feature.title}
      </h3>
      
      <p className="text-gray-600 leading-relaxed mb-4 break-keep">
        {feature.description}
      </p>
      
      {/* 예시 토글 버튼 */}
      {feature.example && (
        <button 
          onClick={() => setShowExample(!showExample)}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {showExample ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="break-keep">{showExample ? '예시 숨기기' : '예시 보기'}</span>
        </button>
      )}
      
      {/* 예시 표시 */}
      {feature.example && showExample && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left">
          {feature.title === '계정별 암호화' && (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1 break-keep">원본 데이터:</div>
                <div className="font-mono text-sm text-gray-800 bg-white p-2 rounded border">
                  {feature.example.original}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="text-blue-600 text-sm">🔒 암호화</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 break-keep">암호화된 데이터:</div>
                <div className="font-mono text-sm text-gray-600 bg-white p-2 rounded border break-all">
                  {feature.example.encrypted}
                </div>
              </div>
              <div className="text-xs text-gray-500 italic break-keep">
                * 서버 관리자도 원본 데이터를 볼 수 없습니다
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};

export default TrustSection;
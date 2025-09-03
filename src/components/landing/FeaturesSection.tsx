import React from 'react';
import { Clock, Users, Zap, CheckCircle } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Clock,
      title: '반복 업무 자동화',
      description: '캡션 50개, 보증서 20개 — 클릭 몇 번이면 끝',
      details: [
        '작품 정보 한 번 입력으로 캡션 자동 생성',
        '보증서 템플릿으로 즉시 PDF 발급',
        '엑셀 업로드로 대량 데이터 처리'
      ],
      color: 'blue'
    },
    {
      icon: Users,
      title: '고객 관리 강화',
      description: 'VIP 태그 & 구매 이력으로 고객을 놓치지 않음',
      details: [
        '고객별 맞춤 태그로 세분화 관리',
        '구매 작품과 고객 자동 연결',
        '대량 SMS 발송으로 전시 안내'
      ],
      color: 'green'
    },
    {
      icon: Zap,
      title: '갤러리 운영 효율화',
      description: '모든 데이터가 한 곳에서 실시간 동기화',
      details: [
        '작품-고객-판매 정보 통합 관리',
        '실시간 검색으로 정보 즉시 확인',
        '갤러리별 독립된 안전한 데이터'
      ],
      color: 'purple'
    }
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 break-keep">
            갤러리 운영이 <span className="text-blue-600">이렇게 쉬워집니다</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto break-keep">
            반복되는 업무는 자동화하고, 고객 관리는 체계화하여<br />
            정말 중요한 전시 기획에만 집중하세요.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className={`w-16 h-16 rounded-xl ${getColorClasses(feature.color)} flex items-center justify-center mb-6`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 break-keep">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg break-keep">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-keep">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-medium">
            <Zap className="w-5 h-5" />
            <span className="break-keep">지금 시작하면 모든 기능을 2025년 내내 무료로 이용</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
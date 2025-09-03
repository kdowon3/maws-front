import React from 'react';
import { Card } from '@/components/ui/card';
import { Palette, ShoppingBag, Megaphone, ArrowRight, Play } from 'lucide-react';

const ScenariosSection = () => {
  const scenarios = [
    {
      icon: Palette,
      step: "01",
      title: "전시 준비",
      subtitle: "작품 정보부터 캡션까지 한 번에",
      description: "작품 리스트와 작가 정보를 입력하면 전시용 캡션이 자동으로 생성됩니다.",
      features: [
        "작품 정보 일괄 업로드 (엑셀)",
        "한영 작품명/작가명 동시 관리", 
        "전시 캡션 자동 생성",
        "작품 이미지 고화질 저장"
      ],
      color: "blue",
      gradient: "from-blue-50 to-blue-100"
    },
    {
      icon: ShoppingBag,
      step: "02", 
      title: "판매 후",
      subtitle: "보증서 발급부터 고객 등록까지",
      description: "작품이 판매되면 보증서를 자동 발급하고 구매자 정보가 고객 리스트에 추가됩니다.",
      features: [
        "보증서 원클릭 PDF 발급",
        "구매자 정보 자동 고객 등록",
        "VIP 태그로 고객 분류",
        "구매 이력 자동 연결"
      ],
      color: "green",
      gradient: "from-green-50 to-green-100"
    },
    {
      icon: Megaphone,
      step: "03",
      title: "홍보",
      subtitle: "고객별 맞춤 전시 안내",
      description: "VIP 고객, 단골 고객 등 태그별로 구분해서 새 전시 소식을 SMS로 발송합니다.",
      features: [
        "태그별 고객 선별 발송",
        "대량 SMS 발송 서비스",
        "발송 성공/실패 실시간 확인",
        "고객 반응 추적 관리"
      ],
      color: "purple", 
      gradient: "from-purple-50 to-purple-100"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { 
        icon: 'bg-blue-600 text-white',
        step: 'text-blue-600',
        border: 'border-blue-200 hover:border-blue-300'
      },
      green: { 
        icon: 'bg-green-600 text-white',
        step: 'text-green-600', 
        border: 'border-green-200 hover:border-green-300'
      },
      purple: { 
        icon: 'bg-purple-600 text-white',
        step: 'text-purple-600',
        border: 'border-purple-200 hover:border-purple-300'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 break-keep">
            <span className="text-blue-600">실제 갤러리 운영</span>은<br />
            이렇게 달라집니다
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto break-keep">
            전시 준비부터 판매 후 관리, 고객 홍보까지<br />
            모든 과정이 자동화됩니다.
          </p>
        </div>

        {/* Scenarios grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {scenarios.map((scenario, index) => {
            const IconComponent = scenario.icon;
            const colors = getColorClasses(scenario.color);
            
            return (
              <Card 
                key={index} 
                className={`relative p-8 border-2 ${colors.border} hover:shadow-xl transition-all duration-300 group cursor-pointer bg-gradient-to-br ${scenario.gradient}`}
              >
                {/* Step number */}
                <div className={`text-6xl font-bold ${colors.step} opacity-10 absolute top-4 right-6`}>
                  {scenario.step}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`text-sm font-semibold ${colors.step} mb-2 break-keep`}>
                    STEP {scenario.step}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 break-keep">
                    {scenario.title}
                  </h3>
                  
                  <p className="text-lg font-medium text-gray-700 mb-4 break-keep">
                    {scenario.subtitle}
                  </p>
                  
                  <p className="text-gray-600 mb-6 break-keep">
                    {scenario.description}
                  </p>
                  
                  {/* Features list */}
                  <ul className="space-y-2">
                    {scenario.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-700">
                        <Play className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="break-keep">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Hover arrow */}
                <ArrowRight className={`w-5 h-5 ${colors.step} absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </Card>
            );
          })}
        </div>

        {/* Process flow visualization */}
        <div className="relative">
          <div className="flex justify-center items-center">
            <div className="hidden lg:flex items-center gap-8">
              {scenarios.map((scenario, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      scenario.color === 'blue' ? 'bg-blue-600' : 
                      scenario.color === 'green' ? 'bg-green-600' : 'bg-purple-600'
                    }`}>
                      {scenario.step}
                    </div>
                    <span className="text-sm font-medium text-gray-600 mt-2 break-keep">
                      {scenario.title}
                    </span>
                  </div>
                  
                  {index < scenarios.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScenariosSection;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Monitor, Tablet, Smartphone, CheckCircle } from 'lucide-react';

const MobileWarningModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 디바이스 감지
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      
      return isMobileDevice && isSmallScreen;
    };

    const mobile = checkMobile();
    setIsMobile(mobile);
    
    // 모바일이고, 이전에 모달을 본 적이 없으면 표시
    if (mobile && !localStorage.getItem('maws-mobile-warning-seen')) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('maws-mobile-warning-seen', 'true');
  };

  const handleContinue = () => {
    handleClose();
  };

  if (!isMobile || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            회원이 되신 것을 환영합니다! 🎉
          </h2>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            MAWS는 갤러리 업무용 시스템으로<br />
            더 나은 경험을 위해 <span className="font-semibold text-gray-800">태블릿, 노트북</span> 사용을 권장합니다
          </p>
        </div>

        {/* 권장 디바이스 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">노트북 / 데스크톱</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <Tablet className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">태블릿 (가로 모드)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex-shrink-0"></div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">모바일 (제한적 기능)</span>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">💼 업무 효율을 위한 권장사항</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 엑셀 파일 업로드 및 다운로드</li>
            <li>• 여러 창으로 작업 동시 진행</li>
            <li>• 키보드 단축키 활용</li>
            <li>• 큰 화면에서 데이터 한눈에 확인</li>
          </ul>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <Button 
            onClick={handleContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            모바일에서 계속하기
          </Button>
        </div>

        {/* 작은 안내 문구 */}
        <p className="text-xs text-gray-500 text-center mt-4">
          이 메시지는 다시 표시되지 않습니다
        </p>
      </div>
    </div>
  );
};

export default MobileWarningModal;
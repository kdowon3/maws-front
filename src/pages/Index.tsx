
import React from "react";
import { Calendar, FileText, Mail, UserPlus, Check, Plus } from "lucide-react";
import { toast } from "sonner";

import Navbar from "../components/dashboard/Navbar";
import MetricCard from "../components/dashboard/MetricCard";
import ActionCard from "../components/dashboard/ActionCard";
import ActivityLog from "../components/dashboard/ActivityLog";

const Index = () => {
  const handleAction = (action: string) => {
    toast.success(`${action} 화면으로 이동합니다.`);
  };

  // 활동 로그 샘플 데이터
  const activityLogs = [
    {
      id: 1,
      action: "보증서 발급 완료",
      user: "김갤러리",
      timestamp: "방금 전",
      details: "작품명: 봄의 시작 - 김작가"
    },
    {
      id: 2,
      action: "신규 고객 등록",
      user: "이매니저",
      timestamp: "1시간 전",
      details: "고객명: 홍길동"
    },
    {
      id: 3,
      action: "문자 발송 완료",
      user: "박큐레이터",
      timestamp: "3시간 전",
      details: "발송 대상: 전체 컬렉터 (32명)"
    },
    {
      id: 4,
      action: "거래 기록 등록",
      user: "김갤러리",
      timestamp: "어제",
      details: "작품명: 겨울 풍경 - 이작가"
    },
    {
      id: 5,
      action: "보증서 발급 완료",
      user: "이매니저",
      timestamp: "어제",
      details: "작품명: 푸른 바다 - 박작가"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-lightGray">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <div className="mt-4 md:mt-0">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-brand-blue">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard 
            title="신규 고객 수" 
            value="12" 
            icon={<UserPlus size={24} />} 
            change="전월 대비 +3" 
            trend="up"
          />
          <MetricCard 
            title="문자 발송 수" 
            value="284" 
            icon={<Mail size={24} />}
            change="전월 대비 +24" 
            trend="up"
          />
          <MetricCard 
            title="거래 기록 수" 
            value="56" 
            icon={<FileText size={24} />}
            change="전월 대비 -5" 
            trend="down"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">주요 작업</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard 
                title="보증서 발급" 
                description="작품 정보를 입력하고 보증서를 발급합니다" 
                icon={<Check size={20} />} 
                onClick={() => handleAction("보증서 발급")}
              />
              <ActionCard 
                title="고객 등록" 
                description="새로운 고객 정보를 시스템에 등록합니다" 
                icon={<UserPlus size={20} />}
                onClick={() => handleAction("고객 등록")}
              />
              <ActionCard 
                title="문자 발송" 
                description="고객에게 안내 문자를 발송합니다" 
                icon={<Mail size={20} />}
                onClick={() => handleAction("문자 발송")}
              />
              <ActionCard 
                title="작품 등록" 
                description="새로운 작품 정보를 시스템에 등록합니다" 
                icon={<Plus size={20} />}
                onClick={() => handleAction("작품 등록")}
              />
            </div>

            <div className="mt-8 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">이번달 주요 지표</h2>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">보증서 발급 횟수</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">48</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">평균 응답 시간</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">1.2시간</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">신규 고객</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">12명</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">총 거래액</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">3.6억</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <ActivityLog activities={activityLogs} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            © 2025 MAWS. 갤러리 실무 자동화 시스템.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

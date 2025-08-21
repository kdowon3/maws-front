import React, { useState } from "react";
import PrintPreview from "./PrintPreview";
import CaptionTemplate1 from "./CaptionTemplate1";
import CaptionTemplate2 from "./CaptionTemplate2";
import CaptionTemplate3 from "./CaptionTemplate3";
import CaptionTemplate4 from "./CaptionTemplate4";
import CaptionTemplate5 from "./CaptionTemplate5";
import CaptionTemplate6 from "./CaptionTemplate6";
import CaptionTemplate7 from "./CaptionTemplate7";
import CaptionTemplate8 from "./CaptionTemplate8";
import { testScenarios } from "@/data/dummyCaptions";

// 모든 사용 가능한 템플릿들
const availableTemplates = {
  "Template 1": CaptionTemplate1,
  "Template 2": CaptionTemplate2,
  "Template 3": CaptionTemplate3,
  "Template 4": CaptionTemplate4,
  "Template 5": CaptionTemplate5,
  "Template 6": CaptionTemplate6,
  "Template 7": CaptionTemplate7,
  "Template 8": CaptionTemplate8,
};

const CaptionTestPage: React.FC = () => {
  const [selectedDataset, setSelectedDataset] =
    useState<keyof typeof testScenarios>("basic");
  const [selectedTemplate, setSelectedTemplate] =
    useState<keyof typeof availableTemplates>("Template 1");
  const [customCount, setCustomCount] = useState<number>(15);

  // 데이터셋 정보
  const datasetInfo = {
    basic: "기본 15개 - 다양한 작품 유형",
    converted: "변환된 15개 - 기존 시스템 호환 형식",
    variableSizes: "다양한 크기 5개 - 크기 테스트용",
    large: "대량 30개 - 성능 테스트용",
    small: "소량 3개 - 빠른 테스트용",
    single: "단일 1개 - 레이아웃 확인용",
  };

  // 선택된 데이터셋
  const selectedData = testScenarios[selectedDataset];

  // 커스텀 개수 적용 (기본 데이터셋에서 슬라이스)
  const finalData =
    selectedDataset === "basic"
      ? testScenarios.basic.slice(0, customCount)
      : selectedData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 캡션 미리보기 테스트 페이지
          </h1>
          <p className="text-gray-600">
            지능형 2단 컬럼 레이아웃으로 최적화된 캡션 배치를 테스트해보세요
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✨ 자동 공간 최적화
            </span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              🚫 캡션 절단 방지
            </span>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              📊 실시간 통계
            </span>
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">⚙️ 테스트 설정</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 데이터셋 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 데이터셋 선택
              </label>
              <select
                value={selectedDataset}
                onChange={(e) =>
                  setSelectedDataset(
                    e.target.value as keyof typeof testScenarios,
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(datasetInfo).map(([key, description]) => (
                  <option key={key} value={key}>
                    {description}
                  </option>
                ))}
              </select>
            </div>

            {/* 템플릿 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎨 캡션 템플릿 ({Object.keys(availableTemplates).length}개)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) =>
                  setSelectedTemplate(
                    e.target.value as keyof typeof availableTemplates,
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.keys(availableTemplates).map((templateName) => (
                  <option key={templateName} value={templateName}>
                    {templateName}
                  </option>
                ))}
              </select>
            </div>

            {/* 커스텀 개수 (기본 데이터셋일 때만) */}
            {selectedDataset === "basic" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔢 캡션 개수 (1-15)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={customCount}
                  onChange={(e) => setCustomCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-500 mt-1">
                  {customCount}개
                </div>
              </div>
            )}
          </div>

          {/* 현재 설정 정보 */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <strong>현재 설정:</strong> {datasetInfo[selectedDataset]} •{" "}
                {selectedTemplate} • 총 {finalData.length}개 캡션
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  {selectedTemplate}
                </span>
                <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
                  {finalData.length}개
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 테스트 버튼들 */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-md font-medium mb-3">🚀 빠른 테스트</h3>

          {/* 데이터셋 빠른 선택 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              📊 데이터셋
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDataset("single")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedDataset === "single"
                    ? "bg-green-200 text-green-800 font-medium"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                단일 캡션 (1개)
              </button>
              <button
                onClick={() => setSelectedDataset("small")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedDataset === "small"
                    ? "bg-blue-200 text-blue-800 font-medium"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                소량 테스트 (3개)
              </button>
              <button
                onClick={() => setSelectedDataset("basic")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedDataset === "basic"
                    ? "bg-purple-200 text-purple-800 font-medium"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                표준 테스트 (15개)
              </button>
              <button
                onClick={() => setSelectedDataset("variableSizes")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedDataset === "variableSizes"
                    ? "bg-yellow-200 text-yellow-800 font-medium"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                크기 다양성 (5개)
              </button>
              <button
                onClick={() => setSelectedDataset("large")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedDataset === "large"
                    ? "bg-red-200 text-red-800 font-medium"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                대량 테스트 (30개)
              </button>
            </div>
          </div>

          {/* 템플릿 빠른 선택 */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              🎨 템플릿
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Object.keys(availableTemplates).map((templateName) => (
                <button
                  key={templateName}
                  onClick={() =>
                    setSelectedTemplate(
                      templateName as keyof typeof availableTemplates,
                    )
                  }
                  className={`px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    selectedTemplate === templateName
                      ? "bg-indigo-200 text-indigo-800 ring-2 ring-indigo-300"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                  title={`${templateName} 미리보기`}
                >
                  {templateName.replace("Template ", "T")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 프리뷰 영역 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <PrintPreview
            artworks={finalData}
            template={availableTemplates[selectedTemplate]}
            templateName={selectedTemplate}
          />
        </div>

        {/* 디버그 정보 */}
        <details className="mt-6 bg-gray-100 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            🔍 디버그 정보 (개발자용)
          </summary>
          <div className="mt-4 space-y-2 text-sm font-mono">
            <div>
              <strong>데이터셋:</strong> {selectedDataset}
            </div>
            <div>
              <strong>템플릿:</strong> {selectedTemplate}
            </div>
            <div>
              <strong>총 캡션 수:</strong> {finalData.length}
            </div>
            <div>
              <strong>첫 번째 캡션:</strong>
            </div>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(finalData[0], null, 2)}
            </pre>
          </div>
        </details>

        {/* 사용 팁 */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-3">💡 테스트 가이드</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div>
              <h4 className="font-medium mb-2">📊 데이터셋별 테스트</h4>
              <ul className="space-y-1">
                <li>
                  • <strong>단일 캡션</strong>: 템플릿 기본 디자인 확인
                </li>
                <li>
                  • <strong>소량 테스트</strong>: 2단 컬럼 배치 확인
                </li>
                <li>
                  • <strong>표준 테스트</strong>: 페이지 넘김 로직 확인
                </li>
                <li>
                  • <strong>크기 다양성</strong>: 다양한 캡션 크기 대응
                </li>
                <li>
                  • <strong>대량 테스트</strong>: 성능 및 다중 페이지
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎨 템플릿별 테스트</h4>
              <ul className="space-y-1">
                <li>
                  • <strong>Template 1-8</strong>: 각각 다른 레이아웃 스타일
                </li>
                <li>
                  • <strong>빠른 전환</strong>: 상단 그리드에서 클릭으로 변경
                </li>
                <li>
                  • <strong>실시간 반영</strong>: 템플릿 변경 즉시 적용
                </li>
                <li>
                  • <strong>PDF 다운로드</strong>: 각 템플릿별 결과 비교
                </li>
                <li>
                  • <strong>통계 확인</strong>: 템플릿별 공간 효율성 비교
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionTestPage;

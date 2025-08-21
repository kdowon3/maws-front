import React, { useEffect, useState } from "react";
import { getArtworks } from "@/utils/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  CaptionTemplate1,
  CaptionTemplate2,
  CaptionTemplate3,
  CaptionTemplate4,
  CaptionTemplate5,
  CaptionTemplate6,
  CaptionTemplate7,
  CaptionTemplate8,
  type ArtworkData,
} from "@/components/captiontemplate";
import PrintPreview from "@/components/captiontemplate/PrintPreview";

// 템플릿 매핑
const TEMPLATES = {
  1: CaptionTemplate1,
  2: CaptionTemplate2,
  3: CaptionTemplate3,
  4: CaptionTemplate4,
  5: CaptionTemplate5,
  6: CaptionTemplate6,
  7: CaptionTemplate7,
  8: CaptionTemplate8,
};

// 템플릿 이름 매핑
const TEMPLATE_NAMES = {
  1: "템플릿 1 - 작품명 중앙, 재료/크기/연도 하단",
  2: "템플릿 2 - 작가명 상단, 작품명 중앙, 상세정보 하단",
  3: "템플릿 3 - 영문 우선 표시",
  4: "템플릿 4 - 작품명 중앙 크게, 크기/재료/연도 하단",
  5: "템플릿 5 - 무제 작품용",
  6: "템플릿 6 - 설명 포함 (모나리자 스타일)",
  7: "템플릿 7 - 미니멀한 형태",
  8: "템플릿 8 - 카드 형태 (라벨 포함)",
};

const CaptionBatchPage = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1); // 기본값을 템플릿 1로 변경
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 사이드바 접기 상태

  useEffect(() => {
    getArtworks()
      .then((data) => {
        // 페이지네이션 응답에서 results 배열 추출
        const artworksData = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];
        setArtworks(artworksData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 선택된 작품들이 변경될 때마다 selectedArtworks 업데이트
  useEffect(() => {
    const filtered = Array.isArray(artworks)
      ? artworks.filter((a) => selectedIds.includes(a.id))
      : [];
    setSelectedArtworks(filtered);
  }, [selectedIds, artworks]);

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const TemplateComponent =
    TEMPLATES[selectedTemplate as keyof typeof TEMPLATES] || CaptionTemplate1;
  const templateName =
    TEMPLATE_NAMES[selectedTemplate as keyof typeof TEMPLATE_NAMES] || "";

  return (
    <div className="container mx-auto py-8 max-w-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">작품 캡션 일괄 생성</h1>
          <p className="text-gray-600 mt-2">
            여러 작품을 선택하고, 한글/영문 캡션을 한 번에 출력/복사/내보내기 할
            수 있습니다.
          </p>
        </div>

        {/* 사이드바 토글 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center gap-2"
        >
          {sidebarCollapsed ? (
            <>
              <ChevronRight className="h-4 w-4" />
              작품 선택 펼치기
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              작품 선택 접기
            </>
          )}
        </Button>
      </div>

      {/* 템플릿 선택 */}
      <div className="mb-6">
        <label
          htmlFor="template-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          캡션 템플릿 선택
        </label>
        <select
          id="template-select"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(Number(e.target.value))}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
        >
          <option value={1}>템플릿 1 - 작품명 중앙, 재료/크기/연도 하단</option>
          <option value={2}>
            템플릿 2 - 작가명 상단, 작품명 중앙, 상세정보 하단
          </option>
          <option value={3}>템플릿 3 - 영문 우선 표시</option>
          <option value={4}>
            템플릿 4 - 작품명 중앙 크게, 크기/재료/연도 하단
          </option>
          <option value={5}>템플릿 5 - 무제 작품용</option>
          <option value={6}>템플릿 6 - 설명 포함 (모나리자 스타일)</option>
          <option value={7}>템플릿 7 - 미니멀한 형태</option>
          <option value={8}>템플릿 8 - 카드 형태 (라벨 포함)</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* 좌측: 작품 리스트/선택 영역 - 접기 가능한 사이드바 */}
        <section
          className={`
                        border rounded-lg transition-all duration-300 ease-in-out overflow-hidden
                        ${sidebarCollapsed ? "w-16 min-w-16" : "w-80 min-w-80"}
                    `}
          style={{ minHeight: "600px" }}
        >
          <div className="p-4 h-full">
            {sidebarCollapsed ? (
              /* 접힌 상태: 간단한 정보만 표시 */
              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-gray-500 text-center">작품</div>
                <div className="text-sm font-semibold text-center">
                  {selectedIds.length}
                </div>
                <div className="text-xs text-gray-500 text-center">선택됨</div>

                {/* 접힌 상태에서도 체크박스 표시 (세로로) */}
                {loading ? (
                  <div className="text-xs text-center">로딩</div>
                ) : error ? (
                  <div className="text-xs text-red-500 text-center">오류</div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                    {Array.isArray(artworks) &&
                      artworks.map((art) => (
                        <div key={art.id} className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(art.id)}
                            onChange={() => handleSelect(art.id)}
                            id={`artwork-checkbox-collapsed-${art.id}`}
                            className="cursor-pointer"
                            title={
                              art.title_ko || art.title_en || "(제목 없음)"
                            }
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              /* 펼친 상태: 전체 리스트 표시 */
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">작품 선택</h2>
                  <div className="text-sm text-gray-500">
                    {selectedIds.length}개 선택됨
                  </div>
                </div>

                {loading ? (
                  <div>로딩 중...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    <ul className="space-y-2">
                      {Array.isArray(artworks) &&
                        artworks.map((art) => (
                          <li
                            key={art.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(art.id)}
                              onChange={() => handleSelect(art.id)}
                              id={`artwork-checkbox-${art.id}`}
                              className="cursor-pointer"
                            />
                            <label
                              htmlFor={`artwork-checkbox-${art.id}`}
                              className="cursor-pointer flex-1 text-sm"
                            >
                              <div className="font-medium">
                                {art.title_ko || art.title_en || "(제목 없음)"}
                              </div>
                              {art.artist_ko && (
                                <div className="text-xs text-gray-500">
                                  {art.artist_ko}
                                </div>
                              )}
                            </label>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* 우측: 전시용 캡션 미리보기 - 남은 공간 모두 활용 */}
        <section className="flex-1 border rounded-lg">
          <div className="p-4 h-full" style={{ minHeight: "600px" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">캡션 미리보기</h2>
              {selectedIds.length > 0 && (
                <div className="text-sm text-gray-500">
                  {selectedIds.length}개 작품의 캡션
                </div>
              )}
            </div>

            <div className="h-full overflow-auto">
              {selectedIds.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-lg mb-2">작품을 선택해주세요</div>
                    <div className="text-sm">
                      좌측에서 캡션을 생성할 작품을 선택하면 여기에 미리보기가
                      표시됩니다.
                    </div>
                  </div>
                </div>
              ) : (
                <PrintPreview
                  artworks={selectedArtworks}
                  template={TemplateComponent}
                  templateName={templateName}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CaptionBatchPage;

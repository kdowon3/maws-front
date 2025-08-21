import React, { useRef, useEffect, useState } from "react";
import { ArtworkData, CaptionTemplateComponent } from "./index";
import {
  measureCaptions,
  calculateOptimalLayout,
  optimizeColumnBalance,
  getLayoutStats,
  PageLayout,
  CaptionMeasurement,
  DEFAULT_LAYOUT_CONFIG,
} from "@/utils/captionLayout";

interface SmartPrintPreviewProps {
  artworks: ArtworkData[];
  template: CaptionTemplateComponent;
  templateName: string;
}

const SmartPrintPreview: React.FC<SmartPrintPreviewProps> = ({
  artworks,
  template: TemplateComponent,
  templateName,
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [layouts, setLayouts] = useState<PageLayout[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [layoutStats, setLayoutStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stylesInjected, setStylesInjected] = useState(false);

  // 클라이언트 사이드에서만 스타일 주입 (hydration 오류 방지)
  useEffect(() => {
    if (typeof window !== "undefined" && !stylesInjected) {
      const style = document.createElement("style");
      style.id = "smart-print-preview-styles";
      style.textContent = `
                @media print {
                    .smart-print-preview .page-container {
                        width: 210mm !important;
                        height: auto !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        background: #fff !important;
                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        page-break-after: always;
                        page-break-inside: avoid;
                    }
                    
                    .smart-print-preview .page-container:last-child {
                        page-break-after: avoid;
                    }
                    
                    .smart-print-preview .column {
                        break-inside: avoid-column;
                        page-break-inside: avoid;
                    }
                    
                    .smart-print-preview .caption-item {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        display: block;
                        margin-bottom: 3mm;
                    }
                    
                    .smart-print-preview .page-number {
                        display: none !important;
                    }
                }
                
                .smart-print-preview .page-container {
                    page-break-inside: avoid;
                    position: relative;
                }
                
                .smart-print-preview .caption-item {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin-bottom: 3mm;
                    display: block;
                }
                
                .smart-print-preview .caption-item > * {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                
                .smart-print-preview .smart-layout-container * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .smart-print-preview .pages-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
            `;

      document.head.appendChild(style);
      setStylesInjected(true);

      return () => {
        const existingStyle = document.getElementById(
          "smart-print-preview-styles",
        );
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [stylesInjected]);

  // 레이아웃 계산
  useEffect(() => {
    if (artworks.length > 0) {
      calculateLayout();
    } else {
      setLayouts([]);
      setLayoutStats(null);
    }
  }, [artworks, templateName]);

  const calculateLayout = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      console.log("스마트 레이아웃 계산 시작:", {
        artworkCount: artworks.length,
      });

      // 1단계: 캡션 크기 측정 (템플릿 이름 전달)
      const measurements = await measureCaptions(
        artworks,
        TemplateComponent,
        undefined,
        templateName,
      );
      console.log("캡션 측정 완료:", measurements);

      // 2단계: 최적 레이아웃 계산
      const optimizedLayouts = calculateOptimalLayout(measurements);
      console.log("레이아웃 계산 완료:", optimizedLayouts);

      // 3단계: 컬럼 밸런싱 (선택적)
      const balancedLayouts = optimizeColumnBalance(optimizedLayouts);

      // 4단계: 통계 정보 생성
      const stats = getLayoutStats(balancedLayouts);
      console.log("레이아웃 통계:", stats);

      setLayouts(balancedLayouts);
      setLayoutStats(stats);
    } catch (err) {
      console.error("레이아웃 계산 실패:", err);
      setError("레이아웃 계산 중 오류가 발생했습니다.");
    } finally {
      setIsCalculating(false);
    }
  };

  // 스마트 PDF 다운로드
  const handleSmartPDFDownload = async () => {
    if (!pdfRef.current || layouts.length === 0) {
      console.log("PDF 다운로드 조건 실패:", {
        pdfRef: !!pdfRef.current,
        layoutsLength: layouts.length,
      });
      return;
    }

    console.log("PDF 다운로드 시작:", {
      layoutsLength: layouts.length,
      artworksLength: artworks.length,
    });

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const pdf = new jsPDF("p", "mm", "a4");

      // 각 페이지를 순차적으로 PDF에 추가 (빈 페이지 체크)
      let pageCount = 0;
      for (let i = 0; i < layouts.length; i++) {
        const pageElement = pdfRef.current.querySelector(
          `[data-page="${i}"]`,
        ) as HTMLElement;
        console.log(`페이지 ${i} 처리 중:`, {
          pageElement: !!pageElement,
          leftCaptions: layouts[i].leftColumn.length,
          rightCaptions: layouts[i].rightColumn.length,
        });

        if (!pageElement) {
          console.warn(`페이지 ${i} 요소를 찾을 수 없습니다.`);
          continue;
        }

        // 페이지에 실제 캡션이 있는지 확인
        const leftCaptions = layouts[i].leftColumn.length;
        const rightCaptions = layouts[i].rightColumn.length;

        if (leftCaptions === 0 && rightCaptions === 0) {
          console.log(`페이지 ${i}는 빈 페이지이므로 건너뜁니다.`);
          continue;
        }

        if (pageCount > 0) pdf.addPage(); // 첫 페이지가 아니면 페이지 추가
        pageCount++;

        console.log(`페이지 ${i} 요소 크기:`, {
          width: pageElement.offsetWidth,
          height: pageElement.offsetHeight,
          innerHTML: pageElement.innerHTML.substring(0, 500) + "...",
          captionItems: pageElement.querySelectorAll(".caption-item").length,
          captionContents: Array.from(
            pageElement.querySelectorAll(".caption-item"),
          ).map((item) => item.innerHTML.substring(0, 100) + "..."),
        });

        // 이미지 로딩을 위해 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 실제 페이지 요소의 크기 측정
        const rect = pageElement.getBoundingClientRect();
        const actualWidth = pageElement.scrollWidth || rect.width;
        const actualHeight = pageElement.scrollHeight || rect.height;

        console.log(`페이지 ${i} 실제 크기:`, {
          actualWidth,
          actualHeight,
          rect,
        });

        const canvas = await html2canvas(pageElement, {
          scale: 6, // 최고 해상도 (576 DPI급) - 인쇄용 품질
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false, // 로깅 줄이기
          removeContainer: false,
          foreignObjectRendering: false,
          imageTimeout: 15000,
          // 고정 크기 제거하여 실제 요소 크기 사용
          width: actualWidth,
          height: actualHeight,
          onclone: (clonedDoc) => {
            console.log("html2canvas onclone 시작");

            // 클론된 문서에서 캡션 페이지 경계 보호 강화
            const clonedElement = clonedDoc.querySelector(
              `[data-page="${i}"]`,
            ) as HTMLElement;
            if (clonedElement) {
              console.log("클론된 페이지 요소 발견:", clonedElement);

              // 클론된 문서에 우리 스타일을 다시 주입
              const existingStyle = clonedDoc.getElementById(
                "smart-print-preview-styles",
              );
              if (!existingStyle) {
                const style = clonedDoc.createElement("style");
                style.id = "smart-print-preview-styles";
                style.textContent = `
                                    .smart-print-preview .page-container {
                                        page-break-inside: avoid;
                                        position: relative;
                                    }
                                    .smart-print-preview .caption-item {
                                        page-break-inside: avoid !important;
                                        break-inside: avoid !important;
                                        margin-bottom: 3mm;
                                        display: block;
                                        font-family: inherit;
                                        color: inherit;
                                    }
                                    .smart-print-preview .caption-item * {
                                        font-family: inherit;
                                        color: inherit;
                                    }
                                `;
                clonedDoc.head.appendChild(style);
              }

              // 페이지 컨테이너 스타일 강화
              clonedElement.style.height = "auto";
              clonedElement.style.minHeight = "1123px";
              clonedElement.style.width = "794px";
              clonedElement.style.overflow = "visible";
              clonedElement.style.background = "#ffffff";
              clonedElement.style.fontSize = "14px";
              clonedElement.style.lineHeight = "1.4";
              clonedElement.style.fontFamily =
                "system-ui, -apple-system, sans-serif";
              clonedElement.style.color = "#000000";

              // 모든 캡션 아이템에 스타일 강화 적용
              const captionItems =
                clonedElement.querySelectorAll(".caption-item");
              console.log(
                `클론된 문서에서 발견된 캡션 아이템 수: ${captionItems.length}`,
              );

              captionItems.forEach((item, idx) => {
                const htmlItem = item as HTMLElement;
                htmlItem.style.display = "block";
                htmlItem.style.marginBottom = "11.34px";
                htmlItem.style.pageBreakInside = "avoid";
                htmlItem.style.breakInside = "avoid";
                htmlItem.style.visibility = "visible";
                htmlItem.style.opacity = "1";
                htmlItem.style.fontSize = "inherit";
                htmlItem.style.lineHeight = "inherit";
                htmlItem.style.fontFamily = "inherit";
                htmlItem.style.color = "#000000";
                htmlItem.style.background = "transparent";

                // 캡션 내부의 모든 텍스트 요소도 스타일 적용
                const textElements = htmlItem.querySelectorAll("*");
                textElements.forEach((el) => {
                  const element = el as HTMLElement;
                  element.style.fontSize = "inherit";
                  element.style.fontFamily = "inherit";
                  element.style.color = "inherit";
                });

                console.log(
                  `캡션 아이템 ${idx} 내용:`,
                  htmlItem.innerHTML.substring(0, 100) + "...",
                );
              });
            }
          },
        });

        console.log(`페이지 ${i} 캔버스 생성 완료:`, {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          actualWidth,
          actualHeight,
          dataURLLength: canvas.toDataURL("image/jpeg", 0.95).length,
        });

        // A4 크기 (210mm x 297mm)에 맞춰서 이미지 크기 계산
        const a4Width = 210;
        const a4Height = 297;

        // 캔버스 비율에 맞춰 이미지 크기 조정
        const canvasRatio = canvas.width / canvas.height;
        const a4Ratio = a4Width / a4Height;

        let imgWidth = a4Width;
        let imgHeight = a4Height;
        let xOffset = 0;
        let yOffset = 0;

        if (canvasRatio > a4Ratio) {
          // 캔버스가 더 넓은 경우
          imgHeight = a4Width / canvasRatio;
          yOffset = (a4Height - imgHeight) / 2;
        } else {
          // 캔버스가 더 높은 경우
          imgWidth = a4Height * canvasRatio;
          xOffset = (a4Width - imgWidth) / 2;
        }

        const imgData = canvas.toDataURL("image/jpeg", 0.98); // 품질 향상
        pdf.addImage(imgData, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
      }

      const safeTemplateName = templateName.replace(/[|\\/:*?"<>]/g, "_");
      const filename = `캡션_${safeTemplateName}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF 생성 실패:", err);
      alert("PDF 생성 중 오류가 발생했습니다.");
    }
  };

  // 단일 캡션 렌더링 (페이지 경계에서 잘리지 않도록)
  const renderCaption = (caption: CaptionMeasurement, index: number) => {
    console.log("캡션 렌더링:", {
      id: caption.id,
      index,
      artist_ko: caption.artwork?.artist_ko,
      artist_en: caption.artwork?.artist_en,
      title_ko: caption.artwork?.title_ko,
      title_en: caption.artwork?.title_en,
      artwork: caption.artwork,
    });

    return (
      <div
        key={`${caption.id}-${index}`}
        className="caption-item"
        style={{
          display: "block",
          marginBottom: "11.34px", // 3mm in pixels
          pageBreakInside: "avoid",
          breakInside: "avoid",
          visibility: "visible",
          opacity: 1,
          minHeight: "20px", // 최소 높이 보장
          fontSize: "inherit",
          lineHeight: "inherit",
          fontFamily: "inherit",
          color: "#000000",
          background: "transparent",
        }}
        data-caption-id={caption.id}
        data-artwork-title={
          caption.artwork?.title_ko || caption.artwork?.title_en
        }
      >
        <TemplateComponent artwork={caption.artwork} />
      </div>
    );
  };

  // 페이지 렌더링
  const renderPage = (page: PageLayout, pageIndex: number) => (
    <div
      key={`page-${page.pageNumber}`}
      data-page={pageIndex}
      className="page-container"
      style={{
        width: "794px", // A4 width in pixels at 96 DPI (210mm)
        height: "auto",
        minHeight: "1123px", // A4 height in pixels at 96 DPI (297mm)
        padding: "37.8px", // 10mm in pixels
        margin: "0 0 20px 0",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        display: "grid",
        gridTemplateColumns: "1fr 18.9px 1fr", // 5mm gap
        alignContent: "start",
        gap: "7.56px", // 2mm gap
        boxSizing: "border-box",
        position: "relative",
        fontSize: "14px", // 기본 폰트 크기 명시
        lineHeight: "1.4", // 줄간격 명시
        fontFamily: "system-ui, -apple-system, sans-serif", // 기본 폰트 명시
      }}
    >
      {/* 페이지 번호 표시 */}
      <div
        className="page-number"
        style={{
          position: "absolute",
          top: "5mm",
          right: "5mm",
          fontSize: "8px",
          color: "#9ca3af",
          pointerEvents: "none",
        }}
      >
        {page.pageNumber} / {layouts.length}
      </div>

      {/* 왼쪽 컬럼 */}
      <div
        className="column left-column"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3mm",
          minHeight: "0",
        }}
      >
        {page.leftColumn.map((caption, index) => renderCaption(caption, index))}
      </div>

      {/* 컬럼 간격 (빈 공간) */}
      <div></div>

      {/* 오른쪽 컬럼 */}
      <div
        className="column right-column"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3mm",
          minHeight: "0",
        }}
      >
        {page.rightColumn.map((caption, index) =>
          renderCaption(caption, index),
        )}
      </div>
    </div>
  );

  return (
    <div className="smart-print-preview bg-gray-100 p-6 rounded-lg">
      {/* 헤더 영역 */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            📄 전시용 캡션 미리보기 - {templateName}
            {isCalculating && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                계산 중...
              </div>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            2단 컬럼으로 공간을 효율적으로 활용하여 용지를 절약합니다
          </p>

          {/* 통계 정보 */}
          {layoutStats && (
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span>📄 총 {layoutStats.totalPages}페이지</span>
              <span>📝 캡션 {layoutStats.totalCaptions}개</span>
              <span>📈 공간 효율성 {layoutStats.spaceEfficiency}%</span>
              {layoutStats.estimatedPaperSaving > 0 && (
                <span className="text-green-600 font-medium">
                  🌱 용지 {layoutStats.estimatedPaperSaving}% 절약
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={calculateLayout}
            disabled={artworks.length === 0 || isCalculating}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="레이아웃 다시 계산"
          >
            🔄 재계산
          </button>
          <button
            onClick={handleSmartPDFDownload}
            disabled={
              artworks.length === 0 || layouts.length === 0 || isCalculating
            }
            className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            📄 PDF 다운로드
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div ref={pdfRef} className="smart-layout-container">
        {artworks.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded border">
            <p>선택된 작품이 없습니다.</p>
            <p className="text-sm">좌측에서 작품을 선택해주세요.</p>
          </div>
        ) : isCalculating ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded border">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>레이아웃을 계산하고 있습니다...</p>
            <p className="text-sm">
              캡션 개수가 많으면 시간이 걸릴 수 있습니다.
            </p>
          </div>
        ) : layouts.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded border">
            <p>레이아웃을 계산할 수 없습니다.</p>
            <p className="text-sm">다시 시도해주세요.</p>
          </div>
        ) : (
          <div className="pages-container">
            {layouts.map((page, index) => renderPage(page, index))}
          </div>
        )}
      </div>

      {/* 정보 표시 */}
      {layouts.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            총 {artworks.length}개 작품을 {layouts.length}페이지에 배치
          </p>
          <p className="text-xs">
            * 각 캡션이 페이지 중간에서 짤리지 않도록 지능적으로 배치됩니다.
          </p>
          <p className="text-xs">
            * 2단 컬럼으로 공간을 효율적으로 활용합니다.
          </p>
          <p className="text-xs">
            * PDF 다운로드 버튼을 클릭하여 최적화된 레이아웃으로 저장할 수
            있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartPrintPreview;

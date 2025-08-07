import React from 'react';

// 타입 정의
export interface CaptionMeasurement {
    id: string;
    artwork: any;
    width: number;
    height: number;
    element?: HTMLElement;
}

export interface PageLayout {
    pageNumber: number;
    leftColumn: CaptionMeasurement[];
    rightColumn: CaptionMeasurement[];
    leftHeight: number;
    rightHeight: number;
    totalHeight: number;
}

export interface LayoutConfig {
    pageWidth: number;      // A4 너비 (mm)
    pageHeight: number;     // A4 높이 (mm)
    padding: number;        // 페이지 여백 (mm)
    columnGap: number;      // 컬럼 간 간격 (mm)
    captionGap: number;     // 캡션 간 간격 (mm)
    maxPageHeight: number;  // 실제 사용 가능한 높이 (mm)
    columnWidth: number;    // 각 컬럼 너비 (mm)
}

// 기본 설정
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    pageWidth: 210,         // A4 너비
    pageHeight: 297,        // A4 높이
    padding: 10,            // 상하좌우 10mm 여백
    columnGap: 5,           // 컬럼 간 5mm 간격
    captionGap: 3,          // 캡션 간 3mm 간격
    maxPageHeight: 277,     // 297 - 20 (상하 여백)
    columnWidth: 97.5       // (210 - 20 - 5) / 2 = 92.5mm
};

// mm를 px로 변환 (96 DPI 기준)
export const mmToPx = (mm: number): number => {
    return (mm * 96) / 25.4;
};

// px를 mm로 변환 (96 DPI 기준)
export const pxToMm = (px: number): number => {
    return (px * 25.4) / 96;
};

// 캡션 크기 측정 함수
export const measureCaptions = async (
    artworks: any[], 
    TemplateComponent: React.ComponentType<{ artwork: any }>,
    config: LayoutConfig = DEFAULT_LAYOUT_CONFIG,
    templateName?: string
): Promise<CaptionMeasurement[]> => {
    return new Promise((resolve) => {
        // artworks가 비어있으면 즉시 resolve
        if (artworks.length === 0) {
            resolve([]);
            return;
        }
        
        const measurements: CaptionMeasurement[] = [];
        
        // 임시 측정용 컨테이너 생성
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: ${config.columnWidth}mm;
            visibility: hidden;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        `;
        document.body.appendChild(tempContainer);
        
        // 각 캡션의 크기 측정
        artworks.forEach((artwork, index) => {
            // React 컴포넌트를 실제 DOM으로 렌더링하기 위한 임시 div
            const captionWrapper = document.createElement('div');
            captionWrapper.className = 'caption-measurement-wrapper';
            captionWrapper.style.cssText = `
                margin-bottom: ${config.captionGap}mm;
                display: block;
            `;
            tempContainer.appendChild(captionWrapper);
            
            // 캡션 HTML 생성 (템플릿별 시뮬레이션)
            const captionElement = createCaptionElementByTemplate(artwork, index, templateName || 'Template 1');
            captionWrapper.appendChild(captionElement);
            
            // 즉시 측정 (비동기 처리 제거)
            const rect = captionWrapper.getBoundingClientRect();
            const width = pxToMm(rect.width);
            const height = pxToMm(rect.height);
            
            measurements.push({
                id: artwork.id || `caption-${index}`,
                artwork,
                width: Math.ceil(width),
                height: Math.ceil(height), // wrapper 높이에 간격이 이미 포함됨
                element: captionElement.cloneNode(true) as HTMLElement
            });
        });
        
        // 임시 컨테이너 제거
        document.body.removeChild(tempContainer);
        
        console.log('캡션 측정 완료:', measurements);
        resolve(measurements);
    });
};

// 템플릿별 캡션 HTML 요소 생성
const createCaptionElementByTemplate = (artwork: any, index: number, templateName: string): HTMLElement => {
    // 공통 크기 정보 조합
    const width = artwork.width && artwork.width !== '' ? Number(artwork.width) : null;
    const height = artwork.height && artwork.height !== '' ? Number(artwork.height) : null;
    const depth = artwork.depth && artwork.depth !== '' ? Number(artwork.depth) : null;
    const size_unit = artwork.size_unit || 'cm';
    
    let sizeStr = '';
    if (width && height) {
        if (depth) {
            sizeStr = `${width} × ${height} × ${depth} ${size_unit}`;
        } else {
            sizeStr = `${width} × ${height} ${size_unit}`;
        }
    }
    
    const medium = artwork.medium || '';
    const year = artwork.year || '';
    const details = [medium, sizeStr, year].filter(Boolean).join(' | ');
    
    switch (templateName) {
        case 'Template 1':
            return createTemplate1Element(artwork, details);
        case 'Template 2':
            return createTemplate2Element(artwork, sizeStr, medium, year);
        case 'Template 3':
            return createTemplate3Element(artwork, details);
        case 'Template 4':
            return createTemplate4Element(artwork, sizeStr, medium, year);
        case 'Template 5':
            return createTemplate5Element(artwork, sizeStr, medium, year);
        case 'Template 6':
            return createTemplate6Element(artwork, sizeStr, medium, year);
        case 'Template 7':
            return createTemplate7Element(artwork, details);
        case 'Template 8':
            return createTemplate8Element(artwork, sizeStr, medium, year);
        default:
            return createTemplate1Element(artwork, details);
    }
};

// Template 1 시뮬레이션 (Tailwind CSS 클래스 정확히 반영)
const createTemplate1Element = (artwork: any, details: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2';
    captionDiv.style.cssText = `
        min-width: 120px;
        max-width: 200px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 4px;">
            <h3 style="font-size: 11px; font-weight: bold; color: #111827; line-height: 1.25; margin: 0; padding: 0;">
                ${artwork.title_ko || artwork.title_en || '작품 제목'}
            </h3>
            <div style="width: 32px; height: 1px; background: #d1d5db; margin: 4px auto;"></div>
        </div>
        <div style="font-size: 11px; color: #4b5563; text-align: center; line-height: 1.25; margin: 0; padding: 0;">
            ${details}
        </div>
        <div style="text-align: right; margin-top: 4px; margin-bottom: 0; padding: 0;">
            <span style="font-size: 11px; font-weight: 500; color: #374151;">
                ${artwork.artist_ko || artwork.artist_en || '작가 이름'}
            </span>
        </div>
    `;
    
    return captionDiv;
};

// Template 2 시뮬레이션
const createTemplate2Element = (artwork: any, sizeStr: string, medium: string, year: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2';
    captionDiv.style.cssText = `
        min-width: 120px;
        max-width: 200px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.2;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="text-align: left; margin-bottom: 4px;">
            <h4 style="font-size: 12px; font-weight: 500; color: #374151; line-height: 1.2; margin: 0; padding: 0;">
                ${artwork.artist_ko || artwork.artist_en || '작가이름'}
            </h4>
        </div>
        <div style="text-align: center; margin-bottom: 4px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #111827; line-height: 1.2; margin: 0; padding: 0;">
                ${artwork.title_ko || artwork.title_en || '작품제목'}
            </h3>
            <div style="width: 24px; height: 1px; background: #d1d5db; margin: 4px auto;"></div>
        </div>
        <div style="font-size: 12px; color: #4b5563; line-height: 1.3; padding: 0;">
            ${sizeStr ? `<div>${sizeStr}</div>` : ''}
            ${medium && year ? `<div>${medium}, ${year}</div>` : ''}
        </div>
    `;
    
    return captionDiv;
};

// Template 3 시뮬레이션
const createTemplate3Element = (artwork: any, details: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2';
    captionDiv.style.cssText = `
        min-width: 120px;
        max-width: 200px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.2;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="margin-bottom: 4px;">
            <div style="font-size: 12px; color: #4b5563; margin: 0; padding: 0;">Artist's name</div>
            <div style="font-size: 12px; font-weight: 500; color: #111827; line-height: 1.2; margin: 0; padding: 0;">
                ${artwork.artist_en || artwork.artist_ko || '작가이름'}
            </div>
        </div>
        <div style="margin-bottom: 4px;">
            <div style="font-size: 12px; font-weight: bold; color: #111827; margin: 0; padding: 0;">Title</div>
            <div style="font-size: 12px; font-weight: bold; color: #111827; line-height: 1.2; margin: 0; padding: 0;">
                ${artwork.title_en || artwork.title_ko || '작품제목'}
            </div>
        </div>
        <div style="font-size: 12px; color: #4b5563; line-height: 1.2; margin: 0; padding: 0;">
            ${details}
        </div>
    `;
    
    return captionDiv;
};

// Template 4 시뮬레이션
const createTemplate4Element = (artwork: any, sizeStr: string, medium: string, year: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2';
    captionDiv.style.cssText = `
        min-width: 120px;
        max-width: 200px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.2;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 4px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #111827; line-height: 1.2; margin: 0; padding: 0;">
                ${artwork.title_ko || artwork.title_en || '작품제목'}
            </h3>
        </div>
        <div style="text-align: center; margin-bottom: 4px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #111827; line-height: 1.2; margin: 0; padding: 0;">
                ${artwork.title_en || artwork.title_ko || 'untitled'}
            </h3>
        </div>
        <div style="text-align: right; font-size: 12px; color: #4b5563; line-height: 1.3; padding: 0;">
            ${sizeStr ? `<div>${sizeStr}</div>` : ''}
            ${medium && year ? `<div>${medium}, ${year}</div>` : ''}
        </div>
    `;
    
    return captionDiv;
};

// Template 5 시뮬레이션
const createTemplate5Element = (artwork: any, sizeStr: string, medium: string, year: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2';
    captionDiv.style.cssText = `
        min-width: 120px;
        max-width: 200px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.2;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <div style="text-align: left;">
                <div style="font-size: 12px; font-weight: 500; color: #111827; line-height: 1.2; margin: 0; padding: 0;">무제</div>
                <div style="font-size: 12px; font-weight: 500; color: #111827; line-height: 1.2; margin: 0; padding: 0;">untitled</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; font-weight: 500; color: #374151; line-height: 1.2; margin: 0; padding: 0;">작가 이름</div>
            </div>
        </div>
        <div style="width: 100%; height: 1px; background: #111827; margin-bottom: 4px;"></div>
        <div style="text-align: right; font-size: 12px; color: #4b5563; line-height: 1.3; padding: 0;">
            ${sizeStr ? `<div>${sizeStr}</div>` : ''}
            ${medium ? `<div>${medium} on canvas</div>` : ''}
            ${year ? `<div>${year}</div>` : ''}
        </div>
    `;
    
    return captionDiv;
};

// Template 6 시뮬레이션 (모나리자 스타일 - 설명 포함)
const createTemplate6Element = (artwork: any, sizeStr: string, medium: string, year: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'border border-dashed border-gray-300 p-3 min-w-[140px] max-w-[180px] text-center bg-white';
    captionDiv.style.cssText = `
        min-width: 140px;
        max-width: 180px;
        padding: 12px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        box-sizing: border-box;
        display: block;
    `;
    
    const noteText = artwork.note || '';
    const detailsText = [medium, sizeStr, year].filter(Boolean).join(' | ');
    
    captionDiv.innerHTML = `
        <div style="margin-bottom: 4px;">
            <div style="font-size: 12px; color: #374151; margin-bottom: 4px; line-height: 1.2;">
                ${artwork.artist_ko || artwork.artist_en || '작가명'}
            </div>
            <div style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px; line-height: 1.2;">
                ${artwork.title_ko || artwork.title_en || '작품명'}
            </div>
            <div style="width: 100%; height: 1px; background: #d1d5db; margin: 4px 0;"></div>
            ${noteText ? `<div style="font-size: 12px; color: #4b5563; line-height: 1.4; margin-bottom: 4px;">${noteText}</div>` : ''}
            <div style="font-size: 12px; color: #6b7280; text-align: right; line-height: 1.3;">
                ${detailsText}
            </div>
        </div>
    `;
    
    return captionDiv;
};

// Template 7 시뮬레이션 (미니멀한 형태)
const createTemplate7Element = (artwork: any, details: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2 min-w-[100px] max-w-[180px]';
    captionDiv.style.cssText = `
        min-width: 100px;
        max-width: 180px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 4px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #111827; line-height: 1.25; margin: 0; padding: 0;">
                ${artwork.title_ko || artwork.title_en || '작품명'}
            </h3>
        </div>
        <div style="text-align: center; font-size: 12px; color: #4b5563; line-height: 1.25; margin: 4px 0; padding: 0;">
            ${artwork.artist_ko || artwork.artist_en || '작가명'}
        </div>
        <div style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.25; padding: 0;">
            ${details}
        </div>
    `;
    
    return captionDiv;
};

// Template 8 시뮬레이션 (카드 형태, 라벨 포함)
const createTemplate8Element = (artwork: any, sizeStr: string, medium: string, year: string): HTMLElement => {
    const captionDiv = document.createElement('div');
    captionDiv.className = 'bg-white border border-dashed border-gray-300 p-2 min-w-[120px] max-w-[220px]';
    captionDiv.style.cssText = `
        min-width: 120px;
        max-width: 220px;
        padding: 8px;
        border: 1px dashed #d1d5db;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.2;
        box-sizing: border-box;
        display: block;
    `;
    
    captionDiv.innerHTML = `
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px;">
            <h3 style="font-size: 12px; font-weight: bold; color: #111827; text-align: center; line-height: 1.25; margin: 0; padding: 0;">
                ${artwork.title_ko || artwork.title_en || '작품명'}
            </h3>
        </div>
        <div style="margin-bottom: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px; font-weight: 500; color: #374151;">작가:</span>
                <span style="font-size: 12px; color: #111827;">${artwork.artist_ko || artwork.artist_en || '작가명'}</span>
            </div>
            ${medium ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px; font-weight: 500; color: #374151;">재료:</span>
                <span style="font-size: 12px; color: #111827;">${medium}</span>
            </div>` : ''}
            ${sizeStr ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px; font-weight: 500; color: #374151;">크기:</span>
                <span style="font-size: 12px; color: #111827;">${sizeStr}</span>
            </div>` : ''}
            ${year ? `
            <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 12px; font-weight: 500; color: #374151;">연도:</span>
                <span style="font-size: 12px; color: #111827;">${year}</span>
            </div>` : ''}
        </div>
    `;
    
    return captionDiv;
};

// 최적 레이아웃 계산
export const calculateOptimalLayout = (
    captions: CaptionMeasurement[],
    config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): PageLayout[] => {
    const pages: PageLayout[] = [];
    let currentPage: PageLayout = createNewPage(1);
    
    console.log('레이아웃 계산 시작:', { 
        captionCount: captions.length, 
        maxPageHeight: config.maxPageHeight 
    });
    
    for (let i = 0; i < captions.length; i++) {
        const caption = captions[i];
        console.log(`캡션 ${i + 1} 배치 시도:`, {
            height: caption.height,
            leftHeight: currentPage.leftHeight,
            rightHeight: currentPage.rightHeight
        });
        
        // 캡션이 페이지 경계에서 잘리지 않도록 엄격한 체크
        const canFitInLeftColumn = currentPage.leftHeight + caption.height <= config.maxPageHeight;
        const canFitInRightColumn = currentPage.rightHeight + caption.height <= config.maxPageHeight;
        
        // 1순위: 왼쪽 열에 완전히 들어가는지 확인
        if (canFitInLeftColumn) {
            currentPage.leftColumn.push(caption);
            currentPage.leftHeight += caption.height;
            console.log(`→ 왼쪽 열에 배치 (높이: ${currentPage.leftHeight}mm/${config.maxPageHeight}mm, 캡션: ${caption.height}mm)`);
        }
        // 2순위: 오른쪽 열에 완전히 들어가는지 확인
        else if (canFitInRightColumn) {
            currentPage.rightColumn.push(caption);
            currentPage.rightHeight += caption.height;
            console.log(`→ 오른쪽 열에 배치 (높이: ${currentPage.rightHeight}mm/${config.maxPageHeight}mm, 캡션: ${caption.height}mm)`);
        }
        // 3순위: 새 페이지 생성 (캡션이 페이지 경계에 걸치지 않도록)
        else {
            // 현재 페이지 마무리
            currentPage.totalHeight = Math.max(currentPage.leftHeight, currentPage.rightHeight);
            pages.push(currentPage);
            console.log(`페이지 ${currentPage.pageNumber} 완료 (페이지 경계 보호):`, {
                leftItems: currentPage.leftColumn.length,
                rightItems: currentPage.rightColumn.length,
                totalHeight: currentPage.totalHeight,
                reason: '캡션 전체를 다음 페이지로 이동'
            });
            
            // 새 페이지 시작
            currentPage = createNewPage(pages.length + 1);
            
            // 새 페이지에서도 캡션이 너무 크면 경고
            if (caption.height > config.maxPageHeight) {
                console.error(`⚠️ 경고: 캡션 ${caption.id}의 높이(${caption.height}mm)가 페이지 최대 높이(${config.maxPageHeight}mm)를 초과합니다!`);
                console.error('이 캡션은 어떤 페이지에서도 완전히 표시될 수 없습니다.');
            }
            
            currentPage.leftColumn.push(caption);
            currentPage.leftHeight += caption.height;
            console.log(`→ 새 페이지 ${currentPage.pageNumber} 왼쪽 열에 완전 배치 (${caption.height}mm)`);
        }
    }
    
    // 마지막 페이지 추가
    if (currentPage.leftColumn.length > 0 || currentPage.rightColumn.length > 0) {
        currentPage.totalHeight = Math.max(currentPage.leftHeight, currentPage.rightHeight);
        pages.push(currentPage);
        console.log(`마지막 페이지 ${currentPage.pageNumber} 완료:`, {
            leftItems: currentPage.leftColumn.length,
            rightItems: currentPage.rightColumn.length,
            totalHeight: currentPage.totalHeight
        });
    }
    
    console.log('레이아웃 계산 완료:', { 
        totalPages: pages.length,
        totalCaptions: captions.length
    });
    
    // 컬럼 밸런싱 최적화 적용
    console.log('컬럼 밸런싱 최적화 시작...');
    const optimizedPages = optimizeColumnBalance(pages);
    console.log('컬럼 밸런싱 최적화 완료');
    
    return optimizedPages;
};

// 새 페이지 생성 헬퍼
const createNewPage = (pageNumber: number): PageLayout => ({
    pageNumber,
    leftColumn: [],
    rightColumn: [],
    leftHeight: 0,
    rightHeight: 0,
    totalHeight: 0
});

// 컬럼 밸런싱 최적화
export const optimizeColumnBalance = (pages: PageLayout[]): PageLayout[] => {
    return pages.map(page => {
        const heightDiff = Math.abs(page.leftHeight - page.rightHeight);
        
        // 높이 차이가 20mm 이상이면 재배치 시도
        if (heightDiff > 20 && page.leftColumn.length > 1 && page.rightColumn.length > 1) {
            console.log(`페이지 ${page.pageNumber} 밸런싱 시작 (차이: ${heightDiff}mm)`);
            return balancePageColumns(page);
        }
        
        return page;
    });
};

// 단일 페이지의 컬럼 밸런싱
const balancePageColumns = (page: PageLayout): PageLayout => {
    // 모든 캡션을 하나의 배열로 합치고 높이순으로 정렬
    const allCaptions = [...page.leftColumn, ...page.rightColumn];
    const sortedCaptions = allCaptions.sort((a, b) => b.height - a.height);
    
    console.log(`밸런싱 대상 캡션 ${allCaptions.length}개:`, 
        allCaptions.map(c => `${c.height}mm`).join(', '));
    
    // 새로운 페이지 구조 생성
    const balancedPage: PageLayout = {
        pageNumber: page.pageNumber,
        leftColumn: [],
        rightColumn: [],
        leftHeight: 0,
        rightHeight: 0,
        totalHeight: 0
    };
    
    // 가장 높은 캡션부터 더 짧은 컬럼에 배치 (First Fit Decreasing 알고리즘)
    for (const caption of sortedCaptions) {
        if (balancedPage.leftHeight <= balancedPage.rightHeight) {
            // 왼쪽이 더 짧거나 같으면 왼쪽에 배치
            balancedPage.leftColumn.push(caption);
            balancedPage.leftHeight += caption.height;
        } else {
            // 오른쪽이 더 짧으면 오른쪽에 배치
            balancedPage.rightColumn.push(caption);
            balancedPage.rightHeight += caption.height;
        }
    }
    
    balancedPage.totalHeight = Math.max(balancedPage.leftHeight, balancedPage.rightHeight);
    
    const originalDiff = Math.abs(page.leftHeight - page.rightHeight);
    const newDiff = Math.abs(balancedPage.leftHeight - balancedPage.rightHeight);
    
    console.log(`밸런싱 결과: ${originalDiff}mm → ${newDiff}mm (개선: ${originalDiff - newDiff}mm)`);
    console.log(`최종 높이: 왼쪽 ${balancedPage.leftHeight}mm, 오른쪽 ${balancedPage.rightHeight}mm`);
    
    // 밸런싱이 실제로 개선되었을 때만 적용
    if (newDiff < originalDiff) {
        return balancedPage;
    } else {
        // First Fit Decreasing이 실패한 경우 Best Fit 알고리즘 시도
        console.log('First Fit Decreasing 실패, Best Fit 알고리즘 시도...');
        return balancePageColumnsBestFit(page);
    }
};

// Best Fit 알고리즘으로 컬럼 밸런싱 (더 정교한 최적화)
const balancePageColumnsBestFit = (page: PageLayout): PageLayout => {
    const allCaptions = [...page.leftColumn, ...page.rightColumn];
    
    // 모든 가능한 조합을 시도하여 최적의 밸런스 찾기
    let bestBalance: PageLayout = page;
    let bestDiff = Math.abs(page.leftHeight - page.rightHeight);
    
    // 재귀적으로 모든 조합 시도 (캡션이 많으면 성능 문제로 제한)
    if (allCaptions.length <= 8) { // 8개 이하일 때만 완전 탐색
        const combinations = generateCombinations(allCaptions);
        
        for (const leftCombination of combinations) {
            const rightCombination = allCaptions.filter(c => !leftCombination.includes(c));
            
            const leftHeight = leftCombination.reduce((sum, c) => sum + c.height, 0);
            const rightHeight = rightCombination.reduce((sum, c) => sum + c.height, 0);
            const diff = Math.abs(leftHeight - rightHeight);
            
            if (diff < bestDiff) {
                bestDiff = diff;
                bestBalance = {
                    pageNumber: page.pageNumber,
                    leftColumn: leftCombination,
                    rightColumn: rightCombination,
                    leftHeight,
                    rightHeight,
                    totalHeight: Math.max(leftHeight, rightHeight)
                };
            }
        }
        
        console.log(`Best Fit 결과: ${Math.abs(page.leftHeight - page.rightHeight)}mm → ${bestDiff}mm`);
    } else {
        // 캡션이 많으면 휴리스틱 방법 사용
        console.log('캡션이 많아 휴리스틱 밸런싱 적용');
        bestBalance = balancePageColumnsHeuristic(page);
    }
    
    return bestBalance;
};

// 휴리스틱 밸런싱 (큰 데이터셋용)
const balancePageColumnsHeuristic = (page: PageLayout): PageLayout => {
    const allCaptions = [...page.leftColumn, ...page.rightColumn];
    const totalHeight = allCaptions.reduce((sum, c) => sum + c.height, 0);
    const targetHeight = totalHeight / 2;
    
    // 높이순으로 정렬
    const sortedCaptions = allCaptions.sort((a, b) => b.height - a.height);
    
    const balancedPage: PageLayout = {
        pageNumber: page.pageNumber,
        leftColumn: [],
        rightColumn: [],
        leftHeight: 0,
        rightHeight: 0,
        totalHeight: 0
    };
    
    // 각 캡션을 목표 높이에 더 가까운 쪽에 배치
    for (const caption of sortedCaptions) {
        const leftDiff = Math.abs((balancedPage.leftHeight + caption.height) - targetHeight);
        const rightDiff = Math.abs((balancedPage.rightHeight + caption.height) - targetHeight);
        
        if (leftDiff <= rightDiff) {
            balancedPage.leftColumn.push(caption);
            balancedPage.leftHeight += caption.height;
        } else {
            balancedPage.rightColumn.push(caption);
            balancedPage.rightHeight += caption.height;
        }
    }
    
    balancedPage.totalHeight = Math.max(balancedPage.leftHeight, balancedPage.rightHeight);
    
    return balancedPage;
};

// 모든 가능한 조합 생성 (소규모 데이터셋용)
const generateCombinations = (items: any[]): any[][] => {
    const combinations: any[][] = [];
    const n = items.length;
    
    // 2^n 개의 조합 생성 (비트마스크 사용)
    for (let i = 0; i < Math.pow(2, n); i++) {
        const combination: any[] = [];
        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                combination.push(items[j]);
            }
        }
        combinations.push(combination);
    }
    
    return combinations;
};

// 레이아웃 통계 정보
export const getLayoutStats = (pages: PageLayout[]) => {
    const totalCaptions = pages.reduce((sum, page) => 
        sum + page.leftColumn.length + page.rightColumn.length, 0
    );
    
    const averageHeight = pages.reduce((sum, page) => sum + page.totalHeight, 0) / pages.length;
    
    const efficiency = pages.reduce((sum, page) => {
        const utilization = page.totalHeight / DEFAULT_LAYOUT_CONFIG.maxPageHeight;
        return sum + Math.min(utilization, 1);
    }, 0) / pages.length;
    
    // 밸런싱 품질 계산
    const balanceQuality = pages.reduce((sum, page) => {
        if (page.leftColumn.length === 0 || page.rightColumn.length === 0) {
            return sum + 0; // 한쪽이 비어있으면 품질 0
        }
        const heightDiff = Math.abs(page.leftHeight - page.rightHeight);
        const totalHeight = Math.max(page.leftHeight, page.rightHeight);
        const balance = totalHeight > 0 ? (1 - heightDiff / totalHeight) : 1;
        return sum + Math.max(0, balance);
    }, 0) / pages.length;

    return {
        totalPages: pages.length,
        totalCaptions,
        averagePageHeight: Math.round(averageHeight),
        spaceEfficiency: Math.round(efficiency * 100),
        balanceQuality: Math.round(balanceQuality * 100),
        estimatedPaperSaving: Math.max(0, Math.round(((totalCaptions - pages.length) / totalCaptions) * 100))
    };
};
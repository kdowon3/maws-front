// 테스트용 더미 캡션 데이터 15개
export const dummyCaptionData = [
    {
        id: 'artwork-001',
        title_ko: '무제',
        title_en: 'Untitled',
        artist_ko: '김민수',
        artist_en: 'Kim Min-su',
        year: '2024',
        medium: 'Oil on canvas',
        width: 73,
        height: 91,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-002',
        title_ko: '봄날의 기억',
        title_en: 'Memory of Spring Day',
        artist_ko: '이지은',
        artist_en: 'Lee Ji-eun',
        year: '2023',
        medium: 'Acrylic on canvas',
        width: 50,
        height: 60,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-003',
        title_ko: '도시 풍경',
        title_en: 'Urban Landscape',
        artist_ko: '박철희',
        artist_en: 'Park Cheol-hee',
        year: '2024',
        medium: 'Mixed media',
        width: 120,
        height: 80,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-004',
        title_ko: '고요한 순간',
        title_en: 'Silent Moment',
        artist_ko: '정수진',
        artist_en: 'Jung Su-jin',
        year: '2023',
        medium: 'Watercolor on paper',
        width: 35,
        height: 45,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-005',
        title_ko: '추상의 세계',
        title_en: 'World of Abstraction',
        artist_ko: '최영호',
        artist_en: 'Choi Young-ho',
        year: '2024',
        medium: 'Oil on linen',
        width: 100,
        height: 100,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-006',
        title_ko: '조각상 No.3',
        title_en: 'Sculpture No.3',
        artist_ko: '한미경',
        artist_en: 'Han Mi-kyung',
        year: '2023',
        medium: 'Bronze',
        width: 25,
        height: 40,
        depth: 15,
        size_unit: 'cm'
    },
    {
        id: 'artwork-007',
        title_ko: '빛의 여행',
        title_en: 'Journey of Light',
        artist_ko: '노태준',
        artist_en: 'Noh Tae-jun',
        year: '2024',
        medium: 'Digital print on canvas',
        width: 80,
        height: 120,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-008',
        title_ko: '자연의 소리',
        title_en: 'Sound of Nature',
        artist_ko: '윤서현',
        artist_en: 'Yoon Seo-hyun',
        year: '2023',
        medium: 'Ink and color on paper',
        width: 45,
        height: 65,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-009',
        title_ko: '현대적 해석',
        title_en: 'Modern Interpretation',
        artist_ko: '송민준',
        artist_en: 'Song Min-jun',
        year: '2024',
        medium: 'Acrylic and collage',
        width: 90,
        height: 70,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-010',
        title_ko: '시간의 흔적',
        title_en: 'Traces of Time',
        artist_ko: '강예린',
        artist_en: 'Kang Ye-rin',
        year: '2023',
        medium: 'Charcoal on paper',
        width: 60,
        height: 80,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-011',
        title_ko: '색채의 교향곡',
        title_en: 'Symphony of Colors',
        artist_ko: '임동혁',
        artist_en: 'Lim Dong-hyuk',
        year: '2024',
        medium: 'Oil and tempera on canvas',
        width: 150,
        height: 100,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-012',
        title_ko: '물의 흐름',
        title_en: 'Flow of Water',
        artist_ko: '오수빈',
        artist_en: 'Oh Su-bin',
        year: '2023',
        medium: 'Ceramic installation',
        width: 30,
        height: 20,
        depth: 25,
        size_unit: 'cm'
    },
    {
        id: 'artwork-013',
        title_ko: '꿈속의 정원',
        title_en: 'Garden in Dreams',
        artist_ko: '배준서',
        artist_en: 'Bae Jun-seo',
        year: '2024',
        medium: 'Mixed media on wood',
        width: 85,
        height: 110,
        depth: 3,
        size_unit: 'cm'
    },
    {
        id: 'artwork-014',
        title_ko: '무한의 공간',
        title_en: 'Infinite Space',
        artist_ko: '서현아',
        artist_en: 'Seo Hyun-ah',
        year: '2023',
        medium: 'Video installation',
        width: 200,
        height: 150,
        depth: null,
        size_unit: 'cm'
    },
    {
        id: 'artwork-015',
        title_ko: '감정의 스펙트럼',
        title_en: 'Spectrum of Emotions',
        artist_ko: '홍진우',
        artist_en: 'Hong Jin-woo',
        year: '2024',
        medium: 'Pastel on paper',
        width: 42,
        height: 59.4,
        depth: null,
        size_unit: 'cm'
    }
];

// 더미 데이터를 기존 형식으로 변환하는 헬퍼 함수
export const convertToCaptionFormat = (data: typeof dummyCaptionData) => {
    return data.map(artwork => ({
        ...artwork,
        // 기존 인터페이스와 호환되도록 추가 필드
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));
};

// 다양한 크기의 캡션 테스트용 데이터
export const variableSizeCaptions = [
    // 짧은 제목, 간단한 정보
    {
        id: 'short-001',
        title_ko: '빛',
        artist_ko: '김철수',
        year: '2024',
        medium: 'Oil',
        width: 20,
        height: 30,
        size_unit: 'cm'
    },
    // 긴 제목, 복잡한 정보
    {
        id: 'long-001',
        title_ko: '현대 사회의 모순과 개인의 정체성에 대한 철학적 고찰',
        title_en: 'Philosophical Contemplation on the Contradictions of Modern Society and Individual Identity',
        artist_ko: '박매우긴이름입니다',
        artist_en: 'Park This-is-a-very-long-name-indeed',
        year: '2023',
        medium: 'Mixed media including oil, acrylic, charcoal, and digital elements',
        width: 180,
        height: 240,
        depth: 5,
        size_unit: 'cm'
    },
    // 중간 크기들...
    {
        id: 'medium-001',
        title_ko: '도시의 밤',
        artist_ko: '이영희',
        year: '2024',
        medium: 'Acrylic on canvas',
        width: 70,
        height: 90,
        size_unit: 'cm'
    },
    // 조각품 (3차원)
    {
        id: 'sculpture-001', 
        title_ko: '균형',
        artist_ko: '조각가',
        year: '2023',
        medium: 'Steel and marble',
        width: 50,
        height: 120,
        depth: 40,
        size_unit: 'cm'
    },
    // 매우 작은 작품
    {
        id: 'tiny-001',
        title_ko: '점',
        artist_ko: '소',
        year: '2024',
        medium: 'Ink',
        width: 5,
        height: 5,
        size_unit: 'cm'
    }
];

// 테스트 시나리오별 데이터셋
export const testScenarios = {
    // 기본 15개 테스트
    basic: dummyCaptionData,
    
    // 변환된 형식 (기존 시스템 호환)
    converted: convertToCaptionFormat(dummyCaptionData),
    
    // 다양한 크기 테스트
    variableSizes: variableSizeCaptions,
    
    // 대량 데이터 테스트 (30개)
    large: [
        ...dummyCaptionData,
        ...dummyCaptionData.map((item, index) => ({
            ...item,
            id: `${item.id}-copy-${index}`,
            title_ko: `${item.title_ko} (복제본)`,
            title_en: item.title_en ? `${item.title_en} (Copy)` : undefined
        }))
    ],
    
    // 극소량 테스트 (3개)
    small: dummyCaptionData.slice(0, 3),
    
    // 단일 캡션 테스트
    single: [dummyCaptionData[0]]
};

// 콘솔에서 쉽게 사용할 수 있는 전역 함수
if (typeof window !== 'undefined') {
    (window as any).testCaptions = testScenarios;
    console.log('🎨 테스트용 캡션 데이터가 준비되었습니다!');
    console.log('사용법: testCaptions.basic (15개), testCaptions.large (30개), testCaptions.small (3개)');
}
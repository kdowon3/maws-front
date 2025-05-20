// 작품 데이터 타입 정의
export interface Artwork {
    id: number;
    title: string; // 작품명
    artist: string; // 작가명
    year: string; // 제작 연도
    dimensions: string; // 크기
    medium: string; // 재료
    price: number; // 가격
    image?: string; // 작품 이미지 (신규 추가)
    buyerId?: number; // 구매자 ID (고객 DB 연동)
    buyerName?: string; // 구매자 이름
    hasMissingFields: boolean; // 보증서 필수 필드 누락 여부
}

// 테스트용 작품 데이터
export const dummyArtworks: Artwork[] = [
    {
        id: 1,
        title: '푸른 바다',
        artist: '김작가',
        year: '2023',
        dimensions: '100 x 80 cm',
        medium: '캔버스에 유채',
        price: 5000000,
        image: '/images/art1.jpg',
        buyerId: 1,
        buyerName: '김미술',
        hasMissingFields: false,
    },
    {
        id: 2,
        title: '정물화 시리즈 #3',
        artist: '이작가',
        year: '2024',
        dimensions: '60 x 40 cm',
        medium: '종이에 수채화',
        price: 2500000,
        image: '/images/art2.jpg',
        buyerId: 2,
        buyerName: '이컬렉터',
        hasMissingFields: false,
    },
    {
        id: 3,
        title: '무제 #27',
        artist: '박작가',
        year: '2022',
        dimensions: '120 x 90 cm',
        medium: '혼합재료',
        price: 8000000,
        image: '/images/art3.jpg',
        hasMissingFields: true,
    },
    {
        id: 4,
        title: '기억의 조각',
        artist: '최작가',
        year: '2023',
        dimensions: '70 x 100 cm',
        medium: '아크릴릭',
        price: 3500000,
        image: '/images/art4.jpg',
        buyerId: 4,
        buyerName: '정고객',
        hasMissingFields: false,
    },
    {
        id: 5,
        title: '도시풍경',
        artist: '김작가',
        year: '2024',
        dimensions: '150 x 100 cm',
        medium: '캔버스에 유채',
        price: 12000000,
        image: '/images/art5.jpg',
        buyerId: 5,
        buyerName: '최수집가',
        hasMissingFields: false,
    },
    {
        id: 6,
        title: '추상 연작 #12',
        artist: '박작가',
        year: '2021',
        dimensions: '80 x 80 cm',
        medium: '캔버스에 아크릴릭',
        price: 4500000,
        image: '/images/art6.jpg',
        hasMissingFields: true,
    },
    {
        id: 7,
        title: '숨겨진 풍경',
        artist: '이작가',
        year: '2022',
        dimensions: '90 x 70 cm',
        medium: '캔버스에 유채',
        price: 5800000,
        image: '/images/art7.jpg',
        hasMissingFields: true,
    },
    {
        id: 8,
        title: '고요한 아침',
        artist: '최작가',
        year: '2024',
        dimensions: '120 x 80 cm',
        medium: '캔버스에 유채',
        price: 7500000,
        image: '/images/art8.jpg',
        buyerId: 8,
        buyerName: '강큐레이터',
        hasMissingFields: false,
    },
];

export const artistList = ['김작가', '이작가', '박작가', '최작가'];

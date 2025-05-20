export type ClientStatus = 'VIP' | '구매자' | '장기고객' | '신규고객';

export interface Client {
    id: number;
    name: string;
    phone: string;
    address: string;
    buyArtist: string;
    favoriteArtist: string;
    note: string;
    email: string;
    lastVisit: string;
    status: ClientStatus[];
    registrationDate: string;
}

// 테스트용 고객 데이터
export const dummyClients: Client[] = [
    {
        id: 1,
        name: '김미술',
        phone: '010-1234-5678',
        address: '서울시 강남구 테헤란로 1',
        buyArtist: '김작가',
        favoriteArtist: '이작가',
        note: 'VIP 고객, 빠른 응대 필요',
        email: 'kim@example.com',
        lastVisit: '2025-05-15T09:30:00',
        status: ['VIP', '구매자'],
        registrationDate: '2024-11-10',
    },
    {
        id: 2,
        name: '이컬렉터',
        phone: '010-2345-6789',
        address: '서울시 서초구 반포대로 2',
        buyArtist: '박작가',
        favoriteArtist: '최작가',
        note: '최근 대형 작품 구매',
        email: 'lee@example.com',
        lastVisit: '2025-05-10T14:00:00',
        status: ['구매자'],
        registrationDate: '2025-02-15',
    },
    {
        id: 3,
        name: '박갤러리',
        phone: '010-3456-7890',
        address: '서울시 종로구 인사동 3',
        buyArtist: '김작가',
        favoriteArtist: '김작가',
        note: '신규 고객, 관심도 높음',
        email: 'park@example.com',
        lastVisit: '2025-05-05T11:45:00',
        status: ['신규고객'],
        registrationDate: '2025-05-01',
    },
    {
        id: 4,
        name: '정고객',
        phone: '010-4567-8901',
        address: '서울시 마포구 월드컵북로 4',
        buyArtist: '이작가',
        favoriteArtist: '최작가',
        note: '장기고객, 신속한 피드백 요청',
        email: 'jung@example.com',
        lastVisit: '2025-04-20T16:30:00',
        status: ['장기고객'],
        registrationDate: '2023-08-22',
    },
    {
        id: 5,
        name: '최수집가',
        phone: '010-5678-9012',
        address: '서울시 용산구 한강대로 5',
        buyArtist: '박작가',
        favoriteArtist: '박작가',
        note: 'VIP, 대량 구매 이력 있음',
        email: 'choi@example.com',
        lastVisit: '2025-05-01T10:15:00',
        status: ['VIP', '장기고객'],
        registrationDate: '2023-10-05',
    },
    {
        id: 6,
        name: '송미술관',
        phone: '010-6789-0123',
        address: '서울시 송파구 올림픽로 6',
        buyArtist: '김작가',
        favoriteArtist: '박작가',
        note: '미술관 담당자, 단체 구매 문의',
        email: 'song@example.com',
        lastVisit: '2025-04-15T13:20:00',
        status: ['구매자'],
        registrationDate: '2024-12-18',
    },
    {
        id: 7,
        name: '홍갤러리',
        phone: '010-7890-1234',
        address: '서울시 강동구 천호대로 7',
        buyArtist: '최작가',
        favoriteArtist: '최작가',
        note: '신규 갤러리, 협업 제안 예정',
        email: 'hong@example.com',
        lastVisit: '2025-03-28T15:10:00',
        status: ['신규고객'],
        registrationDate: '2025-03-20',
    },
    {
        id: 8,
        name: '강큐레이터',
        phone: '010-8901-2345',
        address: '서울시 중구 을지로 8',
        buyArtist: '이작가',
        favoriteArtist: '박작가',
        note: 'VIP, 큐레이팅 요청 다수',
        email: 'kang@example.com',
        lastVisit: '2025-05-12T09:45:00',
        status: ['VIP'],
        registrationDate: '2024-09-30',
    },
];

export const artistList = ['김작가', '이작가', '박작가', '최작가'];
export const statusOptions: ClientStatus[] = ['VIP', '구매자', '장기고객', '신규고객'];

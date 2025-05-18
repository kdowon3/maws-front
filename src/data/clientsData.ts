
export type ClientStatus = "VIP" | "구매자" | "장기고객" | "신규고객";

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  favoriteArtists: string[];
  status: ClientStatus[];
  registrationDate: string;
}

// 테스트용 고객 데이터
export const dummyClients: Client[] = [
  {
    id: 1,
    name: "김미술",
    phone: "010-1234-5678",
    email: "kim@example.com",
    lastVisit: "2025-05-15T09:30:00",
    favoriteArtists: ["김작가", "이작가"],
    status: ["VIP", "구매자"],
    registrationDate: "2024-11-10",
  },
  {
    id: 2,
    name: "이컬렉터",
    phone: "010-2345-6789",
    email: "lee@example.com",
    lastVisit: "2025-05-10T14:00:00",
    favoriteArtists: ["박작가", "최작가"],
    status: ["구매자"],
    registrationDate: "2025-02-15",
  },
  {
    id: 3,
    name: "박갤러리",
    phone: "010-3456-7890",
    email: "park@example.com",
    lastVisit: "2025-05-05T11:45:00",
    favoriteArtists: ["김작가"],
    status: ["신규고객"],
    registrationDate: "2025-05-01",
  },
  {
    id: 4,
    name: "정고객",
    phone: "010-4567-8901",
    email: "jung@example.com", 
    lastVisit: "2025-04-20T16:30:00",
    favoriteArtists: ["이작가", "최작가"],
    status: ["장기고객"],
    registrationDate: "2023-08-22",
  },
  {
    id: 5,
    name: "최수집가",
    phone: "010-5678-9012",
    email: "choi@example.com",
    lastVisit: "2025-05-01T10:15:00",
    favoriteArtists: ["박작가"],
    status: ["VIP", "장기고객"],
    registrationDate: "2023-10-05",
  },
  {
    id: 6,
    name: "송미술관",
    phone: "010-6789-0123",
    email: "song@example.com",
    lastVisit: "2025-04-15T13:20:00",
    favoriteArtists: ["김작가", "박작가"],
    status: ["구매자"],
    registrationDate: "2024-12-18",
  },
  {
    id: 7,
    name: "홍갤러리",
    phone: "010-7890-1234",
    email: "hong@example.com",
    lastVisit: "2025-03-28T15:10:00",
    favoriteArtists: ["최작가"],
    status: ["신규고객"],
    registrationDate: "2025-03-20",
  },
  {
    id: 8,
    name: "강큐레이터",
    phone: "010-8901-2345",
    email: "kang@example.com",
    lastVisit: "2025-05-12T09:45:00",
    favoriteArtists: ["이작가", "박작가"],
    status: ["VIP"],
    registrationDate: "2024-09-30",
  },
];

export const artistList = ["김작가", "이작가", "박작가", "최작가"];
export const statusOptions: ClientStatus[] = ["VIP", "구매자", "장기고객", "신규고객"];

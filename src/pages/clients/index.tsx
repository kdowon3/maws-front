
import React, { useState, useMemo } from "react";
import { Search, Filter, List, Grid2X2, UserPlus, ChevronDown, Check, Star, MessageSquare, FileText, Edit } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import ClientForm from "@/components/clients/ClientForm";

// 테스트용 고객 데이터
const dummyClients = [
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

const artistList = ["김작가", "이작가", "박작가", "최작가"];
const statusOptions = ["VIP", "구매자", "장기고객", "신규고객"];

// 상태별 배지 스타일 정의
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "VIP":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "구매자":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "장기고객":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "신규고객":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const formatDate = (dateString: string, format = "yyyy년 MM월 dd일") => {
  return dateString ? format(new Date(dateString), format, { locale: ko }) : "-";
};

// 최근 방문일 포맷팅 유틸 함수
const formatLastVisit = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`;
  } else {
    return format(date, "yyyy년 MM월 dd일", { locale: ko });
  }
};

const ClientsPage: React.FC = () => {
  // 현재 상태 관리
  const [view, setView] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all"); // all, month, quarter, year
  
  // 검색어, 필터링 적용된 고객 목록
  const filteredClients = useMemo(() => {
    return dummyClients.filter(client => {
      // 검색어 필터링
      const matchesSearch = searchTerm === "" || 
        client.name.includes(searchTerm) || 
        client.phone.includes(searchTerm) ||
        client.email.includes(searchTerm);
      
      // 작가 필터링
      const matchesArtist = selectedArtists.length === 0 || 
        client.favoriteArtists.some(artist => selectedArtists.includes(artist));
      
      // 상태 필터링
      const matchesStatus = selectedStatuses.length === 0 || 
        client.status.some(status => selectedStatuses.includes(status));
      
      // 등록일 필터링
      let matchesDate = true;
      if (dateRangeFilter !== "all") {
        const regDate = new Date(client.registrationDate);
        const now = new Date();
        
        if (dateRangeFilter === "month") {
          matchesDate = now.getTime() - regDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        } else if (dateRangeFilter === "quarter") {
          matchesDate = now.getTime() - regDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
        } else if (dateRangeFilter === "year") {
          matchesDate = now.getTime() - regDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
        }
      }
      
      return matchesSearch && matchesArtist && matchesStatus && matchesDate;
    });
  }, [searchTerm, selectedArtists, selectedStatuses, dateRangeFilter]);
  
  // 페이지네이션 처리
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const displayedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // 필터 토글 핸들러
  const toggleArtistFilter = (artist: string) => {
    setSelectedArtists(prev => 
      prev.includes(artist) 
        ? prev.filter(a => a !== artist)
        : [...prev, artist]
    );
  };
  
  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  // 검색어 변경시 첫 페이지로 이동
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // 뷰 타입 전환
  const handleViewChange = (newView: "table" | "card") => {
    setView(newView);
  };
  
  // 고객 등록 다이얼로그 관리
  const handleAddClient = () => {
    setIsAddClientDialogOpen(false);
    // 여기에 고객 추가 로직 추가
  };
  
  // 고객 작업 핸들러 (메시지 발송, 보증서, 메모)
  const handleClientAction = (actionType: string, clientId: number) => {
    // 실제 구현에서는 여기에 각 액션별 로직 추가
    console.log(`Action: ${actionType} for client ${clientId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 헤더 및 필터 영역 */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          
          <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center bg-brand-blue hover:bg-brand-lightBlue">
                <UserPlus size={18} className="mr-2" />
                고객 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>신규 고객 등록</DialogTitle>
              </DialogHeader>
              <ClientForm onSubmit={handleAddClient} />
            </DialogContent>
          </Dialog>
        </div>
      
        {/* 필터 및 검색 영역 */}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="고객명, 연락처 검색..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-2">
              {/* 작가 필터 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter size={16} className="mr-2 text-gray-500" />
                    관심 작가
                    <ChevronDown size={16} className="ml-2 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    {artistList.map((artist) => (
                      <div key={artist} className="flex items-center gap-2">
                        <Button 
                          variant={selectedArtists.includes(artist) ? "secondary" : "outline"}
                          className="w-full justify-start"
                          onClick={() => toggleArtistFilter(artist)}
                        >
                          {selectedArtists.includes(artist) && <Check size={16} className="mr-2" />}
                          {artist}
                        </Button>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* 고객 상태 필터 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter size={16} className="mr-2 text-gray-500" />
                    고객 상태
                    <ChevronDown size={16} className="ml-2 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center gap-2">
                        <Button 
                          variant={selectedStatuses.includes(status) ? "secondary" : "outline"}
                          className="w-full justify-start"
                          onClick={() => toggleStatusFilter(status)}
                        >
                          {selectedStatuses.includes(status) && <Check size={16} className="mr-2" />}
                          {status}
                        </Button>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* 등록일 필터 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter size={16} className="mr-2 text-gray-500" />
                    등록일
                    <ChevronDown size={16} className="ml-2 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    <Button 
                      variant={dateRangeFilter === "all" ? "secondary" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setDateRangeFilter("all")}
                    >
                      {dateRangeFilter === "all" && <Check size={16} className="mr-2" />}
                      전체 기간
                    </Button>
                    <Button 
                      variant={dateRangeFilter === "month" ? "secondary" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setDateRangeFilter("month")}
                    >
                      {dateRangeFilter === "month" && <Check size={16} className="mr-2" />}
                      최근 1개월
                    </Button>
                    <Button 
                      variant={dateRangeFilter === "quarter" ? "secondary" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setDateRangeFilter("quarter")}
                    >
                      {dateRangeFilter === "quarter" && <Check size={16} className="mr-2" />}
                      최근 3개월
                    </Button>
                    <Button 
                      variant={dateRangeFilter === "year" ? "secondary" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setDateRangeFilter("year")}
                    >
                      {dateRangeFilter === "year" && <Check size={16} className="mr-2" />}
                      최근 1년
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* 뷰 전환 버튼 */}
            <div className="flex gap-2">
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => handleViewChange("table")}
                className={view === "table" ? "bg-brand-blue hover:bg-brand-lightBlue" : ""}
              >
                <List size={18} />
              </Button>
              <Button
                variant={view === "card" ? "default" : "outline"}
                size="icon"
                onClick={() => handleViewChange("card")}
                className={view === "card" ? "bg-brand-blue hover:bg-brand-lightBlue" : ""}
              >
                <Grid2X2 size={18} />
              </Button>
            </div>
          </div>
          
          {/* 선택된 필터 태그 표시 */}
          {(selectedArtists.length > 0 || selectedStatuses.length > 0 || dateRangeFilter !== "all") && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedArtists.map(artist => (
                <Badge 
                  key={artist}
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1 border-brand-blue"
                >
                  {artist}
                  <button 
                    className="ml-1 text-gray-500 hover:text-gray-700" 
                    onClick={() => toggleArtistFilter(artist)}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
              {selectedStatuses.map(status => (
                <Badge 
                  key={status}
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1 border-brand-blue"
                >
                  {status}
                  <button 
                    className="ml-1 text-gray-500 hover:text-gray-700" 
                    onClick={() => toggleStatusFilter(status)}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
              {dateRangeFilter !== "all" && (
                <Badge 
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1 border-brand-blue"
                >
                  {dateRangeFilter === "month" ? "최근 1개월" : 
                   dateRangeFilter === "quarter" ? "최근 3개월" : "최근 1년"}
                  <button 
                    className="ml-1 text-gray-500 hover:text-gray-700" 
                    onClick={() => setDateRangeFilter("all")}
                  >
                    &times;
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      
        {/* 고객 데이터 결과 정보 */}
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <span>전체 {filteredClients.length}명의 고객</span>
        </div>
        
        {/* 데이터 표시 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {view === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>고객명</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>최근 방문</TableHead>
                  <TableHead>관심 작가</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedClients.length > 0 ? (
                  displayedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{formatLastVisit(client.lastVisit)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.favoriteArtists.map(artist => (
                            <Badge key={artist} variant="outline" className="text-xs">
                              {artist}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.status.map(status => (
                            <Badge key={status} className={`text-xs ${getStatusBadgeVariant(status)}`}>
                              {status === "VIP" && <Star size={12} className="mr-1" />}
                              {status}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(client.registrationDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleClientAction("message", client.id)}
                            title="메시지 발송"
                          >
                            <MessageSquare size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleClientAction("warranty", client.id)}
                            title="보증서"
                          >
                            <FileText size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleClientAction("edit", client.id)}
                            title="고객 정보 편집"
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedClients.length > 0 ? (
                  displayedClients.map((client) => (
                    <Card key={client.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-lg">{client.name}</h3>
                              <p className="text-sm text-gray-500">{client.phone}</p>
                            </div>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {client.status.map(status => (
                                <Badge key={status} className={`text-xs ${getStatusBadgeVariant(status)}`}>
                                  {status === "VIP" && <Star size={12} className="mr-1" />}
                                  {status}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">이메일</span>
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">최근 방문</span>
                              <span>{formatLastVisit(client.lastVisit)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">등록일</span>
                              <span>{formatDate(client.registrationDate)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">관심 작가</p>
                            <div className="flex flex-wrap gap-1">
                              {client.favoriteArtists.map(artist => (
                                <Badge key={artist} variant="outline" className="text-xs">
                                  {artist}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100 p-2 bg-gray-50 flex justify-around">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleClientAction("message", client.id)}
                            className="flex-1 py-2"
                          >
                            <MessageSquare size={16} className="mr-1" />
                            메시지
                          </Button>
                          <div className="w-px h-8 bg-gray-200 my-auto"></div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleClientAction("warranty", client.id)}
                            className="flex-1 py-2"
                          >
                            <FileText size={16} className="mr-1" />
                            보증서
                          </Button>
                          <div className="w-px h-8 bg-gray-200 my-auto"></div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleClientAction("edit", client.id)}
                            className="flex-1 py-2"
                          >
                            <Edit size={16} className="mr-1" />
                            편집
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 페이지네이션 */}
          {filteredClients.length > 0 && (
            <div className="py-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;

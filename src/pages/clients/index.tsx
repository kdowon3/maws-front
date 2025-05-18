
import React, { useState, useMemo } from "react";
import { List, Grid2X2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// 컴포넌트 임포트
import ClientsHeader from "@/components/clients/ClientsHeader";
import ClientsFilters from "@/components/clients/ClientsFilters";
import ClientsTableView from "@/components/clients/ClientsTableView";
import ClientsCardView from "@/components/clients/ClientsCardView";
import ClientsPagination from "@/components/clients/ClientsPagination";

// 데이터 및 유틸리티 임포트
import { dummyClients } from "@/data/clientsData";

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
        {/* 헤더 영역 */}
        <ClientsHeader 
          isAddClientDialogOpen={isAddClientDialogOpen} 
          setIsAddClientDialogOpen={setIsAddClientDialogOpen} 
          handleAddClient={handleAddClient} 
        />
      
        {/* 필터 및 검색 영역 */}
        <ClientsFilters 
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          selectedArtists={selectedArtists}
          toggleArtistFilter={toggleArtistFilter}
          selectedStatuses={selectedStatuses}
          toggleStatusFilter={toggleStatusFilter}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          view={view}
          handleViewChange={handleViewChange}
        />
      
        {/* 고객 데이터 결과 정보 */}
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <span>전체 {filteredClients.length}명의 고객</span>
        </div>
        
        {/* 데이터 표시 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {view === "table" ? (
            <ClientsTableView 
              clients={displayedClients} 
              handleClientAction={handleClientAction} 
            />
          ) : (
            <ClientsCardView 
              clients={displayedClients} 
              handleClientAction={handleClientAction} 
            />
          )}
          
          {/* 페이지네이션 */}
          {filteredClients.length > 0 && (
            <ClientsPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;

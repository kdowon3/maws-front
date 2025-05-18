
import React from "react";
import { Search, Filter, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { artistList, statusOptions } from "@/data/clientsData";

interface ClientsFiltersProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedArtists: string[];
  toggleArtistFilter: (artist: string) => void;
  selectedStatuses: string[];
  toggleStatusFilter: (status: string) => void;
  dateRangeFilter: string;
  setDateRangeFilter: (filter: string) => void;
  view: "table" | "card";
  handleViewChange: (view: "table" | "card") => void;
}

const ClientsFilters: React.FC<ClientsFiltersProps> = ({
  searchTerm,
  handleSearchChange,
  selectedArtists,
  toggleArtistFilter,
  selectedStatuses,
  toggleStatusFilter,
  dateRangeFilter,
  setDateRangeFilter,
  view,
  handleViewChange,
}) => {
  return (
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
  );
};

export default ClientsFilters;

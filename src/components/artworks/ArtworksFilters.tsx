
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { artistList } from "@/data/artworksData";

interface ArtworksFiltersProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedArtist: string | null;
  handleArtistChange: (artist: string | null) => void;
  sortBy: "latest" | "oldest" | "price_high" | "price_low";
  handleSortChange: (sort: "latest" | "oldest" | "price_high" | "price_low") => void;
}

const ArtworksFilters: React.FC<ArtworksFiltersProps> = ({
  searchTerm,
  handleSearchChange,
  selectedArtist,
  handleArtistChange,
  sortBy,
  handleSortChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
      {/* 검색 필터 */}
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="작품명, 작가명 검색..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* 작가 필터 */}
      <div className="w-full md:w-auto">
        <Select
          value={selectedArtist || "all_artists"} 
          onValueChange={(value) => handleArtistChange(value === "all_artists" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="작가 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_artists">전체 작가</SelectItem>
            {artistList.map((artist) => (
              <SelectItem key={artist} value={artist}>
                {artist}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* 정렬 필터 */}
      <div className="w-full md:w-auto">
        <Select
          value={sortBy}
          onValueChange={(value) => 
            handleSortChange(value as "latest" | "oldest" | "price_high" | "price_low")
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="정렬 방식" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
            <SelectItem value="price_high">가격 높은순</SelectItem>
            <SelectItem value="price_low">가격 낮은순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ArtworksFilters;

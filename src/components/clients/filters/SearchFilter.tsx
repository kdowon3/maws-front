
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  handleSearchChange,
}) => {
  return (
    <div className="relative w-full md:max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        placeholder="고객명, 연락처 검색..."
        className="pl-10"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SearchFilter;

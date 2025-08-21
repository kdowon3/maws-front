import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  inputValue,
  handleInputChange,
  handleSearch,
  handleKeyPress,
}) => {
  return (
    <div className="relative w-full md:max-w-sm flex gap-2">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="고객명, 연락처, 작가명 등 검색..."
          className="pl-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>
      <Button onClick={handleSearch} variant="outline" size="sm">
        검색
      </Button>
    </div>
  );
};

export default SearchFilter;

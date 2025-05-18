
import React from "react";
import { Badge } from "@/components/ui/badge";

interface FilterTagsProps {
  selectedArtists: string[];
  toggleArtistFilter: (artist: string) => void;
  selectedStatuses: string[];
  toggleStatusFilter: (status: string) => void;
  dateRangeFilter: string;
  setDateRangeFilter: (filter: string) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({
  selectedArtists,
  toggleArtistFilter,
  selectedStatuses,
  toggleStatusFilter,
  dateRangeFilter,
  setDateRangeFilter,
}) => {
  if (
    selectedArtists.length === 0 &&
    selectedStatuses.length === 0 &&
    dateRangeFilter === "all"
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {selectedArtists.map((artist) => (
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
      
      {selectedStatuses.map((status) => (
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
          {dateRangeFilter === "month"
            ? "최근 1개월"
            : dateRangeFilter === "quarter"
            ? "최근 3개월"
            : "최근 1년"}
          <button
            className="ml-1 text-gray-500 hover:text-gray-700"
            onClick={() => setDateRangeFilter("all")}
          >
            &times;
          </button>
        </Badge>
      )}
    </div>
  );
};

export default FilterTags;


import React from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { artistList } from "@/data/clientsData";

interface ArtistFilterProps {
  selectedArtists: string[];
  toggleArtistFilter: (artist: string) => void;
}

const ArtistFilter: React.FC<ArtistFilterProps> = ({
  selectedArtists,
  toggleArtistFilter,
}) => {
  return (
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
  );
};

export default ArtistFilter;

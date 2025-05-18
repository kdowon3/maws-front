
import React from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { statusOptions } from "@/data/clientsData";

interface StatusFilterProps {
  selectedStatuses: string[];
  toggleStatusFilter: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  toggleStatusFilter,
}) => {
  return (
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
  );
};

export default StatusFilter;

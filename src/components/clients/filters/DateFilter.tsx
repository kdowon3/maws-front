
import React from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateFilterProps {
  dateRangeFilter: string;
  setDateRangeFilter: (filter: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  dateRangeFilter,
  setDateRangeFilter,
}) => {
  return (
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
  );
};

export default DateFilter;

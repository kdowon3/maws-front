import React from 'react';
import { Badge } from '@/components/ui/badge';

interface FilterTagsProps {
    dateRangeFilter: string;
    setDateRangeFilter: (filter: string) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({
    dateRangeFilter,
    setDateRangeFilter,
}) => {
    if (dateRangeFilter === 'all') {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 pt-2">
            {dateRangeFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 border-brand-blue">
                    {dateRangeFilter === 'month'
                        ? '최근 1개월'
                        : dateRangeFilter === 'quarter'
                        ? '최근 3개월'
                        : '최근 1년'}
                    <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => setDateRangeFilter('all')}
                    >
                        &times;
                    </button>
                </Badge>
            )}
        </div>
    );
};

export default FilterTags;

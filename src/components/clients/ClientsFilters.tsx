import React from 'react';
import SearchFilter from './filters/SearchFilter';
import TagFilter from './filters/TagFilter';
// import StatusFilter from './filters/StatusFilter';
import DateFilter from './filters/DateFilter';
// import ViewToggle from './filters/ViewToggle';
import FilterTags from './filters/FilterTags';

interface TagType {
    id: number;
    name: string;
    color?: string;
}

interface ClientsFiltersProps {
    inputValue: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearch: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    selectedTags: TagType[];
    onTagChange: (tags: TagType[]) => void;
    // selectedStatuses: string[];
    // toggleStatusFilter: (status: string) => void;
    dateRangeFilter: string;
    setDateRangeFilter: (filter: string) => void;
    // view: 'table' | 'card';
    // handleViewChange: (view: 'table' | 'card') => void;
}

const ClientsFilters: React.FC<ClientsFiltersProps> = ({
    inputValue,
    handleInputChange,
    handleSearch,
    handleKeyPress,
    selectedTags,
    onTagChange,
    // selectedStatuses,
    // toggleStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    // view,
    // handleViewChange,
}) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                    {/* Search Filter */}
                    <SearchFilter 
                        inputValue={inputValue} 
                        handleInputChange={handleInputChange}
                        handleSearch={handleSearch}
                        handleKeyPress={handleKeyPress}
                    />

                    {/* Tag Filter */}
                    <TagFilter
                        selectedTags={selectedTags}
                        onTagChange={onTagChange}
                    />


                    {/* Status Filter (제거됨) */}
                    {/* <StatusFilter selectedStatuses={selectedStatuses} toggleStatusFilter={toggleStatusFilter} /> */}

                    {/* Date Filter */}
                    <DateFilter dateRangeFilter={dateRangeFilter} setDateRangeFilter={setDateRangeFilter} />
                </div>

                {/* View Toggle */}
                {/* <ViewToggle view={view} handleViewChange={handleViewChange} /> */}
            </div>

            {/* Selected Filter Tags (작가 필터 제거) */}
            <FilterTags
                // selectedStatuses={selectedStatuses}
                // toggleStatusFilter={toggleStatusFilter}
                dateRangeFilter={dateRangeFilter}
                setDateRangeFilter={setDateRangeFilter}
            />
        </div>
    );
};

export default ClientsFilters;

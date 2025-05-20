import React from 'react';
import SearchFilter from './filters/SearchFilter';
import ArtistFilter from './filters/ArtistFilter';
import StatusFilter from './filters/StatusFilter';
import DateFilter from './filters/DateFilter';
import ViewToggle from './filters/ViewToggle';
import FilterTags from './filters/FilterTags';

interface ClientsFiltersProps {
    searchTerm: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedArtists: string[];
    toggleArtistFilter: (artist: string) => void;
    selectedStatuses: string[];
    toggleStatusFilter: (status: string) => void;
    dateRangeFilter: string;
    setDateRangeFilter: (filter: string) => void;
    view: 'table' | 'card';
    handleViewChange: (view: 'table' | 'card') => void;
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
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                    {/* Artist Filter */}
                    <ArtistFilter selectedArtists={selectedArtists} toggleArtistFilter={toggleArtistFilter} />

                    {/* Status Filter */}
                    <StatusFilter selectedStatuses={selectedStatuses} toggleStatusFilter={toggleStatusFilter} />

                    {/* Date Filter */}
                    <DateFilter dateRangeFilter={dateRangeFilter} setDateRangeFilter={setDateRangeFilter} />
                </div>

                {/* View Toggle */}
                <ViewToggle view={view} handleViewChange={handleViewChange} />
            </div>

            {/* Selected Filter Tags */}
            <FilterTags
                selectedArtists={selectedArtists}
                toggleArtistFilter={toggleArtistFilter}
                selectedStatuses={selectedStatuses}
                toggleStatusFilter={toggleStatusFilter}
                dateRangeFilter={dateRangeFilter}
                setDateRangeFilter={setDateRangeFilter}
            />
        </div>
    );
};

export default ClientsFilters;

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PageHeader from '@/components/layouts/PageHeader';
import ArtworksFilters from '@/components/artworks/ArtworksFilters';
import ArtworksTable from '@/components/artworks/ArtworksTable';
import ArtworksPagination from '@/components/artworks/ArtworksPagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { Artwork, dummyArtworks } from '@/data/artworksData';
import { toast } from '@/hooks/use-toast';

const ArtworksPage: React.FC = () => {
    // 상태 관리
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'price_high' | 'price_low'>('latest');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddArtworkDialogOpen, setIsAddArtworkDialogOpen] = useState(false);

    // 검색어, 필터링 적용된 작품 목록
    const filteredArtworks = useMemo(() => {
        return dummyArtworks
            .filter((artwork) => {
                // 검색어 필터링 (작품명, 작가명)
                const matchesSearch =
                    searchTerm === '' ||
                    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    artwork.artist.toLowerCase().includes(searchTerm.toLowerCase());

                // 작가 필터링
                const matchesArtist = selectedArtist === null || artwork.artist === selectedArtist;

                return matchesSearch && matchesArtist;
            })
            .sort((a, b) => {
                // 정렬 적용
                switch (sortBy) {
                    case 'latest':
                        return parseInt(b.year) - parseInt(a.year);
                    case 'oldest':
                        return parseInt(a.year) - parseInt(b.year);
                    case 'price_high':
                        return b.price - a.price;
                    case 'price_low':
                        return a.price - b.price;
                    default:
                        return 0;
                }
            });
    }, [searchTerm, selectedArtist, sortBy]);

    // 페이지네이션 처리
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredArtworks.length / itemsPerPage);
    const displayedArtworks = filteredArtworks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 검색어 변경시 첫 페이지로 이동
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // 작가 필터 변경
    const handleArtistChange = (artist: string | null) => {
        setSelectedArtist(artist);
        setCurrentPage(1);
    };

    // 정렬 방식 변경
    const handleSortChange = (sort: 'latest' | 'oldest' | 'price_high' | 'price_low') => {
        setSortBy(sort);
    };

    // 작품 작업 핸들러 (수정, 삭제, 보증서 발급)
    const handleArtworkAction = (actionType: 'edit' | 'delete' | 'certificate', artwork: Artwork) => {
        switch (actionType) {
            case 'edit':
                console.log(`편집: ${artwork.title}`);
                // 편집 로직을 여기에 추가
                break;
            case 'delete':
                console.log(`삭제: ${artwork.title}`);
                toast({
                    title: '작품 삭제',
                    description: `'${artwork.title}' 작품이 삭제되었습니다.`,
                });
                // 삭제 로직을 여기에 추가
                break;
            case 'certificate':
                if (!artwork.buyerId) {
                    toast({
                        title: '보증서 발급 불가',
                        description: '구매자 정보가 연결되지 않았습니다.',
                        variant: 'destructive',
                    });
                    return;
                }
                if (artwork.hasMissingFields) {
                    toast({
                        title: '보증서 발급 불가',
                        description: '필수 필드가 누락되었습니다.',
                        variant: 'destructive',
                    });
                    return;
                }
                console.log(`보증서 발급: ${artwork.title} (구매자: ${artwork.buyerName})`);
                toast({
                    title: '보증서 발급 시작',
                    description: `'${artwork.title}' 작품의 보증서 발급이 시작되었습니다.`,
                });
                // 보증서 발급 로직을 여기에 추가
                break;
        }
    };

    // 작품 추가 다이얼로그 핸들러
    const handleAddArtwork = () => {
        setIsAddArtworkDialogOpen(false);
        // 작품 추가 로직을 여기에 추가
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* 헤더 영역 */}
                <PageHeader title="작품 관리" description="등록된 작품을 관리하고 보증서를 발급할 수 있습니다.">
                    <Button onClick={() => setIsAddArtworkDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        작품 추가
                    </Button>
                </PageHeader>

                {/* 필터 및 검색 영역 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <ArtworksFilters
                        searchTerm={searchTerm}
                        handleSearchChange={handleSearchChange}
                        selectedArtist={selectedArtist}
                        handleArtistChange={handleArtistChange}
                        sortBy={sortBy}
                        handleSortChange={handleSortChange}
                    />
                </div>

                {/* 작품 데이터 결과 정보 */}
                <div className="text-sm text-gray-500">
                    <span>전체 {filteredArtworks.length}개의 작품</span>
                </div>

                {/* 데이터 표시 영역 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <ArtworksTable artworks={displayedArtworks} handleArtworkAction={handleArtworkAction} />

                    {/* 페이지네이션 */}
                    {filteredArtworks.length > 0 && (
                        <div className="px-6 py-4 border-t">
                            <ArtworksPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ArtworksPage;

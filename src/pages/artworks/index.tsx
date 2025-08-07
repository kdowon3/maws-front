import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import ArtworksFilters from '@/components/artworks/ArtworksFilters';
import ArtworksTable from '@/components/artworks/ArtworksTable';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ArtworkForm from '@/components/artworks/ArtworkForm';
import EditArtworkDialog from '@/components/artworks/EditArtworkDialog';
import DeleteArtworkDialog from '@/components/artworks/DeleteArtworkDialog';
import CertificateArtworkDialog from '@/components/artworks/CertificateArtworkDialog';

// import { Artwork, dummyArtworks } from '@/data/artworksData'; // 더미데이터 import 제거
import {
    fetchArtworksServerSide,
    fetchClients,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    issueArtworkCertificate,
    refreshToken,
} from '@/utils/api';
import { toast } from '@/hooks/use-toast';

const ArtworksPage: React.FC = () => {
    // 상태 관리
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'price_high' | 'price_low'>('latest');
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
    const [isAddArtworkDialogOpen, setIsAddArtworkDialogOpen] = useState(false);
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);
    const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'certificate' | null>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchArtworksServerSide({
            search: searchTerm || undefined, // 검색어가 있을 때만 전달
            artist: selectedArtist || undefined, // 선택된 작가가 있을 때만 전달
            sort: sortBy,
        })
            .then((data) => {
                console.log('서버에서 받아온 작품 데이터:', data); // 디버깅용
                const artworksData = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
                console.log('처리된 작품 데이터:', artworksData); // 디버깅용
                if (artworksData.length > 0) {
                    console.log('첫 번째 작품의 크기 데이터:', {
                        width: artworksData[0].width,
                        height: artworksData[0].height,
                        depth: artworksData[0].depth,
                        size_unit: artworksData[0].size_unit,
                    }); // 디버깅용
                }
                setArtworks(artworksData);
            })
            .catch((error) => {
                console.error('작품 데이터 로드 실패:', error);
            })
            .finally(() => setLoading(false));
        fetchClients()
            .then((data) => {
                console.log('원본 클라이언트 데이터:', data); // 디버깅용

                // 페이지네이션 응답에서 results 배열 추출
                const clientsArray = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];

                // 각 클라이언트를 개별적으로 처리
                const mapped = clientsArray.map((c: any, index: number) => {
                    const clientData = {
                        id: `client-${c.id}-${index}`,
                        originalId: c.id, // 원본 ID 보존
                        name: c.name || '이름 없음', // 백엔드에서 제공하는 기본 필드
                        phone: c.phone || '',
                        email: c.email || '',
                        address: c.address || '',
                        note: c.note || '',
                        created_at: c.created_at,
                        updated_at: c.updated_at,
                    };

                    // 기타 동적 필드들도 복사
                    if (c.data) {
                        Object.keys(c.data).forEach((key) => {
                            if (!['name', 'phone', 'email', 'address', 'note'].includes(key)) {
                                clientData[key] = c.data[key];
                            }
                        });
                    }

                    return clientData;
                });

                console.log('가공된 클라이언트 데이터:', mapped); // 디버깅용
                setClients(mapped);
            })
            .catch((error) => {
                console.error('클라이언트 데이터 로드 실패:', error);
            });
    }, [searchTerm, selectedArtist, sortBy]);



    // 실시간 검색을 위한 디바운스 효과
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 300); // 300ms 후 검색 실행

        return () => clearTimeout(timer);
    }, [searchInput]);

    // 검색어 변경 핸들러 (실시간)
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    // 엔터 키 입력시 즉시 검색
    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchTerm(searchInput);
        }
    };

    // 작가 필터 변경
    const handleArtistChange = (artist: string | null) => {
        setSelectedArtist(artist);
    };

    // 정렬 방식 변경
    const handleSortChange = (sort: 'latest' | 'oldest' | 'price_high' | 'price_low') => {
        setSortBy(sort);
    };

    // 작품 작업 핸들러 (수정, 삭제, 보증서 발급)
    const handleArtworkAction = (actionType: 'edit' | 'delete' | 'certificate', artwork: any) => {
        setSelectedArtwork(artwork);
        setDialogType(actionType);
    };

    const handleAddArtwork = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            console.log('등록 요청 데이터:', Object.fromEntries(formData));
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/artworks/`;

            // 토큰 갱신을 포함한 인증 처리
            const token = localStorage.getItem('access_token');
            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            // 401 에러 시 토큰 갱신 시도
            if (res.status === 401) {
                const refreshSuccess = await refreshToken();
                if (refreshSuccess) {
                    const newToken = localStorage.getItem('access_token');
                    res = await fetch(url, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: formData,
                    });
                } else {
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                }
            }

            if (!res.ok) throw new Error('작품 등록 실패');
            const result = await res.json();
            console.log('등록 응답:', result);
            setIsAddArtworkDialogOpen(false);
            const newList = await fetchArtworksServerSide({
                search: searchTerm,
                artist: selectedArtist || undefined,
                sort: sortBy,
                page: 1, // 페이지 번호는 서버에서 처리
            });
            setArtworks(newList.results || newList);
        } catch (e) {
            console.error('등록 에러:', e);
            alert('작품 등록에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditArtwork = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            console.log('수정 요청 데이터:', Object.fromEntries(formData));
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/artworks/${selectedArtwork.id}/`;
            const token = localStorage.getItem('access_token');
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (!res.ok) throw new Error('작품 수정 실패');
            const result = await res.json();
            console.log('수정 응답:', result);
            setDialogType(null);
            setSelectedArtwork(null);
            const newList = await fetchArtworksServerSide({
                search: searchTerm,
                artist: selectedArtist || undefined,
                sort: sortBy,
                page: 1, // 페이지 번호는 서버에서 처리
            });
            setArtworks(newList.results || newList);
        } catch (e) {
            console.error('수정 에러:', e);
            alert('작품 수정에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteArtwork = async () => {
        setIsSubmitting(true);
        try {
            await deleteArtwork(selectedArtwork.id);
            setDialogType(null);
            setSelectedArtwork(null);
            const newList = await fetchArtworksServerSide({
                search: searchTerm,
                artist: selectedArtist || undefined,
                sort: sortBy,
                page: 1, // 페이지 번호는 서버에서 처리
            });
            setArtworks(newList.results || newList);
        } catch (e) {
            alert('작품 삭제에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIssueCertificate = async () => {
        setIsSubmitting(true);
        try {
            await issueArtworkCertificate(selectedArtwork.id);
            setDialogType(null);
            setSelectedArtwork(null);
            const newList = await fetchArtworksServerSide({
                search: searchTerm,
                artist: selectedArtist || undefined,
                sort: sortBy,
                page: 1, // 페이지 번호는 서버에서 처리
            });
            setArtworks(newList.results || newList);
        } catch (e) {
            alert('보증서 발급에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const artistList = useMemo(() => {
        // 한국어와 영어 작가명 모두 수집
        const allArtists = artworks.map((a) => a.artist_ko || a.artist_en).filter(Boolean);
        return Array.from(new Set(allArtists));
    }, [artworks]);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="space-y-6">
            {/* 헤더 영역 */}
            <PageHeader title="작품 관리" description="전시 및 판매 작품을 관리하고 보증서를 발급하세요.">
                <Dialog open={isAddArtworkDialogOpen} onOpenChange={setIsAddArtworkDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            작품 추가
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>신규 작품 등록</DialogTitle>
                            <DialogDescription>새로운 작품 정보를 입력하여 시스템에 등록합니다.</DialogDescription>
                        </DialogHeader>
                        <ArtworkForm
                            onSubmit={handleAddArtwork}
                            onCancel={() => setIsAddArtworkDialogOpen(false)}
                            clients={clients}
                            isLoading={isSubmitting}
                            artistList={artistList}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>
            {/* 필터 및 검색 영역 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <ArtworksFilters
                    searchTerm={searchInput}
                    handleSearchChange={handleSearchInputChange}
                    handleSearchKeyDown={handleSearchInputKeyDown}
                    selectedArtist={selectedArtist}
                    handleArtistChange={handleArtistChange}
                    sortBy={sortBy}
                    handleSortChange={handleSortChange}
                    artistList={artistList}
                />
            </div>
            {/* 작품 데이터 결과 정보 */}
            <div className="text-sm text-gray-500">
                <span>전체 {filteredArtworks.length}개의 작품</span>
            </div>
            {/* 데이터 표시 영역 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <ArtworksTable artworks={filteredArtworks} handleArtworkAction={handleArtworkAction} />
                {/* 페이지네이션 */}
                {filteredArtworks.length > 0 && (
                    <div className="px-6 py-4 border-t">
                        {/* TanStack Table의 내장 페이지네이션은 여기에 포함되지 않습니다. */}
                        {/* 페이지네이션 로직은 서버에서 처리되며, 클라이언트는 현재 페이지의 데이터만 표시합니다. */}
                    </div>
                )}
            </div>
            {/* 모달 렌더링 */}
            {dialogType === 'edit' && selectedArtwork && (
                <EditArtworkDialog
                    artwork={selectedArtwork}
                    onSubmit={handleEditArtwork}
                    onClose={() => setDialogType(null)}
                    clients={clients}
                    isLoading={isSubmitting}
                    artistList={artistList}
                />
            )}
            {dialogType === 'delete' && selectedArtwork && (
                <DeleteArtworkDialog
                    artwork={selectedArtwork}
                    onDelete={handleDeleteArtwork}
                    onClose={() => setDialogType(null)}
                    isLoading={isSubmitting}
                />
            )}
            {dialogType === 'certificate' && selectedArtwork && (
                <CertificateArtworkDialog
                    artwork={selectedArtwork}
                    onClose={() => setDialogType(null)}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
};

export default ArtworksPage;

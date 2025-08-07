import React, { useState, useMemo, useEffect } from 'react';
import { List, Grid2X2 } from 'lucide-react';
import { fetchClientsServerSide, fetchArtworks } from '@/utils/api';
import * as XLSX from 'xlsx';
// @ts-ignore
import Papa from 'papaparse';

// 컴포넌트 임포트
import TanStackDynamicTable from '@/components/test/TanStackDynamicTable';
import EditClientDialog from '@/components/clients/EditClientDialog';
import DeleteClientDialog from '@/components/clients/DeleteClientDialog';
import ClientsCardView from '@/components/clients/ClientsCardView';
import ClientsTableView from '@/components/clients/ClientsTableView';
import ClientsFilters from '@/components/clients/ClientsFilters';
import ClientsHeader from '@/components/clients/ClientsHeader';
import AddClientDialog from '@/components/clients/AddClientDialog';
import MessageClientDialog from '@/components/clients/MessageClientDialog';
// import { initialClientColumns, initialClientRows } from '@/data/clientsDynamicTable';
import { addClient, updateClient, deleteClient, getClients, processExcelData, uploadExcelFile } from '@/utils/api';

// import { dummyClients } from '@/data/clientsData'; // 더미데이터 import 제거

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 프론트엔드 헤더 매핑 로직 제거 - 백엔드 AI 시스템으로 통합

// utils/api에서 bulk delete 함수 추가
// bulkDeleteClients 및 전체 삭제 버튼 관련 코드 모두 삭제

const ClientsPage: React.FC = () => {
    // 현재 상태 관리
    const [view, setView] = useState<'table' | 'card'>('table');
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
    const [dateRangeFilter, setDateRangeFilter] = useState<string>('all'); // all, month, quarter, year
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [artworks, setArtworks] = useState<any[]>([]);

    // 모달 상태 및 선택된 고객
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    // 동적 테이블용 행 상태 (초기값: initialClientRows)
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<any[]>([]);

    // 컬럼 매핑 정보 저장 (영문키 → 한국어 헤더명)
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

    // 필터 적용
    const filteredRows = useMemo(() => {
        return data.filter((row) => {
            // 검색어: 태그를 제외한 모든 클라이언트 데이터 검색
            const searchFields = Object.entries(row).filter(([key]) => key !== 'tags');
            const matchesSearch =
                searchTerm === '' ||
                searchFields.some(([key, value]) => {
                    // 메타데이터 필드와 태그 필드 제외
                    if (['id', 'created_at', 'updated_at', '고객분류'].includes(key)) {
                        return false;
                    }
                    // 배열이나 객체인 태그 데이터 제외
                    if (Array.isArray(value) && key.includes('태그')) {
                        return false;
                    }
                    // 문자열과 숫자만 검색 대상으로 포함
                    if (value && (typeof value === 'string' || typeof value === 'number')) {
                        return value.toString().includes(searchTerm);
                    }
                    return false;
                });

            // 태그 필터: 선택된 태그가 있는 경우 해당 태그를 포함하는지 확인 (한국어 필드명 사용)
            const matchesTags =
                selectedTags.length === 0 ||
                (row['고객분류'] &&
                    Array.isArray(row['고객분류']) &&
                    row['고객분류'].some((tag: any) => selectedTags.some((selectedTag) => selectedTag.id === tag.id)));

            // 날짜 필터: 등록일 기준 (created_at 사용)
            let matchesDate = true;
            if (dateRangeFilter !== 'all' && row.created_at) {
                try {
                    const regDate = new Date(row.created_at);
                    // 유효한 날짜인지 확인
                    if (!isNaN(regDate.getTime())) {
                        const now = new Date();
                        const timeDiff = now.getTime() - regDate.getTime();

                        if (dateRangeFilter === 'month') {
                            matchesDate = timeDiff <= 30 * 24 * 60 * 60 * 1000;
                        } else if (dateRangeFilter === 'quarter') {
                            matchesDate = timeDiff <= 90 * 24 * 60 * 60 * 1000;
                        } else if (dateRangeFilter === 'year') {
                            matchesDate = timeDiff <= 365 * 24 * 60 * 60 * 1000;
                        }
                    }
                } catch (error) {
                    console.warn('날짜 파싱 오류:', row.created_at, error);
                    // 날짜 파싱 실패시 해당 행은 포함 (기본값 true 유지)
                }
            }

            return matchesSearch && matchesTags && matchesDate;
        });
    }, [data, searchTerm, selectedTags, dateRangeFilter]);

    // 페이지네이션 처리
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const displayedClients = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 입력값 변경 (실시간 검색 없음)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    // 실제 검색 실행 (엔터나 버튼 클릭시)
    const handleSearch = () => {
        setSearchTerm(inputValue);
        setCurrentPage(1);
    };

    // 엔터 키 처리
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 뷰 타입 전환
    // const handleViewChange = (newView: 'table' | 'card') => {
    //     setView(newView);
    // };

    // 고객 추가
    const handleAddClient = () => {
        setIsAddClientDialogOpen(true);
    };

    // 고객 액션 처리 (수정, 삭제, 메시지)
    const handleClientAction = (actionType: string, clientId: number | string) => {
        const client = data.find((c) => c.id === clientId);
        if (!client) {
            console.error('고객을 찾을 수 없습니다:', clientId);
            return;
        }

        setSelectedClient(client);

        switch (actionType) {
            case 'edit':
                setEditDialogOpen(true);
                setDeleteDialogOpen(false);
                setMessageDialogOpen(false);
                break;
            case 'delete':
                setDeleteDialogOpen(true);
                setEditDialogOpen(false);
                setMessageDialogOpen(false);
                break;
            case 'message':
                setMessageDialogOpen(true);
                setEditDialogOpen(false);
                setDeleteDialogOpen(false);
                break;
            default:
                console.warn('알 수 없는 액션 타입:', actionType);
        }
    };

    // 모든 모달 닫기
    const handleCloseAllModals = () => {
        setIsAddClientDialogOpen(false);
        setEditDialogOpen(false);
        setDeleteDialogOpen(false);
        setMessageDialogOpen(false);
        setSelectedClient(null);
    };

    // 엑셀 업로드 처리
    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            console.log('📁 엑셀 업로드 시작:', file.name);

            // 파일 확장자 확인
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
                alert('지원하지 않는 파일 형식입니다. xlsx, xls, csv 파일만 업로드 가능합니다.');
                return;
            }

            // 파일 크기 확인 (10MB 제한)
            if (file.size > 10 * 1024 * 1024) {
                alert('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.');
                return;
            }

            // FormData 생성
            const formData = new FormData();
            formData.append('file', file);

            // API 호출
            const { authenticatedFetch } = await import('@/utils/api');
            const response = await authenticatedFetch(`${API_BASE_URL}/excel/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '업로드 실패');
            }

            const result = await response.json();
            console.log('✅ 엑셀 업로드 완료:', result);

            // 성공 메시지
            alert(`엑셀 업로드가 완료되었습니다!\n\n처리된 행: ${result.processed_rows || 0}개`);

            // 데이터 새로고침
            await refresh();
        } catch (error: any) {
            console.error('❌ 엑셀 업로드 실패:', error);
            alert(`엑셀 업로드 실패: ${error.message}`);
        } finally {
            // 파일 입력 초기화
            e.target.value = '';
        }
    };

    // 데이터 새로고침
    const refresh = async () => {
        try {
            setLoading(true);
            console.log('🔄 데이터 새로고침 시작...');

            // 서버에서 최신 데이터 가져오기
            const serverData = await fetchClientsServerSide();
            console.log('📊 서버 데이터 로드 완료:', serverData.length, '건');

            // 데이터 매핑 및 변환
            const mapped = serverData.map((row: any) => {
                console.log('🔍 서버 데이터 구조:', { row });

                // 기본 필드
                const baseData = {
                    id: row.id,
                    고객명: row.name || '',
                    연락처: row.phone || '',
                    고객분류: row.tags || [],
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                };

                // 동적 필드 (data 객체 내용을 최상위로 병합)
                const dynamicData = row.data || {};

                // 최종 행 데이터
                const finalRow = {
                    ...baseData,
                    ...dynamicData, // data 필드 내용을 최상위로 병합
                };

                console.log('🔍 최종 매핑 결과:', finalRow);
                return finalRow;
            });

            setData(mapped);
            console.log('✅ 데이터 새로고침 완료');

            // 컬럼 정보도 업데이트 (첫 번째 행 기준)
            if (mapped.length > 0) {
                const sampleRow = mapped[0];
                const allFields = Object.keys(sampleRow).filter(
                    (key) => !['id', 'created_at', 'updated_at'].includes(key)
                );

                const baseColumns = [
                    { id: '고객명', header: '고객명', meta: { type: 'text' } },
                    { id: '연락처', header: '연락처', meta: { type: 'text' } },
                    { id: '고객분류', header: '고객분류', meta: { type: 'tags' } },
                ];

                const dynamicColumns = allFields
                    .filter((field) => !['고객명', '연락처', '고객분류'].includes(field))
                    .map((field) => ({
                        id: field,
                        header: field,
                        meta: { type: 'text' },
                    }));

                setColumns([...baseColumns, ...dynamicColumns]);
            }
        } catch (error) {
            console.error('❌ 데이터 새로고침 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // Deep Translator 기반 동적 컬럼 생성
    useEffect(() => {
        // 기본 컬럼 설정 (한국어 통일)
        const baseColumns = [
            { id: '고객명', header: '고객명', meta: { type: 'text' } },
            { id: '연락처', header: '연락처', meta: { type: 'text' } },
            { id: '고객분류', header: '고객분류', meta: { type: 'tags' } },
        ];

        setColumns(baseColumns);
    }, []);

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                console.log('🚀 초기 데이터 로드 시작...');

                // 클라이언트 데이터 로드
                const serverData = await fetchClientsServerSide();
                console.log('📊 클라이언트 데이터 로드 완료:', serverData.length, '건');

                // 데이터 매핑 및 변환
                const rows = serverData.map((row: any) => {
                    console.log('🔍 초기 로드 - 서버 데이터 구조:', { row });

                    // 기본 필드
                    const baseData = {
                        id: row.id,
                        고객명: row.name || '',
                        연락처: row.phone || '',
                        고객분류: row.tags || [],
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                    };

                    // 동적 필드 (data 객체 내용을 최상위로 병합)
                    const dynamicData = row.data || {};

                    // 최종 행 데이터
                    const finalRow = {
                        ...baseData,
                        ...dynamicData,
                    };

                    console.log('🔍 초기 로드 - 최종 매핑 결과:', finalRow);
                    return finalRow;
                });

                setData(rows);
                console.log('✅ 초기 데이터 로드 완료');

                // 컬럼 정보 설정 (첫 번째 행 기준)
                if (rows.length > 0) {
                    const sampleRow = rows[0];
                    const allFields = Object.keys(sampleRow).filter(
                        (key) => !['id', 'created_at', 'updated_at'].includes(key)
                    );

                    const baseColumns = [
                        { id: '고객명', header: '고객명', meta: { type: 'text' } },
                        { id: '연락처', header: '연락처', meta: { type: 'text' } },
                        { id: '고객분류', header: '고객분류', meta: { type: 'tags' } },
                    ];

                    const dynamicColumns = allFields
                        .filter((field) => !['고객명', '연락처', '고객분류'].includes(field))
                        .map((field) => ({
                            id: field,
                            header: field,
                            meta: { type: 'text' },
                        }));

                    setColumns([...baseColumns, ...dynamicColumns]);
                }

                // 작품 데이터도 로드 (클라이언트와 동일)
                setArtworks(rows);
            } catch (error) {
                console.error('❌ 초기 데이터 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="space-y-8">
            {/* 헤더 영역 */}
            <ClientsHeader />
            {/* 필터 및 검색 영역 */}
            <ClientsFilters
                inputValue={inputValue}
                handleInputChange={handleInputChange}
                handleSearch={handleSearch}
                handleKeyPress={handleKeyPress}
                selectedTags={selectedTags}
                onTagChange={setSelectedTags}
                dateRangeFilter={dateRangeFilter}
                setDateRangeFilter={setDateRangeFilter}
                // view={view}
                // handleViewChange={handleViewChange}
            />

            {/* 테이블/카드 뷰 분기 */}
            <TanStackDynamicTable
                // key={columns.length} // 컬럼 로드시 테이블 재마운트 - 제거하여 불필요한 재마운트 방지
                initialColumns={columns}
                initialData={filteredRows}
                onAddRow={async (row) => {
                    console.log('🆕 새 고객 추가 요청:', row);

                    // 태그 데이터 확인
                    if (row.tags || row['고객분류']) {
                        console.log('🏷️ 추가할 태그:', row.tags || row['고객분류']);
                    } else {
                        console.log('🏷️ 태그 없음 - 백엔드에서 자동으로 "일반고객" 태그 할당됨');
                    }

                    const result = await addClient(row);
                    console.log('✅ 고객 추가 성공:', result);
                    // TanStackDynamicTable에서 refreshColumnsAndData를 호출하므로 중복 제거
                    // await refresh();
                }}
                onUpdateRow={async (id, row) => {
                    await updateClient(Number(id), row);
                    // TanStackDynamicTable에서 refreshColumnsAndData를 호출하므로 중복 제거
                    // await refresh();
                }}
                onDeleteRow={async (id) => {
                    console.log('🚨 onDeleteRow 호출됨 - 이 콜백은 사용되지 않아야 합니다!');
                    console.log('삭제는 onAction 콜백을 통해 모달에서 처리됩니다.');
                    console.log('onDeleteRow 호출된 ID:', id);

                    // 이 콜백은 사용하지 않음 - onAction을 통한 모달 처리 사용
                    return;
                }}
                onAction={handleClientAction}
                onDataChanged={async () => {
                    await refresh();
                }} // 엑셀 업로드 완료 후 데이터 새로고침
                onColumnsChanged={(newColumns) => {
                    setColumns(newColumns);
                }} // 컬럼 변경 시 상위 컴포넌트에 알림
                onSimpleExcelUpload={async (file) => {
                    console.log('📁 수동 매핑 엑셀 업로드:', file.name);

                    try {
                        // 수동 매핑 API 호출 (백엔드에서 매핑 UI 제공)
                        const formData = new FormData();
                        formData.append('file', file);

                        // 기본 매핑 정보 전달 (빈 객체로 시작)
                        formData.append('column_mappings', JSON.stringify({}));

                        const { authenticatedFetch } = await import('@/utils/api');
                        const response = await authenticatedFetch(`${API_BASE_URL}/excel/upload-with-mapping/`, {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || '업로드 실패');
                        }

                        const result = await response.json();
                        console.log('✅ 수동 매핑 업로드 완료:', result);

                        // 서버 데이터 새로고침
                        await refresh();

                        // 결과 알림
                        alert(
                            `${result.message}\n\n처리된 컬럼:\n${Object.entries(result.column_mapping || {})
                                .map(([k, v]) => `${k} → ${v}`)
                                .join('\n')}`
                        );
                    } catch (error: any) {
                        console.error('❌ 수동 매핑 업로드 실패:', error);
                        alert(`수동 매핑 업로드 실패: ${error.message}`);
                    }
                }}
            />
            {/* 페이지네이션 */}
            {/* 모달/다이얼로그 */}
            <EditClientDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setSelectedClient(null);
                }}
                client={selectedClient}
                onClientUpdated={async () => {
                    await refresh();
                }}
                artworks={artworks}
                columns={columns}
            />
            <DeleteClientDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setSelectedClient(null);
                }}
                client={selectedClient}
                onClientDeleted={async () => {
                    await refresh();
                }}
            />
            {/* 페이지 상단 또는 적절한 위치에 버튼 추가 */}
            {/* 전체 데이터 삭제 버튼 제거 */}
        </div>
    );
};

export default ClientsPage;

import React, { useState, useMemo, useEffect } from 'react';
import { List, Grid2X2 } from 'lucide-react';
import { fetchClientsServerSide, fetchArtworks } from '@/utils/api';
// import * as XLSX from "xlsx"; // 현재 미사용 - TanStackDynamicTable에서 처리
// @ts-ignore
// import Papa from "papaparse"; // 현재 미사용 - TanStackDynamicTable에서 처리

// 컴포넌트 임포트
import ClientsHeader from '@/components/clients/ClientsHeader';
import ClientsFilters from '@/components/clients/ClientsFilters';
import ClientsTableView from '@/components/clients/ClientsTableView';
import ClientsCardView from '@/components/clients/ClientsCardView';
import ClientsPagination from '@/components/clients/ClientsPagination';
import AddClientDialog from '@/components/clients/AddClientDialog';
import EditClientDialog from '@/components/clients/EditClientDialog';
import DeleteClientDialog from '@/components/clients/DeleteClientDialog';
import MessageClientDialog from '@/components/clients/MessageClientDialog';
import TanStackDynamicTable from '@/components/test/TanStackDynamicTable';
// import { initialClientColumns, initialClientRows } from '@/data/clientsDynamicTable';
import {
    addClient,
    updateClient,
    deleteClient,
    getClients,
    // processExcelData, // 현재 미사용 - TanStackDynamicTable에서 처리
    // uploadExcelFile, // 현재 미사용 - TanStackDynamicTable에서 처리
} from '@/utils/api';

// import { dummyClients } from '@/data/clientsData'; // 더미데이터 import 제거

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 프론트엔드 헤더 매핑 로직 제거 - 백엔드 AI 시스템으로 통합

// utils/api에서 bulk delete 함수 추가
// bulkDeleteClients 및 전체 삭제 버튼 관련 코드 모두 삭제

const ClientsPage: React.FC = () => {
    // 현재 상태 관리
    // const [view, setView] = useState<'table' | 'card'>('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
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
            const matchesSearch =
                searchTerm === '' ||
                Object.entries(row).some(([key, value]) => {
                    // 메타데이터 필드와 태그 필드 제외
                    if (['id', 'created_at', 'updated_at', 'tags'].includes(key)) {
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

            // 태그 필터: 선택된 태그가 있는 경우 해당 태그를 포함하는지 확인
            const matchesTags =
                selectedTags.length === 0 ||
                (row.tags &&
                    Array.isArray(row.tags) &&
                    row.tags.some((tag: any) => selectedTags.some((selectedTag) => selectedTag.id === tag.id)));

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

    // 고객 등록 다이얼로그 관리
    const handleAddClient = () => {
        setIsAddClientDialogOpen(true);
        setEditDialogOpen(false);
        setDeleteDialogOpen(false);
        setMessageDialogOpen(false);
    };

    // 고객 작업 핸들러 (메시지, 보증서, 수정, 삭제)
    const handleClientAction = (actionType: string, clientId: number | string) => {
        console.log('handleClientAction 호출:', actionType, 'clientId:', clientId, 'type:', typeof clientId);

        // data 배열에서 고객 찾기 (실제 표시되는 데이터)
        const client = data.find((c) => c.id === clientId);
        console.log('찾은 client:', client);
        console.log('🔍 선택된 고객 data 필드:', client?.data);
        console.log('🔍 전체 data 배열 샘플:', data.slice(0, 1));

        // fallback: clients 배열에서 찾기
        if (!client) {
            const fallbackClient = clients.find((c) => c.id === clientId);
            console.log('fallback client:', fallbackClient);
            setSelectedClient(fallbackClient);
        } else {
            setSelectedClient(client);
        }

        setIsAddClientDialogOpen(false);
        setEditDialogOpen(false);
        setDeleteDialogOpen(false);
        setMessageDialogOpen(false);
        if (actionType === 'edit') setEditDialogOpen(true);
        else if (actionType === 'delete') setDeleteDialogOpen(true);
        else if (actionType === 'message') setMessageDialogOpen(true);
        // 보증서 등 추가 가능
    };

    // 모든 모달 닫기 + 선택된 고객 초기화
    const handleCloseAllModals = () => {
        setIsAddClientDialogOpen(false);
        setEditDialogOpen(false);
        setDeleteDialogOpen(false);
        setMessageDialogOpen(false);
        setSelectedClient(null);
    };

    // 기존 AI 기반 엑셀 업로드 핸들러 (개선된 헤더 인식) - 현재 미사용, TanStackDynamicTable에서 처리
    // const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const file = e.target.files?.[0];
    //   if (!file) return;

    //   const reader = new FileReader();
    //   reader.onload = async (evt) => {
    //     const data = evt.target?.result;
    //     if (!data) return;

    //     try {
    //       // 1. 엑셀 파일 직접 파싱 (CSV 변환 없이)
    //       const workbook = XLSX.read(data, { type: "binary" });
    //       const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    //       // 직접 JSON으로 변환하여 헤더 보존
    //       const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    //         header: 1, // 배열 형태로 반환
    //         defval: "", // 빈 셀 기본값
    //         blankrows: false,
    //       });

    //       if (!jsonData || jsonData.length < 2) {
    //         alert("엑셀 파일에 데이터가 부족합니다. (최소 헤더 + 1행 필요)");
    //         return;
    //       }

    //       // 첫 번째 행을 헤더로 사용, 빈 값 제거
    //       const headers = (jsonData[0] as any[]).map((h, idx) =>
    //         h && h.toString().trim() ? h.toString().trim() : `column_${idx + 1}`,
    //       );

    //       // 나머지 행들을 데이터로 변환
    //       const dataRows = jsonData.slice(1) as any[][];
    //       const parsedData = dataRows.map((row) => {
    //         const rowObj: any = {};
    //         headers.forEach((header, idx) => {
    //           rowObj[header] = row[idx] || "";
    //         });
    //         return rowObj;
    //       });

    //       console.log("📊 엑셀 파싱 완료:", parsedData.length, "행");
    //       console.log("📋 감지된 헤더:", headers);

    //       if (!parsedData || parsedData.length === 0) {
    //         alert("엑셀 파일에 데이터가 없습니다.");
    //         return;
    //       }

    //       // 2. 백엔드 AI API로 자동 매핑 처리
    //       console.log("🤖 AI 기반 컬럼 매핑 시작...");
    //       const mappingResult = await processExcelData(parsedData);

    //       if (!mappingResult.success) {
    //         throw new Error(mappingResult.error || "데이터 처리 실패");
    //       }

    //       console.log("✅ 컬럼 매핑 완료:", mappingResult.column_mapping);
    //       console.log(
    //         "📋 처리된 데이터:",
    //         mappingResult.mapped_data.length,
    //         "행",
    //       );

    //       // 3. 매핑 정보 저장 (역방향 매핑: 영문키 → 한국어 헤더)
    //       const reverseMapping: Record<string, string> = {};
    //       Object.entries(mappingResult.column_mapping).forEach(
    //         ([korean, english]) => {
    //           reverseMapping[english as string] = korean;
    //         },
    //       );
    //       setColumnMapping(reverseMapping);
    //       console.log("🗂️ 저장된 컬럼 매핑:", reverseMapping);
    //       console.log("🔍 원본 매핑 결과:", mappingResult.column_mapping);

    //       // 4. 매핑된 데이터로 UI 업데이트
    //       const mappedData = Array.isArray(mappingResult.mapped_data)
    //         ? mappingResult.mapped_data
    //         : [];
    //       const processedData = mappedData.map((row: any, idx: number) => ({
    //         ...row,
    //         id: `temp_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
    //       }));

    //       console.log("📊 매핑된 데이터 샘플:", processedData[0]);
    //       setData(processedData);

    //       // 5. 컬럼 즉시 업데이트 (업로드된 데이터 기준)
    //       if (processedData.length > 0) {
    //         const sampleRow = processedData[0];

    //         // 기본 필드와 동적 필드를 명확히 구분
    //         const baseFieldIds = ["고객명", "연락처", "고객분류"];
    //         const dynamicFields = Object.keys(sampleRow).filter(
    //           (key) =>
    //             ![
    //               "고객명",
    //               "연락처",
    //               "고객분류",
    //               "id",
    //               "created_at",
    //               "updated_at",
    //             ].includes(key),
    //         );

    //         console.log("🔍 컬럼 분석:", {
    //           allFields: Object.keys(sampleRow),
    //           baseFields: baseFieldIds,
    //           dynamicFields: dynamicFields,
    //           reverseMapping: reverseMapping,
    //         });

    //         const baseColumns = [
    //           { id: "고객명", header: "고객명", meta: { type: "text" } },
    //           { id: "연락처", header: "연락처", meta: { type: "text" } },
    //           { id: "고객분류", header: "고객분류", meta: { type: "tags" } },
    //         ];

    //         const dynamicColumns = dynamicFields.map((field) => {
    //           const header = reverseMapping[field] || field;
    //           console.log(`📝 동적 컬럼 생성: ${field} → ${header}`);
    //           return {
    //             id: field,
    //             header: header,
    //             meta: { type: "text" },
    //           };
    //         });

    //         // 중복 컬럼 제거 (더 엄격한 필터링)
    //         const allColumns = [...baseColumns, ...dynamicColumns];
    //         const uniqueColumns = allColumns.filter((column, index, self) => {
    //           // 기본 필드 중복 방지
    //           if (baseFieldIds.includes(column.id)) {
    //             const isFirst =
    //               self.findIndex((c) => c.id === column.id) === index;
    //             if (!isFirst) {
    //               console.log(`🚫 기본 필드 중복 제거: ${column.id}`);
    //             }
    //             return isFirst;
    //           }
    //           // 동적 필드 중복 방지
    //           const isFirst = self.findIndex((c) => c.id === column.id) === index;
    //           if (!isFirst) {
    //             console.log(`🚫 동적 필드 중복 제거: ${column.id}`);
    //           }
    //           return isFirst;
    //         });

    //         setColumns(uniqueColumns);
    //         console.log("🎯 업로드 후 컬럼 업데이트 완료:", uniqueColumns);
    //       }

    //       // 6. 서버에 실제 데이터 저장 (백엔드에서 기본 태그 자동 처리)
    //       let success = 0,
    //         fail = 0;
    //       const failDetails: string[] = [];

    //       for (let i = 0; i < mappingResult.mapped_data.length; i++) {
    //         const rowData = mappingResult.mapped_data[i];

    //         try {
    //           // 기본 필드와 동적 필드 분리
    //           const { customer_name, phone, ...dynamicFields } = rowData;

    //           const payload = {
    //             name: customer_name || "",
    //             phone: phone || "",
    //             data: dynamicFields,
    //             // tags 필드 제거 - 백엔드에서 자동 처리
    //           };

    //           // Import authenticatedFetch from utils/api.ts if not already imported
    //           const { authenticatedFetch } = await import("@/utils/api");
    //           const response = await authenticatedFetch(
    //             `${API_BASE_URL}/clients/`,
    //             {
    //               method: "POST",
    //               headers: { "Content-Type": "application/json" },
    //               body: JSON.stringify(payload),
    //             },
    //           );

    //           if (response.ok) {
    //             success++;
    //           } else {
    //             const errorData = await response.json();
    //             fail++;
    //             failDetails.push(`${i + 2}행: ${JSON.stringify(errorData)}`);
    //           }
    //         } catch (err: any) {
    //           fail++;
    //           failDetails.push(`${i + 2}행: ${err?.message || "등록 실패"}`);
    //         }
    //       }

    //       // 8. 업로드 완료 후 새로고침
    //       console.log("🔄 서버 데이터 새로고침...");
    //       await refresh();

    //       // 9. 결과 알림
    //       let message = `✅ 업로드 완료!\n성공: ${success}건, 실패: ${fail}건`;

    //       if (failDetails.length > 0) {
    //         message += "\n\n❌ 실패 내역:\n" + failDetails.slice(0, 5).join("\n");
    //         if (failDetails.length > 5) {
    //           message += `\n... 외 ${failDetails.length - 5}건`;
    //         }
    //       }

    //       // 컬럼 매핑 정보도 표시
    //       const mappingInfo = Object.entries(mappingResult.column_mapping)
    //         .map(([korean, english]) => `${korean} → ${english}`)
    //         .join("\n");

    //       message += `\n\n🔄 컬럼 매핑:\n${mappingInfo}`;

    //       alert(message);
    //     } catch (error: any) {
    //       console.error("❌ 엑셀 업로드 실패:", error);
    //       alert(`엑셀 업로드 실패: ${error.message}`);
    //     }
    //   };

    //   reader.readAsBinaryString(file);
    // };

    // Deep Translator 기반 서버 데이터 새로고침
    const refresh = async () => {
        console.log('refresh 함수 호출 시작');
        try {
            const serverResponse = await getClients();
            console.log('🔍 서버에서 받은 클라이언트 응답 원본:', serverResponse);
            console.log('🔍 응답 타입:', typeof serverResponse);
            console.log('🔍 응답이 배열인가?', Array.isArray(serverResponse));

            // 페이지네이션 형식인지 확인
            if (serverResponse && typeof serverResponse === 'object' && 'results' in serverResponse) {
                console.log('📋 페이지네이션 형식 응답 감지:', serverResponse.results);
                const serverData = Array.isArray(serverResponse.results) ? serverResponse.results : [];
                console.log('📋 페이지네이션에서 추출한 데이터:', serverData?.length, '개');
            } else {
                console.log('📋 직접 배열 형식 응답');
            }

            // 응답이 배열인지 확인하고, 페이지네이션이면 results 추출
            const serverData = Array.isArray(serverResponse)
                ? serverResponse
                : serverResponse?.results && Array.isArray(serverResponse.results)
                ? serverResponse.results
                : [];
            console.log('🔍 최종 처리된 클라이언트 데이터:', serverData?.length, '개');

            console.log('🔍 서버 데이터 상태 체크:', {
                serverData,
                isArray: Array.isArray(serverData),
                length: serverData?.length,
                type: typeof serverData,
            });

            if (!serverData || serverData.length === 0) {
                console.log('⚠️ 서버 데이터가 없습니다');
                // 정말 데이터가 없는 경우에만 빈 테이블로 설정
                console.log('✅ 빈 데이터 확인됨 - 테이블 비우기');
                setData([]);
                setColumns([]);
                return;
            }

            // 실제 데이터에서 동적 컬럼 추출 (pandas 결과와 호환)
            const dynamicFields = new Set();
            serverData.forEach((client: any) => {
                if (client.data && typeof client.data === 'object') {
                    Object.keys(client.data).forEach((key) => {
                        // 메타데이터 필드 및 기본 필드 제외
                        if (!['id', 'created_at', 'updated_at', 'customer_name', 'phone', 'name'].includes(key)) {
                            dynamicFields.add(key);
                        }
                    });
                }
            });

            // 기본 컬럼 + 동적 컬럼 생성 (백엔드 필드명 직접 사용)
            const baseColumns = [
                { id: 'name', header: '고객명', accessor: 'name', meta: { type: 'text' } },
                { id: 'phone', header: '연락처', accessor: 'phone', meta: { type: 'text' } },
                { id: 'tags', header: '고객분류', accessor: 'tags', meta: { type: 'tags' } },
            ];

            const dynamicColumns = Array.from(dynamicFields).map((fieldKey: any) => ({
                id: fieldKey,
                header: fieldKey, // pandas에서 이미 한국어로 처리되므로 그대로 사용
                accessor: fieldKey, // accessor 필드 추가
                meta: { type: 'text' },
            }));

            // 중복 컬럼 제거 (id 기준)
            const allColumns = [...baseColumns, ...dynamicColumns];
            const uniqueColumns = allColumns.filter(
                (column, index, self) => index === self.findIndex((c) => c.id === column.id)
            );

            console.log('🔍 pandas 기반 컬럼 처리 - 전체:', allColumns.length, '중복제거후:', uniqueColumns.length);

            // 데이터 매핑 (기존 방식으로 단순화)
            const mapped = serverData.map((row: any) => {
                // 기본 필드들 설정
                let name = row.name || '';
                let phone = row.phone || '';

                // name과 phone이 비어있으면 data에서 찾기
                if (!name && row.data) {
                    const nameValue = row.data['38'] || row.data['고객명'] || row.data['name'];
                    if (nameValue && typeof nameValue === 'string' && nameValue.trim()) {
                        name = nameValue;
                    }
                }

                if (!phone && row.data) {
                    const phoneValue = row.data['39'] || row.data['연락처'] || row.data['phone'];
                    if (phoneValue && typeof phoneValue === 'string' && phoneValue.trim()) {
                        phone = phoneValue;
                    }
                }

                return {
                    name,
                    phone,
                    tags: row.tags || [],
                    ...row.data, // 동적 필드들 직접 매핑 (기존 방식 유지)
                    id: row.id,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                };
            });

            console.log('refresh - 동적 컬럼:', dynamicColumns);
            console.log('refresh - 매핑된 데이터:', mapped.slice(0, 3));

            // 특정 클라이언트 태그 정보 확인 (디버깅용)
            const client114 = mapped.find((c) => c.id === 114);
            if (client114) {
                console.log('🔍 클라이언트 114 태그 정보:', {
                    id: client114.id,
                    name: client114.name,
                    tags: client114.tags,
                    tagsLength: client114.tags?.length || 0,
                });
            }

            setColumns(uniqueColumns);
            setData(mapped);

            // artworks 데이터는 클라이언트 데이터와 동일 (구매 정보가 포함됨)
            setArtworks(mapped);
            console.log('🎨 artworks 데이터 설정:', mapped.slice(0, 3));

            console.log('refresh 함수 완료');
        } catch (error) {
            console.error('refresh 함수 에러:', error);
        }
    };

    // Deep Translator 기반 동적 컬럼 생성
    useEffect(() => {
        // 기본 컬럼 설정 (백엔드 필드명 직접 사용)
        const baseColumns = [
            { id: 'name', header: '고객명', accessor: 'name', meta: { type: 'text' } },
            { id: 'phone', header: '연락처', accessor: 'phone', meta: { type: 'text' } },
            { id: 'tags', header: '고객분류', accessor: 'tags', meta: { type: 'tags' } },
        ];

        setColumns(baseColumns);
    }, []);

    // data 배열이 업데이트될 때 selectedClient도 최신 데이터로 업데이트
    useEffect(() => {
        if (selectedClient && data.length > 0) {
            const updatedClient = data.find((c) => c.id === selectedClient.id);
            if (updatedClient) {
                setSelectedClient(updatedClient);
                console.log('🔄 data 업데이트에 따른 selectedClient 업데이트:', updatedClient);
            }
        }
    }, [data]);

    useEffect(() => {
        setLoading(true);
        fetchClientsServerSide({
            search: searchTerm,

            page: currentPage,
            // 필요한 추가 필터 파라미터
        })
            .then((data) => {
                console.log('GET /clients/ 응답:', data);
                // 한국어 헤더명으로 데이터 매핑
                const dataArray = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
                const rows = dataArray.map((row: any) => {
                    const mappedRow = {
                        name: row.name || '',
                        phone: row.phone || '',
                        tags: row.tags || [],
                        ...row.data, // 동적 필드들 직접 포함 (이미 한국어)
                        id: row.id,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                    };

                    // 태그 데이터 디버깅
                    if (row.tags && row.tags.length > 0) {
                        console.log(`🏷️ 고객 ${row.name} (ID: ${row.id})의 태그:`, row.tags);
                    } else {
                        console.log(`⚠️ 고객 ${row.name} (ID: ${row.id})의 태그 없음`);
                    }

                    return mappedRow;
                });
                setClients(rows);
                setData(rows);

                // TanStackDynamicTable에서 컬럼을 관리하므로 여기서는 기본 컬럼만 설정
                console.log('⚠️ 컬럼 생성을 TanStackDynamicTable에 위임 - 중복 생성 방지');

                // 기본 컬럼만 설정 (TanStackDynamicTable의 refreshColumnsAndData에서 전체 처리)
                const baseColumns = [
                    { id: 'name', header: '고객명', accessor: 'name', meta: { type: 'text' } },
                    { id: 'phone', header: '연락처', accessor: 'phone', meta: { type: 'text' } },
                    { id: 'tags', header: '고객분류', accessor: 'tags', meta: { type: 'tags' } },
                ];
                setColumns(baseColumns);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
        fetchArtworks()
            .then((data) => {
                const artworksData = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : [];
                setArtworks(artworksData);

                // 클라이언트 데이터에서 작가명 추출 (관심작가명, 구매 작가명 등)
            })
            .catch(console.error);
    }, [searchTerm, currentPage, columnMapping]);

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
                key={columns.length} // 컬럼 로드시 테이블 재마운트
                initialColumns={columns}
                initialData={filteredRows}
                onColumnsChanged={(newColumns) => {
                    console.log('🔄 TanStackDynamicTable에서 컬럼 변경:', newColumns);
                    setColumns(newColumns);
                }}
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
                    // 고객 추가 후 테이블 새로고침
                    await refresh();
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
                    console.log('TanStackDynamicTable에서 onDataChanged 콜백 호출됨');
                    await refresh();
                    console.log('TanStackDynamicTable onDataChanged 새로고침 완료');
                }} // 엑셀 업로드 완료 후 데이터 새로고침
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
            <ClientsPagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            {/* 모달/다이얼로그 */}
            <EditClientDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setSelectedClient(null);
                }}
                client={selectedClient}
                onClientUpdated={async (updatedClient?: any) => {
                    console.log('🔄 onClientUpdated 호출됨:', updatedClient);

                    // 먼저 refresh 실행
                    await refresh();

                    // refresh 후 업데이트된 클라이언트 정보로 selectedClient 설정
                    if (updatedClient && updatedClient.client) {
                        console.log('🔄 refresh 후 selectedClient 업데이트:', updatedClient.client);
                        setSelectedClient(updatedClient.client);
                    }
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

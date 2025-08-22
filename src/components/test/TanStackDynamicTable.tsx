import React, { useMemo, useState, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    RowData,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Edit2, MessageSquare, Edit } from 'lucide-react';
import AddRowDialog from '@/components/test/AddRowDialog';
import ClientTags from '@/components/clients/ClientTags';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
    createClientColumn,
    getClientColumns,
    deleteClientColumn,
    updateClientColumn,
    authenticatedFetch,
} from '@/utils/api';

const COLUMN_TYPES = [
    { value: 'text', label: '텍스트' },
    { value: 'number', label: '숫자' },
    { value: 'date', label: '날짜' },
    { value: 'checkbox', label: '체크박스' },
    { value: 'tag', label: '태그' },
];

interface ColumnMeta {
    type: string;
}

interface TableColumn {
    id: string;
    header: string;
    meta: ColumnMeta;
    dbId?: number;
    accessor?: string;
}

interface TableRow {
    id: string;
    [key: string]: any;
}

function uuid() {
    return Math.random().toString(36).slice(2, 10);
}

// 액션 버튼용 props 타입 추가
interface TanStackDynamicTableProps {
    initialColumns: any[];
    initialData: any[];
    // 새로 추가: 행 관련 콜백들
    onAddRow?: (row: any) => Promise<void> | void;
    onUpdateRow?: (id: string | number, row: any) => Promise<void> | void;
    onDeleteRow?: (id: string | number) => Promise<void> | void;
    onAction?: (action: string, rowId: string | number) => void;
    onDataChanged?: () => Promise<void> | void; // 데이터 변경 시 상위에 알림
    onColumnsChanged?: (columns: any[]) => void; // 컬럼 변경 시 상위에 알림
    onSimpleExcelUpload?: (file: File) => Promise<void> | void; // 간단 엑셀 업로드
}

export default function TanStackDynamicTable({
    initialColumns,
    initialData,
    onAddRow,
    onUpdateRow,
    onDeleteRow,
    onAction,
    onDataChanged,
    onColumnsChanged,
    onSimpleExcelUpload,
}: TanStackDynamicTableProps) {
    // 동적 컬럼/행 상태
    const [columns, setColumns] = useState<TableColumn[]>(initialColumns);
    const [data, setData] = useState<TableRow[]>(initialData);

    // pandas 업로드 관련 상태
    const [isPandasUpload, setIsPandasUpload] = useState(false);
    const [pandasFile, setPandasFile] = useState<File | null>(null);

    // 팝오버 상태
    const [popoverCol, setPopoverCol] = useState<string | null>(null);
    // 팝오버 컬럼명 input ref (uncontrolled)
    const editColNameRef = useRef<HTMLInputElement | null>(null);
    // 팝오버 accessor input ref (uncontrolled)
    const editColAccessorRef = useRef<HTMLInputElement | null>(null);
    const [editColType, setEditColType] = useState('text');
    const popoverRef = useRef<HTMLDivElement>(null);
    // IME(한글 등) 조합 상태(셀별 관리)
    const [composingMap, setComposingMap] = useState<{ [key: string]: boolean }>({});
    // input ref 관리 (셀별)
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const getKey = (rowId: string, colId: string) => `${rowId}_${colId}`;

    // 팝오버 외부 클릭 시 닫기
    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopoverCol(null);
            }
        }
        if (popoverCol) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [popoverCol]);

    // 컬럼 추가
    const addColumn = async () => {
        console.log('🎯 addColumn 함수 호출됨');
        const accessor = uuid();

        // 새 컬럼의 order 값 계산 (현재 최대 order + 1)
        const maxOrder = Math.max(...columns.map((c) => (c as any).order || 0), 2); // 필수 컬럼 order는 0,1,2이므로 최소 3부터
        const newOrder = maxOrder + 1;

        try {
            console.log('🔄 컬럼 추가 시도:', {
                header: '새 컬럼',
                accessor,
                type: 'text',
                order: newOrder,
            });
            console.log('🌐 API 호출: createClientColumn');
            const res = await createClientColumn({
                header: '새 컬럼',
                accessor,
                type: 'text',
                order: newOrder,
            });
            console.log('✅ 컬럼 추가 성공:', res);

            console.log('🔄 데이터 새로고침으로 order 기준 정렬 적용');
            await refreshColumnsAndData(); // order 기준으로 다시 정렬

            console.log('🔄 컬럼 추가 완료');
        } catch (err: any) {
            console.error('❌ 컬럼 추가 실패:', err);
            console.error('❌ 에러 상세:', {
                message: err?.message,
                stack: err?.stack,
            });
            alert(`컬럼 추가 실패: ${err?.message || '알 수 없는 오류'}`);
        }
    };
    // 컬럼 수정 중인지 체크하는 플래그
    const [isEditingColumn, setIsEditingColumn] = useState(false);

    // 초기화 중복 실행 방지 플래그
    const [isInitializing, setIsInitializing] = useState(false);

    // 컬럼 삭제 중인지 체크하는 플래그
    const [isDeletingColumn, setIsDeletingColumn] = useState(false);

    // 삭제된 컬럼 추적 (새로고침 시 재생성 방지)
    const [deletedColumns, setDeletedColumns] = useState<Set<string>>(new Set());

    // 컬럼/데이터 새로고침 함수 (데이터 변경 시에만 상위 컴포넌트에 알림)
    const refreshColumnsAndData = async (notifyParent = false, forceRefresh = false) => {
        // 컬럼 수정 중이면 새로고침 건너뛰기 (강제 새로고침이 아닌 경우에만)
        if (isEditingColumn && !forceRefresh) {
            console.log('⏸️ 컬럼 수정 중이므로 새로고침 건너뛰기');
            return;
        }
        try {
            console.log('🔄 refreshColumnsAndData 시작');
            const initialCols = await getClientColumns();
            console.log('📊 서버에서 받은 컬럼:', initialCols);

            // 서버에서 컬럼 조회 (기본 컬럼은 백엔드에서 이미 생성됨)
            const cols = initialCols || [];

            if (cols.length === 0) {
                console.warn('⚠️ 서버에서 컬럼을 가져오지 못했습니다. 백엔드 로그를 확인하세요.');
            }

            // 필수 컬럼 정의 - 이제 DB에서 가져온 컬럼만 사용하므로 참조용으로만 유지
            const requiredColumns = [
                { accessor: 'name', header: '고객명', meta: { type: 'text' }, order: 0 },
                { accessor: 'phone', header: '연락처', meta: { type: 'text' }, order: 1 },
                {
                    accessor: 'tags',
                    header: '고객분류',
                    meta: { type: 'tag' },
                    order: 2,
                },
            ];

            // 서버 컬럼을 order 기준으로 정렬하여 처리
            const allColumns: any[] = [];

            // 1. 서버의 모든 컬럼을 가져와서 처리
            cols.forEach((c: any) => {
                // 필수 컬럼인지 확인 (accessor 기준)
                const requiredCol = requiredColumns.find((req) => req.accessor === c.accessor);

                console.log(`🔍 서버 컬럼 처리: ID=${c.id}, Header=${c.header}, Accessor=${c.accessor}`);

                // 🔧 accessor와 header가 다른 경우 warning 출력
                if (c.accessor && c.accessor !== c.header) {
                    console.warn(`⚠️ accessor와 header 불일치: ${c.header} vs ${c.accessor}`);
                }

                allColumns.push({
                    id: c.id, // 🔧 DB ID를 직접 사용 (정수형, 안전함)
                    header: c.header || '컬럼',
                    meta: { type: c.type || 'text' },
                    accessor: c.accessor, // 🔧 데이터 접근용 accessor
                    headerText: c.header, // 🔧 화면 표시용 헤더
                    order: c.order !== undefined ? c.order : requiredCol ? requiredCol.order : 999,
                });
            });

            // 2. 필수 컬럼은 이제 백엔드에서 자동 생성되므로 별도 생성 로직 불필요
            // 서버에 있는 컬럼들만 사용

            // 3. props 컬럼 자동 생성 로직도 제거 - 서버에 있는 컬럼만 사용

            // 4. 중복 컬럼 제거 (DB ID 기준으로 더 안전하게)
            const uniqueColumnsMap = new Map();
            const duplicateLogs = [];

            // DB ID 기준으로 중복 제거 (정수형 ID 사용)
            for (const col of allColumns) {
                const idKey = col.id.toString(); // DB ID를 키로 사용
                const existing = uniqueColumnsMap.get(idKey);

                if (!existing) {
                    uniqueColumnsMap.set(idKey, col);
                } else {
                    // 중복 발견 - order가 낮은 컬럼 우선
                    let shouldReplace = false;

                    if (col.order < existing.order) {
                        shouldReplace = true;
                    }
                    // 3. order가 같으면 id로 비교 (ID가 숫자이므로 숫자 비교)
                    else if (col.order === existing.order && col.id < existing.id) {
                        shouldReplace = true;
                    }

                    if (shouldReplace) {
                        duplicateLogs.push(
                            `🔄 중복 컬럼 교체: ${existing.header} → ${col.header} (order: ${existing.order} → ${col.order})`
                        );
                        uniqueColumnsMap.set(idKey, col);
                    } else {
                        duplicateLogs.push(
                            `🗑️ 중복 컬럼 제거: ${col.header} (order: ${col.order} vs ${existing.order})`
                        );
                    }
                }
            }

            const uniqueColumns = Array.from(uniqueColumnsMap.values());

            // 5. 백엔드 내부 필드들 제외 (tag_ids, data 등)
            const filteredColumns = uniqueColumns.filter(
                (col) => !['tag_ids', 'data', 'created_at', 'updated_at', 'id'].includes(col.id)
            );

            // 6. order 값으로 정렬 (order가 같으면 id로 2차 정렬)
            const sortedColumns = filteredColumns.sort((a, b) => {
                if (a.order !== b.order) {
                    return a.order - b.order;
                }
                // ID가 숫자이므로 숫자 정렬 사용
                return a.id - b.id;
            });

            console.log(
                'refreshColumnsAndData - 최종 컬럼 목록:',
                sortedColumns.map((col) => ({ id: col.id, header: col.header }))
            );
            setColumns(sortedColumns);

            // 컬럼 정보를 상위 컴포넌트에 전달 (컬럼 변경 시)
            if (onColumnsChanged) {
                onColumnsChanged(sortedColumns);
            }

            // 데이터 변경 시에만 상위 컴포넌트에 알림
            if (onDataChanged && !isEditingColumn && notifyParent) {
                await onDataChanged();
            }
        } catch (error) {
            console.error('❌ refreshColumnsAndData 실패:', error);
        }
    };

    // 컬럼 삭제
    const removeColumn = async (colId: string) => {
        // 이미 삭제 중이면 중복 실행 방지
        if (isDeletingColumn) {
            return;
        }

        const target = columns.find((c) => c.id === colId);

        if (!target) {
            alert('삭제할 컬럼을 찾을 수 없습니다.');
            return;
        }

        if (target?.dbId) {
            try {
                // 삭제 중 플래그 설정
                setIsDeletingColumn(true);

                // 1. 서버에서 먼저 삭제 (실패 시 로컬 상태 변경하지 않음)
                const deleteResult = await deleteClientColumn(target.dbId);

                // 삭제 결과 확인
                if (!deleteResult) {
                    throw new Error('서버에서 삭제 응답을 받지 못했습니다.');
                }

                // 2. 서버 삭제 성공 후 로컬 상태 업데이트
                const updatedColumns = columns.filter((col) => col.id !== colId);
                setColumns(updatedColumns);

                // 3. 삭제된 컬럼 추적에 추가
                setDeletedColumns((prev) => new Set(Array.from(prev).concat([colId])));
                console.log('📝 삭제된 컬럼 추적에 추가:', colId);

                // 4. 팝오버 닫기
                setPopoverCol(null);
                console.log('🔄 팝오버 닫기 완료');

                // 5. 성공 메시지
                toast.success(`컬럼 "${target.header}"이(가) 삭제되었습니다.`);
            } catch (err: any) {
                console.error('❌ 컬럼 삭제 실패:', err);
                console.error('❌ 에러 상세:', {
                    message: err?.message,
                    stack: err?.stack,
                });

                // 실패 메시지 (로컬 상태는 변경하지 않았으므로 복원 불필요)
                toast.error(`컬럼 삭제 실패: ${err?.message || '알 수 없는 오류'}`);
                return;
            } finally {
                // 삭제 중 플래그 해제
                setIsDeletingColumn(false);
            }
        } else {
            console.warn('⚠️ 삭제할 컬럼의 dbId가 없습니다:', { colId, target });

            // dbId가 없는 경우 로컬에서만 제거
            const updatedColumns = columns.filter((col) => col.id !== colId);
            setColumns(updatedColumns);
            setPopoverCol(null);

            toast.warning('로컬 컬럼이 제거되었습니다. (서버에 저장되지 않은 컬럼)');
        }
    };
    // 행 삭제 (현재 사용하지 않음 - onAction 콜백으로 처리)
    const removeRow = async (rowId: string) => {
        console.log('🗑️ removeRow 호출됨 - rowId:', rowId);
        console.log('⚠️ removeRow는 더 이상 사용되지 않습니다. onAction 콜백을 통해 처리하세요.');

        // 즉시 로컬 상태 업데이트 제거 - 서버 삭제 후 새로고침으로 처리
        // setData(data.filter((row) => row.id !== rowId));

        // 데이터 새로고침만 수행 (서버에서 최신 데이터 가져오기)
        await refreshColumnsAndData();
        console.log('🗑️ removeRow 새로고침 완료');
    };
    // 셀 값 변경
    const setCell = async (rowId: string, colId: string, value: any) => {
        setData(data.map((row) => (row.id === rowId ? { ...row, [colId]: value } : row)));

        // 데이터 새로고침 (비동기로 처리)
        setTimeout(async () => {
            await refreshColumnsAndData();
        }, 100);
    };
    // 팝오버 열기
    const openPopover = (col: TableColumn) => {
        console.log('🎯 openPopover 함수 호출됨');
        console.log('🖱️ 컬럼 헤더 클릭됨:', col);
        setTimeout(() => {
            console.log('⏰ setTimeout 실행 - 팝오버 상태 변경');
            setPopoverCol(col.id);
            setEditColType(col.meta.type);
            console.log('📝 팝오버 상태 설정 완료:', {
                colId: col.id,
                type: col.meta.type,
            });
        }, 0);
    };
    // 컬럼명/타입 저장 (1단계: accessor 변경 없이 header/type만 동기화)
    const saveColEdit = async (colId: string) => {
        console.log('🎯 saveColEdit 함수 호출됨:', colId);

        // 컬럼 수정 플래그 설정
        setIsEditingColumn(true);

        const newHeader = editColNameRef.current ? editColNameRef.current.value : '';
        console.log('📝 입력된 새 헤더명:', newHeader);
        console.log('📝 선택된 타입:', editColType);

        // 원래 상태 백업 (실패 시 복원용)
        const originalColumns = [...columns];

        const updatedCols = columns.map((col) =>
            col.id === colId ? { ...col, header: newHeader, meta: { type: editColType } } : col
        );
        console.log('🔄 로컬 컬럼 상태 업데이트');
        setColumns(updatedCols); // 프론트 상태 즉시 반영

        // backend sync
        const target = updatedCols.find((c) => c.id === colId);
        console.log('🔍 수정할 컬럼 찾기:', { colId, target });

        if (target?.dbId) {
            try {
                console.log('🔄 컬럼 수정 시도:', {
                    colId,
                    dbId: target.dbId,
                    header: newHeader,
                    type: editColType,
                });
                console.log('🌐 API 호출: updateClientColumn');
                console.log('🌐 API 호출 전 - dbId 타입:', typeof target.dbId, '값:', target.dbId);

                let result;
                try {
                    result = await updateClientColumn(target.dbId, {
                        header: newHeader,
                        type: editColType,
                        accessor: newHeader, // 🔧 accessor도 새 헤더명으로 변경하여 데이터 매핑 일관성 유지
                    });
                    console.log('🔧 accessor도 함께 업데이트:', newHeader);
                    console.log('🌐 API 호출 성공:', result);
                } catch (error) {
                    console.error('🌐 API 호출 실패:', error);
                    throw error;
                }
                console.log('✅ 컬럼 수정 성공:', result);

                // 🔧 accessor가 변경된 경우 데이터 새로고침 필요
                const oldAccessor = target.accessor || target.id;
                if (newHeader !== oldAccessor) {
                    console.log('🔄 accessor 변경으로 인한 데이터 새로고침 시작:', oldAccessor, '→', newHeader);

                    // 로컬 컬럼 상태에서 accessor도 업데이트
                    const refreshedColumns = updatedCols.map((col) =>
                        col.id === colId ? { ...col, accessor: newHeader, id: newHeader } : col
                    );
                    setColumns(refreshedColumns);

                    // 상위 컴포넌트에 컬럼 변경 알림
                    if (onColumnsChanged) {
                        onColumnsChanged(refreshedColumns);
                    }

                    // 데이터 새로고침 (서버에서 마이그레이션된 데이터 가져오기)
                    if (onDataChanged) {
                        console.log('🔄 데이터 마이그레이션 반영을 위한 새로고침...');
                        await onDataChanged();
                    }
                } else {
                    console.log('✅ accessor 변경 없음, 로컬 상태만 유지');
                }
            } catch (err: any) {
                console.error('❌ 컬럼 수정 실패:', err);
                console.error('❌ 에러 상세:', {
                    message: err?.message,
                    stack: err?.stack,
                });
                alert(`컬럼 수정 실패: ${err?.message || '알 수 없는 오류'}`);
                toast.error(`컬럼 수정에 실패했습니다: ${err?.message || '알 수 없는 오류'}`);

                // 실패 시 원래 상태로 복원
                setColumns(originalColumns);

                // 컬럼 수정 플래그 해제
                setIsEditingColumn(false);
            }
        } else {
            // dbId가 없는 경우: 초기화 시 생성되지 않은 새로운 컬럼
            console.log('🆕 dbId가 없는 새 컬럼 생성');
            alert('⚠️ 이 컬럼은 서버에 동기화되지 않았습니다. 페이지를 새로고침 후 다시 시도해 주세요.');

            // 컬럼 수정 플래그 해제
            setIsEditingColumn(false);
        }

        console.log('🔄 팝오버 닫기');
        setPopoverCol(null);

        // 컬럼 수정 플래그 해제 (새 컬럼 생성의 경우 이미 해제됨)
        if (isEditingColumn) {
            setIsEditingColumn(false);
        }
        console.log('✅ saveColEdit 함수 완료');
    };

    // 고객 이탈 방지를 위해 엑셀 다운로드 기능 임시 비활성화
    /*
    const handleExportExcel = () => {
        // 1. 컬럼 헤더 추출
        const headers = columns.map((col) => col.header);

        // 2. 데이터를 엑셀 친화적으로 변환
        const exportData = data.map((row) => {
            const exportRow: any = {};
            columns.forEach((col) => {
                const value = row[col.id];

                // 각 컬럼 타입에 따른 변환
                if (col.meta.type === 'tags' && Array.isArray(value)) {
                    // 태그 배열을 쉼표로 구분된 문자열로 변환
                    exportRow[col.header] = value
                        .map((tag: any) => {
                            if (typeof tag === 'object' && tag.name) {
                                return tag.name;
                            }
                            return String(tag);
                        })
                        .join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    // 다른 객체들은 JSON 문자열로 변환
                    if (Array.isArray(value)) {
                        exportRow[col.header] = value.join(', ');
                    } else {
                        exportRow[col.header] = JSON.stringify(value);
                    }
                } else {
                    // 기본 값들은 문자열로 변환
                    exportRow[col.header] = value ?? '';
                }
            });
            return exportRow;
        });

        // 3. 워크시트 생성
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clients');

        // 4. 파일 다운로드
        XLSX.writeFile(wb, 'clients_table.xlsx');
    };
    */

    // 컬럼 매핑 상태
    const [showColumnMapping, setShowColumnMapping] = useState(false);
    const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
    const [uploadedRows, setUploadedRows] = useState<any[]>([]);
    const [columnMappings, setColumnMappings] = useState<{
        [key: string]: string;
    }>({});
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // 컬럼 매핑 확정 후 실제 데이터 처리
    const handleConfirmMapping = async () => {
        if (!pendingFile) return;

        try {
            // 수동 매핑 API 호출
            const formData = new FormData();
            formData.append('file', pendingFile);
            formData.append('column_mappings', JSON.stringify(columnMappings));

            const response = await authenticatedFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/excel/upload-with-mapping/`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '업로드 실패');
            }

            const result = await response.json();
            console.log('✅ 수동 매핑 업로드 완료:', result);

            // 매핑 UI 닫기
            setShowColumnMapping(false);
            setUploadedHeaders([]);
            setUploadedRows([]);
            setColumnMappings({});
            setPendingFile(null);

            // 데이터 새로고침 (더 확실하게)
            console.log('🔄 엑셀 업로드 후 데이터 새로고침 시작...');

            // 1차: 컬럼과 데이터 새로고침 (onDataChanged 호출하지 않음 - 별도로 처리)
            await refreshColumnsAndData(true); // 엑셀 업로드 시 중복 호출 방지

            // 2차: 상위 컴포넌트 강제 새로고침
            if (onDataChanged) {
                console.log('🔄 상위 컴포넌트에 데이터 변경 알림...');
                await onDataChanged();
            }

            // 3차: 확실한 새로고침을 위해 페이지 자동 리로드
            console.log('🔄 엑셀 업로드 완료 - 페이지 자동 새로고침 시작');

            // 잠시 후 자동 새로고침 (결과 메시지 표시 후)
            setTimeout(() => {
                window.location.reload();
            }, 500);

            // 결과 알림
            const newColumnsInfo =
                result.new_columns_created > 0 ? `\n\n새로 생성된 컬럼: ${result.new_columns_created}개` : '';
            const duplicatesInfo =
                result.duplicates_cleaned > 0 ? `\n\n중복 컬럼 정리: ${result.duplicates_cleaned}개 삭제` : '';

            alert(
                `${result.message}${newColumnsInfo}${duplicatesInfo}\n\n매핑된 컬럼:\n${Object.entries(
                    result.column_mapping || {}
                )
                    .map(([k, v]) => `${k} → ${v}`)
                    .join('\n')}`
            );
        } catch (error: any) {
            console.error('❌ 수동 매핑 업로드 실패:', error);
            alert(`수동 매핑 업로드 실패: ${error.message}`);
        }
    };

    // 자동 타입 추론 함수
    function guessType(values: any[]) {
        if (values.every((v) => v === '' || v == null)) return 'text';
        if (values.every((v) => v === '' || v == null || !isNaN(Number(v)))) return 'number';
        if (values.every((v) => v === '' || v == null || /^\d{4}[-./]\d{2}[-./]\d{2}$/.test(v))) return 'date';
        return 'text';
    }

    // TanStack Table 컬럼 정의
    const columnDefs = useMemo<ColumnDef<TableRow, any>[]>(
        () => [
            ...columns.map((col) => ({
                id: col.id,
                header: () => (
                    <div
                        className="flex items-center justify-center gap-1 relative group cursor-pointer select-none whitespace-nowrap"
                        onClick={() => openPopover(col)}
                    >
                        <span className="whitespace-nowrap">{col.header}</span>
                        <Edit2 size={14} className="inline ml-1 text-gray-400 group-hover:text-blue-500" />
                        {popoverCol === col.id && (
                            <div
                                ref={popoverRef}
                                className="absolute z-20 left-1/2 top-full mt-2 -translate-x-1/2 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-col gap-2 animate-in fade-in-0 zoom-in-95 duration-200"
                            >
                                <label className="text-xs text-gray-500 mb-1">컬럼명</label>
                                <input
                                    className="border border-gray-200 rounded px-2 py-1 text-sm mb-2 focus:outline-none focus:border-blue-300"
                                    ref={editColNameRef}
                                    defaultValue={columns.find((c) => c.id === col.id)?.header || ''}
                                />
                                <label className="text-xs text-gray-500 mb-1">타입</label>
                                <select
                                    className="border border-gray-200 rounded px-2 py-1 text-sm mb-2 focus:outline-none focus:border-blue-300"
                                    value={editColType}
                                    onChange={(e) => setEditColType(e.target.value)}
                                >
                                    {COLUMN_TYPES.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={(e) => {
                                            console.log('🖱️ 저장 버튼 클릭됨!', col.id);
                                            e.stopPropagation();
                                            saveColEdit(col.id);
                                        }}
                                    >
                                        저장
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1"
                                        disabled={isDeletingColumn}
                                        onClick={(e) => {
                                            console.log('🖱️ 삭제 버튼 클릭됨!', col.id);
                                            e.stopPropagation();
                                            removeColumn(col.id);
                                        }}
                                    >
                                        {isDeletingColumn ? '삭제 중...' : '삭제'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ),
                cell: ({ row }) => {
                    // 🔧 accessor를 사용하여 데이터에 접근
                    let value = row.original[col.accessor];

                    // 🔧 기본 필드가 비어있으면 data 필드에서 값을 가져오기 (기존 데이터 호환성)
                    if ((value === undefined || value === null || value === '') && row.original.data) {
                        // name 필드가 비어있으면 data에서 고객명 찾기
                        if (col.accessor === 'name') {
                            value = row.original.data['고객명'] || row.original.data['이름'] || value;
                        }
                        // phone 필드가 비어있으면 data에서 연락처 찾기
                        else if (col.accessor === 'phone') {
                            value =
                                row.original.data['연락처'] ||
                                row.original.data['전화번호'] ||
                                row.original.data['핸드폰'] ||
                                value;
                        }
                    }

                    // 🔧 데이터 매핑 디버깅 로그 추가
                    console.log(
                        `🔍 셀 렌더링: ID=${col.id}, accessor=${col.accessor}, header=${
                            col.header
                        }, 값=${value}, 타입=${typeof value}`
                    );
                    console.log(`🔍 row.original 샘플:`, {
                        id: row.original.id,
                        name: row.original.name,
                        phone: row.original.phone,
                        keys: Object.keys(row.original).slice(0, 10), // 처음 10개 키만
                    });

                    if (value === undefined || value === null) {
                        console.warn(`⚠️ 빈 값 감지: accessor=${col.accessor}, 헤더=${col.header}`);
                    }

                    if (col.meta.type === 'checkbox') {
                        return <input type="checkbox" checked={!!value} disabled className="w-5 h-5" />;
                    }
                    if (col.meta.type === 'tags' || col.meta.type === 'tag') {
                        return (
                            <div className="min-w-[120px] max-w-[180px] py-1 flex justify-center">
                                <ClientTags
                                    key={`${row.original.id}-${(value || []).length}`} // 고객분류 변경 시 강제 리렌더링
                                    clientId={row.original.id}
                                    initialTags={value || []}
                                    readonly={true} // 테이블에서는 읽기 전용
                                    className="w-full"
                                    // 테이블에서는 읽기 전용이므로 onTagsChange 제거
                                />
                            </div>
                        );
                    }
                    // 객체나 배열인 경우 JSON 문자열로 변환하여 렌더링
                    if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value)) {
                            return <span>{value.join(', ')}</span>;
                        } else {
                            return <span>{JSON.stringify(value)}</span>;
                        }
                    }
                    return <span>{value ?? ''}</span>;
                },
                size: col.meta.type === 'tags' || col.meta.type === 'tag' ? 140 : 150, // 태그 컬럼 너비 조정
                minSize: col.meta.type === 'tags' || col.meta.type === 'tag' ? 120 : 120,
                maxSize: col.meta.type === 'tags' || col.meta.type === 'tag' ? 160 : 300,
            })),
            // 액션 버튼 컬럼 정의
            {
                id: 'add',
                header: () => (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 text-blue-500 hover:bg-blue-50"
                        onClick={addColumn}
                        title="열 추가"
                    >
                        <Plus size={18} />
                    </Button>
                ),
                cell: () => null,
                size: 48,
            },
            {
                id: 'actions',
                header: () => <span className="w-32 text-center">액션</span>,
                cell: ({ row }: any) => (
                    <div className="flex justify-center gap-2">
                        <button
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            title="메시지"
                            onClick={() => onAction && onAction('message', row.original.id)}
                        >
                            <MessageSquare size={16} />
                        </button>
                        <button
                            className="p-1 text-green-500 hover:bg-green-50 rounded"
                            title="편집"
                            onClick={() => onAction && onAction('edit', row.original.id)}
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="삭제"
                            onClick={() => onAction && onAction('delete', row.original.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ),
                size: 100,
                minSize: 90,
                maxSize: 120,
            },
        ],
        [columns, popoverCol, editColNameRef, editColType, data, composingMap]
    );

    const table = useReactTable({
        data,
        columns: columnDefs,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        columnResizeMode: 'onChange',
        debugTable: false,
        initialState: {
            pagination: {
                pageSize: 6, // 백엔드 PAGE_SIZE와 일치 (20 → 6)
            },
        },
    });

    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // 행 추가 모달 저장 핸들러
    const handleSaveRow = async (rowData: any) => {
        // 숫자 ID를 실제 컬럼명(accessor)으로 변환
        const transformedData: any = {};

        columns.forEach((col) => {
            if (rowData.hasOwnProperty(col.id)) {
                const accessor = col.accessor || col.id;
                transformedData[accessor] = rowData[col.id];

                console.log(`🔄 컬럼 변환: ${col.id} -> ${accessor} = ${rowData[col.id]}`);
            }
        });

        console.log('🔄 원본 데이터:', rowData);
        console.log('🔄 변환된 데이터:', transformedData);

        if (onAddRow) {
            await onAddRow(transformedData);
        } else {
            // fallback: 로컬 상태 업데이트
            const newRow: TableRow = { id: uuid(), ...transformedData };
            setData([...data, newRow]);
        }

        // 데이터 새로고침 (상위 컴포넌트에 알림)
        await refreshColumnsAndData(true);
    };

    // 컴포넌트 초기화 시 서버에서 실제 컬럼 구조 로드
    React.useEffect(() => {
        const initializeColumns = async () => {
            try {
                console.log('🚀 TanStackDynamicTable 초기화 시작');
                await refreshColumnsAndData(false, true); // 초기화 시에는 강제 새로고침
                console.log('✅ TanStackDynamicTable 초기화 완료');
            } catch (error) {
                console.error('❌ TanStackDynamicTable 초기화 실패:', error);
                // 초기화 실패시 props로 받은 컬럼을 fallback으로 사용
                const uniqueColumns = initialColumns.filter(
                    (column, index, self) => index === self.findIndex((c) => c.id === column.id)
                );
                console.log('🔄 fallback 컬럼 사용:', uniqueColumns);
                setColumns(uniqueColumns);
            }
        };

        initializeColumns();
    }, []); // 의존성 배열을 빈 배열로 설정하여 마운트 시 한 번만 실행

    // props 변경 시 상태 동기화 (중복 제거) - 서버 데이터 로드 후에만 적용
    React.useEffect(() => {
        // 서버에서 컬럼을 이미 로드했다면 props 변경은 무시
        if (columns.length > 0 && columns[0]?.dbId) {
            console.log('🔄 서버 컬럼이 이미 로드됨, props 변경 무시');
            return;
        }

        console.log('TanStackDynamicTable - initialColumns 변경:', initialColumns);

        // 중복 컬럼 제거 (id 기준)
        const uniqueColumns = initialColumns.filter(
            (column, index, self) => index === self.findIndex((c) => c.id === column.id)
        );

        console.log('TanStackDynamicTable - 중복 제거 후 컬럼:', uniqueColumns);
        setColumns(uniqueColumns);
    }, [JSON.stringify(initialColumns)]);

    React.useEffect(() => {
        console.log('TanStackDynamicTable - initialData 변경:', initialData?.slice(0, 3) || initialData);
        setData(initialData);
    }, [JSON.stringify(initialData)]);

    // pandas 컬럼 매핑 이벤트 리스너
    React.useEffect(() => {
        const handleColumnMappingEvent = (event: any) => {
            const { headers, rows, isPandas, file } = event.detail;
            console.log('🔄 pandas 컬럼 매핑 이벤트 수신:', { headers, isPandas });

            if (isPandas) {
                setUploadedHeaders(headers);
                setUploadedRows(rows);
                setIsPandasUpload(true);
                setPandasFile(file);

                // 초기 매핑 설정 (기존 컬럼과 자동 매칭) - 한국어 기준
                const initialMappings: { [key: string]: string } = {};
                headers.forEach((header: string, idx: number) => {
                    const cleanHeader = header?.trim() || '';
                    // 기존 컬럼과 유사도 체크 (한국어 헤더 기준)
                    const similarColumn = columns.find((col) => {
                        const colHeader = col.header.toLowerCase();
                        const uploadHeader = cleanHeader.toLowerCase();
                        return (
                            colHeader.includes(uploadHeader) ||
                            uploadHeader.includes(colHeader) ||
                            (colHeader === '고객명' && ['이름', '성함', '성명', '고객명'].includes(uploadHeader)) ||
                            (colHeader === '연락처' &&
                                ['전화', '휴대폰', '핸드폰', '연락처', '전화번호'].includes(uploadHeader)) ||
                            (colHeader === '고객분류' &&
                                ['분류', '구분', '카테고리', '타입', '종류'].includes(uploadHeader))
                        );
                    });

                    // 한국어 헤더명으로 매핑 (id 대신 header 사용)
                    initialMappings[cleanHeader] = similarColumn ? similarColumn.header : `new_${idx}`;
                });

                setColumnMappings(initialMappings);
                setShowColumnMapping(true);
            }
        };

        window.addEventListener('triggerColumnMapping', handleColumnMappingEvent);
        return () => window.removeEventListener('triggerColumnMapping', handleColumnMappingEvent);
    }, [columns]);

    return (
        <div className="p-4">
            {/* 컬럼 매핑 다이얼로그 */}
            {showColumnMapping && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">컬럼 매핑 설정</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            업로드된 컬럼을 기존 컬럼에 매핑하거나 새 컬럼으로 추가하세요.
                        </p>

                        <div className="space-y-3">
                            {uploadedHeaders.map((header, index) => {
                                const cleanHeader = header?.trim() || '';
                                const newColumnValue = `new_${index}`;
                                return (
                                    <div key={index} className="flex items-center gap-4 p-3 border rounded">
                                        <div className="flex-1">
                                            <span className="font-medium">{cleanHeader}</span>
                                        </div>
                                        <div className="flex-1">
                                            <select
                                                value={columnMappings[cleanHeader] || newColumnValue}
                                                onChange={(e) =>
                                                    setColumnMappings((prev) => ({
                                                        ...prev,
                                                        [cleanHeader]: e.target.value,
                                                    }))
                                                }
                                                className="w-full border rounded px-3 py-2"
                                            >
                                                <option value={newColumnValue}>새 컬럼으로 추가</option>
                                                {columns.map((col) => (
                                                    <option key={col.id} value={col.id}>
                                                        기존: {col.header}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleConfirmMapping}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                확인
                            </button>
                            <button
                                onClick={() => {
                                    setShowColumnMapping(false);
                                    setUploadedHeaders([]);
                                    setUploadedRows([]);
                                    setColumnMappings({});
                                    setPendingFile(null);
                                }}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 기존 UI */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 mb-4">
                    <Button variant="ghost" className="border border-gray-200" onClick={() => setAddDialogOpen(true)}>
                        고객 추가
                    </Button>
                    {/* 고객 이탈 방지를 위해 엑셀 다운로드 버튼 임시 비활성화 */}
                    {/* <Button variant="outline" className="border border-gray-300" onClick={handleExportExcel}>
                        엑셀 다운로드
                    </Button> */}
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        id="excel-upload-simple-input"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // 수동 매핑 업로드 - 매핑 UI 표시
                            try {
                                console.log('📁 엑셀 업로드 시작 (수동 매핑):', file.name);

                                // 엑셀 파일 읽어서 헤더 추출
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                    const data = evt.target?.result;
                                    if (!data) return;

                                    const workbook = XLSX.read(data, { type: 'binary' });
                                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                                    const rows = XLSX.utils.sheet_to_json(worksheet, {
                                        header: 1,
                                    });

                                    if (rows.length < 2) {
                                        alert('엑셀에 데이터가 없습니다.');
                                        return;
                                    }

                                    const headers = rows[0] as string[];
                                    console.log('📊 엑셀 헤더:', headers);

                                    // 컬럼 매핑 UI 표시
                                    setUploadedHeaders(headers);
                                    setUploadedRows(rows.slice(1));
                                    setPendingFile(file);

                                    // 초기 매핑 설정 (새 컬럼으로 기본 설정)
                                    const initialMappings: { [key: string]: string } = {};
                                    headers.forEach((header, idx) => {
                                        const cleanHeader = header?.trim() || '';
                                        initialMappings[cleanHeader] = `new_${idx}`;
                                    });
                                    setColumnMappings(initialMappings);
                                    setShowColumnMapping(true);
                                };
                                reader.readAsBinaryString(file);
                            } catch (error) {
                                console.error('엑셀 업로드 실패:', error);
                                alert(`엑셀 업로드 실패: ${error}`);
                            }
                            e.target.value = '';
                        }}
                    />
                    <Button
                        variant="outline"
                        className="border border-gray-300 bg-blue-50"
                        onClick={() => document.getElementById('excel-upload-simple-input')?.click()}
                    >
                        📊 엑셀 업로드
                    </Button>
                </div>
                <div
                    className="bg-white rounded shadow border border-gray-200 overflow-x-auto overflow-y-visible"
                    data-table-container
                    style={{ minHeight: '400px' }} // 팝오버 높이(~200px) + 테이블 기본 높이 고려
                >
                    <table className="w-full text-sm min-w-[1200px] table-auto">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="h-12 px-3 text-center align-middle font-semibold text-gray-800 bg-gray-50 border-b whitespace-nowrap"
                                            style={{
                                                width: header.getSize(),
                                                minWidth: header.column.columnDef.minSize,
                                                maxWidth: header.column.columnDef.maxSize,
                                            }}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="border-b transition-colors hover:bg-gray-50/80">
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-2 py-3 text-center align-middle max-w-0 overflow-hidden text-ellipsis"
                                                style={{
                                                    width: cell.column.getSize(),
                                                    minWidth: cell.column.columnDef.minSize,
                                                    maxWidth: cell.column.columnDef.maxSize,
                                                }}
                                                title={String(cell.getValue())}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* 페이지네이션 컨트롤 */}
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            이전
                        </button>
                        <span className="text-sm text-gray-600">
                            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </span>
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            다음
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">페이지당 행:</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                const newPageSize = Number(e.target.value);
                                table.setPageSize(newPageSize);
                                // 페이지 크기 변경 시 첫 페이지로 이동
                                table.setPageIndex(0);
                            }}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            {[6, 10, 20, 30, 40, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* 행 추가 다이얼로그 */}
                <AddRowDialog
                    open={addDialogOpen}
                    onOpenChange={setAddDialogOpen}
                    columns={columns}
                    onSave={handleSaveRow}
                />
            </div>
        </div>
    );
}

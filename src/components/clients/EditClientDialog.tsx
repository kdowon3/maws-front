import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { updateClient, getAllTags, createTag, updateClientTagsOnly, logToTerminal } from '@/utils/api';
import type { DynamicClient, ClientColumn } from '@/types/clients';

interface TagType {
    id: number;
    name: string;
    color?: string;
}

interface EditClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: DynamicClient;
    onClientUpdated?: () => void;
    artworks: DynamicClient[];
    columns?: ClientColumn[]; // 동적 컬럼 구조 추가
}

export default function EditClientDialog({
    open,
    onOpenChange,
    client,
    onClientUpdated,
    artworks,
    columns = [], // 기본값
}: EditClientDialogProps) {
    // client 없으면 훅 사용 전 바로 반환하여 hook 순서 불일치 방지
    if (!client) return null;

    const [availableTags, setAvailableTags] = useState<TagType[]>([]);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');

    // 태그 색상 팔레트 (AddRowDialog와 동일)
    const tagColors = [
        '#EF4444',
        '#F97316',
        '#F59E0B',
        '#EAB308',
        '#84CC16',
        '#22C55E',
        '#10B981',
        '#14B8A6',
        '#06B6D4',
        '#0EA5E9',
        '#3B82F6',
        '#6366F1',
        '#8B5CF6',
        '#A855F7',
        '#D946EF',
        '#EC4899',
        '#F43F5E',
        '#6B7280',
        '#374151',
        '#111827',
    ];

    // AddRowDialog와 동일하게 외부에서 받은 columns를 그대로 사용
    // columns가 비어있으면 client 데이터를 기반으로 동적 컬럼 생성
    const generateColumnsFromClient = () => {
        const baseColumns = [
            { id: 'name', header: '고객명', accessor: 'name', meta: { type: 'text' } },
            { id: 'phone', header: '연락처', accessor: 'phone', meta: { type: 'text' } },
            { id: 'tags', header: '고객분류', accessor: 'tags', meta: { type: 'tags' } },
        ];

        if (client && client.data && typeof client.data === 'object') {
            const dynamicColumns = Object.keys(client.data)
                .map((key) => {
                    if (!['id', 'created_at', 'updated_at', 'customer_name', 'phone', 'name'].includes(key)) {
                        return {
                            id: key,
                            header: key,
                            accessor: key,
                            meta: { type: 'text' },
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            return [...baseColumns, ...dynamicColumns];
        }

        return baseColumns;
    };

    const columnsToUse = columns.length > 0 ? columns : generateColumnsFromClient();

    const allColumns = columnsToUse.filter((col) => {
        // 백엔드 내부 필드들 제외
        if (['tag_ids', 'data', 'created_at', 'updated_at', 'id'].includes(col.id)) {
            return false;
        }
        return true;
    });

    // 초기값 설정 (client 데이터 기반)
    const initValues = () => {
        const obj: Record<string, any> = {};

        allColumns.forEach((col) => {
            // 백엔드 내부 필드들은 제외
            if (['tag_ids', 'data', 'created_at', 'updated_at', 'id'].includes(col.id)) {
                return;
            }

            if (col.meta.type === 'checkbox') {
                obj[col.id] = client[col.id] || false;
            } else if (
                col.meta.type === 'tags' ||
                col.meta.type === 'tag' ||
                col.id === '고객분류' ||
                col.header === '고객분류'
            ) {
                // 태그 데이터 처리 - client.tags를 우선적으로 사용
                const clientTags = client.tags || client[col.id] || [];
                console.log('🏷️ EditClientDialog - Client tags data:', {
                    colId: col.id,
                    clientTags,
                    clientId: client.id,
                    clientName: client.name,
                    hasTags: !!clientTags,
                    tagsLength: Array.isArray(clientTags) ? clientTags.length : 'not array',
                });

                if (Array.isArray(clientTags) && clientTags.length > 0) {
                    obj[col.id] = clientTags[0];
                    console.log('🏷️ 배열에서 첫 번째 태그 선택:', clientTags[0]);
                } else if (typeof clientTags === 'object' && clientTags !== null && !Array.isArray(clientTags)) {
                    // 객체 형태의 태그인 경우
                    obj[col.id] = clientTags;
                    console.log('🏷️ 객체 형태 태그 선택:', clientTags);
                } else if (typeof clientTags === 'string') {
                    // 문자열 형태의 태그인 경우 (태그 이름만 있는 경우)
                    obj[col.id] = { name: clientTags };
                    console.log('🏷️ 문자열을 객체로 변환:', { name: clientTags });
                } else {
                    obj[col.id] = null;
                    console.log('🏷️ 태그 없음 - null 설정');
                }
            } else {
                // 기본 필드들 먼저 확인
                if (col.id === 'name') {
                    obj[col.id] = client.name || '';
                } else if (col.id === 'phone') {
                    obj[col.id] = client.phone || '';
                } else {
                    // 동적 필드는 accessor를 통해 접근
                    const accessor = (col as any).accessor || col.id;
                    const directValue = client[accessor];
                    const dataValue = client.data && client.data[accessor];
                    obj[col.id] = directValue || dataValue || '';

                    console.log(`🔍 동적 필드 ${col.id} (accessor: ${accessor}):`, {
                        accessor,
                        directValue,
                        dataValue,
                        finalValue: obj[col.id],
                        colInfo: col,
                    });
                }
            }
        });

        console.log('Initial values:', obj);
        return obj;
    };

    const [values, setValues] = useState<Record<string, any>>(initValues());

    // 태그 목록 로딩 및 모달이 열릴 때 초기값 설정
    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await getAllTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error('태그 목록 로딩 실패:', error);
            }
        };

        if (open) {
            console.log('🏷️ EditClientDialog 모달 열림:', {
                client: client,
                clientData: client?.data,
                clientKeys: client ? Object.keys(client) : null,
                columns: columns,
                columnsLength: columns.length,
                allColumns: allColumns,
                allColumnsLength: allColumns.length,
            });

            setValues(initValues());
            loadTags();
            // 새 태그 입력 상태 초기화
            setIsCreatingTag(false);
            setNewTagName('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, client]);

    const handleChange = (colId: string, value: any) => {
        setValues((prev) => ({ ...prev, [colId]: value }));
    };

    // 새 태그 생성 함수 (AddRowDialog와 동일)
    const handleCreateNewTag = async (colId?: string) => {
        if (!newTagName.trim()) return;

        try {
            // 랜덤 색상 선택
            const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
            const newTag = await createTag(newTagName.trim(), randomColor);

            // 새 태그를 목록에 추가
            setAvailableTags((prev) => [...prev, newTag]);

            // 태그 컬럼이 있으면 자동으로 선택
            if (colId) {
                handleChange(colId, newTag);
            }

            // 입력 초기화
            setNewTagName('');
            setIsCreatingTag(false);

            console.log('✅ 새 태그 생성 완료:', newTag);
        } catch (error) {
            console.error('❌ 새 태그 생성 실패:', error);
        }
    };

    // 수정 데이터 저장
    const handleSave = async () => {
        await logToTerminal('✏️ 고객 정보 수정', values);

        // 태그 데이터 변환 (단일 태그 → 배열)
        const processedValues = { ...values };
        const tagsColumns = allColumns.filter(
            (col) =>
                col.meta.type === 'tags' ||
                col.meta.type === 'tag' ||
                col.id === '고객분류' ||
                col.header === '고객분류'
        );

        for (const col of tagsColumns) {
            const selectedTag = values[col.id];
            await logToTerminal(`🏷️ 태그 컬럼 "${col.header}" (${col.id}) 선택값`, selectedTag);

            if (selectedTag) {
                // 선택된 태그가 있으면 배열로 변환
                processedValues[col.id] = [selectedTag];
                await logToTerminal(`🏷️ 배열로 변환됨`, [selectedTag]);
            } else {
                // 선택된 태그가 없으면 빈 배열
                processedValues[col.id] = [];
                await logToTerminal(`🏷️ 태그 미선택 → 빈 배열`);
            }
        }

        try {
            // 숫자 ID를 실제 컬럼명(accessor)으로 변환 (AddRowDialog와 동일한 로직)
            const transformedValues: any = {};

            allColumns.forEach((col) => {
                if (processedValues.hasOwnProperty(col.id)) {
                    const accessor = (col as any).accessor || col.id;
                    transformedValues[accessor] = processedValues[col.id];

                    logToTerminal(`🔄 수정 컬럼 변환: ${col.id} -> ${accessor}`, processedValues[col.id]);
                }
            });

            await logToTerminal('🔄 수정 원본 데이터', processedValues);
            await logToTerminal('🔄 수정 변환된 데이터', transformedValues);

            // 태그 컬럼 정보 확인
            const tagColumns = allColumns.filter(
                (col) =>
                    col.meta.type === 'tags' ||
                    col.meta.type === 'tag' ||
                    col.id === '고객분류' ||
                    col.header === '고객분류'
            );
            await logToTerminal(
                '🏷️ 태그 컬럼들',
                tagColumns.map((col) => ({ id: col.id, accessor: (col as any).accessor, header: col.header }))
            );

            // 고객분류(태그) 처리 (destructuring 전에 처리)
            // 태그 컬럼을 찾아서 해당 값 가져오기
            const tagColumn = allColumns.find(
                (col) =>
                    col.meta.type === 'tags' ||
                    col.meta.type === 'tag' ||
                    col.id === '고객분류' ||
                    col.header === '고객분류'
            );

            const customerTags =
                tagColumn && transformedValues[(tagColumn as any).accessor || tagColumn.id]
                    ? transformedValues[(tagColumn as any).accessor || tagColumn.id]
                    : transformedValues['고객분류'] || transformedValues.tags || [];

            await logToTerminal('🏷️ 태그 컬럼 정보', {
                tagColumn: tagColumn
                    ? { id: tagColumn.id, accessor: (tagColumn as any).accessor, header: tagColumn.header }
                    : null,
                tagColumnValue: tagColumn ? transformedValues[(tagColumn as any).accessor || tagColumn.id] : null,
                finalCustomerTags: customerTags,
            });

            // 서버 전송용 데이터 변환 (변환된 데이터 사용)
            const { name, phone, tags: transformedTags, ...rest } = transformedValues;
            // 태그 ID 추출 로직 개선
            let tagIds = [];
            if (Array.isArray(customerTags)) {
                tagIds = customerTags
                    .filter((tag: any) => tag != null)
                    .map((tag: any) => {
                        if (typeof tag === 'object' && tag.id) {
                            return tag.id;
                        } else if (typeof tag === 'number') {
                            return tag;
                        } else if (typeof tag === 'string' && !isNaN(Number(tag))) {
                            return Number(tag);
                        }
                        return null;
                    })
                    .filter((id: any) => id != null);
            } else if (typeof customerTags === 'object' && customerTags && customerTags.id) {
                tagIds = [customerTags.id];
            } else if (typeof customerTags === 'number') {
                tagIds = [customerTags];
            } else if (typeof customerTags === 'string' && !isNaN(Number(customerTags))) {
                tagIds = [Number(customerTags)];
            }

            const debugData = {
                customerTags,
                customerTagsType: typeof customerTags,
                isArray: Array.isArray(customerTags),
                extractedTagIds: tagIds,
                tagIdsLength: tagIds.length,
            };

            await logToTerminal('🏷️ 태그 ID 추출 상세', debugData);

            console.log('🏷️ 태그 ID 추출:', {
                transformedTags: transformedValues['고객분류'],
                transformedTagsKey: transformedValues.tags,
                originalTags: transformedTags,
                customerTags,
                customerTagsDetail: customerTags.map((tag: any) => ({
                    tag: tag,
                    type: typeof tag,
                    hasId: tag && typeof tag === 'object' && 'id' in tag,
                    id: tag?.id,
                })),
                tagIds,
            });

            const serverData = {
                name: transformedValues['고객명'] || transformedValues.name || '',
                phone: transformedValues['연락처'] || transformedValues.phone || '',
                tag_ids: tagIds,
                data: Object.keys(transformedValues).reduce((acc, key) => {
                    // 태그 관련 필드들과 기본 필드들을 제외
                    const excludedFields = [
                        '고객명',
                        '연락처',
                        '고객분류',
                        'name',
                        'phone',
                        'tags',
                        'tag_ids',
                        'notes',
                        'id',
                        'tag',
                        'customer_tags',
                        '고객 분류',
                    ];
                    if (!excludedFields.includes(key)) {
                        acc[key] = transformedValues[key];
                    }
                    return acc;
                }, {} as any),
            };

            console.log('💾 서버로 보낼 데이터:', serverData);

            // 태그와 일반 데이터를 분리하여 처리
            let finalResult = null;
            await logToTerminal('🏷️ EditClientDialog - 태그 업데이트 조건 확인', {
                tagIds,
                tagIdsLength: tagIds.length,
                tagIdsType: typeof tagIds,
                willUpdateTags: tagIds.length > 0,
            });

            if (tagIds.length > 0) {
                // 태그 업데이트 - 태그 객체 배열 전달
                const tagObjects = customerTags.filter((tag: any) => typeof tag === 'object' && tag.id);
                await logToTerminal('🏷️ EditClientDialog - 태그 업데이트 시작', {
                    tagIds,
                    tagObjects,
                });
                const tagResult = await updateClientTagsOnly(Number(client.id), tagObjects);
                await logToTerminal('🏷️ EditClientDialog - 태그 업데이트 결과', tagResult);
                finalResult = tagResult; // 태그 정보가 포함된 결과 저장
            } else {
                console.log('🏷️ EditClientDialog - 태그 ID가 없음, 태그 업데이트 건너뜀');
            }

            // 일반 데이터 업데이트 (모든 태그 관련 필드 제외)
            const { tag_ids, ...dataWithoutTags } = serverData;
            
            // 태그 관련 필드가 완전히 제거되었는지 확인
            console.log('🔍 [DEBUG] 원본 serverData 키들:', Object.keys(serverData));
            console.log('🔍 [DEBUG] dataWithoutTags 키들:', Object.keys(dataWithoutTags));
            console.log('🔍 [DEBUG] tag_ids가 제거되었나?:', !('tag_ids' in dataWithoutTags));
            console.log('🔍 [DEBUG] dataWithoutTags:', dataWithoutTags);
            
            await logToTerminal('🏷️ EditClientDialog - 일반 데이터 업데이트 (태그 제외)', {
                originalKeys: Object.keys(serverData),
                filteredKeys: Object.keys(dataWithoutTags),
                tagIdsRemoved: !('tag_ids' in dataWithoutTags),
                dataWithoutTags: dataWithoutTags
            });
            const dataResult = await updateClient(Number(client.id), dataWithoutTags);
            console.log('✅ 일반 데이터 수정 성공:', dataResult);

            // 최종 결과: 태그 업데이트 결과가 있으면 우선 사용, 없으면 일반 데이터 결과 사용
            const result = finalResult || dataResult;
            console.log('✅ 최종 수정 결과 (태그 정보 포함):', result);

            toast.success('고객 정보가 수정되었습니다.');

            // 부모 컴포넌트에 업데이트 알림 (업데이트된 클라이언트 정보 전달)
            if (onClientUpdated) {
                console.log('🔄 부모 컴포넌트에 업데이트 알림 (업데이트된 클라이언트 정보 포함):', result);
                (onClientUpdated as any)(result);
            }

            onOpenChange(false);

            // 모달 닫은 후 잠시 기다렸다가 강제 새로고침
            setTimeout(() => {
                if (onClientUpdated) {
                    console.log('🔄 모달 닫은 후 강제 새로고침');
                    (onClientUpdated as any)(result);
                }
            }, 100);
        } catch (error) {
            console.error('❌ 고객 정보 수정 실패:', error);
            toast.error('고객 정보 수정에 실패했습니다.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>고객 정보 수정</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {allColumns.map((col) => {
                        const value = values[col.id];
                        const label = col.header || col.id;
                        switch (col.meta.type) {
                            case 'number':
                                return (
                                    <div key={col.id} className="space-y-1">
                                        <label className="block text-sm font-medium">{label}</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            value={value}
                                            onChange={(e) =>
                                                handleChange(
                                                    col.id,
                                                    e.target.value === '' ? '' : Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                );
                            case 'date':
                                return (
                                    <div key={col.id} className="space-y-1">
                                        <label className="block text-sm font-medium">{label}</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            value={value}
                                            onChange={(e) => handleChange(col.id, e.target.value)}
                                        />
                                    </div>
                                );
                            case 'checkbox':
                                return (
                                    <div key={col.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={!!value}
                                            onChange={(e) => handleChange(col.id, e.target.checked)}
                                        />
                                        <label className="text-sm font-medium select-none">{label}</label>
                                    </div>
                                );
                            case 'tags':
                            case 'tag':
                                return (
                                    <div key={col.id} className="space-y-3">
                                        <label className="block text-sm font-medium">{label}</label>

                                        {/* 태그 선택 뱃지들 - AddRowDialog 방식과 동일 */}
                                        <div className="flex flex-wrap gap-2">
                                            {availableTags.map((tag) => {
                                                const isSelected = value?.id === tag.id;
                                                return (
                                                    <Badge
                                                        key={tag.id}
                                                        variant={isSelected ? 'default' : 'outline'}
                                                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                                                            isSelected
                                                                ? 'ring-2 ring-offset-1 shadow-md'
                                                                : 'hover:shadow-sm'
                                                        }`}
                                                        style={{
                                                            backgroundColor: isSelected
                                                                ? tag.color || '#6B7280'
                                                                : 'transparent',
                                                            borderColor: tag.color || '#6B7280',
                                                            color: isSelected ? '#ffffff' : tag.color || '#6B7280',
                                                        }}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                // 이미 선택된 태그를 클릭하면 선택 해제
                                                                handleChange(col.id, null);
                                                            } else {
                                                                // 새로운 태그 선택
                                                                handleChange(col.id, tag);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <div
                                                                className={`w-2 h-2 rounded-full ${
                                                                    isSelected ? 'bg-white' : ''
                                                                }`}
                                                                style={{
                                                                    backgroundColor: isSelected
                                                                        ? '#ffffff'
                                                                        : tag.color || '#6B7280',
                                                                }}
                                                            />
                                                            {tag.name}
                                                        </div>
                                                    </Badge>
                                                );
                                            })}

                                            {/* 새 태그 추가 UI - AddRowDialog와 동일 */}
                                            {!isCreatingTag ? (
                                                <Badge
                                                    variant="outline"
                                                    className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm border-dashed text-gray-500 hover:text-gray-700 hover:border-gray-400"
                                                    onClick={() => setIsCreatingTag(true)}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <Plus className="w-3 h-3" />새 태그
                                                    </div>
                                                </Badge>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 border border-gray-300 rounded bg-white">
                                                    <input
                                                        type="text"
                                                        value={newTagName}
                                                        onChange={(e) => setNewTagName(e.target.value)}
                                                        placeholder="태그 이름..."
                                                        className="px-2 py-1 text-sm border-none outline-none min-w-[100px]"
                                                        autoFocus
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleCreateNewTag(col.id);
                                                            } else if (e.key === 'Escape') {
                                                                setIsCreatingTag(false);
                                                                setNewTagName('');
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleCreateNewTag(col.id)}
                                                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                                        title="생성"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsCreatingTag(false);
                                                            setNewTagName('');
                                                        }}
                                                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                                                        title="취소"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            {value
                                                ? `"${value.name}" 태그가 선택되었습니다. 다시 클릭하면 선택 해제됩니다.`
                                                : '태그를 선택하지 않으면 자동으로 "일반고객" 태그가 할당됩니다.'}
                                        </p>
                                    </div>
                                );
                            default:
                                return (
                                    <div key={col.id} className="space-y-1">
                                        <label className="block text-sm font-medium">{label}</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                                            value={value}
                                            onChange={(e) => handleChange(col.id, e.target.value)}
                                        />
                                    </div>
                                );
                        }
                    })}
                </div>
                <DialogFooter className="mt-4">
                    <Button onClick={handleSave}>저장</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

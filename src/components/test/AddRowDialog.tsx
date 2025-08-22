import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check } from 'lucide-react';
import { getAllTags, createTag } from '@/utils/api';

interface Column {
    id: string;
    header: string;
    meta: { type: string };
}

interface AddRowDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    columns: Column[];
    onSave: (row: Record<string, any>) => void;
}

interface TagType {
    id: number;
    name: string;
    color?: string;
}

const AddRowDialog: React.FC<AddRowDialogProps> = ({ open, onOpenChange, columns, onSave }) => {
    const [availableTags, setAvailableTags] = useState<TagType[]>([]);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');

    const initValues = () => {
        const obj: Record<string, any> = {};
        columns.forEach((col) => {
            if (col.meta.type === 'checkbox') obj[col.id] = false;
            else if (
                col.meta.type === 'tags' ||
                col.meta.type === 'tag' ||
                col.id === '고객분류' ||
                col.header === '고객분류'
            )
                obj[col.id] = null; // 태그는 null로 초기화 (단일 선택)
            else obj[col.id] = '';
        });
        return obj;
    };

    const [values, setValues] = useState<Record<string, any>>(initValues());

    // 태그 목록 로딩
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
            setValues(initValues());
            loadTags();
            // 새 태그 입력 상태 초기화
            setIsCreatingTag(false);
            setNewTagName('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, JSON.stringify(columns)]);

    const handleChange = (colId: string, value: any) => {
        setValues((prev) => ({ ...prev, [colId]: value }));
    };

    // 태그 색상 팔레트
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

    // 새 태그 생성 함수
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

    const handleSave = () => {
        console.log('🆕 새 행 저장:', values);

        // 태그 데이터 변환 (단일 태그 → 배열)
        const processedValues = { ...values };
        const tagsColumns = columns.filter(
            (col) =>
                col.meta.type === 'tags' ||
                col.meta.type === 'tag' ||
                col.id === '고객분류' ||
                col.header === '고객분류'
        );

        tagsColumns.forEach((col) => {
            const selectedTag = values[col.id];
            console.log(`🏷️ 태그 컬럼 "${col.header}" (${col.id}) 선택값:`, selectedTag);

            if (selectedTag) {
                // 선택된 태그가 있으면 배열로 변환
                processedValues[col.id] = [selectedTag];
                console.log(`🏷️ 배열로 변환됨:`, [selectedTag]);
            } else {
                // 선택된 태그가 없으면 빈 배열 (백엔드에서 자동으로 "일반고객" 할당)
                processedValues[col.id] = [];
                console.log(`🏷️ 태그 미선택 → 빈 배열 (자동 할당 예정)`);
            }
        });

        console.log('🆕 최종 저장 데이터:', processedValues);
        onSave(processedValues);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>고객 등록</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {columns.map((col) => {
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

                                        {/* 태그 선택 뱃지들 */}
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
                                                            boxShadow: isSelected
                                                                ? `0 0 0 2px ${tag.color || '#6B7280'}40`
                                                                : 'none',
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

                                            {/* 새 태그 추가 UI */}
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
};

export default AddRowDialog;

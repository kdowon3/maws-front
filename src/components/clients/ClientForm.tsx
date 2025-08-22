import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Check, Plus } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getAllTags, createTag } from '@/utils/api';
import type { DynamicClient, ClientColumn } from '@/types/clients';

interface TagType {
    id: number;
    name: string;
    color?: string;
}

// 유효성 검증 스키마 (동적 컬럼을 위해 더 유연하게)
const formSchema = z
    .object({
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        notes: z.string().optional(),
    })
    .passthrough(); // 추가 필드들을 허용

interface ClientFormProps {
    onSubmit: (data: DynamicClient | null) => void;
    initialValues?: DynamicClient;
    columns?: ClientColumn[]; // 동적 컬럼 구조
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialValues = {}, columns = [] }) => {
    const [availableTags, setAvailableTags] = useState<TagType[]>([]);
    const [loading, setLoading] = useState(false);

    // 태그 목록 로드
    useEffect(() => {
        const loadTags = async () => {
            try {
                setLoading(true);
                const tags = await getAllTags();
                setAvailableTags(tags || []);
            } catch (error) {
                console.error('태그 목록 로드 실패:', error);
                toast.error('태그 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        loadTags();
    }, []);
    // 동적 폼 초기값 생성 (타입별 기본값 설정)
    const defaultValues: DynamicClient =
        columns.length > 0
            ? columns.reduce((acc, col) => {
                  // 컬럼 타입에 따른 기본값 설정
                  if (col.meta?.type === 'select') {
                      acc[col.id] = initialValues[col.id] || [];
                  } else {
                      acc[col.id] = initialValues[col.id] || '';
                  }
                  return acc;
              }, {} as DynamicClient)
            : {
                  name: initialValues.name || '',
                  phone: initialValues.phone || '',
                  email: initialValues.email || '',
                  notes: initialValues.notes || '',
              };

    console.log('📝 ClientForm 초기값 - initialValues:', initialValues);
    console.log('📝 ClientForm 초기값 - defaultValues:', defaultValues);
    console.log(
        '📝 ClientForm 초기값 - columns:',
        columns.map((c) => ({ id: c.id, header: c.header, type: c.meta?.type }))
    );

    // 태그 관련 초기값 상세 확인
    console.log('🏷️ 태그 초기값 상세 확인:');
    console.log('  - initialValues["고객분류"]:', initialValues['고객분류']);
    console.log('  - initialValues.tags:', initialValues.tags);
    console.log('  - defaultValues["고객분류"]:', defaultValues['고객분류']);
    console.log('  - defaultValues.tags:', defaultValues.tags);
    console.log('  - initialValues의 모든 키:', Object.keys(initialValues));
    // 폼 초기화
    const form = useForm<DynamicClient>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    // 폼 제출 핸들러
    const handleSubmit = (values: DynamicClient) => {
        console.log('📝 ClientForm 제출:', values);
        onSubmit(values);
        // toast는 EditClientDialog에서 처리하므로 여기서는 제거
    };

    // 폼 유효성 검사 오류 처리
    const handleFormError = (errors: any) => {
        console.error('📝 폼 유효성 검사 오류:', errors);
        toast.error('필수 필드를 확인해주세요.');
    };

    // 새 태그 생성 상태 (AddRowDialog와 통일)
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

    // 새 태그 생성 함수 (AddRowDialog와 동일)
    const handleCreateNewTag = async (colId?: string, field?: any) => {
        if (!newTagName.trim()) return;

        try {
            // 랜덤 색상 선택
            const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
            const newTag = await createTag(newTagName.trim(), randomColor);

            // 새 태그를 목록에 추가
            setAvailableTags((prev) => [...prev, newTag]);

            // 태그 컬럼이 있으면 자동으로 선택
            if (field) {
                field.onChange(newTag);
            }

            // 입력 초기화
            setNewTagName('');
            setIsCreatingTag(false);

            console.log('✅ 새 태그 생성 완료:', newTag);
            toast.success(`새 태그 "${newTag.name}"가 생성되고 선택되었습니다.`);
        } catch (error) {
            console.error('❌ 새 태그 생성 실패:', error);
            toast.error('태그 생성에 실패했습니다.');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleFormError)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {columns.length > 0 ? (
                        columns.map((col) => (
                            <FormField
                                key={col.id}
                                control={form.control}
                                name={col.id}
                                render={({ field }) => {
                                    // 태그 컬럼인 경우 특별한 UI 제공 (AddRowDialog 스타일로 통일)
                                    if (
                                        col.meta?.type === 'select' ||
                                        col.id === '고객분류' ||
                                        col.header === '고객분류'
                                    ) {
                                        return (
                                            <FormItem>
                                                <FormLabel>{col.header}</FormLabel>
                                                <FormControl>
                                                    <div className="space-y-3">
                                                        {/* 태그 선택 뱃지들 - AddRowDialog 방식과 동일 */}
                                                        <div className="flex flex-wrap gap-2">
                                                            {availableTags.map((tag) => {
                                                                const isSelected =
                                                                    (typeof field.value === 'object' &&
                                                                        field.value !== null &&
                                                                        !Array.isArray(field.value) &&
                                                                        (field.value as any)?.id === tag.id) ||
                                                                    (Array.isArray(field.value) &&
                                                                        field.value.length > 0 &&
                                                                        (field.value[0] as any)?.id === tag.id);
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
                                                                            color: isSelected
                                                                                ? '#ffffff'
                                                                                : tag.color || '#6B7280',
                                                                            boxShadow: isSelected
                                                                                ? `0 0 0 2px ${
                                                                                      tag.color || '#6B7280'
                                                                                  }40`
                                                                                : 'none',
                                                                        }}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                // 이미 선택된 태그를 클릭하면 선택 해제
                                                                                field.onChange(null);
                                                                            } else {
                                                                                // 새로운 태그 선택
                                                                                field.onChange(tag);
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
                                                                                handleCreateNewTag(col.id, field);
                                                                            } else if (e.key === 'Escape') {
                                                                                setIsCreatingTag(false);
                                                                                setNewTagName('');
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            handleCreateNewTag(col.id, field)
                                                                        }
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
                                                            {field.value
                                                                ? `"${
                                                                      (typeof field.value === 'object' &&
                                                                          field.value !== null &&
                                                                          !Array.isArray(field.value) &&
                                                                          (field.value as any)?.name) ||
                                                                      (Array.isArray(field.value) &&
                                                                          field.value.length > 0 &&
                                                                          (field.value[0] as any)?.name)
                                                                  }" 태그가 선택되었습니다. 다시 클릭하면 선택 해제됩니다.`
                                                                : '태그를 선택하지 않으면 자동으로 "일반고객" 태그가 할당됩니다.'}
                                                        </p>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }

                                    return (
                                        <FormItem>
                                            <FormLabel>{col.header}</FormLabel>
                                            <FormControl>
                                                {col.meta?.type === 'number' ? (
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={
                                                            typeof field.value === 'number'
                                                                ? field.value
                                                                : typeof field.value === 'string'
                                                                ? field.value
                                                                : ''
                                                        }
                                                    />
                                                ) : col.meta?.type === 'date' ? (
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={typeof field.value === 'string' ? field.value : ''}
                                                    />
                                                ) : col.meta?.type === 'checkbox' ? (
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                ) : (
                                                    <Input
                                                        {...field}
                                                        value={
                                                            typeof field.value === 'string'
                                                                ? field.value
                                                                : typeof field.value === 'number'
                                                                ? field.value
                                                                : ''
                                                        }
                                                    />
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        ))
                    ) : (
                        <>
                            {/* 기존 고정 필드 렌더링 (백업) */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>고객명 *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="고객 이름을 입력하세요"
                                                {...field}
                                                value={typeof field.value === 'string' ? field.value : ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>연락처 *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="010-0000-0000"
                                                {...field}
                                                value={typeof field.value === 'string' ? field.value : ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>이메일 *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="example@email.com"
                                                {...field}
                                                value={typeof field.value === 'string' ? field.value : ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* 고객분류 태그 필드 추가 */}
                            <FormField
                                control={form.control}
                                name="고객분류"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>고객분류</FormLabel>
                                        <FormControl>
                                            <div className="space-y-3">
                                                {/* 태그 선택 뱃지들 - AddRowDialog 방식과 동일 */}
                                                <div className="flex flex-wrap gap-2">
                                                    {availableTags.map((tag) => {
                                                        const isSelected =
                                                            (typeof field.value === 'object' &&
                                                                field.value !== null &&
                                                                !Array.isArray(field.value) &&
                                                                (field.value as any)?.id === tag.id) ||
                                                            (Array.isArray(field.value) &&
                                                                field.value.length > 0 &&
                                                                (field.value[0] as any)?.id === tag.id);
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
                                                                    color: isSelected
                                                                        ? '#ffffff'
                                                                        : tag.color || '#6B7280',
                                                                    boxShadow: isSelected
                                                                        ? `0 0 0 2px ${tag.color || '#6B7280'}40`
                                                                        : 'none',
                                                                }}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        // 이미 선택된 태그를 클릭하면 선택 해제
                                                                        field.onChange(null);
                                                                    } else {
                                                                        // 새로운 태그 선택
                                                                        field.onChange(tag);
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
                                                                        handleCreateNewTag('고객분류', field);
                                                                    } else if (e.key === 'Escape') {
                                                                        setIsCreatingTag(false);
                                                                        setNewTagName('');
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleCreateNewTag('고객분류', field)}
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
                                                    {field.value
                                                        ? `"${
                                                              (typeof field.value === 'object' &&
                                                                  field.value !== null &&
                                                                  !Array.isArray(field.value) &&
                                                                  (field.value as any)?.name) ||
                                                              (Array.isArray(field.value) &&
                                                                  field.value.length > 0 &&
                                                                  (field.value[0] as any)?.name)
                                                          }" 태그가 선택되었습니다. 다시 클릭하면 선택 해제됩니다.`
                                                        : '태그를 선택하지 않으면 자동으로 "일반고객" 태그가 할당됩니다.'}
                                                </p>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>
                {/* 비고 (고정) */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>비고</FormLabel>
                            <FormControl>
                                <textarea
                                    className="w-full h-24 px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    placeholder="고객 관련 메모를 입력하세요"
                                    {...field}
                                    value={typeof field.value === 'string' ? field.value : ''}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 버튼 영역 */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
                        취소
                    </Button>
                    <Button
                        type="submit"
                        className="bg-brand-blue hover:bg-brand-lightBlue"
                        onClick={(e) => {
                            console.log('🔘 저장 버튼 클릭됨!');
                            console.log('🔘 폼 상태 - isDirty:', form.formState.isDirty);
                            console.log('🔘 폼 상태 - isValid:', form.formState.isValid);
                            console.log('🔘 폼 값 전체:', form.getValues());
                            console.log('🔘 폼 오류:', form.formState.errors);

                            // 태그 값 특별히 확인
                            const values = form.getValues();
                            console.log('🔘 태그 관련 값들:', {
                                고객분류: values['고객분류'],
                                tags: values.tags,
                                전체_키들: Object.keys(values),
                            });
                        }}
                    >
                        저장
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ClientForm;

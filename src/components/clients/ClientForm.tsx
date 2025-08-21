import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Check, Plus, ChevronDown } from 'lucide-react';

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

    // 태그 선택 컴포넌트 (커스텀 드롭다운)
    const TagSelector = ({ field, label }: { field: any; label: string }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [newTagName, setNewTagName] = useState('');
        const [isCreating, setIsCreating] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const selectedTagId = field.value?.[0]?.id || field.value?.id || null;
        const selectedTag = availableTags.find((tag) => tag.id === selectedTagId);

        // 태그 선택 상태 디버깅
        console.log('🏷️ TagSelector 상태 확인:');
        console.log('  - field.value:', field.value);
        console.log('  - selectedTagId:', selectedTagId);
        console.log('  - selectedTag:', selectedTag);
        console.log('  - availableTags 개수:', availableTags.length);
        console.log(
            '  - availableTags 목록:',
            availableTags.map((t) => ({ id: t.id, name: t.name }))
        );

        // 초기값 처리 및 기본 태그 설정
        useEffect(() => {
            const handleInitialTags = async () => {
                // 1. 초기값에 태그가 있는데 availableTags에 없는 경우 처리
                const initialTag = field.value?.[0];
                if (initialTag && !selectedTag && availableTags.length > 0) {
                    console.log('⚠️ 초기값 태그가 availableTags에 없음:', initialTag);

                    // availableTags에 초기값 태그 추가
                    if (!availableTags.find((t) => t.id === initialTag.id)) {
                        setAvailableTags((prev) => [...prev, initialTag]);
                        console.log('✅ 초기값 태그를 availableTags에 추가함:', initialTag);
                    }
                }

                // 기본 태그는 백엔드에서 자동 할당됨 (Client.save() 오버라이드)
            };

            handleInitialTags();
        }, [availableTags, field]);

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
        ];

        // 랜덤 색상 선택 함수
        const getRandomColor = () => {
            return tagColors[Math.floor(Math.random() * tagColors.length)];
        };

        // 외부 클릭 감지
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isOpen]);

        // 새 태그 생성
        const handleCreateNewTag = async () => {
            if (!newTagName.trim()) return;

            setIsCreating(true);
            try {
                const randomColor = getRandomColor();
                const newTag = await createTag(newTagName.trim(), randomColor);
                setAvailableTags((prev) => [...prev, newTag]);

                const newTagValue = [{ id: newTag.id, name: newTag.name, color: newTag.color }];
                console.log('🏷️ 새 태그 생성 및 선택됨:', newTagValue);
                field.onChange(newTagValue);

                setNewTagName('');
                setIsOpen(false);
                toast.success(`새 태그 "${newTag.name}"가 생성되고 선택되었습니다.`);

                // 폼 값 확인
                setTimeout(() => {
                    console.log('🏷️ 새 태그 선택 후 폼 값:', form.getValues());
                }, 100);
            } catch (error) {
                console.error('태그 생성 실패:', error);
                toast.error('태그 생성에 실패했습니다.');
            } finally {
                setIsCreating(false);
            }
        };

        return (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {selectedTag ? (
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: selectedTag.color || '#6B7280' }}
                                    />
                                    <span>{selectedTag.name}</span>
                                </div>
                            ) : (
                                <span className="text-gray-500">태그를 선택하세요</span>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>

                        {isOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-72 overflow-hidden">
                                {/* 기존 태그 목록 */}
                                <div className="max-h-48 overflow-y-auto">
                                    {availableTags.length > 0 ? (
                                        availableTags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                                                onClick={() => {
                                                    const newTagValue = [
                                                        { id: tag.id, name: tag.name, color: tag.color },
                                                    ];
                                                    console.log('🏷️ 태그 선택됨:', newTagValue);
                                                    field.onChange(newTagValue);
                                                    setIsOpen(false);

                                                    // 폼 값 확인
                                                    setTimeout(() => {
                                                        console.log('🏷️ 태그 선택 후 폼 값:', form.getValues());
                                                    }, 100);
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: tag.color || '#6B7280' }}
                                                    />
                                                    <span>{tag.name}</span>
                                                </div>
                                                {selectedTagId === tag.id && (
                                                    <Check className="h-4 w-4 text-blue-600" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                            사용 가능한 태그가 없습니다
                                        </div>
                                    )}
                                </div>

                                {/* 새 태그 추가 섹션 - 맨 아래로 이동 */}
                                <div className="border-t bg-gray-50">
                                    <div className="p-3">
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                placeholder="새 태그 이름..."
                                                value={newTagName}
                                                onChange={(e) => setNewTagName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleCreateNewTag();
                                                    } else if (e.key === 'Escape') {
                                                        setIsOpen(false);
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                autoFocus
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleCreateNewTag}
                                                disabled={!newTagName.trim() || isCreating}
                                                className="px-3 bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isCreating ? '...' : <Plus className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Enter 키를 누르거나 + 버튼을 클릭하여 새 태그를 생성하세요
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </FormControl>
                <FormMessage />
            </FormItem>
        );
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
                                    // 태그 컬럼인 경우 특별한 UI 제공
                                    if (col.meta?.type === 'select') {
                                        return <TagSelector field={field} label={col.header} />;
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
                                    <FormItem className="md:col-span-2">
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


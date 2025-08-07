import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getAllTags, createTag, updateClient, updateTag, updateClientTagsOnly } from '@/utils/api';
import ColorPicker from '@/components/ui/color-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TagType {
    id: number;
    name: string;
    color?: string;
    created_at?: string;
    updated_at?: string;
}

interface ClientTagsProps {
    clientId?: number;
    initialTags?: TagType[];
    onTagsChange?: (tags: TagType[]) => void;
    readonly?: boolean;
    className?: string;
}

const ClientTags: React.FC<ClientTagsProps> = ({
    clientId,
    initialTags = [],
    onTagsChange,
    readonly = false,
    className = '',
}) => {
    // 기본 태그 상태 관리
    const [defaultTag, setDefaultTag] = useState<TagType>({ id: -1, name: '일반고객', color: '#6B7280' });

    // 단일 태그로 변경 (첫 번째 태그만 사용)
    const [selectedTag, setSelectedTag] = useState<TagType>(initialTags.length > 0 ? initialTags[0] : defaultTag);
    const [availableTags, setAvailableTags] = useState<TagType[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        placement: 'bottom' as 'top' | 'bottom',
        width: 320,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [selectedColor, setSelectedColor] = useState('#3B82F6'); // 새 태그 색상
    const [editingTagId, setEditingTagId] = useState<number | null>(null); // 편집 중인 태그 ID
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 간단한 드롭다운 위치 계산
    const calculateDropdownPosition = (triggerElement: HTMLElement) => {
        // 테이블 행 찾기
        const tableRow = triggerElement.closest('tr');

        if (tableRow) {
            // 테이블 행이 있으면 행 기준으로 위치 계산
            const rowRect = tableRow.getBoundingClientRect();
            return {
                top: rowRect.bottom + window.scrollY + 4,
                left: rowRect.left + window.scrollX + 16,
                placement: 'bottom' as 'top' | 'bottom',
                width: Math.min(400, rowRect.width - 32), // 행 너비에서 좌우 마진 제외
            };
        } else {
            // 테이블 밖에서는 태그 기준으로 위치 계산
            const triggerRect = triggerElement.getBoundingClientRect();
            return {
                top: triggerRect.bottom + window.scrollY + 8,
                left: triggerRect.left + window.scrollX,
                placement: 'bottom' as 'top' | 'bottom',
                width: 320,
            };
        }
    };

    // 태그 목록 불러오기 및 기본 태그 생성 (utils/api 사용)
    useEffect(() => {
        // 이미 태그가 로드되어 있으면 다시 로드하지 않음
        if (availableTags.length > 0) {
            return;
        }

        const fetchTags = async () => {
            try {
                const tags = await getAllTags();

                // 기본 태그 '일반고객'이 없으면 생성
                const defaultTagExists = tags.some((tag: TagType) => tag.name === '일반고객');
                if (!defaultTagExists) {
                    try {
                        const newDefaultTag = await createTag('일반고객', '#6B7280');
                        setAvailableTags([...tags, newDefaultTag]);

                        // 현재 선택된 태그가 임시 기본 태그면 실제 태그로 교체
                        if (selectedTag.id === -1) {
                            setSelectedTag(newDefaultTag);
                            onTagsChange?.([newDefaultTag]);
                        }
                    } catch (createError) {
                        console.error('🚨 기본 태그 생성 실패:', createError);
                        setAvailableTags(tags || []);
                    }
                } else {
                    setAvailableTags(tags || []);

                    // 현재 선택된 태그가 임시 기본 태그면 실제 태그로 교체
                    if (selectedTag.id === -1) {
                        const realDefaultTag = tags.find((tag: TagType) => tag.name === '일반고객');
                        if (realDefaultTag) {
                            setSelectedTag(realDefaultTag);
                            onTagsChange?.([realDefaultTag]);
                        }
                    }
                }
            } catch (error) {
                console.error('🚨 태그 목록 조회 실패:', error);
                toast.error('태그 목록을 불러오는데 실패했습니다.');
                setAvailableTags([]); // 실패 시 빈 배열로 설정
            }
        };
        fetchTags();
    }, [availableTags.length]); // availableTags.length가 변경될 때만 실행

    // 드롭다운 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 드롭다운이 열려있고, 클릭한 곳이 드롭다운 외부인 경우에만 닫기
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // 드롭다운 자체나 그 하위 요소를 클릭한 게 아닌지 확인
                const dropdown = document.querySelector('[data-dropdown="tag-selector"]');
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                    setSearchTerm('');
                }
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    // 새 태그 생성 (utils/api 사용)
    const createNewTag = async (tagName: string, color: string = selectedColor) => {
        if (!tagName.trim()) return null;

        setLoading(true);
        try {
            const newTag = await createTag(tagName.trim(), color);
            // available 태그 목록에 추가 (중복 방지)
            setAvailableTags((prev) => {
                const exists = prev.some((tag) => tag.id === newTag.id);
                return exists ? prev : [...prev, newTag];
            });

            // 다른 컴포넌트들에게 태그 업데이트 알림
            window.dispatchEvent(new CustomEvent('tagUpdated'));
            return newTag;
        } catch (error) {
            console.error('태그 생성 실패:', error);
            toast.error('태그 생성에 실패했습니다.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // 태그 선택 (단일 선택으로 변경)
    const selectTag = async (tag: TagType) => {
        // 이미 선택된 태그면 아무것도 하지 않음
        if (selectedTag.id === tag.id) {
            return;
        }

        // 기본 태그 (id: -1)인 경우 실제 "일반고객" 태그 찾기 또는 생성
        let actualTag = tag;
        if (tag.id === -1 && tag.name === '일반고객') {
            console.log('🏷️ 기본 태그 선택됨, 실제 서버 태그 찾는 중...');

            // availableTags에서 "일반고객" 태그 찾기
            let serverDefaultTag = availableTags.find((t) => t.name === '일반고객');

            // 없으면 서버에 생성
            if (!serverDefaultTag) {
                console.log('🏷️ "일반고객" 태그가 없어서 생성합니다...');
                try {
                    serverDefaultTag = await createTag('일반고객', '#6B7280');
                    setAvailableTags((prev) => [...prev, serverDefaultTag!]);
                    setDefaultTag(serverDefaultTag);
                    console.log('✅ "일반고객" 태그 생성 완료:', serverDefaultTag);
                } catch (error) {
                    console.error('❌ "일반고객" 태그 생성 실패:', error);
                    toast.error('기본 태그 생성에 실패했습니다.');
                    return;
                }
            } else {
                console.log('✅ 서버에서 "일반고객" 태그 발견:', serverDefaultTag);
                setDefaultTag(serverDefaultTag);
            }

            actualTag = serverDefaultTag;
        }

        // 실시간 서버 저장 (clientId가 있는 경우) - 태그 전용 API 사용
        if (clientId && !readonly) {
            try {
                setLoading(true);
                console.log('🏷️ 태그 변경:', actualTag.name);
                await updateClientTagsOnly(clientId, [actualTag]);

                // 서버 업데이트 성공 후 로컬 상태 업데이트
                setSelectedTag(actualTag);
                onTagsChange?.([actualTag]); // 배열로 래핑하여 호환성 유지

                toast.success('태그가 변경되었습니다.');
            } catch (error) {
                console.error('태그 업데이트 실패:', error);
                toast.error('태그 업데이트에 실패했습니다.');
                // 실패시 원래 상태로 되돌리기
                setSelectedTag(selectedTag);
                onTagsChange?.([selectedTag]);
            } finally {
                setLoading(false);
            }
        } else if (!readonly) {
            // clientId가 없고 읽기 전용이 아닌 경우 로컬 상태만 업데이트
            setSelectedTag(actualTag);
            onTagsChange?.([actualTag]);
        }
        // readonly 모드에서는 아무것도 하지 않음
    };

    // 태그 제거 - 기본 태그로 변경
    const removeTag = async (tagToRemove: TagType) => {
        await selectTag(defaultTag); // 기본 태그로 변경
    };

    // 기존 태그 색상 업데이트
    const updateTagColor = async (tagId: number, newColor: string) => {
        try {
            setLoading(true);
            const updatedTag = await updateTag(tagId, { color: newColor });

            // availableTags 업데이트
            setAvailableTags((prev) => prev.map((tag) => (tag.id === tagId ? { ...tag, color: newColor } : tag)));

            // selectedTag 업데이트 (현재 선택된 태그 색상 반영)
            if (selectedTag.id === tagId) {
                const updatedTag = { ...selectedTag, color: newColor };
                setSelectedTag(updatedTag);
                onTagsChange?.([updatedTag]);
            }

            toast.success('태그 색상이 변경되었습니다.');
            setEditingTagId(null);

            // 전체 태그 목록 새로고침
            const refreshedTags = await getAllTags();
            setAvailableTags(refreshedTags);

            // 다른 컴포넌트들에게 태그 업데이트 알림
            window.dispatchEvent(new CustomEvent('tagUpdated'));
        } catch (error) {
            console.error('태그 색상 업데이트 실패:', error);
            toast.error('태그 색상 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 검색 필터링된 태그 목록
    const filteredTags = availableTags.filter(
        (tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()) && tag.id !== selectedTag.id
    );

    // 검색어로 새 태그 생성 처리
    const handleCreateNewTag = async () => {
        if (!searchTerm.trim()) return;

        console.log('🏷️ 새 태그 생성 시도:', { name: searchTerm, color: selectedColor });

        const newTag = await createNewTag(searchTerm, selectedColor);
        if (newTag) {
            console.log('✅ 새 태그 생성 성공:', newTag);
            selectTag(newTag);
            setSearchTerm('');
            setIsDropdownOpen(false); // 드롭다운 닫기
            toast.success(`새 태그 "${newTag.name}"가 생성되고 선택되었습니다.`);
        } else {
            console.error('❌ 새 태그 생성 실패');
            toast.error('태그 생성에 실패했습니다.');
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* 선택된 태그 표시 */}
            <div className={`flex flex-wrap items-center ${readonly ? 'gap-1' : 'gap-2 mb-2'}`}>
                <div className="relative" data-tag-trigger ref={dropdownRef}>
                    <Badge
                        variant="secondary"
                        className={`flex items-center gap-1 transition-all duration-200 border ${
                            readonly
                                ? 'py-0.5 px-1.5 text-xs' // 테이블용 컴팩트 스타일
                                : 'py-1 px-2 cursor-pointer hover:shadow-md hover:scale-105' // 편집 모드 스타일
                        }`}
                        style={{
                            backgroundColor: selectedTag.color + '20',
                            borderColor: selectedTag.color,
                            boxShadow: readonly ? 'none' : `0 0 0 1px ${selectedTag.color}30`,
                        }}
                        title={readonly ? selectedTag.name : '클릭하여 태그 편집'}
                        onClick={(e) => {
                            if (!readonly) {
                                if (!isDropdownOpen) {
                                    const triggerElement = e.currentTarget.closest('[data-tag-trigger]') as HTMLElement;
                                    if (triggerElement) {
                                        const position = calculateDropdownPosition(triggerElement);
                                        setDropdownPosition(position);
                                    }
                                }
                                setIsDropdownOpen(!isDropdownOpen);
                            }
                        }}
                    >
                        <span style={{ color: selectedTag.color }} className={readonly ? 'font-medium' : ''}>
                            {selectedTag.name}
                        </span>
                        {!readonly && selectedTag.name !== '일반고객' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(selectedTag);
                                }}
                                disabled={loading}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </Badge>
                </div>

                {/* 노션 스타일 + 버튼 */}
                {!readonly && (
                    <div data-tag-trigger>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-dashed text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                                if (!isDropdownOpen) {
                                    const triggerElement = e.currentTarget.closest('[data-tag-trigger]') as HTMLElement;
                                    if (triggerElement) {
                                        const position = calculateDropdownPosition(triggerElement);
                                        setDropdownPosition(position);
                                    }
                                }
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                        >
                            <Plus className="h-3 w-3" />
                            <span className="text-xs">태그 추가</span>
                        </Badge>
                    </div>
                )}
            </div>

            {/* 노션 스타일: 태그를 직접 클릭하여 편집 */}
            {/* 드롭다운 메뉴 */}
            {!readonly && isDropdownOpen && (
                <div
                    data-dropdown="tag-selector"
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[99999] max-h-64 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        pointerEvents: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 검색 입력 */}
                    <div className="p-2 border-b" onClick={(e) => e.stopPropagation()}>
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="태그 검색 또는 새 태그 이름..."
                            className="w-full z-[100000]"
                            autoFocus
                            onKeyPress={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    searchTerm.trim() &&
                                    !filteredTags.some((tag) => tag.name.toLowerCase() === searchTerm.toLowerCase())
                                ) {
                                    handleCreateNewTag();
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* 태그 목록 */}
                    <div className="max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {filteredTags.length > 0 ? (
                            filteredTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectTag(tag);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                        <span>{tag.name}</span>
                                    </div>
                                    {selectedTag.id === tag.id && <Check className="h-4 w-4 text-green-600" />}
                                </button>
                            ))
                        ) : searchTerm.trim() ? (
                            <div className="p-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                                {/* 색상 선택 */}
                                <div className="space-y-2">
                                    <span className="text-sm text-gray-600">색상:</span>
                                    <ColorPicker
                                        selectedColor={selectedColor}
                                        onColorChange={(color) => {
                                            console.log('🎨 ColorPicker에서 색깔 변경:', color);
                                            setSelectedColor(color);
                                        }}
                                        disabled={loading}
                                    />
                                </div>

                                {/* 태그 생성 버튼 */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateNewTag();
                                    }}
                                    disabled={loading}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>"{searchTerm}" 태그 생성</span>
                                    <div
                                        className="w-3 h-3 rounded-full ml-auto border border-gray-300"
                                        style={{ backgroundColor: selectedColor }}
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 text-center">
                                <div className="text-gray-500 text-sm mb-2">
                                    {searchTerm ? '검색 결과가 없습니다' : '사용 가능한 태그가 없습니다'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    위 검색창에 태그명을 입력하고 Enter를 누르면
                                    <br />새 태그를 생성할 수 있습니다
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientTags;

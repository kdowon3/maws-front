import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Tag, X } from "lucide-react";
import { getAllTags } from "@/utils/api";

interface TagType {
  id: number;
  name: string;
  color?: string;
}

interface TagFilterProps {
  selectedTags: TagType[];
  onTagChange: (tags: TagType[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTags, onTagChange }) => {
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 태그 목록 불러오기
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        console.log("🏷️ [TagFilter] 태그 목록 새로고침 시작");
        const tags = await getAllTags();
        console.log("🏷️ [TagFilter] 받은 태그 목록:", tags);
        setAvailableTags(Array.isArray(tags) ? tags : []);
      } catch (error) {
        console.error("🏷️ [TagFilter] 태그 목록 조회 실패:", error);
        setAvailableTags([]); // 에러 발생시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [refreshKey]);

  // 전역 태그 변경 이벤트 리스너
  useEffect(() => {
    const handleTagUpdate = () => {
      console.log("🏷️ [TagFilter] tagUpdated 이벤트 감지됨");
      setRefreshKey((prev) => prev + 1);
    };

    // 여러 이벤트 이름으로 리스너 등록
    const events = ["tagUpdated", "tagCreated", "tagDeleted", "tagsChanged"];
    events.forEach(event => {
      window.addEventListener(event, handleTagUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleTagUpdate);
      });
    };
  }, []);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 태그 선택/해제
  const toggleTag = (tag: TagType) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onTagChange(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: TagType) => {
    onTagChange(selectedTags.filter((t) => t.id !== tagToRemove.id));
  };

  // 필터링된 태그 (선택되지 않은 것들만)
  const unselectedTags = Array.isArray(availableTags)
    ? availableTags.filter(
        (tag) => !selectedTags.some((selected) => selected.id === tag.id),
      )
    : [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 선택된 태그들 표시 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
              style={{
                backgroundColor: tag.color + "20",
                borderColor: tag.color,
              }}
            >
              <span style={{ color: tag.color }}>{tag.name}</span>
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 드롭다운 트리거 */}
      <Button
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between min-w-[120px]"
        disabled={loading}
      >
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>태그 필터</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {/* 드롭다운 메뉴 */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-hidden">
          {loading ? (
            <div className="p-3 text-center text-gray-500">로딩 중...</div>
          ) : unselectedTags.length > 0 ? (
            <div className="max-h-48 overflow-y-auto">
              {unselectedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              {selectedTags.length > 0
                ? "모든 태그가 선택됨"
                : "사용 가능한 태그가 없습니다"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;

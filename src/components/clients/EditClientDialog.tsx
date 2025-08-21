import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  updateClient,
  getAllTags,
  createTag,
  updateClientTagsOnly,
} from "@/utils/api";
import type { DynamicClient, ClientColumn } from "@/types/clients";

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
  const [newTagName, setNewTagName] = useState("");

  // 태그 색상 팔레트 (AddRowDialog와 동일)
  const tagColors = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#10B981",
    "#14B8A6",
    "#06B6D4",
    "#0EA5E9",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#D946EF",
    "#EC4899",
    "#F43F5E",
    "#6B7280",
    "#374151",
    "#111827",
  ];

  // 컬럼 정의 (기본 컬럼 + 동적 컬럼, 중복 제거)
  const baseColumns = [
    { id: "고객명", header: "고객명", meta: { type: "text" } },
    { id: "연락처", header: "연락처", meta: { type: "text" } },
    { id: "고객분류", header: "고객분류", meta: { type: "tags" } },
  ];

  const dynamicColumns = columns.map((col) => ({
    id: col.id,
    header: col.header,
    meta: { type: col.meta?.type || "text" },
  }));

  const tempColumns = [...baseColumns, ...dynamicColumns];
  // id 기준으로 중복 제거 (첫 번째 항목 유지) + 백엔드 내부 필드 제외
  const allColumns = tempColumns.filter((col, idx, self) => {
    // 백엔드 내부 필드들 제외
    if (
      ["tag_ids", "data", "created_at", "updated_at", "id"].includes(col.id)
    ) {
      return false;
    }
    // 중복 제거
    return self.findIndex((c) => c.id === col.id) === idx;
  });

  // 초기값 설정 (client 데이터 기반)
  const initValues = () => {
    const obj: Record<string, any> = {};

    allColumns.forEach((col) => {
      // 백엔드 내부 필드들은 제외
      if (
        ["tag_ids", "data", "created_at", "updated_at", "id"].includes(col.id)
      ) {
        return;
      }

      if (col.meta.type === "checkbox") {
        obj[col.id] = client[col.id] || false;
      } else if (col.meta.type === "tags") {
        // 태그 데이터 처리 - 다양한 형태의 태그 데이터 처리
        const clientTags = client[col.id] || client.tags || [];
        console.log("🏷️ EditClientDialog - Client tags data:", {
          colId: col.id,
          clientTags,
          clientId: client.id,
          clientName: client.name,
          hasTags: !!clientTags,
          tagsLength: Array.isArray(clientTags)
            ? clientTags.length
            : "not array",
        });

        if (Array.isArray(clientTags) && clientTags.length > 0) {
          obj[col.id] = clientTags[0];
          console.log("🏷️ 배열에서 첫 번째 태그 선택:", clientTags[0]);
        } else if (
          typeof clientTags === "object" &&
          clientTags !== null &&
          !Array.isArray(clientTags)
        ) {
          // 객체 형태의 태그인 경우
          obj[col.id] = clientTags;
          console.log("🏷️ 객체 형태 태그 선택:", clientTags);
        } else if (typeof clientTags === "string") {
          // 문자열 형태의 태그인 경우 (태그 이름만 있는 경우)
          obj[col.id] = { name: clientTags };
          console.log("🏷️ 문자열을 객체로 변환:", { name: clientTags });
        } else {
          obj[col.id] = null;
          console.log("🏷️ 태그 없음 - null 설정");
        }
      } else {
        obj[col.id] = client[col.id] || "";
      }
    });

    console.log("Initial values:", obj);
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
        console.error("태그 목록 로딩 실패:", error);
      }
    };

    if (open) {
      console.log("🏷️ EditClientDialog 모달 열림:", {
        client: client,
        columns: columns,
        allColumns: allColumns,
        baseColumns: baseColumns,
        dynamicColumns: dynamicColumns,
      });

      setValues(initValues());
      loadTags();
      // 새 태그 입력 상태 초기화
      setIsCreatingTag(false);
      setNewTagName("");
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
      const randomColor =
        tagColors[Math.floor(Math.random() * tagColors.length)];
      const newTag = await createTag(newTagName.trim(), randomColor);

      // 새 태그를 목록에 추가
      setAvailableTags((prev) => [...prev, newTag]);

      // 태그 컬럼이 있으면 자동으로 선택
      if (colId) {
        handleChange(colId, newTag);
      }

      // 입력 초기화
      setNewTagName("");
      setIsCreatingTag(false);

      console.log("✅ 새 태그 생성 완료:", newTag);
    } catch (error) {
      console.error("❌ 새 태그 생성 실패:", error);
    }
  };

  // 수정 데이터 저장
  const handleSave = async () => {
    console.log("✏️ 고객 정보 수정:", values);

    // 태그 데이터 변환 (단일 태그 → 배열)
    const processedValues = { ...values };
    const tagsColumns = allColumns.filter((col) => col.meta.type === "tags");

    tagsColumns.forEach((col) => {
      const selectedTag = values[col.id];
      console.log(
        `🏷️ 태그 컬럼 "${col.header}" (${col.id}) 선택값:`,
        selectedTag,
      );

      if (selectedTag) {
        // 선택된 태그가 있으면 배열로 변환
        processedValues[col.id] = [selectedTag];
        console.log(`🏷️ 배열로 변환됨:`, [selectedTag]);
      } else {
        // 선택된 태그가 없으면 빈 배열
        processedValues[col.id] = [];
        console.log(`🏷️ 태그 미선택 → 빈 배열`);
      }
    });

    try {
      // 서버 전송용 데이터 변환
      const { name, phone, tags, ...rest } = processedValues;

      // 고객분류(태그) 처리
      const customerTags = processedValues["고객분류"] || tags || [];
      const tagIds = Array.isArray(customerTags)
        ? customerTags.map((tag: any) =>
            typeof tag === "object" ? tag.id : tag,
          )
        : typeof customerTags === "object" && customerTags.id
          ? [customerTags.id]
          : [];

      console.log("🏷️ 태그 ID 추출:", { customerTags, tagIds });

      const serverData = {
        name: processedValues["고객명"] || processedValues.name || "",
        phone: processedValues["연락처"] || processedValues.phone || "",
        tag_ids: tagIds,
        data: Object.keys(processedValues).reduce((acc, key) => {
          // 태그 관련 필드들과 기본 필드들을 제외
          const excludedFields = [
            "고객명",
            "연락처",
            "고객분류",
            "name",
            "phone",
            "tags",
            "tag_ids",
            "notes",
            "id",
            "tag",
            "customer_tags",
            "고객 분류",
          ];
          if (!excludedFields.includes(key)) {
            acc[key] = processedValues[key];
          }
          return acc;
        }, {} as any),
      };

      console.log("💾 서버로 보낼 데이터:", serverData);

      // 태그와 일반 데이터를 분리하여 처리
      if (tagIds.length > 0) {
        // 태그 업데이트 - 태그 객체 배열 전달
        const tagObjects = customerTags.filter(
          (tag: any) => typeof tag === "object" && tag.id,
        );
        console.log("🏷️ EditClientDialog - 태그 업데이트 시작:", {
          tagIds,
          tagObjects,
        });
        const tagResult = await updateClientTagsOnly(
          Number(client.id),
          tagObjects,
        );
        console.log("🏷️ EditClientDialog - 태그 업데이트 결과:", tagResult);
      } else {
        console.log(
          "🏷️ EditClientDialog - 태그 ID가 없음, 태그 업데이트 건너뜀",
        );
      }

      // 일반 데이터 업데이트 (태그 제외)
      const { tag_ids, ...dataWithoutTags } = serverData;
      console.log(
        "🏷️ EditClientDialog - 일반 데이터 업데이트:",
        dataWithoutTags,
      );
      const result = await updateClient(Number(client.id), dataWithoutTags);
      console.log("✅ 고객 정보 수정 성공:", result);

      toast.success("고객 정보가 수정되었습니다.");

      // 부모 컴포넌트에 업데이트 알림 (테이블 새로고침을 위해)
      if (onClientUpdated) {
        console.log("🔄 부모 컴포넌트에 업데이트 알림");
        onClientUpdated();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("❌ 고객 정보 수정 실패:", error);
      toast.error("고객 정보 수정에 실패했습니다.");
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
              case "number":
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
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                );
              case "date":
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
              case "checkbox":
                return (
                  <div key={col.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => handleChange(col.id, e.target.checked)}
                    />
                    <label className="text-sm font-medium select-none">
                      {label}
                    </label>
                  </div>
                );
              case "tags":
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
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                              isSelected
                                ? "ring-2 ring-offset-1 shadow-md"
                                : "hover:shadow-sm"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? tag.color || "#6B7280"
                                : "transparent",
                              borderColor: tag.color || "#6B7280",
                              color: isSelected
                                ? "#ffffff"
                                : tag.color || "#6B7280",
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
                                  isSelected ? "bg-white" : ""
                                }`}
                                style={{
                                  backgroundColor: isSelected
                                    ? "#ffffff"
                                    : tag.color || "#6B7280",
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
                              if (e.key === "Enter") {
                                handleCreateNewTag(col.id);
                              } else if (e.key === "Escape") {
                                setIsCreatingTag(false);
                                setNewTagName("");
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
                              setNewTagName("");
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

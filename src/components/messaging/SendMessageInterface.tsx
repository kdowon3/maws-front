import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// Tabs 제거 - 통합 인터페이스로 변경
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Filter, Users, Eye, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { getClients, getAllTags } from "@/utils/api";
import { sendBulkSMS, validateSMSData, SMSAPIError } from "@/utils/smsApi";

interface CustomerFilterProps {
  selectedCount: number;
  onApplyFilters: (filteredClients: any[]) => void;
  onIndividualSelect: (selectedClients: any[]) => void;
  clients: any[];
  filteredClients: any[];
  selectedClients: any[];
  loading: boolean;
}

const CustomerFilter: React.FC<CustomerFilterProps> = ({
  selectedCount,
  onApplyFilters,
  onIndividualSelect,
  clients,
  filteredClients,
  selectedClients,
  loading,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색어 debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F: 검색에 포커스
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // ESC: 포커스 해제
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTag = useCallback((value: string) => {
    const isTagSelected = selectedTags.includes(value);
    
    // 태그에 해당하는 고객들 찾기
    const tagClients = clients.filter(client => 
      client.tags?.some(clientTag => 
        (typeof clientTag === 'string' ? clientTag : clientTag.name) === value
      )
    );
    
    if (isTagSelected) {
      // 태그 해제 - 해당 고객들 선택 해제
      const newSelectedClients = selectedClients.filter(selected => 
        !tagClients.some(tagClient => tagClient.id === selected.id)
      );
      onIndividualSelect(newSelectedClients);
      setSelectedTags(prev => prev.filter(tag => tag !== value));
    } else {
      // 태그 선택 - 해당 고객들 선택 추가 (중복 제거)
      const newSelectedClients = [...selectedClients];
      tagClients.forEach(tagClient => {
        if (!newSelectedClients.some(selected => selected.id === tagClient.id)) {
          newSelectedClients.push(tagClient);
        }
      });
      onIndividualSelect(newSelectedClients);
      setSelectedTags(prev => [...prev, value]);
    }
  }, [clients, selectedClients, selectedTags, onIndividualSelect]);

  // 태그 별 선택된 고객 수 계산
  const getTagSelectedCount = useCallback((tagName: string) => {
    const tagClients = clients.filter(client => 
      client.tags?.some(clientTag => 
        (typeof clientTag === 'string' ? clientTag : clientTag.name) === tagName
      )
    );
    const selectedInTag = tagClients.filter(tagClient => 
      selectedClients.some(selected => selected.id === tagClient.id)
    );
    return { total: tagClients.length, selected: selectedInTag.length };
  }, [clients, selectedClients]);

  // 개별 고객 선택/해제 (memoized)
  const toggleClientSelection = useCallback((client: any) => {
    const isSelected = selectedClients.some((c) => c.id === client.id);
    if (isSelected) {
      onIndividualSelect(selectedClients.filter((c) => c.id !== client.id));
    } else {
      onIndividualSelect([...selectedClients, client]);
    }
  }, [selectedClients, onIndividualSelect]);

  // 전체 선택/해제 (memoized)
  const toggleSelectAll = useCallback(() => {
    if (selectedClients.length === clients.length) {
      onIndividualSelect([]);
    } else {
      onIndividualSelect([...clients]);
    }
  }, [selectedClients.length, clients.length, clients, onIndividualSelect]);

  // 검색된 고객 목록 (memoized)
  const searchedClients = useMemo(() => {
    if (!debouncedSearchTerm) return clients;
    
    return clients.filter((client) => {
      const name = client.name || "";
      const phone = client.phone || "";
      return (
        name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        phone.includes(debouncedSearchTerm)
      );
    });
  }, [clients, debouncedSearchTerm]);

  // 태그 목록 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("태그 목록 조회 실패:", error);
      }
    };
    fetchTags();
  }, []);

  // 모든 선택 해제 (초기화) (memoized)
  const clearAllSelections = useCallback(() => {
    setSelectedTags([]);
    onIndividualSelect([]);
  }, [onIndividualSelect]);

  return (
    <Card className="p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-lg font-bold mb-4">
        1. 고객 선택{" "}
        <span className="text-brand-blue">{selectedCount}명 선택됨</span>
      </h2>

      <div className="space-y-4">
        {/* 통합된 선택 인터페이스 */}
        <div className="space-y-4">
          {/* 태그 필터링 영역 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">태그로 고객 선택</p>
              {(selectedTags.length > 0 || selectedClients.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllSelections}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  전체 해제
                </Button>
              )}
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  태그 목록 로딩 중...
                </div>
                {/* 태그 스켈레톤 */}
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-md animate-pulse" style={{width: `${60 + Math.random() * 40}px`}}></div>
                  ))}
                </div>
              </div>
            ) : availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 md:max-h-none overflow-y-auto">
                {availableTags.map((tag: any) => {
                  const tagName = typeof tag === 'string' ? tag : (tag.name || tag);
                  const isSelected = selectedTags.includes(tagName);
                  const { total, selected } = getTagSelectedCount(tagName);
                  
                  return (
                    <Button
                      key={typeof tag === 'string' ? tag : (tag.id || tag.name || tag)}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleTag(tagName)}
                      size="sm"
                      className={
                        isSelected
                          ? "bg-brand-blue hover:bg-brand-blue/90 ring-2 ring-brand-blue/20 active:scale-95 transition-transform"
                          : "hover:bg-brand-lightGray active:scale-95 transition-transform"
                      }
                      aria-pressed={isSelected}
                      title={`${tagName} - 선택: ${selected}/${total}명`}
                    >
                      <span className="flex items-center gap-1">
                        {tagName}
                        <span className={`text-xs px-1 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : selected > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {selected > 0 ? `${selected}/${total}` : total}
                        </span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">등록된 태그가 없습니다.</p>
                <p className="text-xs">고객 관리에서 태그를 먼저 생성해주세요.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 통합된 고객 선택 영역 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">고객 목록</h3>
            <span className="text-xs text-gray-500">
              {selectedClients.length}/{clients.length}명 선택
            </span>
          </div>
          
          {/* 검색 바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="고객명 또는 연락처로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 전체 선택 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedClients.length === searchedClients.length &&
                  searchedClients.length > 0
                }
                onCheckedChange={() => {
                  if (selectedClients.length === searchedClients.length) {
                    // 모든 검색된 고객 해제
                    const newSelected = selectedClients.filter(selected => 
                      !searchedClients.some(searched => searched.id === selected.id)
                    );
                    onIndividualSelect(newSelected);
                  } else {
                    // 모든 검색된 고객 선택
                    const newSelected = [...selectedClients];
                    searchedClients.forEach(searched => {
                      if (!newSelected.some(selected => selected.id === searched.id)) {
                        newSelected.push(searched);
                      }
                    });
                    onIndividualSelect(newSelected);
                  }
                }}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                {searchTerm ? `검색 결과 전체 선택 (${searchedClients.length}명)` : `전체 선택 (${clients.length}명)`}
              </label>
            </div>
          </div>

          {/* 고객 목록 */}
          <div className="max-h-64 md:max-h-80 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {loading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm">고객 목록 로딩 중...</span>
                </div>
                {/* 고객 스켈레톤 */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : searchedClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "검색 결과가 없습니다."
                  : "등록된 고객이 없습니다."}
              </div>
            ) : (
              searchedClients.map((client) => {
                const isSelected = selectedClients.some(
                  (c) => c.id === client.id,
                );
                const hasPhone = client.phone && client.phone.trim() !== "";
                const canReceiveMessage =
                  hasPhone && client.data?.문자수신동의 !== false;

                return (
                  <div
                    key={client.id}
                    className={`flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-brand-blue/5 border-brand-blue shadow-sm"
                        : "border-gray-200 hover:shadow-sm"
                    } ${!canReceiveMessage ? "opacity-60" : ""} active:scale-[0.98] touch-manipulation`}
                    onClick={() => toggleClientSelection(client)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={!canReceiveMessage}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleClientSelection(client);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleClientSelection(client)}
                      disabled={!canReceiveMessage}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {client.name || "이름 없음"}
                        </p>
                        {client.data?.vip && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {client.phone || "연락처 없음"}
                      </p>
                      {!canReceiveMessage && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-500">×</span>
                          <p className="text-xs text-red-500">
                            {!hasPhone ? "연락처 없음" : "발신 거부"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center" title={canReceiveMessage ? '메시지 발송 가능' : '메시지 발송 불가능'}>
                      {canReceiveMessage ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="sr-only">발송 가능</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-xs text-red-500">×</span>
                          <span className="sr-only">발송 불가</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 선택 상태 표시 - 애니메이션 개선 */}
      <div className={`mt-4 p-3 rounded-md border transition-all duration-300 ${
        selectedClients.length > 0 
          ? 'bg-blue-50 border-blue-200 opacity-100 transform translate-y-0'
          : 'bg-gray-50 border-gray-200 opacity-50 transform translate-y-1'
      }`}>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className={`font-medium ${
              selectedClients.length > 0 ? 'text-blue-700' : 'text-gray-500'
            }`}>
              선택된 고객: {selectedClients.length}명
            </span>
            {selectedClients.length > 0 && (
              <div className="mt-1 text-xs space-x-4 animate-fade-in">
                <span className="text-green-600 inline-flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  발신가능: {selectedClients.filter(c => c.phone && c.data?.문자수신동의 !== false).length}명
                </span>
                <span className="text-red-600 inline-flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  발신불가: {selectedClients.filter(c => !c.phone || c.data?.문자수신동의 === false).length}명
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 색상 범례 */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500 py-3 bg-gray-50 rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
          <span className="font-medium">발신가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <span className="font-medium">발신불가</span>
        </div>
      </div>

    </Card>
  );
};

const MessageComposer: React.FC<{ selectedClients: any[] }> = ({ selectedClients }) => {
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; } | null>(null);
  const { user } = useAuth();
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + M: 메시지 입력에 포커스
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        messageTextareaRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 발신 가능한 고객 수 계산
  const sendableCount = selectedClients.filter(client => 
    client.phone && client.phone.trim() !== "" && client.data?.문자수신동의 !== false
  ).length;

  const canSendMessage = sendableCount > 0 && message.trim().length > 0 && !isSending;

  // SMS 발송 처리
  const handleSendMessage = async () => {
    if (!canSendMessage || message.length > 1000) return;

    const clientIds = selectedClients
      .filter(client => client.phone && client.phone.trim() !== "" && client.data?.문자수신동의 !== false)
      .map(client => client.id);

    // 클라이언트 측 유효성 검사
    const validation = validateSMSData(clientIds, message);
    if (!validation.isValid) {
      setSendResult({
        success: false,
        message: validation.errors.join(' ')
      });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const result = await sendBulkSMS(clientIds, message);
      
      if (result.success && result.data) {
        let successMessage = `✅ 발송 완료!\n\n📱 성공: ${result.data.sent_count}명`;
        
        // 실패한 경우 고객명만 표시
        if (result.data.failed_count > 0) {
          successMessage += `\n❌ 실패: ${result.data.failed_count}명`;
          
          if (result.data.results) {
            const failedClients = result.data.results.filter((r: any) => !r.success);
            if (failedClients.length > 0) {
              successMessage += '\n\n실패 고객:';
              failedClients.forEach((client: any, index: number) => {
                if (index < 5) { // 최대 5명까지만 표시
                  successMessage += `\n• ${client.client_name}`;
                }
              });
              
              if (failedClients.length > 5) {
                successMessage += `\n• 외 ${failedClients.length - 5}명`;
              }
              
              successMessage += `\n\n💡 오류 상세는 관리자가 확인합니다.`;
            }
          } else {
            successMessage += `\n\n💡 실패 상세는 관리자에게 문의하세요.`;
          }
        }
        
        successMessage += `\n📊 총 대상: ${result.data.total_count}명`;
        
        alert(successMessage);
        
        setSendResult({
          success: true,
          message: `발송 완료! ${result.data.sent_count}명에게 전송되었습니다.${result.data.failed_count > 0 ? ` (실패: ${result.data.failed_count}명)` : ''}`
        });
        // 성공 시 메시지 초기화
        setMessage("");
      } else {
        const errorMessage = `❌ 발송 실패\n\n오류: ${result.error || '발송 중 오류가 발생했습니다.'}`;
        alert(errorMessage);
        
        setSendResult({
          success: false,
          message: result.error || '발송 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error('SMS 발송 오류:', error);
      const errorMessage = `❌ 네트워크 오류\n\n${error instanceof SMSAPIError ? error.message : '네트워크 연결을 확인해주세요.'}`;
      alert(errorMessage);
      
      setSendResult({
        success: false,
        message: error instanceof SMSAPIError ? error.message : '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setIsSending(false);
      // 5초 후 결과 메시지 자동 숨김
      setTimeout(() => setSendResult(null), 5000);
    }
  };

  const sampleClient = selectedClients[0] || { name: "고객명", phone: "010-1234-5678" };
  const galleryName = user?.gallery?.name || "갤러리명";
  const galleryPhone = user?.gallery?.phone || "연락처";

  const getPreviewMessage = () => {
    const renderedMessage = message
      .replace(/{{고객명}}/g, sampleClient.name || "고객명")
      .replace(/{{갤러리명}}/g, galleryName)
      .replace(/{{갤러리_연락처}}/g, galleryPhone);
    
    // 실제 수신 시 통신사에서 자동으로 붙이는 국제발신 표시
    return `[국제발신]\n${renderedMessage}`;
  };

  return (
    <Card className="p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold">2. 메시지 작성</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="hover:bg-brand-lightGray active:scale-95 transition-transform touch-manipulation"
        >
          <Eye className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{showPreview ? "편집 모드" : "미리보기"}</span>
          <span className="sm:hidden">{showPreview ? "편집" : "미리보기"}</span>
        </Button>
      </div>

      <div className="mb-3">
        <div className="inline-block bg-brand-blue/10 text-brand-blue py-2 px-4 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:bg-brand-blue/15">
          🏢 {galleryName} ({user?.first_name} {user?.last_name})
        </div>
      </div>

      {showPreview ? (
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">{sampleClient.name}</span>
              <span className="text-sm text-gray-500">{sampleClient.phone}</span>
            </div>
            <div className="bg-white p-3 rounded-md border-l-4 border-l-brand-blue">
              <p className="text-sm whitespace-pre-wrap">
                {getPreviewMessage() || "메시지를 입력하세요..."}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            * {selectedClients.length}명의 고객에게 개인화되어 발송됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            ref={messageTextareaRef}
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow min-h-[150px] md:min-h-[200px] resize-none touch-manipulation"
            maxLength={1000}
            onKeyDown={(e) => {
              // Ctrl/Cmd + Enter: 발송 (사용 가능할 때)
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSendMessage && message.length <= 1000) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setMessage(message + "{{고객명}}")}
              className="hover:bg-brand-blue/5 hover:border-brand-blue transition-colors duration-200 text-xs"
            >
              📝 고객명 삽입
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const template = `[{{갤러리명}}] 안녕하세요 {{고객명}}님,\n\n[메시지 내용을 여기에 입력하세요]\n\n※{{갤러리명}} 공식 발송입니다\n연락처: {{갤러리_연락처}}`;
                setMessage(template);
              }}
              className="hover:bg-green-50 hover:border-green-500 border-green-200 text-green-700 transition-colors duration-200 text-xs"
            >
              📋 기본 템플릿
            </Button>
          </div>
        </div>
      )}

      <div className={`p-3 rounded-md mb-3 mt-3 ${
        message.length > 1000 
          ? 'bg-red-50 border border-red-200' 
          : message.length > 800 
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${
            message.length > 1000 
              ? 'text-red-600' 
              : message.length > 800 
              ? 'text-yellow-600'
              : 'text-gray-600'
          }`}>
            메시지 길이: {message.length}자 (최대 1000자)
          </p>
          {message.length > 1000 && (
            <span className="text-xs text-red-500 font-medium">
              ⚠️ 최대 길이 초과
            </span>
          )}
        </div>
        {message.length > 800 && message.length <= 1000 && (
          <p className="text-xs text-yellow-600 mt-1">
            남은 자수: {1000 - message.length}자
          </p>
        )}
      </div>

      {/* 발송 결과 표시 */}
      {sendResult && (
        <div className={`p-3 rounded-md mb-4 ${
          sendResult.success 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        } animate-fade-in`}>
          <p className="text-sm font-medium">
            {sendResult.success ? '✅ ' : '❌ '}{sendResult.message}
          </p>
        </div>
      )}

      <Button
        onClick={handleSendMessage}
        disabled={!canSendMessage || message.length > 1000}
        className={`w-full py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-200 ${
          !canSendMessage || message.length > 1000
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-lg active:scale-[0.98] bg-brand-blue hover:bg-brand-blue/90'
        } touch-manipulation`}
        size="lg"
      >
        {isSending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
            발송 중...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {message.length > 1000
              ? '메시지 길이를 줄여주세요'
              : !canSendMessage 
                ? (sendableCount === 0 
                    ? '발송 가능한 고객이 없습니다' 
                    : '메시지를 입력하세요'
                  )
                : `${sendableCount}명에게 메시지 발송하기`
            }
          </>
        )}
      </Button>
    </Card>
  );
};

const SendMessageInterface: React.FC = () => {
  const isMobile = useIsMobile();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 고객 데이터 가져오기
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("고객 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleIndividualSelect = (selected: any[]) => {
    setSelectedClients(selected);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메시지 발송</h1>
          <p className="text-sm text-gray-500 mt-1">태그로 빠르게 선택하고, 체크박스로 정밀하게 조정하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <CustomerFilter
          selectedCount={selectedClients.length}
          onApplyFilters={() => {}} // 더 이상 사용하지 않음
          onIndividualSelect={handleIndividualSelect}
          clients={clients}
          filteredClients={[]} // 더 이상 사용하지 않음
          selectedClients={selectedClients}
          loading={loading}
        />
        <MessageComposer 
          selectedClients={selectedClients}
        />
      </div>
    </div>
  );
};

export default SendMessageInterface;

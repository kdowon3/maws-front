import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Filter, Users, Eye, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { getClients, getAllTags } from "@/utils/api";

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["vip"]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableArtists, setAvailableArtists] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFilter = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const toggleArtist = (value: string) => {
    setSelectedArtists((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const toggleTag = (value: string) => {
    setSelectedTags((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  // 개별 고객 선택/해제
  const toggleClientSelection = (client: any) => {
    const isSelected = selectedClients.some((c) => c.id === client.id);
    if (isSelected) {
      onIndividualSelect(selectedClients.filter((c) => c.id !== client.id));
    } else {
      onIndividualSelect([...selectedClients, client]);
    }
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      onIndividualSelect([]);
    } else {
      onIndividualSelect([...clients]);
    }
  };

  // 검색된 고객 목록
  const searchedClients = clients.filter((client) => {
    const name = client.name || "";
    const phone = client.phone || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)
    );
  });

  // 작가 목록 추출
  useEffect(() => {
    if (clients && clients.length > 0) {
      const artists = new Set<string>();
      clients.forEach((client) => {
        // 작가 정보가 있는 경우 (예: data.artist, data.관심작가 등)
        if (client.data?.artist) {
          artists.add(client.data.artist);
        }
        if (client.data?.관심작가) {
          artists.add(client.data.관심작가);
        }
      });
      setAvailableArtists(Array.from(artists));
    }
  }, [clients]);

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

  const handleApplyFilters = () => {
    if (!clients) return;

    let filteredClients = [...clients];

    // 필터 적용
    if (selectedFilters.includes("vip")) {
      filteredClients = filteredClients.filter(
        (client) =>
          client.data?.vip === true ||
          client.data?.VIP === true ||
          client.data?.등급 === "VIP",
      );
    }

    if (selectedFilters.includes("regular")) {
      filteredClients = filteredClients.filter(
        (client) =>
          client.data?.단골 === true ||
          client.data?.regular === true ||
          client.data?.등급 === "단골",
      );
    }

    if (selectedFilters.includes("purchaseHistory")) {
      filteredClients = filteredClients.filter(
        (client) =>
          client.data?.구매이력 === true ||
          client.data?.purchase_history === true,
      );
    }

    if (selectedFilters.includes("recentVisit")) {
      // 최근 방문 필터 (예: 30일 이내)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredClients = filteredClients.filter((client) => {
        if (client.data?.최근방문) {
          const visitDate = new Date(client.data.최근방문);
          return visitDate > thirtyDaysAgo;
        }
        return false;
      });
    }

    if (selectedFilters.includes("birthday")) {
      // 생일 필터 (이번 달 생일)
      const currentMonth = new Date().getMonth() + 1;
      filteredClients = filteredClients.filter((client) => {
        if (client.data?.생일) {
          const birthday = new Date(client.data.생일);
          return birthday.getMonth() + 1 === currentMonth;
        }
        return false;
      });
    }

    // 작가별 필터
    if (selectedArtists.length > 0) {
      filteredClients = filteredClients.filter((client) => {
        return selectedArtists.some(
          (artist) =>
            client.data?.artist === artist || client.data?.관심작가 === artist,
        );
      });
    }

    // 태그별 필터
    if (selectedTags.length > 0) {
      filteredClients = filteredClients.filter((client) => {
        if (!client.tags || client.tags.length === 0) return false;
        return selectedTags.some((tag) => client.tags.includes(tag));
      });
    }

    onApplyFilters(filteredClients);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">
        1. 고객 선택{" "}
        <span className="text-brand-blue">{selectedCount}명 선택됨</span>
      </h2>

      <Tabs defaultValue="filters" className="mb-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="filters">필터로 선택</TabsTrigger>
          <TabsTrigger value="individual">개별 선택</TabsTrigger>
        </TabsList>
        <TabsContent value="filters" className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">기본 필터</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  selectedFilters.includes("vip") ? "default" : "outline"
                }
                onClick={() => toggleFilter("vip")}
                size="sm"
                className={
                  selectedFilters.includes("vip")
                    ? "bg-brand-blue hover:bg-brand-blue/90"
                    : "hover:bg-brand-lightGray"
                }
              >
                VIP 고객
              </Button>
              <Button
                variant={
                  selectedFilters.includes("regular") ? "default" : "outline"
                }
                onClick={() => toggleFilter("regular")}
                size="sm"
                className={
                  selectedFilters.includes("regular")
                    ? "bg-brand-blue hover:bg-brand-blue/90"
                    : "hover:bg-brand-lightGray"
                }
              >
                단골 고객
              </Button>
              <Button
                variant={
                  selectedFilters.includes("purchaseHistory")
                    ? "default"
                    : "outline"
                }
                onClick={() => toggleFilter("purchaseHistory")}
                size="sm"
                className={
                  selectedFilters.includes("purchaseHistory")
                    ? "bg-brand-blue hover:bg-brand-blue/90"
                    : "hover:bg-brand-lightGray"
                }
              >
                구매 이력
              </Button>
              <Button
                variant={
                  selectedFilters.includes("recentVisit")
                    ? "default"
                    : "outline"
                }
                onClick={() => toggleFilter("recentVisit")}
                size="sm"
                className={
                  selectedFilters.includes("recentVisit")
                    ? "bg-brand-blue hover:bg-brand-blue/90"
                    : "hover:bg-brand-lightGray"
                }
              >
                최근 방문
              </Button>
              <Button
                variant={
                  selectedFilters.includes("birthday") ? "default" : "outline"
                }
                onClick={() => toggleFilter("birthday")}
                size="sm"
                className={
                  selectedFilters.includes("birthday")
                    ? "bg-brand-blue hover:bg-brand-blue/90"
                    : "hover:bg-brand-lightGray"
                }
              >
                생일
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">
              관심 작가별
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                작가 목록 로딩 중...
              </div>
            ) : availableArtists.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableArtists.map((artist) => (
                  <Button
                    key={artist}
                    variant={
                      selectedArtists.includes(artist) ? "default" : "outline"
                    }
                    onClick={() => toggleArtist(artist)}
                    size="sm"
                    className={
                      selectedArtists.includes(artist)
                        ? "bg-brand-blue hover:bg-brand-blue/90"
                        : "hover:bg-brand-lightGray"
                    }
                  >
                    {artist}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                등록된 작가 정보가 없습니다.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">태그별</p>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                태그 목록 로딩 중...
              </div>
            ) : availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    onClick={() => toggleTag(tag)}
                    size="sm"
                    className={
                      selectedTags.includes(tag)
                        ? "bg-brand-blue hover:bg-brand-blue/90"
                        : "hover:bg-brand-lightGray"
                    }
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">등록된 태그가 없습니다.</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">고급 필터</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="300만원 이상" />
              <Input placeholder="최근 90일" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="individual" className="space-y-4">
          {/* 검색 바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
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
                  selectedClients.length === clients.length &&
                  clients.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                전체 선택 ({clients.length}명)
              </label>
            </div>
            <span className="text-sm text-gray-500">
              {selectedClients.length}명 선택됨
            </span>
          </div>

          {/* 고객 목록 */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">고객 목록 로딩 중...</span>
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
                    className={`flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                      isSelected
                        ? "bg-brand-blue/5 border-brand-blue"
                        : "border-gray-200"
                    } ${!canReceiveMessage ? "opacity-60" : ""}`}
                    onClick={() => toggleClientSelection(client)}
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
                        <p className="text-xs text-red-500">
                          {!hasPhone ? "연락처 없음" : "수신 거부"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {canReceiveMessage ? (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        className="w-full mt-4 bg-brand-blue hover:bg-brand-blue/90"
        onClick={handleApplyFilters}
      >
        필터 적용하기
      </Button>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-blue"></span>
            <span className="text-sm">선택된 고객: {selectedCount}명</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm">
              문자 수신 동의:{" "}
              {
                filteredClients.filter(
                  (client) =>
                    client.data?.문자수신동의 !== false && client.phone,
                ).length
              }
              명
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="text-sm">
              문자 수신 거부:{" "}
              {
                filteredClients.filter(
                  (client) => client.data?.문자수신동의 === false,
                ).length
              }
              명
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm">
              연락처 없음:{" "}
              {filteredClients.filter((client) => !client.phone).length}명
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const MessageComposer: React.FC = () => {
  const [message, setMessage] = useState("");

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4">2. 메시지 작성</h2>

      <div className="mb-3">
        <div className="inline-block bg-brand-blue/10 text-brand-blue py-1 px-3 rounded-full text-sm font-medium">
          푸른 호수 (김민수)
        </div>
      </div>

      <Textarea
        placeholder="메시지를 입력하세요..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow min-h-[200px] mb-2"
      />

      <div className="bg-gray-50 p-3 rounded-md mb-3">
        <p className="text-sm text-gray-600">
          메시지 길이: {message.length}자 (최대 1000자)
        </p>
      </div>

      <Button className="w-full bg-brand-blue hover:bg-brand-blue/90">
        <Send className="mr-2 h-4 w-4" />
        메시지 발송하기
      </Button>
    </Card>
  );
};

const SendMessageInterface: React.FC = () => {
  const isMobile = useIsMobile();
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectionMode, setSelectionMode] = useState<"filter" | "individual">(
    "filter",
  );

  // 고객 데이터 가져오기
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClients();
        setClients(data);
        setFilteredClients(data);
        setSelectedCount(data.length);
      } catch (error) {
        console.error("고객 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleApplyFilters = (filtered: any[]) => {
    setFilteredClients(filtered);
    setSelectedCount(filtered.length);
    setSelectionMode("filter");
  };

  const handleIndividualSelect = (selected: any[]) => {
    setSelectedClients(selected);
    setSelectedCount(selected.length);
    setSelectionMode("individual");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">메시지 발송</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="hover:bg-brand-lightGray">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
          <Button variant="outline" className="hover:bg-brand-lightGray">
            <Users className="mr-2 h-4 w-4" />
            고객 목록
          </Button>
          <Button variant="outline" className="hover:bg-brand-lightGray">
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerFilter
          selectedCount={selectedCount}
          onApplyFilters={handleApplyFilters}
          onIndividualSelect={handleIndividualSelect}
          clients={clients}
          filteredClients={filteredClients}
          selectedClients={selectedClients}
          loading={loading}
        />
        <MessageComposer />
      </div>
    </div>
  );
};

export default SendMessageInterface;

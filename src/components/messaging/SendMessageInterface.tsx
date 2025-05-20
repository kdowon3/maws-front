
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Filter, Users, Eye } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-mobile";

interface CustomerFilterProps {
  selectedCount: number;
  onApplyFilters: () => void;
}

const CustomerFilter: React.FC<CustomerFilterProps> = ({
  selectedCount,
  onApplyFilters,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["vip"]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>(["김민수"]);

  const toggleFilter = (value: string) => {
    setSelectedFilters(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  const toggleArtist = (value: string) => {
    setSelectedArtists(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">
        1. 고객 선택 <span className="text-[#6C4AD1]">{selectedCount}명 선택됨</span>
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
                variant={selectedFilters.includes("vip") ? "default" : "outline"} 
                onClick={() => toggleFilter("vip")}
                className={selectedFilters.includes("vip") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                VIP 고객
              </Button>
              <Button 
                variant={selectedFilters.includes("regular") ? "default" : "outline"} 
                onClick={() => toggleFilter("regular")}
                className={selectedFilters.includes("regular") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                단골 고객
              </Button>
              <Button 
                variant={selectedFilters.includes("purchaseHistory") ? "default" : "outline"} 
                onClick={() => toggleFilter("purchaseHistory")}
                className={selectedFilters.includes("purchaseHistory") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                구매 이력
              </Button>
              <Button 
                variant={selectedFilters.includes("recentVisit") ? "default" : "outline"} 
                onClick={() => toggleFilter("recentVisit")}
                className={selectedFilters.includes("recentVisit") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                최근 방문
              </Button>
              <Button 
                variant={selectedFilters.includes("birthday") ? "default" : "outline"} 
                onClick={() => toggleFilter("birthday")}
                className={selectedFilters.includes("birthday") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                생일
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">관심 작가별</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedArtists.includes("김민수") ? "default" : "outline"} 
                onClick={() => toggleArtist("김민수")}
                className={selectedArtists.includes("김민수") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                김민수
              </Button>
              <Button 
                variant={selectedArtists.includes("이하늘") ? "default" : "outline"} 
                onClick={() => toggleArtist("이하늘")}
                className={selectedArtists.includes("이하늘") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                이하늘
              </Button>
              <Button 
                variant={selectedArtists.includes("박지원") ? "default" : "outline"} 
                onClick={() => toggleArtist("박지원")}
                className={selectedArtists.includes("박지원") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                박지원
              </Button>
              <Button 
                variant={selectedArtists.includes("정예은") ? "default" : "outline"} 
                onClick={() => toggleArtist("정예은")}
                className={selectedArtists.includes("정예은") ? "bg-[#6C4AD1] hover:bg-[#5C3AC1]" : ""}
                size="sm"
              >
                정예은
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">고급 필터</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="300만원 이상" />
              <Input placeholder="최근 90일" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="individual">
          <p className="text-sm text-gray-500">
            이 탭에서는 고객을 개별적으로 선택할 수 있습니다.
          </p>
          {/* 개별 선택 UI는 여기에 구현 */}
        </TabsContent>
      </Tabs>
      
      <Button 
        className="w-full mt-4 bg-[#6C4AD1] hover:bg-[#5C3AC1]"
        onClick={onApplyFilters}
      >
        필터 적용하기
      </Button>
      
      <div className="mt-auto pt-4 border-t border-gray-200 mt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#6C4AD1]"></span>
            <span className="text-sm">선택된 고객: 32명</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm">문자 수신 동의: 30명</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="text-sm">문자 수신 거부: 2명</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageComposer: React.FC = () => {
  const [message, setMessage] = useState("");
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">2. 메시지 작성</h2>
      
      <div className="mb-3">
        <div className="inline-block bg-[#F0EBF8] text-[#6C4AD1] py-1 px-3 rounded-full text-sm font-medium">
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
        <p className="text-sm text-gray-600 mb-2">개인화 태그:</p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-[#F0EBF8] text-[#6C4AD1] px-2 py-1 rounded text-xs">
            {"{고객명}"}
          </span>
          <span className="bg-[#F0EBF8] text-[#6C4AD1] px-2 py-1 rounded text-xs">
            {"{작품명}"}
          </span>
          <span className="bg-[#F0EBF8] text-[#6C4AD1] px-2 py-1 rounded text-xs">
            {"{작가명}"}
          </span>
          <span className="bg-[#F0EBF8] text-[#6C4AD1] px-2 py-1 rounded text-xs">
            {"{전시명}"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="text-sm text-gray-500">
          {message.length} / 1000자
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            미리보기
          </Button>
          <Button className="bg-[#6C4AD1] hover:bg-[#5C3AC1]">
            <Send className="w-4 h-4 mr-1" />
            발송하기
          </Button>
        </div>
      </div>
    </div>
  );
};

const SendMessageInterface: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedCount, setSelectedCount] = useState(32);
  
  const handleApplyFilters = () => {
    // 실제로는 여기서 선택된 필터에 따라 고객 수를 업데이트할 것입니다
    console.log("Filters applied");
  };
  
  if (isMobile) {
    return (
      <div className="bg-white p-4 min-h-[calc(100vh-64px)]">
        <h1 className="text-xl font-bold mb-4">메시지 발송</h1>
        
        <Card className="mb-4 p-4 bg-[#F8F8F8]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-4">
                <Filter className="w-4 h-4 mr-2" />
                고객 선택 ({selectedCount}명)
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:max-w-md overflow-y-auto">
              <CustomerFilter
                selectedCount={selectedCount}
                onApplyFilters={handleApplyFilters}
              />
            </SheetContent>
          </Sheet>
          
          <MessageComposer />
        </Card>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">메시지 발송</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F8F8F8] p-6 rounded-lg">
            <CustomerFilter
              selectedCount={selectedCount}
              onApplyFilters={handleApplyFilters}
            />
          </div>
          
          <div className="bg-[#F8F8F8] p-6 rounded-lg">
            <MessageComposer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessageInterface;

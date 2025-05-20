import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Filter, Users, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerFilterProps {
    selectedCount: number;
    onApplyFilters: () => void;
}

const CustomerFilter: React.FC<CustomerFilterProps> = ({ selectedCount, onApplyFilters }) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['vip']);
    const [selectedArtists, setSelectedArtists] = useState<string[]>(['김민수']);

    const toggleFilter = (value: string) => {
        setSelectedFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    };

    const toggleArtist = (value: string) => {
        setSelectedArtists((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    };

    return (
        <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">
                1. 고객 선택 <span className="text-brand-blue">{selectedCount}명 선택됨</span>
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
                                variant={selectedFilters.includes('vip') ? 'default' : 'outline'}
                                onClick={() => toggleFilter('vip')}
                                size="sm"
                                className={
                                    selectedFilters.includes('vip')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                VIP 고객
                            </Button>
                            <Button
                                variant={selectedFilters.includes('regular') ? 'default' : 'outline'}
                                onClick={() => toggleFilter('regular')}
                                size="sm"
                                className={
                                    selectedFilters.includes('regular')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                단골 고객
                            </Button>
                            <Button
                                variant={selectedFilters.includes('purchaseHistory') ? 'default' : 'outline'}
                                onClick={() => toggleFilter('purchaseHistory')}
                                size="sm"
                                className={
                                    selectedFilters.includes('purchaseHistory')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                구매 이력
                            </Button>
                            <Button
                                variant={selectedFilters.includes('recentVisit') ? 'default' : 'outline'}
                                onClick={() => toggleFilter('recentVisit')}
                                size="sm"
                                className={
                                    selectedFilters.includes('recentVisit')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                최근 방문
                            </Button>
                            <Button
                                variant={selectedFilters.includes('birthday') ? 'default' : 'outline'}
                                onClick={() => toggleFilter('birthday')}
                                size="sm"
                                className={
                                    selectedFilters.includes('birthday')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                생일
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">관심 작가별</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={selectedArtists.includes('김민수') ? 'default' : 'outline'}
                                onClick={() => toggleArtist('김민수')}
                                size="sm"
                                className={
                                    selectedArtists.includes('김민수')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                김민수
                            </Button>
                            <Button
                                variant={selectedArtists.includes('이하늘') ? 'default' : 'outline'}
                                onClick={() => toggleArtist('이하늘')}
                                size="sm"
                                className={
                                    selectedArtists.includes('이하늘')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                이하늘
                            </Button>
                            <Button
                                variant={selectedArtists.includes('박지원') ? 'default' : 'outline'}
                                onClick={() => toggleArtist('박지원')}
                                size="sm"
                                className={
                                    selectedArtists.includes('박지원')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
                            >
                                박지원
                            </Button>
                            <Button
                                variant={selectedArtists.includes('정예은') ? 'default' : 'outline'}
                                onClick={() => toggleArtist('정예은')}
                                size="sm"
                                className={
                                    selectedArtists.includes('정예은')
                                        ? 'bg-brand-blue hover:bg-brand-blue/90'
                                        : 'hover:bg-brand-lightGray'
                                }
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
                    <p className="text-sm text-gray-500">이 탭에서는 고객을 개별적으로 선택할 수 있습니다.</p>
                </TabsContent>
            </Tabs>

            <Button className="w-full mt-4 bg-brand-blue hover:bg-brand-blue/90" onClick={onApplyFilters}>
                필터 적용하기
            </Button>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-brand-blue"></span>
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
        </Card>
    );
};

const MessageComposer: React.FC = () => {
    const [message, setMessage] = useState('');

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
                <p className="text-sm text-gray-600">메시지 길이: {message.length}자 (최대 1000자)</p>
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
    const [selectedCount, setSelectedCount] = useState(32);

    const handleApplyFilters = () => {
        // 필터 적용 로직
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
                <CustomerFilter selectedCount={selectedCount} onApplyFilters={handleApplyFilters} />
                <MessageComposer />
            </div>
        </div>
    );
};

export default SendMessageInterface;

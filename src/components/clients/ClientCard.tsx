
import React from "react";
import { MessageSquare, FileText, Edit, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  favoriteArtists: string[];
  status: string[];
  registrationDate: string;
}

interface ClientCardProps {
  client: Client;
  onAction: (actionType: string, clientId: number) => void;
}

// 상태별 배지 스타일 정의
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "VIP":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "구매자":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "장기고객":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "신규고객":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

// 최근 방문일 포맷팅 유틸 함수
const formatLastVisit = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`;
  } else {
    return format(date, "yyyy년 MM월 dd일", { locale: ko });
  }
};

const formatDate = (dateString: string, formatStr = "yyyy년 MM월 dd일") => {
  return dateString ? format(new Date(dateString), formatStr, { locale: ko }) : "-";
};

const ClientCard: React.FC<ClientCardProps> = ({ client, onAction }) => {
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-lg">{client.name}</h3>
              <p className="text-sm text-gray-500">{client.phone}</p>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {client.status.map(status => (
                <Badge key={status} className={`text-xs ${getStatusBadgeVariant(status)}`}>
                  {status === "VIP" && <Star size={12} className="mr-1" />}
                  {status}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">이메일</span>
              <span>{client.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">최근 방문</span>
              <span>{formatLastVisit(client.lastVisit)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">등록일</span>
              <span>{formatDate(client.registrationDate)}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">관심 작가</p>
            <div className="flex flex-wrap gap-1">
              {client.favoriteArtists.map(artist => (
                <Badge key={artist} variant="outline" className="text-xs">
                  {artist}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 p-2 bg-gray-50 flex justify-around">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onAction("message", client.id)}
            className="flex-1 py-2"
          >
            <MessageSquare size={16} className="mr-1" />
            메시지
          </Button>
          <div className="w-px h-8 bg-gray-200 my-auto"></div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onAction("warranty", client.id)}
            className="flex-1 py-2"
          >
            <FileText size={16} className="mr-1" />
            보증서
          </Button>
          <div className="w-px h-8 bg-gray-200 my-auto"></div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onAction("edit", client.id)}
            className="flex-1 py-2"
          >
            <Edit size={16} className="mr-1" />
            편집
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;

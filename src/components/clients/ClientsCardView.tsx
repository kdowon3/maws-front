
import React from "react";
import { MessageSquare, FileText, Edit, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/data/clientsData";
import { formatDate, formatLastVisit } from "@/utils/dateUtils";
import { getStatusBadgeVariant } from "@/utils/clientUtils";

interface ClientsCardViewProps {
  clients: Client[];
  handleClientAction: (actionType: string, clientId: number) => void;
}

const ClientsCardView: React.FC<ClientsCardViewProps> = ({ clients, handleClientAction }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map((client) => (
            <Card key={client.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
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
                    onClick={() => handleClientAction("message", client.id)}
                    className="flex-1 py-2"
                  >
                    <MessageSquare size={16} className="mr-1" />
                    메시지
                  </Button>
                  <div className="w-px h-8 bg-gray-200 my-auto"></div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleClientAction("warranty", client.id)}
                    className="flex-1 py-2"
                  >
                    <FileText size={16} className="mr-1" />
                    보증서
                  </Button>
                  <div className="w-px h-8 bg-gray-200 my-auto"></div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleClientAction("edit", client.id)}
                    className="flex-1 py-2"
                  >
                    <Edit size={16} className="mr-1" />
                    편집
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsCardView;

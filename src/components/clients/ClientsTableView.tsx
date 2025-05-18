
import React from "react";
import { MessageSquare, FileText, Edit, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/data/clientsData";
import { formatDate, formatLastVisit } from "@/utils/dateUtils";
import { getStatusBadgeVariant } from "@/utils/clientUtils";

interface ClientsTableViewProps {
  clients: Client[];
  handleClientAction: (actionType: string, clientId: number) => void;
}

const ClientsTableView: React.FC<ClientsTableViewProps> = ({ clients, handleClientAction }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>고객명</TableHead>
          <TableHead>연락처</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>최근 방문</TableHead>
          <TableHead>관심 작가</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>등록일</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.length > 0 ? (
          clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{formatLastVisit(client.lastVisit)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.favoriteArtists.map(artist => (
                    <Badge key={artist} variant="outline" className="text-xs">
                      {artist}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.status.map(status => (
                    <Badge key={status} className={`text-xs ${getStatusBadgeVariant(status)}`}>
                      {status === "VIP" && <Star size={12} className="mr-1" />}
                      {status}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatDate(client.registrationDate)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleClientAction("message", client.id)}
                    title="메시지 발송"
                  >
                    <MessageSquare size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleClientAction("warranty", client.id)}
                    title="보증서"
                  >
                    <FileText size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleClientAction("edit", client.id)}
                    title="고객 정보 편집"
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              검색 결과가 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ClientsTableView;

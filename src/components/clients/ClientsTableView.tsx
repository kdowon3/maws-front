import React from 'react';
import { MessageSquare, FileText, Edit, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Client } from '@/data/clientsData';
import { formatDate, formatLastVisit } from '@/utils/dateUtils';
import { getStatusBadgeVariant } from '@/utils/clientUtils';

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
                    <TableHead>주소</TableHead>
                    <TableHead>구매작가명</TableHead>
                    <TableHead>관심작가명</TableHead>
                    <TableHead>특이사항</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>{client.address}</TableCell>
                            <TableCell>{client.buyArtist}</TableCell>
                            <TableCell>{client.favoriteArtist}</TableCell>
                            <TableCell>{client.note}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleClientAction('message', client.id)}
                                        title="메시지 발송"
                                    >
                                        <MessageSquare size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleClientAction('warranty', client.id)}
                                        title="보증서"
                                    >
                                        <FileText size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleClientAction('edit', client.id)}
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
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            검색 결과가 없습니다.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default ClientsTableView;

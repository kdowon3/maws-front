import React from 'react';
import { MessageSquare, FileText, Edit, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatLastVisit } from '@/utils/dateUtils';
import { getStatusBadgeVariant } from '@/utils/clientUtils';
import type { DynamicClient } from '@/types/clients';

interface ClientsTableViewProps {
    clients: DynamicClient[];
    handleClientAction: (actionType: string, clientId: number | string) => void;
    artworks: DynamicClient[];
}

const ClientsTableView: React.FC<ClientsTableViewProps> = ({ clients, handleClientAction, artworks }) => {
    // 고객별 구매작가명 추출 함수
    const getPurchasedArtists = (clientId: string | number | boolean | any[]) => {
        return Array.from(
            new Set(
                (artworks || [])
                    .filter((artwork) => artwork.buyer === clientId)
                    .map((artwork) => artwork.artist)
                    .filter(Boolean)
            )
        );
    };
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>고객명</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>주소</TableHead>
                    <TableHead>구매작가명</TableHead>
                    <TableHead>특이사항</TableHead>
                    <TableHead className="text-center">작업</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <TableRow key={String(client.id)}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>{client.address}</TableCell>
                            <TableCell>{getPurchasedArtists(client.id).join(', ') || '없음'}</TableCell>
                            <TableCell>{client.note}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleClientAction(
                                                'message',
                                                typeof client.id === 'string' || typeof client.id === 'number'
                                                    ? client.id
                                                    : String(client.id)
                                            )
                                        }
                                        title="메시지 발송"
                                    >
                                        <MessageSquare size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleClientAction(
                                                'edit',
                                                typeof client.id === 'string' || typeof client.id === 'number'
                                                    ? client.id
                                                    : String(client.id)
                                            )
                                        }
                                        title="고객 정보 편집"
                                    >
                                        <Edit size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleClientAction(
                                                'delete',
                                                typeof client.id === 'string' || typeof client.id === 'number'
                                                    ? client.id
                                                    : String(client.id)
                                            )
                                        }
                                        title="고객 삭제"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            검색 결과가 없습니다.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default ClientsTableView;

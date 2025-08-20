import React, { useMemo } from 'react';
import { Pencil, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table';
import { formatCurrency } from '@/utils/currencyUtils';

interface ArtworksTableProps {
    artworks: any[];
    handleArtworkAction: (actionType: 'edit' | 'delete' | 'certificate', artwork: any) => void;
}

const ArtworksTable: React.FC<ArtworksTableProps> = ({ artworks, handleArtworkAction }) => {
    // 컬럼 정의
    const columns = useMemo(
        () => [
            {
                accessorKey: 'image',
                header: '이미지',
                cell: ({ row }: any) => {
                    const artwork = row.original;
                    return (
                        <div className="w-[80px]">
                            {artwork.image ? (
                                <img
                                    src={artwork.image}
                                    alt={artwork.title_ko || artwork.title_en}
                                    width={60}
                                    height={60}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                />
                            ) : (
                                <span className="text-gray-400">-</span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'title',
                header: '작품명',
                cell: ({ row }: any) => {
                    const artwork = row.original;
                    return <div className="w-[160px] font-medium">{artwork.title_ko || artwork.title_en || '-'}</div>;
                },
            },
            {
                accessorKey: 'artist',
                header: '작가명',
                cell: ({ row }: any) => {
                    const artwork = row.original;
                    const { artist_ko, artist_en } = artwork;
                    return <div className="w-[120px]">{artist_ko || artist_en || '-'}</div>;
                },
            },
            {
                accessorKey: 'year',
                header: '제작 연도',
                cell: ({ row }: any) => row.original.year || '-',
            },
            {
                accessorKey: 'size',
                header: '크기',
                cell: ({ row }: any) => {
                    const artwork = row.original;
                    const width = artwork.width !== undefined && artwork.width !== null ? artwork.width : null;
                    const height = artwork.height !== undefined && artwork.height !== null ? artwork.height : null;
                    const depth = artwork.depth !== undefined && artwork.depth !== null ? artwork.depth : null;
                    const size_unit = artwork.size_unit || 'cm';

                    if (width && height) {
                        if (depth) {
                            return `${width} × ${height} × ${depth} ${size_unit}`;
                        }
                        return `${width} × ${height} ${size_unit}`;
                    }
                    return '-';
                },
            },
            {
                accessorKey: 'medium',
                header: '재료',
                cell: ({ row }: any) => row.original.medium || '-',
            },
            {
                accessorKey: 'price',
                header: '가격',
                cell: ({ row }: any) => (
                    <div className="text-right font-mono">{formatCurrency(row.original.price)}</div>
                ),
            },
            {
                accessorKey: 'buyer',
                header: '구매자',
                cell: ({ row }: any) => {
                    const artwork = row.original;
                    return (
                        <div>
                            {artwork.buyer_detail?.name ? (
                                <div className="flex flex-col">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        {artwork.buyer_detail.name}
                                    </span>
                                    {artwork.buyer_detail.phone && (
                                        <span className="text-xs text-gray-500 mt-1">{artwork.buyer_detail.phone}</span>
                                    )}
                                </div>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                    미지정
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'actions',
                header: '작업',
                cell: ({ row }: any) => {
                    const artwork = row.original;
                    return (
                        <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleArtworkAction('edit', artwork)}>
                                <Pencil size={18} className="text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleArtworkAction('delete', artwork)}>
                                <Trash2 size={18} className="text-gray-500" />
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.open(`/certificate/${artwork.id}`, '_blank')}
                                            className={
                                                artwork.buyerId && !artwork.hasMissingFields
                                                    ? 'text-[#1A2A68]'
                                                    : 'text-gray-400'
                                            }
                                        >
                                            <div className="relative">
                                                <FileText size={18} className="text-inherit" />
                                                {artwork.hasMissingFields && (
                                                    <AlertCircle
                                                        size={12}
                                                        className="absolute -top-1 -right-1 text-amber-500"
                                                    />
                                                )}
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {!artwork.buyerId
                                            ? '구매자 정보가 필요합니다'
                                            : artwork.hasMissingFields
                                            ? '필수 필드가 누락되었습니다'
                                            : '보증서 발급하기'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                },
            },
        ],
        [handleArtworkAction]
    );

    const table = useReactTable({
        data: artworks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b bg-gray-50">
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left text-sm font-medium text-gray-900"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="border-b hover:bg-gray-50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-4 py-3 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                                        조회된 작품이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-700">
                        총 {table.getFilteredRowModel().rows.length}개 중{' '}
                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        개
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        이전
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        다음
                    </Button>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            table.setPageSize(Number(e.target.value));
                        }}
                        className="border rounded px-2 py-1"
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ArtworksTable;

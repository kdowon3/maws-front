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
                                <span className="text-gray-400">-</span>
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
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleArtworkAction('edit', artwork)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>수정</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleArtworkAction('delete', artwork)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>삭제</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleArtworkAction('certificate', artwork)}
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>보증서</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                },
            },
        ],
        [handleArtworkAction]
    );

    // TanStack Table 설정
    const table = useReactTable({
        data: artworks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    });

    return (
        <div className="overflow-hidden">
            <table className="w-full">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b">
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="h-12 px-3 text-left align-middle font-semibold text-gray-800 bg-gray-50"
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b transition-colors hover:bg-gray-50/80">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-3 py-3 align-middle">
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

            {/* TanStack Table 내장 페이지네이션 */}
            <div className="flex items-center justify-between px-3 py-4">
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        이전
                    </button>
                    <span className="text-sm text-gray-600">
                        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </span>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        다음
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">페이지당 행:</span>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            table.setPageSize(Number(e.target.value));
                        }}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
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

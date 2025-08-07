import React, { useState, useRef } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLUMN_TYPES = [
    { value: 'text', label: '텍스트' },
    { value: 'number', label: '숫자' },
    { value: 'date', label: '날짜' },
    { value: 'checkbox', label: '체크박스' },
];

interface Column {
    id: string;
    name: string;
    type: string;
}
interface Row {
    id: string;
    [colId: string]: any;
}
function uuid() {
    return Math.random().toString(36).slice(2, 10);
}

export default function DynamicTableTest() {
    const [columns, setColumns] = useState<Column[]>([
        { id: 'menu', name: '메뉴명', type: 'text' },
        { id: 'price', name: '금액', type: 'number' },
        { id: 'person1', name: '사람1', type: 'checkbox' },
        { id: 'person2', name: '사람2', type: 'checkbox' },
    ]);
    const [rows, setRows] = useState<Row[]>([{ id: uuid(), menu: '', price: '', person1: false, person2: false }]);
    const [popoverCol, setPopoverCol] = useState<string | null>(null);
    const [editColName, setEditColName] = useState('');
    const [editColType, setEditColType] = useState('text');
    const popoverRef = useRef<HTMLDivElement>(null);

    // 팝오버 외부 클릭 시 닫기
    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopoverCol(null);
            }
        }
        if (popoverCol) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [popoverCol]);

    // 행/열 추가/삭제/수정
    const addColumn = () => {
        const id = uuid();
        setColumns([...columns, { id, name: '새 컬럼', type: 'text' }]);
        setRows(rows.map((row) => ({ ...row, [id]: '' })));
    };
    const addRow = () => {
        const newRow: Row = { id: uuid() };
        columns.forEach((col) => {
            if (col.type === 'checkbox') newRow[col.id] = false;
            else newRow[col.id] = '';
        });
        setRows([...rows, newRow]);
    };
    const removeColumn = (colId: string) => {
        setColumns(columns.filter((col) => col.id !== colId));
        setRows(
            rows.map((row) => {
                const newRow = { ...row };
                delete newRow[colId];
                return newRow;
            })
        );
        setPopoverCol(null);
    };
    const removeRow = (rowId: string) => {
        setRows(rows.filter((row) => row.id !== rowId));
    };
    const setCell = (rowId: string, colId: string, value: any) => {
        setRows(rows.map((row) => (row.id === rowId ? { ...row, [colId]: value } : row)));
    };
    // 컬럼 팝오버 열기
    const openPopover = (col: Column) => {
        setPopoverCol(col.id);
        setEditColName(col.name);
        setEditColType(col.type);
    };
    // 컬럼명/타입 수정
    const saveColEdit = (colId: string) => {
        setColumns(columns.map((col) => (col.id === colId ? { ...col, name: editColName, type: editColType } : col)));
        setRows(
            rows.map((row) => {
                // 타입이 바뀌면 값도 초기화
                if (editColType === 'checkbox') return { ...row, [colId]: false };
                if (editColType === 'number') return { ...row, [colId]: '' };
                if (editColType === 'date') return { ...row, [colId]: '' };
                return row;
            })
        );
        setPopoverCol(null);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex gap-2 mb-4">
                <Button variant="ghost" className="border border-gray-200" onClick={addRow}>
                    + 메뉴(행) 추가
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-16 text-center">삭제</TableHead>
                        {columns.map((col, idx) => (
                            <TableHead
                                key={col.id}
                                className="text-center font-medium text-gray-700 relative group cursor-pointer"
                                onClick={() => openPopover(col)}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    {col.name}
                                    <Edit2 size={14} className="inline ml-1 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                {/* 팝오버 메뉴 */}
                                {popoverCol === col.id && (
                                    <div
                                        ref={popoverRef}
                                        className="absolute z-20 left-1/2 top-full mt-2 -translate-x-1/2 min-w-[180px] bg-white border border-gray-200 rounded shadow p-3 flex flex-col gap-2"
                                    >
                                        <label className="text-xs text-gray-500 mb-1">컬럼명</label>
                                        <input
                                            className="border border-gray-200 rounded px-2 py-1 text-sm mb-2 focus:outline-none focus:border-blue-300"
                                            value={editColName}
                                            onChange={(e) => setEditColName(e.target.value)}
                                        />
                                        <label className="text-xs text-gray-500 mb-1">타입</label>
                                        <select
                                            className="border border-gray-200 rounded px-2 py-1 text-sm mb-2 focus:outline-none focus:border-blue-300"
                                            value={editColType}
                                            onChange={(e) => setEditColType(e.target.value)}
                                        >
                                            {COLUMN_TYPES.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" className="flex-1" onClick={() => saveColEdit(col.id)}>
                                                저장
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => removeColumn(col.id)}
                                            >
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TableHead>
                        ))}
                        {/* + 버튼으로 열 추가 */}
                        <TableHead className="w-12 text-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="p-1 text-blue-500 hover:bg-blue-50"
                                onClick={addColumn}
                                title="열 추가"
                            >
                                <Plus size={18} />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length > 0 ? (
                        rows.map((row) => (
                            <TableRow key={row.id} className="transition-colors hover:bg-muted/50">
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="p-1 text-red-500 hover:bg-red-50"
                                        onClick={() => removeRow(row.id)}
                                        title="행 삭제"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                                {columns.map((col) => (
                                    <TableCell key={col.id} className="text-center align-middle">
                                        {col.type === 'text' && (
                                            <input
                                                value={row[col.id] || ''}
                                                onChange={(e) => setCell(row.id, col.id, e.target.value)}
                                                placeholder={col.name}
                                                className="border border-gray-200 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:border-blue-300"
                                            />
                                        )}
                                        {col.type === 'number' && (
                                            <input
                                                type="number"
                                                value={row[col.id] || ''}
                                                onChange={(e) => setCell(row.id, col.id, e.target.value)}
                                                placeholder={col.name}
                                                className="border border-gray-200 rounded px-2 py-1 w-20 text-sm focus:outline-none focus:border-blue-300"
                                            />
                                        )}
                                        {col.type === 'date' && (
                                            <input
                                                type="date"
                                                value={row[col.id] || ''}
                                                onChange={(e) => setCell(row.id, col.id, e.target.value)}
                                                className="border border-gray-200 rounded px-2 py-1 w-28 text-sm focus:outline-none focus:border-blue-300"
                                            />
                                        )}
                                        {col.type === 'checkbox' && (
                                            <input
                                                type="checkbox"
                                                checked={!!row[col.id]}
                                                onChange={(e) => setCell(row.id, col.id, e.target.checked)}
                                                className="w-5 h-5 accent-blue-500"
                                            />
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                                데이터가 없습니다.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

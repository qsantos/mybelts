import React from 'react';
import { ReactElement, useState } from 'react';
import Table from 'react-bootstrap/Table';

import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

interface SortTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    initialSorting?: SortingState;
}

export default function SortTable<T>(props: SortTableProps<T>): ReactElement {
    const { data, columns, initialSorting } = props;

    const [sorting, setSorting] = useState<SortingState>(initialSorting || []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <>
            <Table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) =>
                                header.isPlaceholder ? null : (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={
                                            header.column.getCanSort()
                                                ? 'cursor-pointer select-none'
                                                : ''
                                        }
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {{
                                            asc: ' 🔼',
                                            desc: ' 🔽',
                                        }[
                                            header.column.getIsSorted() as string
                                        ] ?? null}
                                    </th>
                                )
                            )}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}

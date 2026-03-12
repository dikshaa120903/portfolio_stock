import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

const DataTable = ({ columns, data }) => {
    const [sortConfig, setSortConfig] = useState(null);

    const sortedData = React.useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] shadow-sm backdrop-blur-md">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#0000000a] dark:bg-[#ffffff05] border-b border-[var(--surface-border)] font-medium text-[var(--text-muted)] text-sm">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`py-4 px-6 font-semibold cursor-pointer select-none hover:text-[var(--text-main)] transition-colors ${col.className || ''}`}
                                onClick={() => col.sortable !== false && requestSort(col.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {col.label}
                                    {col.sortable !== false && (
                                        <ArrowUpDown size={14} className="opacity-50 hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)] text-sm">
                    {sortedData.map((item, index) => (
                        <tr
                            key={index}
                            className="hover:bg-[#00000008] dark:hover:bg-[#ffffff03] transition-colors group cursor-pointer"
                        >
                            {columns.map((col) => (
                                <td key={`${index}-${col.key}`} className={`py-4 px-6 text-[var(--text-main)] ${col.cellClassName || ''}`}>
                                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {sortedData.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="py-12 text-center text-[var(--text-muted)]">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;

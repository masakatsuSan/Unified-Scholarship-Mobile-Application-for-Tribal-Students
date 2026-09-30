import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from './Button.tsx';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  mobileKeyInfo?: boolean; // Highlighted on top of mobile card
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  searchableKeys?: (keyof T)[];
  filters?: {
    id: string;
    label: string;
    options: { label: string; value: string }[];
    selected: string;
    onChange: (value: string) => void;
  }[];
  pageSize?: number;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  actionsHeader?: string;
  customRowAction?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  searchPlaceholder = 'Search records...',
  searchableKeys,
  filters,
  pageSize = 10,
  emptyStateMessage = 'No records found',
  emptyStateAction,
  actionsHeader = 'Action',
  customRowAction,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search
  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim() && searchableKeys && searchableKeys.length > 0) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchableKeys.some(key => {
          const val = item[key];
          if (val == null) return false;
          return String(val).toLowerCase().includes(q);
        })
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data, searchTerm, searchableKeys, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-850 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map(f => (
              <div key={f.id} className="relative inline-block">
                <select
                  value={f.selected}
                  onChange={e => {
                    f.onChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-lg pl-3 pr-8 py-2 font-medium focus:ring-2 focus:ring-teal-600 cursor-pointer"
                >
                  {f.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Desktop Table / Mobile Cards */}
      {paginatedData.length === 0 ? (
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-base">{emptyStateMessage}</p>
          {emptyStateAction && <div className="mt-4">{emptyStateAction}</div>}
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile <768px) */}
          <div className="hidden md:block bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <tr>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={`py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        } ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 select-none' : ''}`}
                        onClick={() => col.sortable && col.accessorKey && handleSort(String(col.accessorKey))}
                      >
                        <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end w-full' : ''}`}>
                          <span>{col.header}</span>
                          {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                        </div>
                      </th>
                    ))}
                    {customRowAction && (
                      <th className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">
                        {actionsHeader}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-800 dark:text-slate-200">
                  {paginatedData.map(item => {
                    const key = keyExtractor(item);
                    return (
                      <tr
                        key={key}
                        onClick={() => onRowClick && onRowClick(item)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          onRowClick ? 'cursor-pointer' : ''
                        }`}
                      >
                        {columns.map((col, colIdx) => {
                          const alignClass =
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                          return (
                            <td key={colIdx} className={`py-3.5 px-4 align-middle ${alignClass}`}>
                              {col.cell
                                ? col.cell(item)
                                : col.accessorKey
                                ? String(item[col.accessorKey] ?? '—')
                                : '—'}
                            </td>
                          );
                        })}
                        {customRowAction && (
                          <td className="py-3.5 px-4 align-middle text-right" onClick={e => e.stopPropagation()}>
                            {customRowAction(item)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (Shown on mobile <768px, stacked label:value with key info and status on top) */}
          <div className="md:hidden space-y-3">
            {paginatedData.map(item => {
              const key = keyExtractor(item);
              const keyCol = columns.find(c => c.mobileKeyInfo);
              const otherCols = columns.filter(c => !c.hideOnMobile && !c.mobileKeyInfo);

              return (
                <div
                  key={key}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 ${
                    onRowClick ? 'active:bg-slate-50 dark:active:bg-slate-800 cursor-pointer' : ''
                  }`}
                >
                  {/* Header row with key info */}
                  {keyCol && (
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {keyCol.cell ? keyCol.cell(item) : keyCol.accessorKey ? String(item[keyCol.accessorKey]) : ''}
                      </div>
                    </div>
                  )}

                  {/* Body Key-Values */}
                  <div className="space-y-2 text-sm">
                    {otherCols.map((col, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          {col.mobileLabel || col.header}
                        </span>
                        <div className="text-slate-900 dark:text-slate-100 font-medium text-right">
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String(item[col.accessorKey] ?? '—')
                            : '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions row if specified */}
                  {customRowAction && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end" onClick={e => e.stopPropagation()}>
                      {customRowAction(item)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <span className="px-2 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  iconRight={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

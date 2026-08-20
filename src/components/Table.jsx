import { ArrowDown, ArrowUp } from 'lucide-react';

export default function Table({ title, columns, rows, searchTerm, onSearchChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or address"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id || index} className="border-t border-slate-200 hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${row.id || index}-${column.key}`} className="px-4 py-3 align-middle">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SortableTable({ title, columns, rows, searchTerm, onSearchChange, sortConfig, onSort }) {
  const handleSort = (field) => {
    if (!onSort) return;

    const nextDirection =
      sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    onSort(field, nextDirection);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or address"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-left font-semibold text-slate-600"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {sortConfig?.field === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id || index} className="border-t border-slate-200 hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${row.id || index}-${column.key}`} className="px-4 py-3 align-middle">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

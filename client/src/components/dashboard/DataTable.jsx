import { Loader2 } from "lucide-react";

export function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "No hay registros.",
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-16">
        <Loader2 size={32} className="animate-spin text-maastel-600" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-16 text-center">
        <div className="text-gray-400">📦</div>
        <p className="mt-2 text-sm font-semibold text-gray-600">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-600 ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={row.id || idx} className="transition hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm ${col.cellClassName || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

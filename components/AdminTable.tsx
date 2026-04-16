import React from 'react';

type Column<T> = {
  label: string;
  render: (row: T) => React.ReactNode;
};

export function AdminTable<T extends { id: string }>({
  rows,
  columns,
  emptyText,
  onEdit,
  onDelete,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyText: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.label}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '1.5rem' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map(row => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.label}>{col.render(row)}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    <div className="row-actions">
                      {onEdit ? (
                        <button className="ghost-button" onClick={() => onEdit(row)}>
                          Edit
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button className="danger-button" onClick={() => onDelete(row)}>
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
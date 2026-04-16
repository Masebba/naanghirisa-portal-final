import React from 'react';
import { AdminTable } from './AdminTable';

type Column<T> = {
  label: string;
  render: (row: T) => React.ReactNode;
};

export function EntityEditor<T extends { id: string }>({
  title,
  subtitle,
  rows,
  columns,
  form,
  emptyText,
  onNew,
  onSave,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  rows: T[];
  columns: Column<T>[];
  form: React.ReactNode;
  emptyText: string;
  onNew: () => void;
  onSave: () => void;
  onDelete?: (row: T) => void;
}) {
  return (
    <section className="page-card">
      <div className="page-card-head">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="toolbar">
        <button className="primary-button" onClick={onNew}>New item</button>
        <button className="ghost-button" onClick={onSave}>Save changes</button>
      </div>
      <div className="editor-panel">{form}</div>
      <AdminTable rows={rows} columns={columns} emptyText={emptyText} onDelete={onDelete} />
    </section>
  );
}
import React, { useState } from 'react';
import { PageTemplate } from '../PageTemplate';
import { AdminTable } from '../../components/AdminTable';

type Column<T> = {
  label: string;
  render: (row: T) => React.ReactNode;
};

export function CrudPage<T extends { id: string }>({
  title,
  subtitle,
  rows,
  columns,
  createEmpty,
  renderFields,
  saveItem,
  deleteItem,
  emptyText,
}: {
  title: string;
  subtitle: string;
  rows: T[];
  columns: Column<T>[];
  createEmpty: () => T;
  renderFields: (draft: T, setDraft: React.Dispatch<React.SetStateAction<T>>) => React.ReactNode;
  saveItem: (item: T) => Promise<unknown>;
  deleteItem: (id: string) => Promise<unknown>;
  emptyText: string;
}) {
  const [draft, setDraft] = useState<T>(createEmpty());

  return (
    <PageTemplate title={title} subtitle={subtitle}>
      <div className="stack">
        <div className="editor-panel">{renderFields(draft, setDraft)}</div>
        <div className="toolbar">
          <button className="primary-button" onClick={async () => { await saveItem(draft); setDraft(createEmpty()); }}>Save item</button>
          <button className="ghost-button" onClick={() => setDraft(createEmpty())}>Reset form</button>
        </div>
      </div>
      <AdminTable
        rows={rows}
        columns={columns}
        emptyText={emptyText}
        onDelete={async row => { await deleteItem(row.id); }}
      />
    </PageTemplate>
  );
}

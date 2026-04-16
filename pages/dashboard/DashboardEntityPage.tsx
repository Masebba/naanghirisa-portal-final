import React, { useState } from 'react';
import { PageTemplate } from '../PageTemplate';
import { EntityEditor } from '../../components/EntityEditor';
import { notify } from '../../services/notifications';

type Column<T> = {
  label: string;
  render: (row: T) => React.ReactNode;
};

export function DashboardEntityPage<T extends { id: string }>({
  title,
  subtitle,
  rows,
  columns,
  fields,
  emptyText,
  createEmpty,
  saveItem,
  deleteItem,
}: {
  title: string;
  subtitle: string;
  rows: T[];
  columns: Column<T>[];
  fields: (value: T, setValue: React.Dispatch<React.SetStateAction<T>>) => React.ReactNode;
  emptyText: string;
  createEmpty: () => T;
  saveItem: (item: T) => Promise<unknown>;
  deleteItem: (id: string) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState<T>(createEmpty());

  return (
    <PageTemplate title={title} subtitle={subtitle}>
      <EntityEditor
        title={title}
        subtitle={subtitle}
        rows={rows}
        columns={columns}
        emptyText={emptyText}
        onNew={() => setDraft(createEmpty())}
        onSave={async () => {
          await saveItem(draft);
          notify(`${title} saved`);
        }}
        onDelete={async row => {
          await deleteItem(row.id);
          notify(`${title} deleted`);
        }}
        form={<div className="stack">{fields(draft, setDraft)}</div>}
      />
    </PageTemplate>
  );
}

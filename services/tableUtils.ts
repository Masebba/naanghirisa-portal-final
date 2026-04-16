export const toLower = (value: string) => value.trim().toLowerCase();

export const matchesSearch = (values: Array<string | undefined | null>, searchTerm: string) => {
  const needle = toLower(searchTerm);
  if (!needle) return true;
  return values.some(value => String(value || '').toLowerCase().includes(needle));
};

export const paginate = <T,>(items: T[], page: number, pageSize: number) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    totalPages,
    currentPage,
    pageItems: items.slice(start, start + pageSize),
  };
};

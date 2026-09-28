type DateLike = string | Date | { toDate: () => Date } | null | undefined;

const toDate = (value: DateLike) => {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value) return value.toDate();
  return value ? new Date(value) : null;
};

export const formatDate = (value?: DateLike) => {
  if (!value) return 'N/A';
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (value?: DateLike) => {
  if (!value) return 'N/A';
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

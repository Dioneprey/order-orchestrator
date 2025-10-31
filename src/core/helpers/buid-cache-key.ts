export function buildCacheKey({
  baseKey,
  filters,
  include,
  select,
}: {
  baseKey: string;
  filters?: Record<string, any>;
  include?: any;
  select?: any;
}) {
  const filterEntries = Object.entries(filters ?? {})
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  const includeEntries = Object.entries(include ?? {})
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  const selectEntries = Object.entries(select ?? {})
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  let parts = [baseKey];

  if (filterEntries) {
    parts.push(`filters[${filterEntries}]`);
  }

  if (includeEntries) {
    parts.push(`include[${includeEntries}]`);
  }

  if (includeEntries) {
    parts.push(`select[${selectEntries}]`);
  }

  return parts.join(':');
}

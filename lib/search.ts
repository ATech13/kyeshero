/** Normalize text for forgiving, case-insensitive searches. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

/** Return true when the query appears in at least one searchable value. */
export function matchesSearchQuery(
  query: string,
  ...values: Array<string | null | undefined>
): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) return true;

  return values.some(
    (value) => value != null && normalizeSearchText(value).includes(normalizedQuery),
  );
}

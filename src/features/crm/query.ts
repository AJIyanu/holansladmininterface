/**
 * Values accepted by the shared CRM query-string builder.
 */
export type CrmQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly string[]
  | readonly number[];

/**
 * Convert a query object into URLSearchParams.
 *
 * Arrays are appended as repeated parameters because Django's multiple-choice
 * filters accept repeated query keys.
 *
 * @param query Query values to serialise.
 * @returns URLSearchParams containing non-empty query values.
 */
export function buildCrmSearchParams<T extends object>(
  query: T,
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(query as Record<string, CrmQueryValue>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    },
  );
  return params;
}

/**
 * Append a query object to a relative API path.
 *
 * @param path Relative backend API path.
 * @param query Query values to append.
 * @returns Relative path including its query string.
 */
export function buildCrmApiPath<T extends object>(
  path: string,
  query: T = {} as T,
): string {
  const searchParams = buildCrmSearchParams(
    query as Record<string, CrmQueryValue>,
  );
  const queryString = searchParams.toString();

  return queryString ? `${path}?${queryString}` : path;
}

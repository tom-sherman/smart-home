import fetch from 'node-fetch';

export type GqlResponse<T> =
  | {
      errors: any[];
      data?: null;
    }
  | {
      errors: undefined;
      data: T;
    };

export async function fetchGql<T>(
  endpoint: string,
  query: string,
  variables?: object
): Promise<GqlResponse<T>> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return await res.json();
}

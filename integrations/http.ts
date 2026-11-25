// Small fetch wrapper. Tokens are only placed in headers and never logged.
export async function request<T>(
  method: 'GET' | 'POST',
  url: string,
  headers: Record<string, string>,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

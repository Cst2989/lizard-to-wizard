export async function fetchPage(page: string): Promise<any> {
  const res = await fetch(`/api/pages/${page}`);
  if (!res.ok) throw new Error(`Failed to fetch page: ${page}`);
  return res.json();
}

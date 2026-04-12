type SSEHandler = (data: { page: string; variant: string }) => void;

export function connectSSE(onConfigChanged: SSEHandler): () => void {
  const source = new EventSource('/api/events');

  source.addEventListener('CONFIG_CHANGED', (e) => {
    onConfigChanged(JSON.parse(e.data));
  });

  source.addEventListener('CONFIG_RESET', () => {
    // Trigger re-fetch of all pages
    onConfigChanged({ page: 'all', variant: '' });
  });

  return () => source.close();
}

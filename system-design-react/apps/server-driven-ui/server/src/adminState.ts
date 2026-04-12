export interface AdminConfig {
  home: 'home' | 'home-v2' | 'home-promo';
  restaurants: Record<string, 'default' | 'v2'>;
}

const DEFAULT_CONFIG: AdminConfig = {
  home: 'home',
  restaurants: { '1': 'default', '2': 'default' },
};

let currentConfig: AdminConfig = { ...DEFAULT_CONFIG };
let sseClients: Array<(event: string, data: any) => void> = [];

export function getConfig(): AdminConfig { return currentConfig; }

export function setHomeConfig(variant: AdminConfig['home']): void {
  currentConfig = { ...currentConfig, home: variant };
  notifyClients('CONFIG_CHANGED', { page: 'home', variant });
}

export function setRestaurantConfig(id: string, variant: 'default' | 'v2'): void {
  currentConfig = {
    ...currentConfig,
    restaurants: { ...currentConfig.restaurants, [id]: variant },
  };
  notifyClients('CONFIG_CHANGED', { page: `restaurant-${id}`, variant });
}

export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
  notifyClients('CONFIG_RESET', {});
}

export function addSSEClient(send: (event: string, data: any) => void): () => void {
  sseClients.push(send);
  return () => { sseClients = sseClients.filter(c => c !== send); };
}

function notifyClients(event: string, data: any): void {
  sseClients.forEach(send => send(event, data));
}

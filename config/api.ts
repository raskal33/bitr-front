export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://bitr-backend.fly.dev',
  endpoints: {
    airdrop: '/api/airdrop',
    faucet: '/api/faucet', 
    pools: '/api/guided-markets/pools',
    bitrPool: '/api/bitr-pool',
    analytics: '/api/analytics',
    social: '/api/social',
    health: '/api/health',
    crypto: '/api/crypto',
    fixtures: '/api/fixtures',
    oddyssey: '/api/oddyssey',
    staking: '/api/staking',
    users: '/api/users',
    reputation: '/api/reputation',
    guidedMarkets: '/api/guided-markets',
    optimisticOracle: '/api/optimistic-oracle',
    matches: '/api/matches',
    terms: '/api/terms',
    cycleMonitoring: '/api/cycle-monitoring',
    cronCoordination: '/api/cron-coordination',
    monitoringDashboard: '/api/monitoring-dashboard',
    admin: '/api/admin'
  }
} as const;

export function getAPIUrl(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`;
}

// Helper function for making API requests with proper error handling
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = getAPIUrl(endpoint);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}

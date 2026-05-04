import { apiClient } from './client';

const USAGE_TIMEOUT_MS = 60 * 1000;

export const usageApi = {
  getUsage: () => apiClient.get<Record<string, unknown>>('/usage', { timeout: USAGE_TIMEOUT_MS }),
};

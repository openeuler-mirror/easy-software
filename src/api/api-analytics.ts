import { request } from '@/shared/axios';

export function reportAnalytics(data: Record<string, any>) {
  return request.post('/api-dsapi/query/track/software', data, { showError: false });
}

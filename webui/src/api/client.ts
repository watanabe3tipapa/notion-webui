import ky from 'ky';
import { useAuthStore } from '../stores/auth';

const api = ky.create({
  prefixUrl: '/api',
  credentials: 'same-origin',
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        const csrf = getCsrfToken();
        if (csrf) {
          request.headers.set('X-CSRF-Token', csrf);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          const refreshed = await tryRefresh();
          if (refreshed) {
            return; // caller will retry once via ky retry config
          }
          useAuthStore.getState().logout();
        }
      },
    ],
  },
  retry: {
    limit: 1,
    methods: ['get', 'post', 'put', 'delete', 'patch'],
    statusCodes: [401],
  },
});

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const resp = await ky.post('/api/auth/refresh', { credentials: 'same-origin' }).json<{ accessToken: string; userId: string }>();
    useAuthStore.getState().setAuth(resp.accessToken, resp.userId);
    return true;
  } catch {
    return false;
  }
}

export async function fetchMe() {
  return api.get('me').json();
}

export async function pushToNotion(body: {
  mode: 'create' | 'update';
  title?: string;
  markdown: string;
  pageId?: string;
  databaseId?: string;
}) {
  return api.post('push', { json: body }).json<{ success: boolean; pageId: string; url?: string }>();
}

export async function searchPages(q: string) {
  return api.get('pages/search', { searchParams: { q } }).json<{ results: any[] }>();
}

export async function listDatabases() {
  return api.get('pages/databases').json<{ results: any[] }>();
}

export async function fetchSyncLogs(limit = 50, offset = 0) {
  return api.get('sync/logs', { searchParams: { limit: String(limit), offset: String(offset) } }).json<{ logs: any[]; total: number }>();
}

export async function deleteSyncLogs() {
  return api.delete('sync/logs').json();
}

export default api;

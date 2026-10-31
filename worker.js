import { D1AccountStore } from './lib/d1-account-store.mjs';
import { handleAccountRequest } from './lib/account-api.mjs';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!env.DB) {
      return Response.json(
        { error: 'Account storage is not configured' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    try {
      return await handleAccountRequest(request, new D1AccountStore(env.DB));
    } catch (error) {
      console.error('Account API request failed:', error);
      return Response.json(
        { error: 'Request failed' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }
};
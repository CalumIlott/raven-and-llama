import { D1AccountStore } from '../_shared/d1-account-store.mjs';
import { handleAccountRequest } from '../_shared/account-api.mjs';

export async function onRequest({ request, env }) {
  if (!env.DB) {
    return Response.json({ error: 'Account storage is not configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return handleAccountRequest(request, new D1AccountStore(env.DB));
}
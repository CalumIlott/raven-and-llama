import { D1AccountStore } from './lib/d1-account-store.mjs';
import { handleAccountRequest } from './lib/account-api.mjs';
import { createAuthRateLimiter } from './lib/worker-auth-rate-limit.mjs';

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith('/api/')) return withSecurityHeaders(await env.ASSETS.fetch(request));
    if (!env.DB) {
      return withSecurityHeaders(Response.json(
        { error: 'Account storage is not configured' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      ));
    }

    try {
      const authAction = request.method === 'POST' && pathname === '/api/auth/login'
        ? 'login'
        : request.method === 'POST' && pathname === '/api/auth/register'
          ? 'register'
          : null;
      const limiters = authAction === 'login'
        ? [env.AUTH_LOGIN_IP_LIMITER, env.AUTH_LOGIN_ACCOUNT_LIMITER]
        : authAction === 'register'
          ? [env.AUTH_REGISTER_LIMITER]
          : [];
      if (limiters.some(limiter => !limiter)) {
        return withSecurityHeaders(Response.json(
          { error: 'Account protection is not configured' },
          { status: 503, headers: { 'Cache-Control': 'no-store' } }
        ));
      }

      const rateLimit = authAction ? createAuthRateLimiter(request, env) : undefined;

      const response = await handleAccountRequest(request, new D1AccountStore(env.DB), { rateLimit });
      return withSecurityHeaders(response);
    } catch (error) {
      console.error('Account API request failed:', error);
      return withSecurityHeaders(Response.json(
        { error: 'Request failed' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      ));
    }
  }
};
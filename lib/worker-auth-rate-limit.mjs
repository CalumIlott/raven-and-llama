export function createAuthRateLimiter(request, env) {
  const sourceIp = request.headers.get('cf-connecting-ip') || 'unknown';

  return async ({ action, username }) => {
    const checks = action === 'login'
      ? await Promise.all([
        env.AUTH_LOGIN_IP_LIMITER.limit({ key: sourceIp }),
        env.AUTH_LOGIN_ACCOUNT_LIMITER.limit({ key: `${sourceIp}:${username}` })
      ])
      : [await env.AUTH_REGISTER_LIMITER.limit({ key: sourceIp })];
    return checks.every(check => check.success);
  };
}
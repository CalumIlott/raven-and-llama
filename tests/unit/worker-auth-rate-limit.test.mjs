import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthRateLimiter } from '../../lib/worker-auth-rate-limit.mjs';

function makeLimiter(success = true) {
  const keys = [];
  return {
    keys,
    async limit({ key }) {
      keys.push(key);
      return { success };
    }
  };
}

test('login checks source and source/username buckets', async () => {
  const sourceLimiter = makeLimiter();
  const accountLimiter = makeLimiter();
  const limiter = createAuthRateLimiter(new Request('https://dojo.example/api/auth/login', {
    headers: { 'CF-Connecting-IP': '203.0.113.8' }
  }), {
    AUTH_LOGIN_IP_LIMITER: sourceLimiter,
    AUTH_LOGIN_ACCOUNT_LIMITER: accountLimiter
  });

  assert.equal(await limiter({ action: 'login', username: 'learner' }), true);
  assert.deepEqual(sourceLimiter.keys, ['203.0.113.8']);
  assert.deepEqual(accountLimiter.keys, ['203.0.113.8:learner']);
});

test('registration uses the source bucket and rejects a denied decision', async () => {
  const registrationLimiter = makeLimiter(false);
  const limiter = createAuthRateLimiter(new Request('https://dojo.example/api/auth/register'), {
    AUTH_REGISTER_LIMITER: registrationLimiter
  });

  assert.equal(await limiter({ action: 'register', username: 'learner' }), false);
  assert.deepEqual(registrationLimiter.keys, ['unknown']);
});
const redis = require('../src/db/redis');

describe('Redis caching integration', () => {
  const testKey = 'test:key';
  const testValue = { foo: 'bar', num: 42 };

  afterAll(async () => {
    await redis.del(testKey);
    await redis.quit();
  });

  it('should set and get a value from Redis', async () => {
    await redis.set(testKey, JSON.stringify(testValue), { EX: 60 });
    const cached = await redis.get(testKey);
    expect(JSON.parse(cached)).toEqual(testValue);
  });

  it('should expire the key after set time', async () => {
    await redis.set(testKey, JSON.stringify(testValue), { EX: 1 });
    await new Promise((r) => setTimeout(r, 1100));
    const cached = await redis.get(testKey);
    expect(cached).toBeNull();
  });
});

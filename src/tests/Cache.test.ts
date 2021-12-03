import { Cache } from '../Cache';
import { ConcurrentRequestPool } from '../RequestPool';

test("Create pool with cache", () => {
  const pool = new ConcurrentRequestPool();
  pool.useCache(new Cache());
  
  expect(pool.cacheStorage).toBeInstanceOf(Cache);
});

test("Put key into cache", () => {
  const pool = new ConcurrentRequestPool();
  pool.useCache(new Cache());
  pool.cacheStorage.put("key");
  
  expect(pool.cacheStorage.items().size).toBe(1);
  expect(pool.cacheStorage.match("key")).toBe(true);
  expect(pool.cacheStorage.get("key")).toBe(true);
});

test("Put value into cache", () => {
  const pool = new ConcurrentRequestPool();
  pool.useCache(new Cache());
  pool.cacheStorage.put("key", "value");
  
  expect(pool.cacheStorage.items().size).toBe(1);
  expect(pool.cacheStorage.match("key")).toBe(true);
  expect(pool.cacheStorage.get("key")).toBe("value");
});

test("Remove value from cache", () => {
  const pool = new ConcurrentRequestPool();
  pool.useCache(new Cache());
  pool.cacheStorage.put("first", "value");
  pool.cacheStorage.put("second", "value");
  pool.cacheStorage.remove("first");
  
  expect(pool.cacheStorage.items().size).toBe(1);
  expect(pool.cacheStorage.match("first")).toBe(false);
  expect(pool.cacheStorage.get("first")).toBe(false);
})
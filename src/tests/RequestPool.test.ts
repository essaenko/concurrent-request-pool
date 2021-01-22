import { ConcurrentRequestPool } from "../RequestPool";
import {IRequestPoolJob} from "../RequestPool.types";

test('Create default pool', () => {
  const pool = new ConcurrentRequestPool();

  expect(pool.state.counter).toBe(0);
  expect(pool.state.limit).toBe(0);
  expect(pool.state.type).toBe('pop');
  expect(Object.keys(pool.state.tubes)).toEqual(['default']);
  expect(pool.state.tubes.default.counter).toBe(0);
  expect(pool.state.tubes.default.limit).toBe(0);
  expect(pool.state.tubes.default.type).toBe('pop');
  expect(pool.state.tubes.default.jobs).toEqual([]);
});

test('Create pool with specified props', () => {
  const pool = new ConcurrentRequestPool({
    limit: 10,
    type: "shift",
  });
  expect(pool.state.counter).toBe(0);
  expect(pool.state.limit).toBe(10);
  expect(pool.state.type).toBe('shift');
  expect(Object.keys(pool.state.tubes)).toEqual(['default']);
  expect(pool.state.tubes.default.counter).toBe(0);
  expect(pool.state.tubes.default.limit).toBe(10);
  expect(pool.state.tubes.default.type).toBe('shift');
  expect(pool.state.tubes.default.jobs).toEqual([]);
});

test('Create tube in clear pool', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({
    name: 'tube',
  });

  expect(Object.keys(pool.state.tubes).includes('tube')).toBe(true);
  expect(pool.state.tubes.tube.limit).toBe(0);
  expect(pool.state.tubes.tube.jobs).toEqual([]);
  expect(pool.state.tubes.tube.type).toBe('pop');
});

test('Create tube with name that already exists', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({
    name: 'custom',
  });
  const createResult: boolean = pool.createTube({ name: 'custom' });

  expect(createResult).toBe(false);
});

test('Create tube with specified props', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({
    name: 'tube',
    limit: 10,
    type: 'shift',
  });

  expect(Object.keys(pool.state.tubes).includes('tube')).toBe(true);
  expect(pool.state.tubes.tube.limit).toBe(10);
  expect(pool.state.tubes.tube.type).toBe('shift');
});

test('Remove tube from pool', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({
    name: 'tube',
  });

  expect(Object.keys(pool.state.tubes).includes('tube')).toBe(true);

  pool.removeTube({ name: 'tube' });

  expect(Object.keys(pool.state.tubes).includes('tube')).toBe(false);
});

test('Remove default tube from pool', () => {
  const pool = new ConcurrentRequestPool();

  const removeResult: false | IRequestPoolJob[] = pool.removeTube({ name: 'default' });

  expect(removeResult).toBe(false);
});

test('Remove tube that are not exists', () => {
  const pool = new ConcurrentRequestPool();

  const removeResult: false | IRequestPoolJob[] = pool.removeTube({ name: 'unspecified' });

  expect(removeResult).toBe(false);
});

test('Disable tube', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({
    name: 'tube',
  });
  pool.disableTube({ name: 'tube' });

  expect(pool.state.tubes.tube.enabled).toBe(false);
});

test('Disable tube that are not exists', () => {
  const pool = new ConcurrentRequestPool();
  const disableResult: boolean = pool.disableTube({ name: 'custom' });

  expect(disableResult).toBe(false);
});

test('Enable tube', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({
    name: 'tube',
  });
  pool.disableTube({ name: 'tube' });

  expect(pool.state.tubes.tube.enabled).toBe(false);

  pool.enableTube({ name: 'tube' });

  expect(pool.state.tubes.tube.enabled).toBe(true);
});

test('Enable tube that are not exists', () => {
  const pool = new ConcurrentRequestPool();

  const enableResult: boolean = pool.enableTube({ name: 'custom' });

  expect(enableResult).toBe(false);
});

test('Push job to default tube', () => {
  const jestCallback = jest.fn();
  const action = () => new Promise<boolean>((resolve) => {
    jestCallback();
    resolve(true);
  }).then(() => {
    expect(pool.state.tubes.default.counter).toBe(1);
    expect(pool.state.tubes.default.index).toBe(2);
    expect(jestCallback).toHaveBeenCalledTimes(1);
  }).catch((e) => {
    throw e;
  });

  const pool = new ConcurrentRequestPool();
  pool.push({
    action,
  });
});

test('Push job to default shift tube', () => {
  const action = () => new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.log('Async action');

      resolve(true);
    });
  });

  const pool = new ConcurrentRequestPool({ type: 'shift' });
  pool.push({
    action,
  });

  return action().then(() => {
    expect(pool.state.tubes.default.counter).toBe(0);
    expect(pool.state.tubes.default.index).toBe(2);
  })
});

test('Push job with empty action to default tube', () => {
  const pool = new ConcurrentRequestPool();
  const result: number | false = pool.push({
    action: void 0,
  });

  expect(result).toBe(false);
});

test('Push job to custom tube', () => {
  const action = () => new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.log('Async action');

      resolve(true);
    });
  });

  const pool = new ConcurrentRequestPool();
  pool.createTube({ name: 'custom' });
  pool.push({
    action,
    tube: 'custom'
  });

  return action().then(() => {
    expect(pool.state.tubes.custom.counter).toBe(0);
    expect(pool.state.tubes.custom.index).toBe(2);
  })
});

test('Push job with empty action to custom tube', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({ name: 'custom' });
  const result: number | false = pool.push({
    action: void 0,
    tube: 'custom'
  });

  expect(result).toBe(false);
});

test('Push job to tube that are not exists', () => {
  const pool = new ConcurrentRequestPool();
  const result: number | false = pool.push({
    action: async () => void 0,
    tube: 'custom'
  });

  expect(result).toBe(false);
});

test('Push job to disabled tube', () => {
  const pool = new ConcurrentRequestPool();
  pool.createTube({ name: 'custom' });
  pool.disableTube({ name: 'custom' })
  const result: number | false = pool.push({
    action: async () => void 0,
    tube: 'custom'
  });

  expect(result).toBe(false);
});

test('Remove job from default tube', () => {
  const pool = new ConcurrentRequestPool({ limit: 1 });
  const actionToRemove = jest.fn();
  pool.push({
    action: () => new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Action succeeded');
        resolve();
      }, 1000);
    }),
  });
  const jobToRemoveId: number = pool.push({
    action: actionToRemove,
  }) as number;

  const removeResult: boolean = pool.remove({ id: jobToRemoveId });

  expect(removeResult).toBe(true);
  expect(pool.state.tubes.default.index).toBe(3);
  expect(pool.state.tubes.default.counter).toBe(1);
  expect(pool.state.tubes.default.jobs.length).toBe(0);
  expect(pool.state.counter).toBe(1);
  expect(actionToRemove).toHaveBeenCalledTimes(0);
});

test('Remove job from tube that are not exists', () => {
  const pool = new ConcurrentRequestPool();
  const jestCallback = jest.fn();
  const action = async () => {
    jestCallback();
  };
  const jobId: number = pool.push({
    action,
  }) as number;
  const removeResult: boolean = pool.remove({ id: jobId, tube: 'custom' });

  expect(removeResult).toBe(false);
  expect(jestCallback).toHaveBeenCalledTimes(1);
});

test('Remove job from custom tube', () => {
  const pool = new ConcurrentRequestPool({ limit: 1 });
  pool.createTube({ name: 'custom' });
  const actionToRemove = jest.fn();
  pool.push({
    tube: 'custom',
    action: () => new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Action succeeded');
        resolve();
      }, 1000);
    }),
  });
  const jobToRemoveId: number = pool.push({
    tube: 'custom',
    action: actionToRemove,
  }) as number;

  const removeResult: boolean = pool.remove({ id: jobToRemoveId, tube: 'custom' });

  expect(removeResult).toBe(true);
  expect(pool.state.tubes.custom.index).toBe(3);
  expect(pool.state.tubes.custom.counter).toBe(1);
  expect(pool.state.tubes.custom.jobs.length).toBe(0);
  expect(pool.state.counter).toBe(1);
  expect(actionToRemove).toHaveBeenCalledTimes(0);
});
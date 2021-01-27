# Typescript based pool of concurrent requests

## The main reasons for the creation

Limiting the HTTP protocol to the number of simultaneous connections can lead to a situation where some JS code completely clogs the request queue for tens of seconds ahead and does not allow critical requests to squeeze through.This solution allows you to manage the number of simultaneous requests, as well as their sorting.

## Installation

```npm i concurrent-request-pool```

## npm

https://www.npmjs.com/package/concurrent-request-pool

## Usage

### Create default queue

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool({
  limit: 10, //global limit on concurrent requests, unlimited if limit equal 0 or unspecified
  type: 'pop' //global default queue type, will used in new tube if type field unspecified, if global type not specified 'pop' will be used
});
```

### Push jobs to default tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.push({
  action: async () => { /* Your async things */ },
});
```

### Remove jobs from default tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
const jobID: number = pool.push({ // push will return job id
  action: async () => { /* Your async things */ },
});

pool.remove({
  id: jobID // Job's id to remove from default tube
});
```

### Create queue with tubes

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.createTube({
  name: 'my_tube', // Tube's name
  limit: 10, // Tube's local limit of concurrent requests, can't be more than global limit
  type: 'pop' // Tube's type, if type unspecified - global type will used, can be pop or shift
});
```

### Push jobs to custom tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.createTube({ name: 'my_pop_tube', limit: 10, type: 'pop' });
pool.createTube({ name: 'my_shift_tube', limit: 10, type: 'shift' });
//Job to pop tube
pool.push({
  action: async () => { /* Your async things */ },
  tube: 'my_pop_tube',
});
//Job to shift tube
pool.push({
  action: async () => { /* Your async things */ },
  tube: 'my_shift_tube',
});
```

### Remove jobs from custom tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.createTube({ name: 'my_pop_tube', limit: 10, type: 'pop' });
pool.createTube({ name: 'my_shift_tube', limit: 10, type: 'shift' });
//Job to pop tube, push will return job id
const popJobID: number = pool.push({
  action: async () => { /* Your async things */ },
  tube: 'pop',
});
//Job to shift tube, push will return job id
const shiftJobID: number = pool.push({
  action: async () => { /* Your async things */ },
  tube: 'shift',
});

pool.remove({
  tube: 'my_pop_tube', // Name of tube to remove jobs 
  id: popJobID // Job's id to remove
});
pool.remove({ tube: 'my_shift_tube', id: shiftJobID });
```

### Stop process tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.createTube({ name: 'my_pop_tube', limit: 10, type: 'pop' });
pool.createTube({ name: 'my_shift_tube', limit: 10, type: 'shift' });

// Disabled tube will stop processing jobs and will not accept new jobs
pool.disableTube({
  name: 'my_shift_tube' // Tube's name to disable
});
```

### Start process tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.createTube({ name: 'my_pop_tube', limit: 10, type: 'pop' });
pool.createTube({ name: 'my_shift_tube', limit: 10, type: 'shift' });
pool.disableTube({ name: 'my_shift_tube' });

// Enabled tube will process existed jobs and will accept new ones
pool.enableTube({
  name: 'my_shift_tube' // Tube's name to enable
});
```

### Remove custom tube

```typescript
const pool: ConcurrentRequestPool =  new ConcurrentRequestPool();
pool.createTube({ name: 'my_pop_tube', limit: 10, type: 'pop' });
pool.createTube({ name: 'my_shift_tube', limit: 10, type: 'shift' });

pool.removeTube({
  name: 'my_pop_tube' // Tube's name to remove
});
```

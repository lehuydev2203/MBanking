// Global test setup for e2e tests
import { MongoMemoryServer } from 'mongodb-memory-server';

// Increase timeout for MongoDB Memory Server
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  // Any global setup can go here
});

// Global teardown
afterAll(async () => {
  // Any global cleanup can go here
});

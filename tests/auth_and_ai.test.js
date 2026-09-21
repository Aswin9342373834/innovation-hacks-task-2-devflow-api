process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_automated_testing_suite';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

describe('DevFlow API — Task 4 Auth & AI Test Suite', () => {
  let mongoServer;
  let testProjectId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: { version: '6.0.14' },
      instance: { launchTimeout: 30000 }
    });
    const uri = mongoServer.getUri();
    await connectDB(uri);
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    // Seed one project for AI testing
    const owner = await User.create({
      name: 'Owner User',
      email: 'owner@devflow.io',
      role: 'manager'
    });
    const project = await Project.create({
      name: 'E-Commerce Platform',
      description: 'Full stack online shopping experience',
      ownerId: owner._id,
      status: 'active'
    });
    testProjectId = project._id.toString();
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register should register a new user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: 'sarah@devflow.io',
          password: 'Password123!',
          role: 'developer'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.name, 'Sarah Connor');
      assert.equal(res.body.data.user.email, 'sarah@devflow.io');
      assert.equal(res.body.data.user.passwordHash, undefined, 'passwordHash must never be exposed');
      assert.ok(res.body.data.token, 'JWT token must be returned');
    });

    it('POST /api/auth/register should reject duplicate email with 409 Conflict', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: 'duplicate@devflow.io',
          password: 'Password123!'
        });

      const duplicateRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Person',
          email: 'duplicate@devflow.io',
          password: 'Password456!'
        });

      assert.equal(duplicateRes.status, 409);
      assert.equal(duplicateRes.body.success, false);
      assert.equal(duplicateRes.body.error.code, 'EMAIL_ALREADY_EXISTS');
    });

    it('POST /api/auth/register should reject short passwords with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@devflow.io',
          password: '123'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('POST /api/auth/login should log in registered user with correct credentials', async () => {
      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@devflow.io',
          password: 'SecretPassword99'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@devflow.io',
          password: 'SecretPassword99'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.email, 'john@devflow.io');
      assert.equal(res.body.data.user.passwordHash, undefined);
      assert.ok(res.body.data.token);
    });

    it('POST /api/auth/login should reject invalid password with 401 Unauthorized', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@devflow.io',
          password: 'CorrectPassword'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@devflow.io',
          password: 'WrongPassword'
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    });

    it('GET /api/auth/me should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('GET /api/auth/me should return current user when valid token is provided', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Me User',
          email: 'me@devflow.io',
          password: 'Password123'
        });

      const token = reg.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, 'me@devflow.io');
      assert.equal(res.body.data.passwordHash, undefined);
    });

    it('POST /api/auth/logout should return success', async () => {
      const res = await request(app).post('/api/auth/logout');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  describe('AI Feature Endpoints', () => {
    it('POST /api/ai/generate-tasks should return structured list of 4-8 tasks', async () => {
      const res = await request(app)
        .post('/api/ai/generate-tasks')
        .send({
          prompt: 'Build an e-commerce mobile application',
          projectId: testProjectId
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.tasks));
      assert.ok(res.body.data.tasks.length >= 4 && res.body.data.tasks.length <= 8);

      const firstTask = res.body.data.tasks[0];
      assert.ok(firstTask.title, 'Task must have a title');
      assert.ok(firstTask.description, 'Task must have a description');
      assert.ok(['low', 'medium', 'high'].includes(firstTask.priority));
      assert.equal(firstTask.status, 'todo');
    });

    it('POST /api/ai/generate-tasks should reject empty prompt with 400', async () => {
      const res = await request(app)
        .post('/api/ai/generate-tasks')
        .send({ prompt: '' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('POST /api/ai/save-tasks should persist reviewed AI tasks into MongoDB', async () => {
      const generated = [
        {
          title: 'AI Generated Task 1',
          description: 'Build user auth with JWT',
          priority: 'high',
          status: 'todo'
        },
        {
          title: 'AI Generated Task 2',
          description: 'Build product catalog',
          priority: 'medium',
          status: 'todo'
        }
      ];

      const saveRes = await request(app)
        .post('/api/ai/save-tasks')
        .send({
          projectId: testProjectId,
          tasks: generated
        });

      assert.equal(saveRes.status, 201);
      assert.equal(saveRes.body.success, true);
      assert.equal(saveRes.body.data.savedCount, 2);

      // Verify tasks in database via Task API
      const taskListRes = await request(app)
        .get(`/api/tasks?projectId=${testProjectId}`);

      assert.equal(taskListRes.status, 200);
      assert.equal(taskListRes.body.data.length, 2);
      const titles = taskListRes.body.data.map(t => t.title);
      assert.ok(titles.includes('AI Generated Task 1'));
      assert.ok(titles.includes('AI Generated Task 2'));
    });

    it('GET /api/ai/productivity-suggestions should return suggestions & metrics', async () => {
      // Create a couple tasks in project
      await Task.create([
        {
          title: 'Urgent Task',
          projectId: testProjectId,
          priority: 'high',
          status: 'todo'
        },
        {
          title: 'Done Task',
          projectId: testProjectId,
          priority: 'low',
          status: 'done'
        }
      ]);

      const res = await request(app)
        .get(`/api/ai/productivity-suggestions?projectId=${testProjectId}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.metrics);
      assert.ok(Array.isArray(res.body.data.suggestions));
      assert.equal(res.body.data.metrics.total, 2);
      assert.equal(res.body.data.metrics.highPriorityPending, 1);
    });
  });
});

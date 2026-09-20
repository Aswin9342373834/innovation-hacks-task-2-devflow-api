const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const store = require('../src/data/store');

describe('DevFlow API Automated Test Suite', () => {
  beforeEach(() => {
    // Reset store to known baseline state before every test to eliminate mutable test pollution
    store.resetStore();
  });

  describe('Root & Health Endpoints', () => {
    it('1 & 2: Should return 200 and welcome message on GET /', async () => {
      const res = await request(app).get('/');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'Welcome to DevFlow API');
      assert.equal(res.body.version, '1.0.0');
    });

    it('Should return 200 and health info on GET /api/health', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'DevFlow API is running');
      assert.ok(res.body.data.environment);
    });
  });

  describe('User API', () => {
    it('3: GET /api/users should return all users', async () => {
      const res = await request(app).get('/api/users');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 4);
    });

    it('GET /api/users/:id should return a specific user if exists', async () => {
      const res = await request(app).get('/api/users/a1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, 'alice.johnson@devflow.io');
    });

    it('16: GET /api/users/:id should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/non-existent-user-id');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'USER_NOT_FOUND');
    });

    it('4: POST /api/users should create a new user with valid data', async () => {
      const newUser = {
        name: 'Grace Hopper',
        email: 'grace.hopper@devflow.io',
        role: 'developer'
      };
      const res = await request(app).post('/api/users').send(newUser);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Grace Hopper');
      assert.equal(res.body.data.email, 'grace.hopper@devflow.io');
      assert.ok(res.body.data.id);
      assert.ok(res.body.data.createdAt);
    });

    it('5: POST /api/users should reject invalid user data with 400 Bad Request', async () => {
      const invalidUser = {
        name: 'G',
        email: 'invalid-email-address',
        role: 'invalid-role'
      };
      const res = await request(app).post('/api/users').send(invalidUser);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Validation failed');
      assert.ok(Array.isArray(res.body.errors));
      assert.ok(res.body.errors.length >= 3);
    });

    it('6: POST /api/users should reject duplicate email with 409 Conflict', async () => {
      const duplicateUser = {
        name: 'Alice Duplicate',
        email: 'alice.johnson@devflow.io',
        role: 'manager'
      };
      const res = await request(app).post('/api/users').send(duplicateUser);
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
    });
  });

  describe('Project API', () => {
    it('7: GET /api/projects should return all projects', async () => {
      const res = await request(app).get('/api/projects');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 3);
    });

    it('GET /api/projects/:id should return a specific project', async () => {
      const res = await request(app).get('/api/projects/b1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'DevFlow Dashboard');
    });

    it('16: GET /api/projects/:id should return 404 for non-existent project', async () => {
      const res = await request(app).get('/api/projects/non-existent-project-id');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'PROJECT_NOT_FOUND');
    });

    it('8: POST /api/projects should create a project with valid data and existing owner', async () => {
      const newProject = {
        name: 'Security Hardening',
        description: 'Implement audit logging and rate limiting for API security.',
        ownerId: 'a1b2c3d4-e5f6-4a1b-8c2d-111111111111',
        status: 'active',
        progress: 20
      };
      const res = await request(app).post('/api/projects').send(newProject);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Security Hardening');
      assert.equal(res.body.data.progress, 20);
      assert.ok(res.body.data.id);
    });

    it('9: POST /api/projects should reject invalid input format with 400 Bad Request', async () => {
      const invalidProject = {
        name: 'S',
        description: 'tiny',
        ownerId: '',
        progress: 150
      };
      const res = await request(app).post('/api/projects').send(invalidProject);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.ok(Array.isArray(res.body.errors));
    });

    it('3 (Requirement): POST /api/projects should return 404 when referenced owner user does not exist', async () => {
      const missingOwnerProject = {
        name: 'Valid Project Name',
        description: 'Valid Project Description here',
        ownerId: 'non-existent-owner-user-id'
      };
      const res = await request(app).post('/api/projects').send(missingOwnerProject);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'OWNER_NOT_FOUND');
    });
  });

  describe('Task API', () => {
    it('10: GET /api/tasks should return all tasks', async () => {
      const res = await request(app).get('/api/tasks');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 4);
    });

    it('GET /api/tasks/:id should return a specific task', async () => {
      const res = await request(app).get('/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Design API Spec');
    });

    it('11: POST /api/tasks should create a task with valid data and existing project/assignee', async () => {
      const newTask = {
        title: 'Implement CORS Headers',
        description: 'Ensure cross-origin access is properly handled.',
        projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
        assignedTo: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-05-01T00:00:00.000Z'
      };
      const res = await request(app).post('/api/tasks').send(newTask);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Implement CORS Headers');
      assert.equal(res.body.data.status, 'todo');
      assert.equal(res.body.data.priority, 'high');
      assert.ok(res.body.data.id);
    });

    it('12: POST /api/tasks should reject invalid task format with 400 Bad Request', async () => {
      const invalidTask = {
        title: 'T',
        projectId: '',
        status: 'invalid-status',
        priority: 'super-high',
        dueDate: 'not-a-date'
      };
      const res = await request(app).post('/api/tasks').send(invalidTask);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.ok(Array.isArray(res.body.errors));
    });

    it('4 (Requirement): POST /api/tasks should return 404 when projectId references non-existent project', async () => {
      const taskWithMissingProject = {
        title: 'Valid Task Title',
        projectId: 'non-existent-project-id'
      };
      const res = await request(app).post('/api/tasks').send(taskWithMissingProject);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'PROJECT_NOT_FOUND');
    });

    it('4 (Requirement): POST /api/tasks should return 404 when assignedTo references non-existent user', async () => {
      const taskWithMissingUser = {
        title: 'Valid Task Title',
        projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
        assignedTo: 'non-existent-user-id'
      };
      const res = await request(app).post('/api/tasks').send(taskWithMissingUser);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'USER_NOT_FOUND');
    });

    it('13: PUT /api/tasks/:id should update a task successfully', async () => {
      const updateData = {
        title: 'Design API Spec - Revised Edition',
        priority: 'low'
      };
      const res = await request(app).put('/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-111111111111').send(updateData);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Design API Spec - Revised Edition');
      assert.equal(res.body.data.priority, 'low');
    });

    it('PUT /api/tasks/:id should return 404 for non-existent task', async () => {
      const res = await request(app).put('/api/tasks/non-existent-task-id').send({ title: 'New Title' });
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'TASK_NOT_FOUND');
    });

    it('14: PATCH /api/tasks/:id/status should update status to in-progress', async () => {
      const res = await request(app)
        .patch('/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-333333333333/status')
        .send({ status: 'in-progress' });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'in-progress');
    });

    it('18: PATCH /api/tasks/:id/status should reject invalid status with 400', async () => {
      const res = await request(app)
        .patch('/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-333333333333/status')
        .send({ status: 'done-and-dusted' });
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
    });

    it('PATCH /api/tasks/:id/status should return 404 if task missing', async () => {
      const res = await request(app)
        .patch('/api/tasks/non-existent-task-id/status')
        .send({ status: 'done' });
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'TASK_NOT_FOUND');
    });

    it('15: DELETE /api/tasks/:id should delete existing task and return 200', async () => {
      const res = await request(app).delete('/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'Task deleted successfully');

      // Verify it no longer exists
      const checkRes = await request(app).get('/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      assert.equal(checkRes.statusCode, 404);
    });

    it('16: DELETE /api/tasks/:id should return 404 if task does not exist', async () => {
      const res = await request(app).delete('/api/tasks/non-existent-task-id');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'TASK_NOT_FOUND');
    });
  });

  describe('Query Filtering & Error Handling', () => {
    it('20: GET /api/tasks?status=done should filter tasks by status', async () => {
      const res = await request(app).get('/api/tasks?status=done');
      assert.equal(res.statusCode, 200);
      assert.ok(res.body.data.length >= 1);
      for (const t of res.body.data) {
        assert.equal(t.status, 'done');
      }
    });

    it('20: GET /api/tasks?priority=high should filter tasks by priority', async () => {
      const res = await request(app).get('/api/tasks?priority=high');
      assert.equal(res.statusCode, 200);
      assert.ok(res.body.data.length >= 1);
      for (const t of res.body.data) {
        assert.equal(t.priority, 'high');
      }
    });

    it('20: GET /api/tasks?projectId=b1b2c3d4-e5f6-4a1b-8c2d-111111111111 should filter tasks by projectId', async () => {
      const res = await request(app).get('/api/tasks?projectId=b1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      assert.equal(res.statusCode, 200);
      for (const t of res.body.data) {
        assert.equal(t.projectId, 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111');
      }
    });

    it('20: GET /api/tasks with combined filters (status=todo&priority=low)', async () => {
      const res = await request(app).get('/api/tasks?status=todo&priority=low');
      assert.equal(res.statusCode, 200);
      for (const t of res.body.data) {
        assert.equal(t.status, 'todo');
        assert.equal(t.priority, 'low');
      }
    });

    it('18: GET /api/tasks?status=invalidStatus should return 400 Bad Request', async () => {
      const res = await request(app).get('/api/tasks?status=unknown');
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
    });

    it('19: GET /api/tasks?priority=invalidPriority should return 400 Bad Request', async () => {
      const res = await request(app).get('/api/tasks?priority=critical');
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
    });

    it('17: Unknown route GET /api/non-existent-route should return 404', async () => {
      const res = await request(app).get('/api/non-existent-route');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Route not found');
    });
  });
});

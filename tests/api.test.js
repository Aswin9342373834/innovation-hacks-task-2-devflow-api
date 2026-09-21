const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

describe('DevFlow API Automated Test Suite (Task 3 — MongoDB)', () => {
  let mongoServer;

  // Predictable ObjectIds for baseline relational test data
  const user1Id = '65f1a1b2c3d4e5f6a1b20001';
  const user2Id = '65f1a1b2c3d4e5f6a1b20002';
  const user3Id = '65f1a1b2c3d4e5f6a1b20003';
  const user4Id = '65f1a1b2c3d4e5f6a1b20004';

  const proj1Id = '65f1a1b2c3d4e5f6a1b20011';
  const proj2Id = '65f1a1b2c3d4e5f6a1b20012';
  const proj3Id = '65f1a1b2c3d4e5f6a1b20013';

  const task1Id = '65f1a1b2c3d4e5f6a1b20021';
  const task2Id = '65f1a1b2c3d4e5f6a1b20022';
  const task3Id = '65f1a1b2c3d4e5f6a1b20023';
  const task4Id = '65f1a1b2c3d4e5f6a1b20024';

  before(async () => {
    if (process.env.MONGODB_TEST_URI) {
      await connectDB(process.env.MONGODB_TEST_URI);
    } else {
      mongoServer = await MongoMemoryServer.create({
        binary: { version: '6.0.14' },
        instance: { launchTimeout: 30000 }
      });
      const uri = mongoServer.getUri();
      await connectDB(uri);
    }
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Reset database to known baseline state before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    // Seed baseline users
    await User.create([
      {
        _id: user1Id,
        name: 'Alice Johnson',
        email: 'alice.johnson@devflow.io',
        role: 'manager'
      },
      {
        _id: user2Id,
        name: 'Bob Smith',
        email: 'bob.smith@devflow.io',
        role: 'developer'
      },
      {
        _id: user3Id,
        name: 'Carol Danvers',
        email: 'carol.danvers@devflow.io',
        role: 'designer'
      },
      {
        _id: user4Id,
        name: 'David Miller',
        email: 'david.miller@devflow.io',
        role: 'tester'
      }
    ]);

    // Seed baseline projects
    await Project.create([
      {
        _id: proj1Id,
        name: 'DevFlow Dashboard',
        description: 'Modern developer productivity analytics and workspace overview.',
        ownerId: user1Id,
        status: 'active',
        progress: 65
      },
      {
        _id: proj2Id,
        name: 'Cloud Infrastructure Migration',
        description: 'Migrating legacy monolith services to containerized cloud microservices.',
        ownerId: user2Id,
        status: 'active',
        progress: 40
      },
      {
        _id: proj3Id,
        name: 'Mobile Client v2',
        description: 'Next-generation cross-platform mobile companion application.',
        ownerId: user1Id,
        status: 'completed',
        progress: 100
      }
    ]);

    // Seed baseline tasks
    await Task.create([
      {
        _id: task1Id,
        title: 'Design API Spec',
        description: 'Finalize OpenAPI/REST specifications for users, projects, and tasks.',
        projectId: proj1Id,
        assignedTo: user3Id,
        status: 'done',
        priority: 'high',
        dueDate: new Date('2026-03-01T00:00:00.000Z')
      },
      {
        _id: task2Id,
        title: 'Implement Express REST Endpoints',
        description: 'Build user, project, and task controllers with validation and error handling.',
        projectId: proj1Id,
        assignedTo: user2Id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2026-03-10T00:00:00.000Z')
      },
      {
        _id: task3Id,
        title: 'Dockerize Gateway Service',
        description: 'Write multi-stage Dockerfile and test local compose orchestration.',
        projectId: proj2Id,
        assignedTo: user2Id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-03-25T00:00:00.000Z')
      },
      {
        _id: task4Id,
        title: 'Automated Integration Tests',
        description: 'Write comprehensive integration tests verifying endpoint response codes and schemas.',
        projectId: proj1Id,
        assignedTo: user4Id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2026-03-30T00:00:00.000Z')
      }
    ]);
  });

  describe('Root & Health Endpoints', () => {
    it('1 & 2: Should return 200 and welcome message on GET /', async () => {
      const res = await request(app).get('/');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'Welcome to DevFlow API');
      assert.equal(res.body.version, '1.0.0');
    });

    it('Should return 200 and health info on GET /api/health with database status', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.environment);
      assert.equal(res.body.data.database, 'connected');
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
      const res = await request(app).get(`/api/users/${user1Id}`);
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

    it('PUT /api/users/:id should update user details', async () => {
      const res = await request(app)
        .put(`/api/users/${user1Id}`)
        .send({ name: 'Alice Johnson Updated', role: 'developer' });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Alice Johnson Updated');
      assert.equal(res.body.data.role, 'developer');
    });

    it('DELETE /api/users/:id should delete user and safely unassign from tasks', async () => {
      // user3Id was assigned to task1Id
      const res = await request(app).delete(`/api/users/${user3Id}`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);

      // Verify task1Id now has assignedTo = null
      const taskRes = await request(app).get(`/api/tasks/${task1Id}`);
      assert.equal(taskRes.statusCode, 200);
      assert.equal(taskRes.body.data.assignedTo, null);
    });
  });

  describe('Project API', () => {
    it('7: GET /api/projects should return all projects with populated owner', async () => {
      const res = await request(app).get('/api/projects');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 3);
      // Verify owner is populated
      assert.ok(res.body.data[0].ownerId.name || res.body.data[0].ownerId.email);
    });

    it('GET /api/projects/:id should return a specific project', async () => {
      const res = await request(app).get(`/api/projects/${proj1Id}`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'DevFlow Dashboard');
      assert.equal(res.body.data.ownerId.email, 'alice.johnson@devflow.io');
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
        ownerId: user1Id,
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

    it('PUT /api/projects/:id should update a project', async () => {
      const res = await request(app)
        .put(`/api/projects/${proj1Id}`)
        .send({ name: 'DevFlow Dashboard Pro', progress: 80 });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'DevFlow Dashboard Pro');
      assert.equal(res.body.data.progress, 80);
    });

    it('DELETE /api/projects/:id should delete project and remove its tasks', async () => {
      const res = await request(app).delete(`/api/projects/${proj2Id}`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);

      // Verify task3Id (which belonged to proj2Id) is deleted
      const checkTask = await request(app).get(`/api/tasks/${task3Id}`);
      assert.equal(checkTask.statusCode, 404);
    });
  });

  describe('Task API', () => {
    it('10: GET /api/tasks should return all tasks with populated references', async () => {
      const res = await request(app).get('/api/tasks');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 4);
    });

    it('GET /api/tasks/:id should return a specific task', async () => {
      const res = await request(app).get(`/api/tasks/${task1Id}`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Design API Spec');
      assert.ok(res.body.data.projectId);
    });

    it('11: POST /api/tasks should create a task with valid data and existing project/assignee', async () => {
      const newTask = {
        title: 'Implement CORS Headers',
        description: 'Ensure cross-origin access is properly handled.',
        projectId: proj1Id,
        assignedTo: user2Id,
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
        projectId: proj1Id,
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
      const res = await request(app).put(`/api/tasks/${task1Id}`).send(updateData);
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
        .patch(`/api/tasks/${task3Id}/status`)
        .send({ status: 'in-progress' });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'in-progress');
    });

    it('18: PATCH /api/tasks/:id/status should reject invalid status with 400', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${task3Id}/status`)
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
      const res = await request(app).delete(`/api/tasks/${task1Id}`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'Task deleted successfully');

      // Verify it no longer exists
      const checkRes = await request(app).get(`/api/tasks/${task1Id}`);
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

    it('20: GET /api/tasks?projectId=<proj1Id> should filter tasks by projectId', async () => {
      const res = await request(app).get(`/api/tasks?projectId=${proj1Id}`);
      assert.equal(res.statusCode, 200);
      for (const t of res.body.data) {
        const idToCheck = t.projectId.id || t.projectId._id || t.projectId;
        assert.equal(idToCheck.toString(), proj1Id);
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

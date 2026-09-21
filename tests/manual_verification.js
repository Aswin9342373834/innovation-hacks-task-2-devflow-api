// Live verification script hitting running server (default http://localhost:5000)
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

async function runVerification() {
  console.log(`--- Starting DevFlow API Task 3 Live Verification against ${BASE_URL} ---\n`);

  let passed = 0;
  let total = 0;

  async function testItem(num, desc, url, options, expectedStatus, validator) {
    total++;
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      const statusMatch = res.status === expectedStatus;
      const customMatch = validator ? validator(json, res) : true;
      if (statusMatch && customMatch) {
        console.log(`[PASS] Check ${num}: ${desc} (Status: ${res.status})`);
        passed++;
        return json;
      } else {
        console.error(`[FAIL] Check ${num}: ${desc} (Expected: ${expectedStatus}, Received: ${res.status})`, json);
        return null;
      }
    } catch (err) {
      console.error(`[ERROR] Check ${num}: ${desc}:`, err.message);
      return null;
    }
  }

  // 1. GET /
  await testItem(1, 'GET / welcome endpoint', `${BASE_URL}/`, {}, 200, (d) => d.success && d.version === '1.0.0');

  // 2. GET /api/health
  await testItem(2, 'GET /api/health check', `${BASE_URL}/api/health`, {}, 200, (d) => d.success && d.data.environment);

  // --- Users CRUD ---
  // 3. POST /api/users (Create)
  const uniqueEmail = `engineer.${Date.now()}@devflow.io`;
  let createdUserId = null;
  const createUserRes = await testItem(3, 'POST /api/users (Create User)', `${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ada Lovelace', email: uniqueEmail, role: 'developer' })
  }, 201, (d) => {
    createdUserId = d.data.id || d.data._id;
    return d.data.email === uniqueEmail && createdUserId;
  });

  // 4. GET /api/users
  await testItem(4, 'GET /api/users', `${BASE_URL}/api/users`, {}, 200, (d) => Array.isArray(d.data) && d.data.length >= 1);

  // 5. GET /api/users/:id
  await testItem(5, 'GET /api/users/:id', `${BASE_URL}/api/users/${createdUserId}`, {}, 200, (d) => d.data.email === uniqueEmail);

  // 6. PUT /api/users/:id (Update User)
  await testItem(6, 'PUT /api/users/:id (Update User)', `${BASE_URL}/api/users/${createdUserId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ada Lovelace Byrne', role: 'manager' })
  }, 200, (d) => d.data.name === 'Ada Lovelace Byrne' && d.data.role === 'manager');

  // 7. Duplicate email → 409
  await testItem(7, 'Duplicate email conflict (409)', `${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Duplicate Ada', email: uniqueEmail })
  }, 409, (d) => d.error.code === 'EMAIL_ALREADY_EXISTS');

  // 8. Invalid user validation
  await testItem(8, 'Invalid user validation (400)', `${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', role: 'invalid-role' })
  }, 400, (d) => d.errors.length >= 3);

  // --- Projects CRUD ---
  // 9. POST /api/projects (Create Project)
  let createdProjectId = null;
  await testItem(9, 'POST /api/projects (Create Project)', `${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Compiler Optimization Engine',
      description: 'High-performance JIT and bytecode compiler toolkit.',
      ownerId: createdUserId,
      status: 'active',
      progress: 15
    })
  }, 201, (d) => {
    createdProjectId = d.data.id || d.data._id;
    return d.data.name === 'Compiler Optimization Engine' && createdProjectId;
  });

  // 10. GET /api/projects
  await testItem(10, 'GET /api/projects (with populated owner)', `${BASE_URL}/api/projects`, {}, 200, (d) => Array.isArray(d.data) && d.data.length >= 1);

  // 11. GET /api/projects/:id
  await testItem(11, 'GET /api/projects/:id', `${BASE_URL}/api/projects/${createdProjectId}`, {}, 200, (d) => d.data.name === 'Compiler Optimization Engine' && d.data.ownerId);

  // 12. PUT /api/projects/:id (Update Project)
  await testItem(12, 'PUT /api/projects/:id (Update Project)', `${BASE_URL}/api/projects/${createdProjectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress: 45, status: 'active' })
  }, 200, (d) => d.data.progress === 45);

  // 13. Non-existent ownerId → 404
  await testItem(13, 'Non-existent ownerId (404)', `${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Valid Project Name',
      description: 'Valid Project Description here',
      ownerId: '65f1a1b2c3d4e5f6a1b29999'
    })
  }, 404, (d) => d.error.code === 'OWNER_NOT_FOUND');

  // --- Tasks CRUD ---
  // 14. POST /api/tasks (Create Task)
  let createdTaskId = null;
  await testItem(14, 'POST /api/tasks (Create Task)', `${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Implement AST Parser',
      description: 'Build recursive descent parser for language grammar.',
      projectId: createdProjectId,
      assignedTo: createdUserId,
      status: 'todo',
      priority: 'high',
      dueDate: '2026-04-15T00:00:00.000Z'
    })
  }, 201, (d) => {
    createdTaskId = d.data.id || d.data._id;
    return d.data.title === 'Implement AST Parser' && createdTaskId;
  });

  // 15. GET /api/tasks
  await testItem(15, 'GET /api/tasks', `${BASE_URL}/api/tasks`, {}, 200, (d) => Array.isArray(d.data) && d.data.length >= 1);

  // 16. GET /api/tasks/:id
  await testItem(16, 'GET /api/tasks/:id', `${BASE_URL}/api/tasks/${createdTaskId}`, {}, 200, (d) => d.data.title === 'Implement AST Parser');

  // 17. Filter tasks by status
  await testItem(17, 'GET /api/tasks?status=todo', `${BASE_URL}/api/tasks?status=todo`, {}, 200, (d) => d.data.every(t => t.status === 'todo'));

  // 18. Filter tasks by priority
  await testItem(18, 'GET /api/tasks?priority=high', `${BASE_URL}/api/tasks?priority=high`, {}, 200, (d) => d.data.every(t => t.priority === 'high'));

  // 19. Filter tasks by projectId
  await testItem(19, `GET /api/tasks?projectId=${createdProjectId}`, `${BASE_URL}/api/tasks?projectId=${createdProjectId}`, {}, 200, (d) => d.data.length >= 1);

  // 20. PUT /api/tasks/:id (Update Task)
  await testItem(20, 'PUT /api/tasks/:id (Update Task)', `${BASE_URL}/api/tasks/${createdTaskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Implement AST Parser - V2',
      priority: 'medium'
    })
  }, 200, (d) => d.data.title === 'Implement AST Parser - V2' && d.data.priority === 'medium');

  // 21. PATCH /api/tasks/:id/status
  await testItem(21, 'PATCH /api/tasks/:id/status', `${BASE_URL}/api/tasks/${createdTaskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'in-progress' })
  }, 200, (d) => d.data.status === 'in-progress');

  // 22. DELETE /api/tasks/:id
  await testItem(22, 'DELETE /api/tasks/:id', `${BASE_URL}/api/tasks/${createdTaskId}`, {
    method: 'DELETE'
  }, 200, (d) => d.message === 'Task deleted successfully');

  // 23. DELETE /api/projects/:id (Deletes project and cascade-cleans project tasks)
  await testItem(23, 'DELETE /api/projects/:id', `${BASE_URL}/api/projects/${createdProjectId}`, {
    method: 'DELETE'
  }, 200, (d) => d.message === 'Project deleted successfully');

  // 24. DELETE /api/users/:id (Deletes user and safely unassigns tasks)
  await testItem(24, 'DELETE /api/users/:id', `${BASE_URL}/api/users/${createdUserId}`, {
    method: 'DELETE'
  }, 200, (d) => d.message === 'User deleted successfully');

  // 25. Non-existent task → 404
  await testItem(25, 'Non-existent task → 404', `${BASE_URL}/api/tasks/65f1a1b2c3d4e5f6a1b29999`, {}, 404, (d) => d.error.code === 'TASK_NOT_FOUND');

  // 26. Unknown route → 404
  await testItem(26, 'Unknown route → 404', `${BASE_URL}/api/unregistered-path`, {}, 404, (d) => d.message === 'Route not found');

  console.log(`\n========================================`);
  console.log(`Live Verification Complete: ${passed}/${total} checks passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();

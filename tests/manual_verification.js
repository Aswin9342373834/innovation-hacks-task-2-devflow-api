// Live verification script hitting http://localhost:5000
const BASE_URL = 'http://localhost:5000';

async function runVerification() {
  console.log('--- Starting Complete Final Verification against http://localhost:5000 ---\n');

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
      } else {
        console.error(`[FAIL] Check ${num}: ${desc} (Expected: ${expectedStatus}, Received: ${res.status})`, json);
      }
    } catch (err) {
      console.error(`[ERROR] Check ${num}: ${desc}:`, err.message);
    }
  }

  // 1. GET /
  await testItem(1, 'GET / welcome endpoint', `${BASE_URL}/`, {}, 200, (d) => d.success && d.version === '1.0.0');

  // 2. GET /api/health
  await testItem(2, 'GET /api/health check', `${BASE_URL}/api/health`, {}, 200, (d) => d.success && d.data.environment === 'development');

  // Users:
  // 3. GET /api/users
  await testItem(3, 'GET /api/users', `${BASE_URL}/api/users`, {}, 200, (d) => Array.isArray(d.data) && d.data.length >= 4);

  // 4. GET /api/users/:id
  await testItem(4, 'GET /api/users/:id', `${BASE_URL}/api/users/a1b2c3d4-e5f6-4a1b-8c2d-111111111111`, {}, 200, (d) => d.data.name === 'Alice Johnson');

  // 5. POST /api/users
  const uniqueEmail = `user.${Date.now()}@devflow.io`;
  await testItem(5, 'POST /api/users (Create)', `${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Margaret Hamilton', email: uniqueEmail, role: 'developer' })
  }, 201, (d) => d.data.email === uniqueEmail);

  // 6. Invalid user validation
  await testItem(6, 'Invalid user validation (400)', `${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'M', email: 'not-an-email', role: 'invalid-role' })
  }, 400, (d) => d.errors.length >= 3);

  // 7. Duplicate email → 409
  await testItem(7, 'Duplicate email conflict (409)', `${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Duplicate User', email: uniqueEmail })
  }, 409, (d) => d.error.code === 'EMAIL_ALREADY_EXISTS');

  // Projects:
  // 8. GET /api/projects
  await testItem(8, 'GET /api/projects', `${BASE_URL}/api/projects`, {}, 200, (d) => Array.isArray(d.data) && d.data.length >= 3);

  // 9. GET /api/projects/:id
  await testItem(9, 'GET /api/projects/:id', `${BASE_URL}/api/projects/b1b2c3d4-e5f6-4a1b-8c2d-111111111111`, {}, 200, (d) => d.data.name === 'DevFlow Dashboard');

  // 10. POST /api/projects
  await testItem(10, 'POST /api/projects (Create)', `${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Realtime Pipeline',
      description: 'Distributed streaming pipeline using event streams.',
      ownerId: 'a1b2c3d4-e5f6-4a1b-8c2d-111111111111',
      status: 'active',
      progress: 30
    })
  }, 201, (d) => d.data.name === 'Realtime Pipeline');

  // 11. Invalid project validation
  await testItem(11, 'Invalid project validation (400)', `${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'R', description: 'tiny', ownerId: '' })
  }, 400, (d) => d.errors.length >= 3);

  // 12. Non-existent ownerId
  await testItem(12, 'Non-existent ownerId (404)', `${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Valid Project Name',
      description: 'Valid Project Description here',
      ownerId: 'non-existent-owner-id'
    })
  }, 404, (d) => d.error.code === 'OWNER_NOT_FOUND');

  // Tasks:
  // 13. GET /api/tasks
  await testItem(13, 'GET /api/tasks', `${BASE_URL}/api/tasks`, {}, 200, (d) => Array.isArray(d.data) && d.data.length >= 4);

  // 14. GET /api/tasks/:id
  await testItem(14, 'GET /api/tasks/:id', `${BASE_URL}/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-111111111111`, {}, 200, (d) => d.data.title === 'Design API Spec');

  // 15. GET /api/tasks?status=done
  await testItem(15, 'GET /api/tasks?status=done', `${BASE_URL}/api/tasks?status=done`, {}, 200, (d) => d.data.length >= 1 && d.data.every(t => t.status === 'done'));

  // 16. GET /api/tasks?priority=high
  await testItem(16, 'GET /api/tasks?priority=high', `${BASE_URL}/api/tasks?priority=high`, {}, 200, (d) => d.data.length >= 1 && d.data.every(t => t.priority === 'high'));

  // 17. GET /api/tasks?projectId=<valid-project-id>
  await testItem(17, 'GET /api/tasks?projectId=b1b2c3d4-e5f6-4a1b-8c2d-111111111111', `${BASE_URL}/api/tasks?projectId=b1b2c3d4-e5f6-4a1b-8c2d-111111111111`, {}, 200, (d) => d.data.every(t => t.projectId === 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111'));

  // 18. POST /api/tasks
  let dynamicTaskId = null;
  await testItem(18, 'POST /api/tasks (Create)', `${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Build Distributed Lock Manager',
      description: 'Implement distributed locking mechanism for task state machine.',
      projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
      assignedTo: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
      status: 'todo',
      priority: 'high'
    })
  }, 201, (d) => {
    dynamicTaskId = d.data.id;
    return d.data.title === 'Build Distributed Lock Manager';
  });

  // 19. PUT /api/tasks/:id
  await testItem(19, 'PUT /api/tasks/:id (Update)', `${BASE_URL}/api/tasks/${dynamicTaskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Build Distributed Lock Manager - Complete',
      priority: 'low'
    })
  }, 200, (d) => d.data.title === 'Build Distributed Lock Manager - Complete' && d.data.priority === 'low');

  // 20. PATCH /api/tasks/:id/status
  await testItem(20, 'PATCH /api/tasks/:id/status', `${BASE_URL}/api/tasks/${dynamicTaskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'in-progress' })
  }, 200, (d) => d.data.status === 'in-progress');

  // 21. DELETE /api/tasks/:id
  await testItem(21, 'DELETE /api/tasks/:id', `${BASE_URL}/api/tasks/${dynamicTaskId}`, {
    method: 'DELETE'
  }, 200, (d) => d.message === 'Task deleted successfully');

  // 22. Invalid task validation
  await testItem(22, 'Invalid task validation (400)', `${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'B', projectId: '' })
  }, 400, (d) => d.errors.length >= 2);

  // 23. Invalid task status
  await testItem(23, 'Invalid task status (400)', `${BASE_URL}/api/tasks/c1b2c3d4-e5f6-4a1b-8c2d-111111111111/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'invalid-status-value' })
  }, 400, (d) => d.errors.length >= 1);

  // 24. Non-existent projectId
  await testItem(24, 'Non-existent projectId (404)', `${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Valid Title Here', projectId: 'non-existent-project-id' })
  }, 404, (d) => d.error.code === 'PROJECT_NOT_FOUND');

  // 25. Non-existent assignedTo
  await testItem(25, 'Non-existent assignedTo (404)', `${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Valid Title Here',
      projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
      assignedTo: 'non-existent-assigned-user-id'
    })
  }, 404, (d) => d.error.code === 'USER_NOT_FOUND');

  // 26. Non-existent task → 404
  await testItem(26, 'Non-existent task → 404', `${BASE_URL}/api/tasks/non-existent-task-id`, {}, 404, (d) => d.error.code === 'TASK_NOT_FOUND');

  // 27. Unknown route → 404
  await testItem(27, 'Unknown route → 404', `${BASE_URL}/api/unregistered-path`, {}, 404, (d) => d.message === 'Route not found');

  console.log(`\n========================================`);
  console.log(`Verification Complete: ${passed}/${total} checks passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();

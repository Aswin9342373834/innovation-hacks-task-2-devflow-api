/**
 * DevFlow AI — End-to-End Live Integration Verification Script
 * Validates the exact user flows against the running backend server:
 * 1. Register new user
 * 2. Profile check & token verification
 * 3. Logout & re-login with registered account
 * 4. Protected routes access control
 * 5. Projects CRUD in MongoDB Atlas
 * 6. Tasks CRUD in MongoDB Atlas (including status cycling)
 * 7. AI Task Generator with prompt: "Build an e-commerce mobile application"
 * 8. AI Task Batch Saving to MongoDB Atlas
 * 9. AI Productivity Suggestions
 * 10. CORS and HTTP response formats
 */

const BASE_URL = 'http://localhost:5000';

async function runVerification() {
  console.log('====================================================');
  console.log('DevFlow AI — Live Integration Verification Starting');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Health check
    console.log('[STEP 0] Verifying Backend Health & Database Connectivity...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthData.data.database === 'connected', 'Database reports connected to MongoDB Atlas');
    console.log(`  Database status: ${healthData.data.database}, env: ${healthData.data.environment}\n`);

    // 1. REGISTER
    console.log('[STEP 1] Testing User Registration Flow...');
    const timestamp = Date.now();
    const testUserEmail = `verify_${timestamp}@devflow.io`;
    const testPassword = 'Password_12345!';

    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Tester',
        email: testUserEmail,
        password: testPassword,
        role: 'developer'
      })
    });

    const regData = await regRes.json();
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regData.success === true, 'Response has success: true');
    assert(Boolean(regData.data.token), 'Returns JWT auth token');
    assert(regData.data.user.email === testUserEmail, 'Returns registered user email');
    assert(regData.data.user.passwordHash === undefined, 'passwordHash is NOT exposed in response');

    const authToken = regData.data.token;
    const userId = regData.data.user.id || regData.data.user._id;
    console.log(`  Registered user ID: ${userId}\n`);

    // 2. AUTH / ME & PROTECTED ROUTE
    console.log('[STEP 2] Testing Protected Route & Session Verification...');
    // Without token
    const noTokenRes = await fetch(`${BASE_URL}/api/auth/me`);
    assert(noTokenRes.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // With token
    const withTokenRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const withTokenData = await withTokenRes.json();
    assert(withTokenRes.status === 200, 'GET /api/auth/me with Bearer token returns 200 OK');
    assert(withTokenData.data.email === testUserEmail, 'Returns verified user profile');
    console.log('');

    // 3. LOGOUT & LOGIN
    console.log('[STEP 3] Testing Logout and Re-Login...');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK');

    // Invalid login attempt
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: 'WrongPassword999' })
    });
    assert(badLoginRes.status === 401, 'Invalid password returns 401 Unauthorized');

    // Valid login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK');
    assert(Boolean(loginData.data.token), 'Login returns new valid JWT token');
    assert(loginData.data.user.passwordHash === undefined, 'passwordHash is NOT exposed');
    console.log('');

    // 4. PROJECTS CRUD
    console.log('[STEP 4] Testing Project CRUD Flow with MongoDB Atlas Persistence...');
    // Create Project
    const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: `E2E Test Project ${timestamp}`,
        description: 'Automated full-stack verification project',
        ownerId: userId,
        status: 'active',
        progress: 10
      })
    });
    const createProjData = await createProjRes.json();
    assert(createProjRes.status === 201, 'POST /api/projects creates project (201 Created)');
    const projectId = createProjData.data.id || createProjData.data._id;
    assert(Boolean(projectId), 'Created project has valid MongoDB ObjectId');

    // Edit Project
    const editProjRes = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: `E2E Test Project Updated ${timestamp}`,
        description: 'Updated project description in MongoDB Atlas',
        status: 'active',
        progress: 75
      })
    });
    const editProjData = await editProjRes.json();
    assert(editProjRes.status === 200, 'PUT /api/projects/:id updates project (200 OK)');
    assert(editProjData.data.progress === 75, 'Project progress updated to 75% in MongoDB');

    // Verify persistence via GET
    const getProjRes = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    const getProjData = await getProjRes.json();
    assert(getProjRes.status === 200, 'GET /api/projects/:id retrieves updated project');
    assert(getProjData.data.name.includes('Updated'), 'Updated project name persisted');
    console.log('');

    // 5. TASKS CRUD & STATUS CYCLE
    console.log('[STEP 5] Testing Task Management & Status Cycle in MongoDB...');
    // Create Task
    const createTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Initial Development Task',
        description: 'Testing task status transitions',
        projectId: projectId,
        priority: 'high',
        status: 'todo'
      })
    });
    const createTaskData = await createTaskRes.json();
    assert(createTaskRes.status === 201, 'POST /api/tasks creates task (201 Created)');
    const taskId = createTaskData.data.id || createTaskData.data._id;

    // Cycle Status: todo -> in-progress
    const toProgressRes = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-progress' })
    });
    const toProgressData = await toProgressRes.json();
    assert(toProgressRes.status === 200, 'PATCH /api/tasks/:id/status moves to in-progress');
    assert(toProgressData.data.status === 'in-progress', 'Status updated to in-progress');

    // Cycle Status: in-progress -> done
    const toDoneRes = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' })
    });
    const toDoneData = await toDoneRes.json();
    assert(toDoneRes.status === 200, 'PATCH /api/tasks/:id/status moves to done');
    assert(toDoneData.data.status === 'done', 'Status updated to done');

    // Cycle Status: done -> todo
    const toTodoRes = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'todo' })
    });
    const toTodoData = await toTodoRes.json();
    assert(toTodoRes.status === 200, 'PATCH /api/tasks/:id/status cycles back to todo');
    assert(toTodoData.data.status === 'todo', 'Status cycled back to todo');

    // Delete single task
    const delTaskRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
    assert(delTaskRes.status === 200, 'DELETE /api/tasks/:id deletes task');
    console.log('');

    // 6. AI ASSISTANT: TASK GENERATOR
    console.log('[STEP 6] Testing AI Task Generator with Prompt: "Build an e-commerce mobile application"...');
    const aiGenRes = await fetch(`${BASE_URL}/api/ai/generate-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Build an e-commerce mobile application',
        projectId: projectId
      })
    });
    const aiGenData = await aiGenRes.json();
    assert(aiGenRes.status === 200, 'POST /api/ai/generate-tasks returns 200 OK');
    assert(Array.isArray(aiGenData.data.tasks), 'Returns tasks array');
    assert(
      aiGenData.data.tasks.length >= 4 && aiGenData.data.tasks.length <= 8,
      `Generated ${aiGenData.data.tasks.length} structured development tasks (expected 4-8)`
    );
    console.log(`  AI Provider: ${aiGenData.data.provider}`);
    console.log(`  Sample generated task: "${aiGenData.data.tasks[0].title}" (${aiGenData.data.tasks[0].priority})`);

    // 7. AI BATCH TASK SAVING
    console.log('[STEP 7] Testing Batch Saving of Selected AI Tasks to MongoDB...');
    const tasksToSave = aiGenData.data.tasks.slice(0, 3); // User selects 3 tasks
    const saveAiRes = await fetch(`${BASE_URL}/api/ai/save-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId,
        tasks: tasksToSave
      })
    });
    const saveAiData = await saveAiRes.json();
    assert(saveAiRes.status === 201, 'POST /api/ai/save-tasks returns 201 Created');
    assert(saveAiData.data.savedCount === 3, 'Batch saved 3 selected tasks to project in MongoDB Atlas');

    // Verify saved tasks in Task API
    const verifyTasksRes = await fetch(`${BASE_URL}/api/tasks?projectId=${projectId}`);
    const verifyTasksData = await verifyTasksRes.json();
    assert(verifyTasksRes.status === 200, 'GET /api/tasks returns saved AI tasks');
    assert(verifyTasksData.data.length === 3, 'All 3 AI tasks verified persisted in MongoDB Atlas');
    console.log('');

    // 8. AI PRODUCTIVITY SUGGESTIONS
    console.log('[STEP 8] Testing AI Productivity Suggestions for Project...');
    const suggestionsRes = await fetch(`${BASE_URL}/api/ai/productivity-suggestions?projectId=${projectId}`);
    const suggestionsData = await suggestionsRes.json();
    assert(suggestionsRes.status === 200, 'GET /api/ai/productivity-suggestions returns 200 OK');
    assert(Boolean(suggestionsData.data.metrics), 'Returns productivity metrics');
    assert(Array.isArray(suggestionsData.data.suggestions), 'Returns actionable suggestion cards');
    console.log(`  Analyzed project metrics: ${JSON.stringify(suggestionsData.data.metrics)}`);
    console.log('');

    // 9. CLEANUP TEST DATA
    console.log('[STEP 9] Cleaning up test project and cascading tasks...');
    const delProjRes = await fetch(`${BASE_URL}/api/projects/${projectId}`, { method: 'DELETE' });
    assert(delProjRes.status === 200, 'DELETE /api/projects/:id deletes test project and cascades tasks');

    // Verify cascading delete removed tasks
    const checkTasksRes = await fetch(`${BASE_URL}/api/tasks?projectId=${projectId}`);
    const checkTasksData = await checkTasksRes.json();
    assert(checkTasksData.data.length === 0, 'Cascading delete verified: 0 tasks remain in project');
    console.log('');

    // 10. CORS HEADERS
    console.log('[STEP 10] Checking CORS Headers on API Responses...');
    const corsHeader = healthRes.headers.get('access-control-allow-origin');
    assert(corsHeader === '*' || corsHeader !== null, 'CORS header access-control-allow-origin is present');

    console.log('\n====================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error during verification:', error);
    process.exit(1);
  }
}

runVerification();

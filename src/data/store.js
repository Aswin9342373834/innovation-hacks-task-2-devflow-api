const { v4: uuidv4 } = require('uuid');

// Seed data definitions with realistic fixed UUIDs
const initialUsers = [
  {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    name: 'Alice Johnson',
    email: 'alice.johnson@devflow.io',
    role: 'manager',
    createdAt: '2026-01-10T08:30:00.000Z'
  },
  {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    name: 'Bob Smith',
    email: 'bob.smith@devflow.io',
    role: 'developer',
    createdAt: '2026-01-12T09:15:00.000Z'
  },
  {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-333333333333',
    name: 'Carol Danvers',
    email: 'carol.danvers@devflow.io',
    role: 'designer',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-444444444444',
    name: 'David Miller',
    email: 'david.miller@devflow.io',
    role: 'tester',
    createdAt: '2026-01-20T11:45:00.000Z'
  }
];

const initialProjects = [
  {
    id: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    name: 'DevFlow Dashboard',
    description: 'Modern developer productivity analytics and workspace overview.',
    ownerId: 'a1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    status: 'active',
    progress: 65,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z'
  },
  {
    id: 'b1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    name: 'Cloud Infrastructure Migration',
    description: 'Migrating legacy monolith services to containerized cloud microservices.',
    ownerId: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    status: 'active',
    progress: 40,
    createdAt: '2026-02-10T11:00:00.000Z',
    updatedAt: '2026-02-18T16:00:00.000Z'
  },
  {
    id: 'b1b2c3d4-e5f6-4a1b-8c2d-333333333333',
    name: 'Mobile Client v2',
    description: 'Next-generation cross-platform mobile companion application.',
    ownerId: 'a1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    status: 'completed',
    progress: 100,
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-02-28T18:00:00.000Z'
  }
];

const initialTasks = [
  {
    id: 'c1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    title: 'Design API Spec',
    description: 'Finalize OpenAPI/REST specifications for users, projects, and tasks.',
    projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    assignedTo: 'a1b2c3d4-e5f6-4a1b-8c2d-333333333333',
    status: 'done',
    priority: 'high',
    dueDate: '2026-03-01T00:00:00.000Z',
    createdAt: '2026-02-05T09:00:00.000Z',
    updatedAt: '2026-02-10T12:00:00.000Z'
  },
  {
    id: 'c1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    title: 'Implement Express REST Endpoints',
    description: 'Build user, project, and task controllers with validation and error handling.',
    projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    assignedTo: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-03-10T00:00:00.000Z',
    createdAt: '2026-02-12T10:00:00.000Z',
    updatedAt: '2026-02-20T14:30:00.000Z'
  },
  {
    id: 'c1b2c3d4-e5f6-4a1b-8c2d-333333333333',
    title: 'Dockerize Gateway Service',
    description: 'Write multi-stage Dockerfile and test local compose orchestration.',
    projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    assignedTo: 'a1b2c3d4-e5f6-4a1b-8c2d-222222222222',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-03-25T00:00:00.000Z',
    createdAt: '2026-02-15T11:00:00.000Z',
    updatedAt: '2026-02-15T11:00:00.000Z'
  },
  {
    id: 'c1b2c3d4-e5f6-4a1b-8c2d-444444444444',
    title: 'Automated Integration Tests',
    description: 'Write comprehensive integration tests verifying endpoint response codes and schemas.',
    projectId: 'b1b2c3d4-e5f6-4a1b-8c2d-111111111111',
    assignedTo: 'a1b2c3d4-e5f6-4a1b-8c2d-444444444444',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-03-30T00:00:00.000Z',
    createdAt: '2026-02-18T14:00:00.000Z',
    updatedAt: '2026-02-18T14:00:00.000Z'
  }
];

// Active in-memory arrays
let users = [];
let projects = [];
let tasks = [];

// Helper function to reset data to clean state
const resetStore = () => {
  users = JSON.parse(JSON.stringify(initialUsers));
  projects = JSON.parse(JSON.stringify(initialProjects));
  tasks = JSON.parse(JSON.stringify(initialTasks));
};

// Initialize store immediately
resetStore();

module.exports = {
  getUsers: () => users,
  getProjects: () => projects,
  getTasks: () => tasks,
  getUserById: (id) => users.find((u) => u.id === id),
  getUserByEmail: (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  addUser: (userData) => {
    const newUser = {
      id: userData.id || uuidv4(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'developer',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },
  getProjectById: (id) => projects.find((p) => p.id === id),
  addProject: (projectData) => {
    const now = new Date().toISOString();
    const newProject = {
      id: projectData.id || uuidv4(),
      name: projectData.name,
      description: projectData.description,
      ownerId: projectData.ownerId,
      status: projectData.status || 'active',
      progress: projectData.progress !== undefined ? projectData.progress : 0,
      createdAt: now,
      updatedAt: now
    };
    projects.push(newProject);
    return newProject;
  },
  getTaskById: (id) => tasks.find((t) => t.id === id),
  addTask: (taskData) => {
    const now = new Date().toISOString();
    const newTask = {
      id: taskData.id || uuidv4(),
      title: taskData.title,
      description: taskData.description || '',
      projectId: taskData.projectId,
      assignedTo: taskData.assignedTo || null,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      createdAt: now,
      updatedAt: now
    };
    tasks.push(newTask);
    return newTask;
  },
  updateTask: (id, updates) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const existing = tasks[index];
    const updated = {
      ...existing,
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.projectId !== undefined && { projectId: updates.projectId }),
      ...(updates.assignedTo !== undefined && { assignedTo: updates.assignedTo }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.priority !== undefined && { priority: updates.priority }),
      ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
      updatedAt: new Date().toISOString()
    };
    tasks[index] = updated;
    return updated;
  },
  deleteTask: (id) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  },
  resetStore
};

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const users = await User.create([
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@devflow.io',
        role: 'manager'
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@devflow.io',
        role: 'developer'
      },
      {
        name: 'Carol Danvers',
        email: 'carol.danvers@devflow.io',
        role: 'designer'
      },
      {
        name: 'David Miller',
        email: 'david.miller@devflow.io',
        role: 'tester'
      }
    ]);

    const [alice, bob, carol, david] = users;

    console.log('[Seed] Creating demo projects...');
    const projects = await Project.create([
      {
        name: 'DevFlow Dashboard',
        description: 'Modern developer productivity analytics and workspace overview.',
        ownerId: alice._id,
        status: 'active',
        progress: 65
      },
      {
        name: 'Cloud Infrastructure Migration',
        description: 'Migrating legacy monolith services to containerized cloud microservices.',
        ownerId: bob._id,
        status: 'active',
        progress: 40
      },
      {
        name: 'Mobile Client v2',
        description: 'Next-generation cross-platform mobile companion application.',
        ownerId: alice._id,
        status: 'completed',
        progress: 100
      }
    ]);

    const [dashboardProj, cloudProj] = projects;

    console.log('[Seed] Creating demo tasks...');
    await Task.create([
      {
        title: 'Design API Spec',
        description: 'Finalize OpenAPI/REST specifications for users, projects, and tasks.',
        projectId: dashboardProj._id,
        assignedTo: carol._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date('2026-03-01T00:00:00.000Z')
      },
      {
        title: 'Implement Express REST Endpoints',
        description: 'Build user, project, and task controllers with validation and error handling.',
        projectId: dashboardProj._id,
        assignedTo: bob._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2026-03-10T00:00:00.000Z')
      },
      {
        title: 'Dockerize Gateway Service',
        description: 'Write multi-stage Dockerfile and test local compose orchestration.',
        projectId: cloudProj._id,
        assignedTo: bob._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-03-25T00:00:00.000Z')
      },
      {
        title: 'Automated Integration Tests',
        description: 'Write comprehensive integration tests verifying endpoint response codes and schemas.',
        projectId: dashboardProj._id,
        assignedTo: david._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2026-03-30T00:00:00.000Z')
      }
    ]);

    console.log('[Seed] Database seeded successfully with:');
    console.log(`  - ${users.length} Users`);
    console.log(`  - ${projects.length} Projects`);
    console.log(`  - 4 Tasks`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;

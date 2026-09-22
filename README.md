# DevFlow AI — AI-Powered Project & Task Management Platform

DevFlow AI is a full-stack AI-powered project and task management platform developed for the Innovation Hacks Full Stack Development Internship. It combines a responsive React frontend, Node.js/Express REST API, MongoDB Atlas persistent storage, JWT authentication, and AI-powered task generation and productivity suggestions.

---

## Innovation Hacks Internship

- **Internship**: Innovation Hacks Full Stack Development Internship
- **Final Task**: Task 4 — AI-Powered Project & Task Management Platform
- **Development Progression**:
  - **Task 1 — Developer Productivity Dashboard**: Responsive React UI with local state management, metric cards, active projects, and task tracking.
  - **Task 2 — REST API**: Modular Express.js backend establishing standardized API routes, controllers, middleware, and request validation.
  - **Task 3 — MongoDB Persistent Data Layer**: Transition to cloud-hosted MongoDB Atlas document database using Mongoose ODM, schema validation, and relational integrity.
  - **Task 4 — Authentication + AI Full-Stack Platform**: End-to-end full-stack integration featuring secure user authentication (JWT + bcrypt), Google Gemini AI task breakdown and productivity insights, and seamless cloud deployment.

---

## Features

### Authentication
- User registration with name, email, role, and password validation
- User login with secure credential verification
- JWT-based stateless authentication (`Bearer` token)
- Protected backend API routes and authenticated frontend views
- Secure client-side logout handling
- Current-user identity verification (`/api/auth/me`)
- Strong password hashing using `bcryptjs`
- Password hash strictly excluded and never returned in API responses

### Dashboard
- Real-time project statistics and summary metrics
- Live task counters (Total, Todo, In Progress, Completed)
- Completed task count and real-time velocity metrics
- Dynamic overall project progress calculation
- Active project tracking with assigned leads
- Direct MongoDB-backed dynamic dashboard data

### Project Management
- Create new projects with name, description, status, and lead assignment
- View and search projects across the workspace
- Update project information and progress tracking
- Delete projects with automatic cascading cleanup of linked tasks
- Strict project ownership relationships verified against registered users
- Persistent storage in MongoDB Atlas

### Task Management
- Create tasks linked to parent projects with optional user assignments
- View tasks with multi-attribute filtering (by status, priority, and project)
- Update task details, priorities, and deadlines
- Dedicated quick status updates (`todo` → `in-progress` → `done`)
- Delete tasks with immediate data sync
- Task priority levels (`low`, `medium`, `high`)
- Target due dates with ISO formatting
- Relational integrity linking tasks to parent projects and assigned users
- Persistent storage in MongoDB Atlas

### AI Features
- **AI Task Generator**: Converts high-level project goals or feature prompts into 4–8 structured engineering tasks
- **Structured Engineering Output**: Generates titles, actionable descriptions, recommended priority levels, and default statuses
- **Interactive Review & Selection**: Review AI-generated task proposals, uncheck unwanted items, and select specific tasks to commit
- **Batch Persistence**: Save selected AI tasks directly into the targeted project in MongoDB Atlas in a single click
- **AI Productivity Suggestions**: Analyzes project workloads, completion velocity, and pending tasks to deliver actionable productivity recommendations
- **Google Gemini API Integration**: Direct integration with Gemini 2.5 Flash / 1.5 Flash models
- **Reliable Fallback Engine**: Automatic heuristic fallback ensures task generation and productivity suggestions continue working smoothly even when external AI rate limits or network issues occur

### UI / UX
- Responsive React interface optimized for desktop, tablet, and mobile displays
- DevFlow navigation header and tabbed views
- Dashboard view with real-time analytics cards and activity feed
- Dedicated Projects view with creation modal and progress bars
- Dedicated Tasks view with category filters, priority tags, and status changers
- AI Assistant workspace with prompt input, task checklist preview, and productivity insights
- Settings view for user profile and API connection verification
- Search, filter, loading spinners, and error notification states
- Polished DevFlow design system built with Tailwind CSS and Lucide icons

---

## System Architecture

```
User
 │
 ▼
React + Vite Frontend
 │
 ▼
REST API (HTTP / JSON / JWT)
 │
 ▼
Node.js + Express Backend
 │
 ├── Authentication Middleware (JWT & bcrypt)
 ├── Business Logic & Validation (express-validator)
 └── AI Service Integration (Google Gemini)
 │
 ▼
MongoDB Atlas (Cloud NoSQL Database via Mongoose)
```

### AI Request & Execution Flow

```
User Enters Project Idea
 │
 ▼
AI Task Generator
 │
 ▼
Google Gemini API (with Smart Heuristic Fallback)
 │
 ▼
Structured Engineering Tasks
 │
 ▼
User Review & Selection Interface
 │
 ▼
Batch Commit to MongoDB Atlas
```

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, JavaScript (ES6+), Tailwind CSS, Lucide React |
| **Backend** | Node.js (v24.x), Express.js (v4.21), REST API, JWT (`jsonwebtoken`), `bcryptjs` |
| **Database** | MongoDB Atlas, Mongoose ODM (v9.x) |
| **AI Integration** | Google Gemini API (`@google/genai` / Gemini Flash) |
| **Validation & Security** | `express-validator`, `cors`, `dotenv`, HTTP status codes |
| **Testing & Quality** | Node.js Native Test Runner (`node:test`), `supertest`, `mongodb-memory-server`, ESLint, Oxlint |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## Database Models & Relational Design

All models are defined under `src/models/` and export schema definitions with `{ timestamps: true }` and JSON virtual transformations (`_id` mapped to string `id`, `__v` omitted, `password` stripped).

### User Model (`src/models/User.js`)
| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Trimmed, min length 2, max length 100 |
| `email` | String | Yes | Trimmed, lowercase, unique index, valid email regex |
| `password` | String | Yes | Bcrypt hash, min 6 characters before hashing, `select: false` |
| `role` | String | No | Enum: `['developer', 'manager', 'designer', 'tester']`, default: `'developer'` |
| `createdAt` | Date | Auto | ISO 8601 Timestamp |
| `updatedAt` | Date | Auto | ISO 8601 Timestamp |

### Project Model (`src/models/Project.js`)
| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Trimmed, min length 2, max length 120 |
| `description` | String | Yes | Trimmed, min length 5, max length 1000 |
| `ownerId` | ObjectId | Yes | Reference to `User` collection (`ref: 'User'`) |
| `status` | String | No | Enum: `['active', 'completed', 'archived']`, default: `'active'` |
| `progress` | Number | No | Min: 0, Max: 100, default: 0 |
| `createdAt` | Date | Auto | ISO 8601 Timestamp |
| `updatedAt` | Date | Auto | ISO 8601 Timestamp |

### Task Model (`src/models/Task.js`)
| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Trimmed, min length 2, max length 150 |
| `description` | String | No | Trimmed, max length 2000, default: `''` |
| `projectId` | ObjectId | Yes | Reference to `Project` collection (`ref: 'Project'`) |
| `assignedTo` | ObjectId | No | Reference to `User` collection (`ref: 'User'`), default: `null` |
| `status` | String | No | Enum: `['todo', 'in-progress', 'done']`, default: `'todo'` |
| `priority` | String | No | Enum: `['low', 'medium', 'high']`, default: `'medium'` |
| `dueDate` | Date | No | Valid Date or `null` |
| `createdAt` | Date | Auto | ISO 8601 Timestamp |
| `updatedAt` | Date | Auto | ISO 8601 Timestamp |

---

## API Endpoints

All responses adhere to a consistent standard JSON envelope:
- **Success Envelope**: `{ "success": true, "message": "...", "data": ... }`
- **Error Envelope**: `{ "success": false, "message": "...", "error": { "code": "..." } }`
- **Validation Envelope**: `{ "success": false, "message": "Validation failed", "errors": [{ "field": "...", "message": "..." }] }`

### Root & Health
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API welcome message and version info | No |
| `GET` | `/api/health` | Health check reporting runtime environment and MongoDB status | No |

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user, hashes password, returns user object & JWT | No |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Yes (`Bearer <token>`) |
| `POST` | `/api/auth/logout` | Acknowledge client logout and invalidate session | No |

### Users
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Retrieve all registered users | No |
| `GET` | `/api/users/:id` | Retrieve user by ID | No |
| `POST` | `/api/users` | Create user profile with role and email validation | No |
| `PUT` | `/api/users/:id` | Full update of user information | No |
| `PATCH` | `/api/users/:id` | Partial update of user information | No |
| `DELETE` | `/api/users/:id` | Delete user and safely unassign tasks assigned to them | No |

### Projects
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Retrieve all projects with populated owner details | No |
| `GET` | `/api/projects/:id` | Retrieve specific project by ID with owner details | No |
| `POST` | `/api/projects` | Create a project (verifies referenced owner exists) | No |
| `PUT` | `/api/projects/:id` | Full update of project details | No |
| `PATCH` | `/api/projects/:id` | Partial update of project details | No |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-remove associated tasks | No |

### Tasks
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve tasks (supports `?status=`, `?priority=`, `?projectId=`) | No |
| `GET` | `/api/tasks/:id` | Retrieve task by ID with populated project and assignee | No |
| `POST` | `/api/tasks` | Create a task (verifies project and assignee exist) | No |
| `PUT` | `/api/tasks/:id` | Full update of task details | No |
| `PATCH` | `/api/tasks/:id` | Partial update of task details | No |
| `PATCH` | `/api/tasks/:id/status` | Quick status change (`todo`, `in-progress`, `done`) | No |
| `DELETE` | `/api/tasks/:id` | Delete task | No |

### AI Assistant
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/generate-tasks` | Generate structured tasks from project description via Gemini AI | Optional |
| `POST` | `/api/ai/save-tasks` | Batch save user-selected AI tasks to targeted project in MongoDB | Optional |
| `GET` | `/api/ai/productivity-suggestions` | Get AI productivity metrics and bottleneck recommendations | Optional |

---

## Environment Variables

### Backend Configuration (`DevFlow-API/.env`)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=<your-jwt-secret>
AI_API_KEY=<your-gemini-api-key>
```

### Frontend Configuration (`.env`)

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

> [!CAUTION]
> **Security Notice**: Never commit `.env` files, actual passwords, API keys, JWT secrets, or database credentials to GitHub. All sensitive variables must be supplied securely through hosting provider dashboards (Render, Vercel) or kept in local uncommitted `.env` files.

---

## Local Development

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd DevFlow-API

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your local or cloud MongoDB URI, JWT secret, and Gemini API key

# (Optional) Seed demo data into MongoDB
npm run seed

# Run in development mode with live reload
npm run dev
```

The backend server will run at `http://localhost:5000`.

### 2. Frontend Setup

```bash
# From the repository root
npm install

# Create local environment configuration
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000

# Start Vite development server
npm run dev
```

The frontend application will run at `http://localhost:5173`. Ensure that `VITE_API_URL` points to your running backend.

---

## Deployment

| Component | Platform | Production URL |
| :--- | :--- | :--- |
| **Frontend** | Vercel | [https://innovation-hacks-task-1-devflow.vercel.app/](https://innovation-hacks-task-1-devflow.vercel.app/) |
| **Backend** | Render | [https://innovation-hacks-task-2-devflow-api.onrender.com](https://innovation-hacks-task-2-devflow-api.onrender.com) |
| **Database** | MongoDB Atlas | Cloud-hosted MongoDB Atlas M0 cluster |

---

## Testing & Quality Assurance

All test suites and code linters across the backend and frontend have been verified and pass with zero errors.

### Test Results Summary

| Suite | Scope | Result | Status |
| :--- | :--- | :--- | :--- |
| **Backend Automated Tests** | Unit & Integration testing (`node:test`, `supertest`, `mongodb-memory-server`) | **50 / 50 passed** | Passed |
| **Backend Lint** | ESLint standards across `src/` | **0 errors** | Passed |
| **Frontend Build** | Vite production compilation & bundling | **Successful** | Passed |
| **Frontend Lint** | Oxlint syntax & React best practices across 32 files | **0 errors** | Passed |
| **Full Integration Verification** | E2E flow test script (`tests/e2e_integration_verification.js`) | **42 / 42 checks passed** | Passed |

### Running Tests Locally

```bash
# Run backend test suite (in-memory MongoDB runner, zero-credential required)
cd DevFlow-API
npm test

# Run backend linter
npm run lint

# Run live E2E integration verification (requires backend running)
node tests/e2e_integration_verification.js
```

---

## Security

- **JWT Authentication**: Stateless, signed tokens using industry-standard HMAC SHA-256 for secure session verification.
- **Bcrypt Password Hashing**: Passwords hashed with `bcryptjs` salt rounds before database writes.
- **Sensitive Data Exclusion**: Mongoose schemas configured with `select: false` on password fields to ensure hashes are never exposed in responses.
- **Protected Backend Routes**: Express middleware validates Bearer tokens on protected endpoints.
- **Environment Variable Isolation**: Zero secrets stored in version control; `.gitignore` strictly protects `.env`.
- **Cloud Credential Injection**: MongoDB Atlas credentials and Gemini API keys configured exclusively via Render dashboard environment variables.
- **Client Boundary Protection**: AI API keys remain exclusively on the backend server. The frontend interacts only with public API routes.

---

## Project Structure

```
DevFlow-API/
├── api/
│   └── index.js                         # Serverless entry wrapper
├── docs/
│   └── (Architecture documentation)
├── postman/
│   └── DevFlow-API.postman_collection.json # Exported Postman collection v2.1
├── src/
│   ├── config/
│   │   └── db.js                        # MongoDB Atlas connection manager
│   ├── controllers/
│   │   ├── aiController.js              # AI task generation & productivity handler
│   │   ├── authController.js            # Register, login, getMe, logout logic
│   │   ├── projectController.js         # Project CRUD and ownership logic
│   │   ├── taskController.js            # Task CRUD, filters, status patch logic
│   │   └── userController.js            # User CRUD and profile logic
│   ├── data/
│   │   └── seedData.js                  # Database seed script for demo records
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification & optional auth middleware
│   │   ├── errorMiddleware.js           # Centralized JSON error responder
│   │   └── notFoundMiddleware.js        # 404 route fallback handler
│   ├── models/
│   │   ├── Project.js                   # Mongoose Project schema & virtuals
│   │   ├── Task.js                      # Mongoose Task schema & virtuals
│   │   └── User.js                      # Mongoose User schema & password hashing
│   ├── routes/
│   │   ├── aiRoutes.js                  # /api/ai endpoints
│   │   ├── authRoutes.js                # /api/auth endpoints
│   │   ├── projectRoutes.js             # /api/projects endpoints
│   │   ├── taskRoutes.js                # /api/tasks endpoints
│   │   └── userRoutes.js                # /api/users endpoints
│   ├── services/
│   │   └── aiService.js                 # Google Gemini integration & fallback engine
│   ├── utils/
│   │   ├── jwt.js                       # JWT sign & verify utility functions
│   │   └── response.js                  # Standardized response envelopes
│   ├── validators/
│   │   ├── authValidator.js             # express-validator rules for auth
│   │   ├── projectValidator.js          # express-validator rules for projects
│   │   ├── taskValidator.js             # express-validator rules for tasks
│   │   └── userValidator.js             # express-validator rules for users
│   ├── app.js                           # Express application configuration
│   └── server.js                        # Server listener & database initializer
├── tests/
│   ├── api.test.js                      # Task 3 automated CRUD & schema tests
│   ├── auth_and_ai.test.js              # Task 4 automated Auth & AI tests
│   ├── e2e_integration_verification.js  # 42-step end-to-end integration test
│   └── manual_verification.js           # Manual API verification utility
├── .env.example                         # Safe environment variable template
├── eslint.config.js                     # ESLint configuration
├── package.json                         # Node.js project manifest & scripts
└── render.yaml                          # Render blueprint for cloud deployment
```

---

## Demo

- **Live Frontend**: [https://innovation-hacks-task-1-devflow.vercel.app/](https://innovation-hacks-task-1-devflow.vercel.app/)
- **Live Backend**: [https://innovation-hacks-task-2-devflow-api.onrender.com](https://innovation-hacks-task-2-devflow-api.onrender.com)
- **Demo Video**: [ADD DEMO VIDEO LINK HERE]
- **GitHub Repository**: [https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api](https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api)

---

## Task 4 Demonstration Flow

1. **User Registration / Login**:
   - Register a new account on the frontend or log in with existing credentials.
   - Observe JWT token generation and authentication state persistence.
2. **Explore Dashboard**:
   - View live overview metrics for projects, total tasks, and completion velocity dynamically loaded from MongoDB Atlas.
3. **View & Manage Projects**:
   - Navigate to the Projects view to explore existing projects.
   - Create a new project or update details; verify changes update state and save to MongoDB.
4. **View & Manage Tasks**:
   - View tasks categorized across Todo, In Progress, and Done.
   - Filter by project, priority, or status.
   - Update a task's status or details with real-time UI synchronization.
5. **AI Task Generation**:
   - Navigate to the AI Assistant tab.
   - Enter a project prompt (e.g., *"Build an e-commerce mobile application"*).
   - Click **Generate Tasks** to trigger Google Gemini AI analysis.
6. **Review & Select AI Proposals**:
   - Review the generated task list complete with titles, descriptions, and recommended priorities.
   - Uncheck any tasks not needed or select the desired set.
7. **Commit AI Tasks to MongoDB**:
   - Select a destination project and save the reviewed tasks.
   - Confirm tasks are persisted to MongoDB Atlas via `/api/ai/save-tasks`.
8. **Verify Persistence in Tasks View**:
   - Return to the Tasks view and verify the newly generated AI tasks are listed and editable.
9. **Inspect AI Productivity Insights**:
   - Toggle to the Productivity Insights tab in the AI Assistant to review workflow bottlenecks and task distribution recommendations.
10. **Verify Cloud Deployments**:
    - Confirm the live web interface on Vercel communicates seamlessly with the live Render API and MongoDB Atlas cloud database.

---

## Future Improvements

- **Team Collaboration**: Real-time collaborative task updates via WebSockets.
- **Advanced Analytics**: Interactive burndown charts, team velocity graphs, and time-tracking metrics.
- **Expanded AI Workflows**: Automated code review suggestions, sprint planning estimation, and natural-language task querying.
- **Notification Engine**: In-app notifications and email alerts for task assignments and upcoming due dates.
- **Role-Based Access Control**: Granular permissions distinguishing organization admins, project leads, and external contributors.

---

## Conclusion

DevFlow AI demonstrates a complete full-stack engineering workflow spanning a responsive React user interface, structured RESTful API architecture, stateless JWT authentication, persistent cloud storage with MongoDB Atlas and Mongoose, Google Gemini AI intelligence, automated testing, and reliable multi-tier cloud deployment.

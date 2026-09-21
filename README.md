# DevFlow API — Task 3 Database Integration

> **Innovation Hacks Full Stack Development Internship**  
> **Task 3: Database Integration — MongoDB Atlas & Mongoose**

---

## 1. Project Overview

**DevFlow API** is a modular, production-ready RESTful backend engine powering developer workflows, team directory management, project tracking, and task lifecycle operations. 

In **Task 3**, the API transitions from an in-memory data store to a fully persistent, secure **MongoDB Atlas** database layer utilizing **Mongoose ODM**. All existing endpoints and response structures are preserved while introducing database-level schemas, field validations, relational references, cascading/safe deletion logic, and automated test coverage.

```
Frontend / Postman
        │
        ▼
   [ REST API ]
        │
        ▼
[ Express Backend ]
  (Routing, Middleware & Validation)
        │
        ▼
   [ Mongoose ]
  (Models, Schemas & Hooks)
        │
        ▼
[ MongoDB Atlas ]
  (Persistent Cloud Document Storage)
```

---

## 2. Task 3 Objective

The primary objective of Task 3 is to integrate a robust, persistent MongoDB Atlas database into the DevFlow REST API:
1. **User Data Storage**: Persistent storage of team members with unique email indexing and role constraints.
2. **Project Data Storage**: Structured projects with foreign reference links to User owners.
3. **Task Data Storage**: Granular task management linked to parent Projects and optional assigned Users.
4. **Full CRUD Operations**: Complete Create, Read, Update, and Delete endpoints for all three entities (`Users`, `Projects`, `Tasks`).
5. **Database/Schema-Level Validation**: Enforced at the Mongoose schema layer (required fields, string lengths, regex email validation, enums) complemented by route-level input validation (`express-validator`).
6. **Relational References**: MongoDB `ObjectId` references (`ownerId`, `projectId`, `assignedTo`) with Mongoose `.populate()` for relationship retrieval.
7. **Secure Database Configuration**: Connection URI loaded strictly through environment variables (`process.env.MONGODB_URI`) with no hard-coded credentials.
8. **Automated Testing**: Offline and CI/CD testing supported using an isolated in-memory MongoDB runner (`mongodb-memory-server`) to ensure zero-credential dependency.
9. **Demo-Ready Seeding**: Automated seed utility (`npm run seed`) to quickly populate MongoDB Atlas with relational demo records.
10. **Render Deployment Ready**: Declarative `render.yaml` configuration with environment variable abstraction.

---

## 3. Technology Stack

- **Runtime**: Node.js (`v24.x` / CommonJS)
- **Framework**: Express.js (`v4.21.2`)
- **Database**: MongoDB Atlas (Cloud NoSQL Document Database)
- **ODM**: Mongoose (`v9.x`)
- **Validation**: `express-validator` (`v7.2.1`) & Mongoose Schema Validation
- **CORS**: `cors` (`v2.8.5`)
- **Configuration**: `dotenv` (`v16.4.7`)
- **Testing**: Node.js Native Test Runner (`node:test`, `node:assert/strict`), `supertest` (`v7.0.0`), `mongodb-memory-server` (`v10.x`)
- **Code Standards**: ESLint (`v9.21.0`)
- **API Documentation**: Postman Collection v2.1
- **Deployment Platform**: Render

---

## 4. Database Models & Schema Design

All models are defined under `src/models/` and export schema definitions with `{ timestamps: true }` and JSON virtual transformations (`_id` mapped to string `id`, `__v` omitted).

### 4.1 User Model (`src/models/User.js`)

| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Trimmed, min length 2, max length 100 |
| `email` | String | Yes | Trimmed, lowercase, unique index, valid email regex pattern |
| `role` | String | No | Enum: `['developer', 'manager', 'designer', 'tester']`, default: `'developer'` |
| `createdAt` | Date | Auto | ISO 8601 Timestamp |
| `updatedAt` | Date | Auto | ISO 8601 Timestamp |

### 4.2 Project Model (`src/models/Project.js`)

| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Trimmed, min length 2, max length 120 |
| `description` | String | Yes | Trimmed, min length 5, max length 1000 |
| `ownerId` | ObjectId | Yes | Reference to `User` collection (`ref: 'User'`) |
| `status` | String | No | Enum: `['active', 'completed', 'archived']`, default: `'active'` |
| `progress` | Number | No | Min: 0, Max: 100, default: 0 |
| `createdAt` | Date | Auto | ISO 8601 Timestamp |
| `updatedAt` | Date | Auto | ISO 8601 Timestamp |

### 4.3 Task Model (`src/models/Task.js`)

| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Trimmed, min length 2, max length 150 |
| `description` | String | No | Trimmed, default: `''`, max length 2000 |
| `projectId` | ObjectId | Yes | Reference to `Project` collection (`ref: 'Project'`) |
| `assignedTo` | ObjectId | No | Reference to `User` collection (`ref: 'User'`), default: `null` |
| `status` | String | No | Enum: `['todo', 'in-progress', 'done']`, default: `'todo'` |
| `priority` | String | No | Enum: `['low', 'medium', 'high']`, default: `'medium'` |
| `dueDate` | Date | No | Valid Date or `null` |
| `createdAt` | Date | Auto | ISO 8601 Timestamp |
| `updatedAt` | Date | Auto | ISO 8601 Timestamp |

---

## 5. Relationships & Integrity Strategy

```
  ┌──────────────┐
  │     User     │
  └──────┬───────┘
         │ 1:N (ownerId)
         ▼
  ┌──────────────┐
  │   Project    │
  └──────┬───────┘
         │ 1:N (projectId)
         ▼
  ┌──────────────┐
  │     Task     │◄──────── (assignedTo: optional User ref)
  └──────────────┘
```

1. **Foreign Reference Validation**:
   - Creating or updating a **Project** verifies that the referenced `ownerId` exists in the `User` collection (returns `404 OWNER_NOT_FOUND` if missing).
   - Creating or updating a **Task** verifies that the referenced `projectId` exists in the `Project` collection (returns `404 PROJECT_NOT_FOUND` if missing).
   - If an `assignedTo` User is specified on a Task, it verifies the user exists (returns `404 USER_NOT_FOUND` if missing).
2. **Safe Relational Deletion Strategy**:
   - **User Deletion**: When a user is deleted (`DELETE /api/users/:id`), any active tasks assigned to that user have their `assignedTo` field safely unassigned (`null`) to prevent orphan broken references, without deleting the tasks themselves.
   - **Project Deletion**: When a project is deleted (`DELETE /api/projects/:id`), tasks explicitly linked to that project are removed to maintain relational consistency, and the count of removed tasks is reported in the response envelope.
3. **Mongoose Population**:
   - Retrieval endpoints (`GET /api/projects`, `GET /api/projects/:id`, `GET /api/tasks`, `GET /api/tasks/:id`) automatically populate foreign entities (`ownerId`, `projectId`, `assignedTo`) with relevant subset fields (`name`, `email`, `role`, `status`).

---

## 6. API Endpoints Reference

All responses adhere to a consistent standard JSON envelope:
- **Success Envelope**: `{ "success": true, "message": "...", "data": ... }`
- **Error Envelope**: `{ "success": false, "message": "...", "error": { "code": "..." } }`
- **Validation Envelope**: `{ "success": false, "message": "Validation failed", "errors": [{ "field": "...", "message": "..." }] }`

### 6.1 Root & Health Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API welcome and version metadata | `200` |
| `GET` | `/api/health` | Health check reporting runtime & MongoDB connection state | `200` |

### 6.2 Users Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Register a new user | `201`, `400`, `409` |
| `GET` | `/api/users` | Retrieve all users | `200` |
| `GET` | `/api/users/:id` | Retrieve user by ID | `200`, `404` |
| `PUT` | `/api/users/:id` | Full update of user details | `200`, `400`, `404`, `409` |
| `PATCH`| `/api/users/:id` | Partial update of user details | `200`, `400`, `404`, `409` |
| `DELETE`| `/api/users/:id`| Delete user and safely unassign associated tasks | `200`, `404` |

### 6.3 Projects Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Create a new project (verifies owner user exists) | `201`, `400`, `404` |
| `GET` | `/api/projects` | Retrieve all projects (with populated owner) | `200` |
| `GET` | `/api/projects/:id` | Retrieve project by ID (with populated owner) | `200`, `404` |
| `PUT` | `/api/projects/:id` | Full update of project details | `200`, `400`, `404` |
| `PATCH`| `/api/projects/:id` | Partial update of project details | `200`, `400`, `404` |
| `DELETE`| `/api/projects/:id`| Delete project and safely clean up project tasks | `200`, `404` |

### 6.4 Tasks Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Create task (verifies project and assignee exist) | `201`, `400`, `404` |
| `GET` | `/api/tasks` | Retrieve tasks with query filters (`status`, `priority`, `projectId`) | `200` |
| `GET` | `/api/tasks/:id` | Retrieve task by ID with populated project & assignee | `200`, `404` |
| `PUT` | `/api/tasks/:id` | Full update of task details | `200`, `400`, `404` |
| `PATCH`| `/api/tasks/:id` | Partial update of task details | `200`, `400`, `404` |
| `PATCH`| `/api/tasks/:id/status` | Update task status specifically (`todo`, `in-progress`, `done`) | `200`, `400`, `404` |
| `DELETE`| `/api/tasks/:id` | Delete task | `200`, `404` |

---

## 7. MongoDB Atlas Setup Guide

To connect DevFlow API to your MongoDB Atlas cluster:

1. **Sign in to MongoDB Atlas**: Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Cluster**: Use the free tier (M0 Shared).
3. **Database Access**: Create a Database User (e.g. `devflow_admin`) with password authentication and `readWriteAnyDatabase` privileges.
4. **Network Access**: Add IP address `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Render and development environments.
5. **Get Connection String**:
   - Go to **Databases** → **Connect** → **Drivers** (Node.js).
   - Copy the SRV URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/devflow?retryWrites=true&w=majority
     ```
6. **Set Environment Variable**: Add this URI to your local `.env` file (never commit `.env` to git).

---

## 8. Environment Variables

Create a local `.env` file from `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/devflow?retryWrites=true&w=majority
```

> [!CAUTION]
> Never commit `.env` or hard-code credentials in the repository. The `.gitignore` file is configured to strictly exclude `.env`.

---

## 9. Installation & Running Locally

### 9.1 Clone & Install Dependencies

```bash
git clone https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api.git
cd DevFlow-API
npm install
```

### 9.2 Seed the Database (Demo Ready)

Populate your connected MongoDB Atlas database with realistic demo users, projects, and tasks:

```bash
npm run seed
```

### 9.3 Start the Development Server

```bash
npm run dev
```

The server binds to `0.0.0.0:5000` with live reload enabled.

### 9.4 Start the Production Server

```bash
npm start
```

---

## 10. Automated Testing & Quality Checks

### 10.1 Run Automated Test Suite

```bash
npm test
```

Tests execute against an isolated in-memory MongoDB instance (`mongodb-memory-server`) or your configured test database. No live Atlas credentials are required to run automated tests.

Test coverage verifies:
- Database connectivity and `/api/health` status reporting
- Full CRUD for Users (create, list, get by ID, update, delete, duplicate email handling)
- Full CRUD for Projects (create with owner check, list, get by ID, update, delete with task cleanup)
- Full CRUD for Tasks (create with project & assignee checks, list, filter by status/priority/project, get by ID, update, patch status, delete)
- Entity relationships, populated fields, and foreign reference constraints
- Schema validation, express-validator checks, invalid ObjectIds, and 404 responses

### 10.2 Run Linter

```bash
npm run lint
```

Runs ESLint to enforce JavaScript code quality and maintain clean formatting standards.

---

## 11. Postman Testing

A comprehensive Postman collection is located in `postman/DevFlow-API.postman_collection.json`.

### How to Import and Test:
1. Open Postman.
2. Click **Import** and select `postman/DevFlow-API.postman_collection.json`.
3. Set the collection variable `baseUrl` to `http://localhost:5000` (or your live Render URL).
4. Run requests in logical sequence:
   - **Root & Health** → Check server & DB readiness.
   - **Users** → Create User (automatically saves `sampleUserId`).
   - **Projects** → Create Project (uses `sampleUserId`, saves `sampleProjectId`).
   - **Tasks** → Create Task (uses `sampleProjectId` and `sampleUserId`, saves `sampleTaskId`).
   - Run Updates, Filters, and Deletions.

---

## 12. Render Deployment Instructions

DevFlow API is pre-configured for seamless zero-downtime deployment on Render via `render.yaml`.

### Step-by-Step Deployment:
1. Push your Task 3 code to your GitHub repository.
2. Sign in to [Render](https://render.com) and click **New** → **Blueprint**.
3. Connect your repository. Render automatically reads `render.yaml`:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. In the Render Dashboard under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/devflow?retryWrites=true&w=majority`
   - `NODE_ENV`: `production`
5. Click **Apply** and trigger manual deployment.
6. Verify deployment by visiting:
   ```
   https://<your-render-service>.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "message": "DevFlow API is running",
     "data": {
       "environment": "production",
       "database": "connected"
     }
   }
   ```

---

## 13. Demo Video Placeholder

> **Demo Walkthrough Video**:  
> `[Link to Demo Video: DevFlow API Task 3 Database Integration]`  
> *(Demonstrating MongoDB Atlas connection, seed execution, full CRUD operations via Postman, query filters, schema validation, and health checks.)*

---

## 14. Internship Submission Checklist

- [x] User data storage in MongoDB
- [x] Project data storage in MongoDB
- [x] Task data storage in MongoDB
- [x] Full CRUD operations across all entities
- [x] Schema-level validation and express-validator
- [x] Relational references (`ownerId`, `projectId`, `assignedTo`)
- [x] Populated relationship retrieval
- [x] Safe relational deletion logic
- [x] Secure database configuration (`process.env.MONGODB_URI`)
- [x] No hard-coded credentials committed
- [x] Updated Postman collection
- [x] Automated test suite
- [x] Render deployment preparation (`render.yaml`)

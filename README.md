# DevFlow API

> **Task 2 — Backend & REST API Development: Users, Projects & Tasks API**  
> Innovation Hacks Full Stack Development Internship

---

## 1. Project Title & Overview
**DevFlow API** is the core RESTful backend service designed to power developer productivity and project management workflows. It provides robust, validated endpoints for managing team members (users), software projects, and associated engineering tasks with strict status workflows, query filtering, centralized error handling, and structured JSON responses.

---

## 2. Task Description & Objective
- **Task**: Backend & REST API Development (Task 2 of 4)
- **Objective**: Develop a production-grade, modular Node.js/Express REST API backend serving user, project, and task data.
- **Scope**: Implements in-memory data architecture, strict input validation with `express-validator`, centralized error-handling middleware, query filtering, complete Postman collection, automated tests, and professional documentation.
- **Important Note**: Task 2 uses an in-memory data store. Database integration is planned for Task 3.

---

## 3. Key Features
- **User Management**: List users, inspect single user details, and register new team members with unique email enforcement and role constraints.
- **Project Tracking**: Create and retrieve engineering projects, establish owner associations with users, and track completion progress (0–100%).
- **Task Lifecycle Management**: Full CRUD operations for project tasks including creation, title/priority/assignee updates, status changes, and task deletion.
- **Task Status Workflow**: Dedicated `PATCH /api/tasks/:id/status` endpoint to transition tasks across `todo`, `in-progress`, and `done`.
- **Query Parameter Filtering**: Filter tasks by status, priority, and project ID, supporting single and combined query parameters (e.g., `?status=todo&priority=high`).
- **Strict Input Validation**: Validates all incoming payloads before controller execution using `express-validator`, returning field-level error messages.
- **Centralized Error & 404 Handling**: Uniform error handling catching synchronous and asynchronous exceptions without code duplication.
- **CORS Enabled**: Configured with CORS for integration with the Task 1 frontend application.
- **Automated Test Coverage**: Complete test suite verifying all 20 required behaviors without mutable test state pollution.

---

## 4. Technology Stack
- **Runtime**: Node.js (`v24.16.0`+)
- **Framework**: Express.js (`v4.21.2`)
- **Language**: JavaScript (CommonJS)
- **Validation**: `express-validator` (`v7.2.1`)
- **CORS**: `cors` (`v2.8.5`)
- **Environment Management**: `dotenv` (`v16.4.7`)
- **Identifiers**: `uuid` (`v11.1.0`)
- **Testing**: Node.js Native Test Runner (`node:test`, `node:assert/strict`) + `supertest` (`v7.0.0`)
- **Linting & Code Quality**: ESLint (`v9.21.0`)

---

## 5. System Architecture
DevFlow API employs a layered, modular architecture:
1. **Application Entry & Startup Layer** (`server.js` & `app.js`): `server.js` reads environment configurations and starts the HTTP server. `app.js` configures global middleware, health checks, route mounting, and error interceptors.
2. **Routing Layer** (`src/routes/`): Declares RESTful endpoints, maps HTTP verbs, and binds validator chains to controller handlers.
3. **Validation Layer** (`src/validators/`): Sanitizes and validates request headers, params, queries, and bodies before controller execution.
4. **Controller Layer** (`src/controllers/`): Handles business logic, validates cross-entity relationships (e.g., verifying that a project's owner or task's project exists), and returns standard response structures.
5. **Data Layer** (`src/data/store.js`): In-memory datastore holding pre-seeded datasets, CRUD utility methods, and state reset capabilities for automated testing.
6. **Middleware & Utilities Layer** (`src/middleware/`, `src/utils/`): Standardized JSON response formatters, 404 handler, and global error handling middleware.

```
DevFlow Client / Postman
         │
         ▼
[ Express Application Layer (app.js) ]
         │ (CORS, JSON Parser)
         ▼
[ Route Middleware & Validators (routes/ & validators/) ]
         │ (Input validation, Format verification)
         ▼
[ Controllers (controllers/) ]
         │ (Business logic, Foreign key resolution)
         ▼
[ In-Memory Store (data/store.js) ]
         │
         ▼
[ Standardized Response Formatters (utils/response.js) ]
```

---

## 6. Folder Structure
```
DevFlow-API/
├── src/
│   ├── controllers/
│   │   ├── userController.js       # User route controller logic
│   │   ├── projectController.js    # Project route controller logic
│   │   └── taskController.js       # Task CRUD and status controller logic
│   │
│   ├── routes/
│   │   ├── userRoutes.js          # /api/users route declarations
│   │   ├── projectRoutes.js       # /api/projects route declarations
│   │   └── taskRoutes.js          # /api/tasks route declarations
│   │
│   ├── middleware/
│   │   ├── errorMiddleware.js     # Centralized error handling
│   │   └── notFoundMiddleware.js  # 404 unmatched route handler
│   │
│   ├── validators/
│   │   ├── userValidator.js       # User schema validation rules
│   │   ├── projectValidator.js    # Project schema validation rules
│   │   └── taskValidator.js       # Task schema and query parameter rules
│   │
│   ├── data/
│   │   └── store.js               # In-memory store with seed data & helpers
│   │
│   ├── utils/
│   │   └── response.js            # Standardized JSON response helpers
│   │
│   ├── app.js                     # Express application configuration
│   └── server.js                  # Server startup and port listener
│
├── tests/
│   └── api.test.js                # 34 automated integration tests
│
├── postman/
│   └── DevFlow-API.postman_collection.json # Exported Postman collection
│
├── .env                           # Local environment variables (gitignored)
├── .env.example                   # Template environment variables
├── .gitignore                     # Git ignore rules
├── eslint.config.js               # ESLint configuration
├── package.json                   # Project scripts and dependencies
└── README.md                      # Comprehensive project documentation
```

---

## 7. Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended, tested on v24.16.0)
- npm (v9.0.0 or higher)

### Steps
1. Navigate to the project directory:
   ```bash
   cd "C:\Users\aswin\OneDrive\Desktop\Innovation Hacks\DevFlow-API"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the environment configuration file:
   ```bash
   cp .env.example .env
   ```

---

## 8. Environment Variables
The application uses `dotenv` to load environment variables from `.env`.

| Variable | Description | Default Value | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | The port the HTTP server listens on | `5000` | `5000` |
| `NODE_ENV` | Runtime environment mode | `development` | `development` |

> [!NOTE]
> `.env` is listed in `.gitignore` to prevent committing secrets or environment configurations. Use `.env.example` as a template.

---

## 9. How to Run

### Development Mode (with hot-reloading using Node's native watch):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Run ESLint:
```bash
npm run lint
```

### Run Automated Tests:
```bash
npm test
```

---

## 10. API Base URL
```
http://localhost:5000
```
API endpoints are prefixed with `/api`.

---

## 11. API Documentation Table

| Method | Endpoint | Purpose | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | API Root Welcome | `200` |
| **GET** | `/api/health` | Health Check & Environment Status | `200` |
| **GET** | `/api/users` | Get all registered users | `200` |
| **GET** | `/api/users/:id` | Get user by unique ID | `200`, `404` |
| **POST** | `/api/users` | Create a new user | `201`, `400`, `409` |
| **GET** | `/api/projects` | Get all projects | `200` |
| **GET** | `/api/projects/:id` | Get project by unique ID | `200`, `404` |
| **POST** | `/api/projects` | Create project (verifies owner user exists) | `201`, `400`, `404` |
| **GET** | `/api/tasks` | Get all tasks (supports `status`, `priority`, `projectId`) | `200`, `400` |
| **GET** | `/api/tasks/:id` | Get task by unique ID | `200`, `404` |
| **POST** | `/api/tasks` | Create task (verifies project & assignee exist) | `201`, `400`, `404` |
| **PUT** | `/api/tasks/:id` | Update task details | `200`, `400`, `404` |
| **PATCH**| `/api/tasks/:id/status` | Update task status | `200`, `400`, `404` |
| **DELETE**| `/api/tasks/:id` | Delete a task | `200`, `404` |

---

## 12. Complete Endpoint Details & Examples

### Health Check
- **`GET /api/health`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "DevFlow API is running",
    "data": {
      "environment": "development"
    }
  }
  ```

---

### User Endpoints (`/api/users`)

#### 1. Get All Users
- **`GET /api/users`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
      {
        "id": "a1b2c3d4-e5f6-4a1b-8c2d-111111111111",
        "name": "Alice Johnson",
        "email": "alice.johnson@devflow.io",
        "role": "manager",
        "createdAt": "2026-01-10T08:30:00.000Z"
      }
    ]
  }
  ```

#### 2. Get User By ID
- **`GET /api/users/:id`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-4a1b-8c2d-111111111111",
      "name": "Alice Johnson",
      "email": "alice.johnson@devflow.io",
      "role": "manager",
      "createdAt": "2026-01-10T08:30:00.000Z"
    }
  }
  ```
- **Response `404 Not Found`**:
  ```json
  {
    "success": false,
    "message": "User not found",
    "error": {
      "code": "USER_NOT_FOUND"
    }
  }
  ```

#### 3. Create User
- **`POST /api/users`**
- **Request Body**:
  ```json
  {
    "name": "Grace Hopper",
    "email": "grace.hopper@devflow.io",
    "role": "developer"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "id": "d748f219-48fe-4e4b-9721-a5d41f3e7901",
      "name": "Grace Hopper",
      "email": "grace.hopper@devflow.io",
      "role": "developer",
      "createdAt": "2026-09-20T18:00:00.000Z"
    }
  }
  ```
- **Response `400 Bad Request` (Validation Failure)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      { "field": "name", "message": "Name must be at least 2 characters long" },
      { "field": "email", "message": "Please provide a valid email" }
    ]
  }
  ```
- **Response `409 Conflict` (Duplicate Email)**:
  ```json
  {
    "success": false,
    "message": "A user with this email already exists",
    "error": {
      "code": "EMAIL_ALREADY_EXISTS"
    }
  }
  ```

---

### Project Endpoints (`/api/projects`)

#### 1. Get All Projects
- **`GET /api/projects`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Projects retrieved successfully",
    "data": [
      {
        "id": "b1b2c3d4-e5f6-4a1b-8c2d-111111111111",
        "name": "DevFlow Dashboard",
        "description": "Modern developer productivity analytics and workspace overview.",
        "ownerId": "a1b2c3d4-e5f6-4a1b-8c2d-111111111111",
        "status": "active",
        "progress": 65,
        "createdAt": "2026-02-01T10:00:00.000Z",
        "updatedAt": "2026-02-15T14:30:00.000Z"
      }
    ]
  }
  ```

#### 2. Get Project By ID
- **`GET /api/projects/:id`**
- **Response `200 OK`** or **`404 Not Found`** (`code: "PROJECT_NOT_FOUND"`).

#### 3. Create Project
- **`POST /api/projects`**
- **Request Body**:
  ```json
  {
    "name": "Security Hardening",
    "description": "Implement audit logging and rate limiting for API security.",
    "ownerId": "a1b2c3d4-e5f6-4a1b-8c2d-111111111111",
    "status": "active",
    "progress": 20
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "id": "e812d3c4-f5a6-4b1c-9d2e-333333333333",
      "name": "Security Hardening",
      "description": "Implement audit logging and rate limiting for API security.",
      "ownerId": "a1b2c3d4-e5f6-4a1b-8c2d-111111111111",
      "status": "active",
      "progress": 20,
      "createdAt": "2026-09-20T18:00:00.000Z",
      "updatedAt": "2026-09-20T18:00:00.000Z"
    }
  }
  ```
- **Response `404 Not Found` (Referenced Owner User Missing)**:
  ```json
  {
    "success": false,
    "message": "Referenced owner user with ID 'non-existent-id' does not exist",
    "error": {
      "code": "OWNER_NOT_FOUND"
    }
  }
  ```

---

### Task Endpoints (`/api/tasks`)

#### 1. Get All Tasks (with Filtering)
- **`GET /api/tasks`**
- **Query Parameters**:
  - `status`: `todo`, `in-progress`, `done`
  - `priority`: `low`, `medium`, `high`
  - `projectId`: `<project UUID>`
- **Example**: `GET /api/tasks?status=todo&priority=low`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": [
      {
        "id": "c1b2c3d4-e5f6-4a1b-8c2d-444444444444",
        "title": "Automated Integration Tests",
        "description": "Write comprehensive integration tests verifying endpoint response codes.",
        "projectId": "b1b2c3d4-e5f6-4a1b-8c2d-111111111111",
        "assignedTo": "a1b2c3d4-e5f6-4a1b-8c2d-444444444444",
        "status": "todo",
        "priority": "low",
        "dueDate": "2026-03-30T00:00:00.000Z",
        "createdAt": "2026-02-18T14:00:00.000Z",
        "updatedAt": "2026-02-18T14:00:00.000Z"
      }
    ]
  }
  ```
- **Invalid Filter Value `400 Bad Request`**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      { "field": "status", "message": "Filter status must be one of: todo, in-progress, done" }
    ]
  }
  ```

#### 2. Create Task
- **`POST /api/tasks`**
- **Request Body**:
  ```json
  {
    "title": "Build Automated Testing Suite",
    "description": "Cover all endpoints with integration tests.",
    "projectId": "b1b2c3d4-e5f6-4a1b-8c2d-111111111111",
    "assignedTo": "a1b2c3d4-e5f6-4a1b-8c2d-222222222222",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-04-15T00:00:00.000Z"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "id": "f2c3d4e5-a6b7-4c8d-9e0f-555555555555",
      "title": "Build Automated Testing Suite",
      "description": "Cover all endpoints with integration tests.",
      "projectId": "b1b2c3d4-e5f6-4a1b-8c2d-111111111111",
      "assignedTo": "a1b2c3d4-e5f6-4a1b-8c2d-222222222222",
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-04-15T00:00:00.000Z",
      "createdAt": "2026-09-20T18:00:00.000Z",
      "updatedAt": "2026-09-20T18:00:00.000Z"
    }
  }
  ```
- **Response `404 Not Found` (Referenced Project Missing)**:
  ```json
  {
    "success": false,
    "message": "Referenced project with ID 'non-existent-id' does not exist",
    "error": {
      "code": "PROJECT_NOT_FOUND"
    }
  }
  ```

#### 3. Update Task
- **`PUT /api/tasks/:id`**
- **Request Body**:
  ```json
  {
    "title": "Design API Spec - Revised Edition",
    "priority": "low"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": {
      "id": "c1b2c3d4-e5f6-4a1b-8c2d-111111111111",
      "title": "Design API Spec - Revised Edition",
      "priority": "low",
      "updatedAt": "2026-09-20T18:05:00.000Z"
    }
  }
  ```

#### 4. Update Task Status
- **`PATCH /api/tasks/:id/status`**
- **Request Body**:
  ```json
  {
    "status": "in-progress"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Task status updated successfully",
    "data": {
      "id": "c1b2c3d4-e5f6-4a1b-8c2d-333333333333",
      "status": "in-progress",
      "updatedAt": "2026-09-20T18:06:00.000Z"
    }
  }
  ```

#### 5. Delete Task
- **`DELETE /api/tasks/:id`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "data": {
      "id": "c1b2c3d4-e5f6-4a1b-8c2d-111111111111"
    }
  }
  ```

---

## 13. HTTP Status Codes

| Status Code | Meaning | Used For |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | `GET`, `PUT`, `PATCH`, `DELETE` operations |
| `201 Created` | Resource created | Successful `POST` creations |
| `400 Bad Request` | Malformed input | Schema validation failures, invalid query filters, invalid enums |
| `404 Not Found` | Resource missing | Unregistered routes, non-existent users/projects/tasks, or missing referenced entities |
| `409 Conflict` | Conflict | Duplicate unique field values (e.g., duplicate user email) |
| `500 Internal Server Error` | Unexpected error | Unhandled server exceptions processed by centralized error middleware |

---

## 14. Validation Rules

### Users (`POST /api/users`)
- `name`: Required string, minimum 2 characters.
- `email`: Required, must be a valid email format, normalized, and unique across all users.
- `role`: Optional string; must be one of `developer`, `manager`, `designer`, `tester`. Defaults to `developer`.

### Projects (`POST /api/projects`)
- `name`: Required string, minimum 2 characters.
- `description`: Required string, minimum 5 characters.
- `ownerId`: Required string referencing an existing user in the store (returns `400` if malformed, `404` if user not found).
- `status`: Optional string; must be one of `active`, `completed`, `archived`. Defaults to `active`.
- `progress`: Optional number between 0 and 100. Defaults to `0`.

### Tasks (`POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`)
- `title`: Required string, minimum 2 characters.
- `projectId`: Required string referencing an existing project (returns `400` if malformed, `404` if project not found).
- `assignedTo`: Optional string referencing an existing user (returns `404` if user not found, or nullable).
- `status`: Must be one of `todo`, `in-progress`, `done`. Defaults to `todo`.
- `priority`: Must be one of `low`, `medium`, `high`. Defaults to `medium`.
- `dueDate`: Optional valid ISO date string.

---

## 15. Error Handling & Standard Responses

All responses conform to a predictable envelope structure.

### Success Envelope
```json
{
  "success": true,
  "message": "Resource operation description",
  "data": { ... } // or [ ... ]
}
```

### Validation Error Envelope (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 2 characters long"
    }
  ]
}
```

### Business Logic / Not Found Error Envelope (`404` / `409` / `500`)
```json
{
  "success": false,
  "message": "Detailed error explanation",
  "error": {
    "code": "ERROR_CODE_IDENTIFIER"
  }
}
```

---

## 16. Postman Collection Usage

A complete Postman collection is provided in `postman/DevFlow-API.postman_collection.json`.

### How to Import & Run:
1. Open the **Postman** application.
2. Click **Import** (top left corner) and select `postman/DevFlow-API.postman_collection.json`.
3. The imported collection includes predefined collection variables:
   - `baseUrl`: `http://localhost:5000`
   - `sampleUserId`: `a1b2c3d4-e5f6-4a1b-8c2d-111111111111`
   - `sampleProjectId`: `b1b2c3d4-e5f6-4a1b-8c2d-111111111111`
   - `sampleTaskId`: `c1b2c3d4-e5f6-4a1b-8c2d-111111111111`
4. Requests are categorized into folders:
   - **Root & Health**: `/` and `/api/health`
   - **Users**: List, Get by ID, 404 test, Create, Validation error, Duplicate email conflict
   - **Projects**: List, Get by ID, 404 test, Create, Validation error, Missing owner test
   - **Tasks**: List, Filter by status, Filter by priority, Combined filters, Invalid filter, Create, Missing project test, Update, Patch status, Delete
   - **Error Cases**: Unregistered route 404

---

## 17. Testing Instructions

DevFlow API includes an automated integration test suite written with Node's native test runner (`node:test`) and `supertest`.

To execute the test suite:
```bash
npm test
```

### Isolation & Independence Guarantee
To ensure tests do not suffer from order dependency or shared mutable state, `beforeEach()` executes `store.resetStore()`, resetting all user, project, and task arrays to pristine baseline fixtures before each individual test runs.

---

## 18. Future Task 3 Database Integration Note

> [!IMPORTANT]
> **Task 2 Scope Boundary**:  
> Task 2 uses an in-memory data store. Database integration is planned for Task 3.  
> The system architecture has been intentionally partitioned (clean controllers, isolated store methods, decoupled routes, and async signatures) so that migrating from the in-memory store to an ORM or database driver (such as MongoDB, PostgreSQL, or MySQL) in Task 3 will require changes only to the data layer without breaking API route contracts.

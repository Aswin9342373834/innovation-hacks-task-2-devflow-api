# DevFlow API — Task 2

> **Innovation Hacks Full Stack Development Internship**  
> **Task 2: Backend & REST API Development — Users, Projects & Tasks API**

---

## 1. Project Title
**DevFlow API** — A modular, production-ready RESTful backend engine powering developer workflows, team member directory management, project tracking, and task lifecycle operations.

---

## 2. Innovation Hacks Internship & Task 2 Description
This project is developed as part of **Task 2** of the **Innovation Hacks Full Stack Development Internship**.

Task 2 focuses strictly on architecting and delivering a robust REST API service layer:
- **Task 1**: Frontend Developer Productivity Dashboard (completed separately in the client application).
- **Task 2** (*This Project*): Users, Projects & Tasks REST API with strict validation, centralized error handling, query filtering, automated test suite, and Postman documentation.
- **Task 3**: Real database integration (planned for next task).
- **Task 4**: Final AI-powered full-stack application integration.

> [!IMPORTANT]
> **Task 2 Data Architecture Note**:  
> "Task 2 uses an in-memory data store. Persistent database integration is planned for Task 3."  
> No external database engines (such as MongoDB, PostgreSQL, MySQL) or external authentication providers are used in Task 2, preserving architectural separation of concerns.

---

## 3. Objective
The primary objective of Task 2 is to construct a scalable, maintainable REST API backend utilizing Node.js and Express. It enforces standard HTTP status codes, centralized error and 404 routing, comprehensive input validation on every write operation, query filtering for task collection resources, and structured JSON envelopes.

---

## 4. Key Features
- **User Management**:
  - Retrieve all registered users (`GET /api/users`).
  - Retrieve a single user by unique identifier (`GET /api/users/:id`).
  - Register new users with unique email validation and role constraints (`POST /api/users`).
- **Project Tracking**:
  - Retrieve all projects (`GET /api/projects`).
  - Inspect project details by ID (`GET /api/projects/:id`).
  - Create new projects linked to existing user owner IDs with progress tracking (`POST /api/projects`).
- **Task Lifecycle & Workflow**:
  - Full CRUD operations for project tasks.
  - Create new tasks linked to existing projects and assignees (`POST /api/tasks`).
  - Full or partial updates to task title, description, priority, or dates (`PUT /api/tasks/:id`).
  - Dedicated state transition endpoint (`PATCH /api/tasks/:id/status`) supporting `todo`, `in-progress`, and `done`.
  - Delete tasks by ID (`DELETE /api/tasks/:id`).
- **Query Parameter Filtering**:
  - Filter tasks by status (e.g. `?status=done`).
  - Filter tasks by priority (e.g. `?priority=high`).
  - Filter tasks by project (e.g. `?projectId=<project-id>`).
  - Combine filters (e.g. `?status=todo&priority=low`).
- **Strict Input Validation**:
  - Validates request body, parameters, and query strings before controller execution using `express-validator`.
- **Centralized Error & 404 Handling**:
  - Unmatched routes are handled by uniform 404 middleware.
  - Runtime exceptions are trapped and formatted by centralized error-handling middleware.
- **CORS Enabled**:
  - Cross-Origin Resource Sharing is enabled to allow frontend connections.

---

## 5. Technology Stack
- **Runtime Environment**: Node.js (`v24.16.0`+)
- **Server Framework**: Express.js (`v4.21.2`)
- **Language**: JavaScript (CommonJS)
- **Validation Engine**: `express-validator` (`v7.2.1`)
- **CORS Support**: `cors` (`v2.8.5`)
- **Environment Variables**: `dotenv` (`v16.4.7`)
- **Unique Identifiers**: `uuid` (`v11.1.0`)
- **Automated Testing**: Node.js Native Test Runner (`node:test`, `node:assert/strict`) + `supertest` (`v7.0.0`)
- **Linting & Code Standards**: ESLint (`v9.21.0`)

---

## 6. Architecture
DevFlow API implements a clean, decoupled MVC/layered architecture:
1. **Entry & Server Configuration** (`src/app.js` & `src/server.js`): `app.js` wires middleware, route mounts, and error handlers; `server.js` starts the listener.
2. **Routing Layer** (`src/routes/`): Declares endpoints and connects validators to controller actions.
3. **Validation Layer** (`src/validators/`): Sanitizes and inspects payloads, halting invalid requests before reaching business logic.
4. **Controller Layer** (`src/controllers/`): Handles domain logic, resolves foreign references (users, projects), and invokes data store operations.
5. **Data Layer** (`src/data/store.js`): Encapsulates in-memory arrays, seed data, and a `resetStore()` utility ensuring isolated automated test runs.
6. **Middleware & Utilities** (`src/middleware/`, `src/utils/`): Standard response formatters (`sendSuccess`, `sendError`, `sendValidationError`), 404 fallback, and error handler.

```
Client / Frontend / Postman
            │
            ▼
[ Express Application Layer (src/app.js) ]
            │ (cors, express.json)
            ▼
[ Route Validators (src/validators/) ]
            │ (400 Bad Request if invalid format)
            ▼
[ Controllers (src/controllers/) ]
            │ (404 Not Found if referenced foreign entity missing)
            ▼
[ In-Memory Store (src/data/store.js) ]
            │
            ▼
[ Standardized Response Formatter (src/utils/response.js) ]
```

---

## 7. Folder Structure
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
│   ├── api.test.js                # 34 automated integration tests
│   └── manual_verification.js     # 27 live HTTP endpoint checks
│
├── postman/
│   └── DevFlow-API.postman_collection.json # Exported Postman collection
│
├── .env                           # Local environment variables (gitignored)
├── .env.example                   # Template environment variables
├── .gitignore                     # Git ignore rules (ignores .env, node_modules, logs)
├── eslint.config.js               # ESLint configuration
├── package.json                   # Project scripts and dependencies
└── README.md                      # Comprehensive project documentation
```

---

## 8. Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api.git
   cd innovation-hacks-task-2-devflow-api
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment configuration file:
   ```bash
   cp .env.example .env
   ```

---

## 9. Environment Variables
Environment variables are managed via `dotenv`.

| Variable | Description | Default Value | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | The port the HTTP server binds to | `5000` | `5000` |
| `NODE_ENV` | Application runtime environment | `development` | `development` |

> [!NOTE]
> `.env` is ignored by Git in `.gitignore`. Use `.env.example` as a template.

---

## 10. How to Run Locally

### Start in Development Mode (Hot Reloading via Node Watch):
```bash
npm run dev
```

### Start in Production Mode:
```bash
npm start
```

### Run Code Quality Linter:
```bash
npm run lint
```

### Run Automated Tests:
```bash
npm test
```

### Run Live Server Verification Checks:
```bash
npm run test:live
```

---

## 11. API Base URL
- **Local Base URL**: `http://localhost:5000`
- **Prefix**: All resource endpoints are prefixed with `/api`

---

## 12. Health Endpoint
- **Endpoint**: `GET /api/health`
- **HTTP Status**: `200 OK`
- **Example Response**:
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

## 13. Complete Endpoint Table

| Method | Endpoint | Purpose | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | API Welcome Message | `200 OK` |
| **GET** | `/api/health` | Service Health & Environment Status | `200 OK` |
| **GET** | `/api/users` | Retrieve all registered users | `200 OK` |
| **GET** | `/api/users/:id` | Retrieve user by ID | `200 OK`, `404 Not Found` |
| **POST** | `/api/users` | Create new user (unique email) | `201 Created`, `400 Bad Request`, `409 Conflict` |
| **GET** | `/api/projects` | Retrieve all projects | `200 OK` |
| **GET** | `/api/projects/:id` | Retrieve project by ID | `200 OK`, `404 Not Found` |
| **POST** | `/api/projects` | Create project (checks owner exists) | `201 Created`, `400 Bad Request`, `404 Not Found` |
| **GET** | `/api/tasks` | Retrieve all tasks (supports query filters) | `200 OK`, `400 Bad Request` |
| **GET** | `/api/tasks/:id` | Retrieve task by ID | `200 OK`, `404 Not Found` |
| **POST** | `/api/tasks` | Create task (checks project & assignee exist) | `201 Created`, `400 Bad Request`, `404 Not Found` |
| **PUT** | `/api/tasks/:id` | Update task details | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **PATCH**| `/api/tasks/:id/status` | Update task status (`todo`, `in-progress`, `done`) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE**| `/api/tasks/:id` | Delete task by ID | `200 OK`, `404 Not Found` |

---

## 14. Request Examples

### 1. Create User (`POST /api/users`)
```json
{
  "name": "Evelyn Wright",
  "email": "evelyn.wright@devflow.io",
  "role": "developer"
}
```

### 2. Create Project (`POST /api/projects`)
```json
{
  "name": "Analytics Engine v2",
  "description": "Real-time streaming analytics engine with low latency.",
  "ownerId": "a1b2c3d4-e5f6-4a1b-8c2d-111111111111",
  "status": "active",
  "progress": 15
}
```

### 3. Create Task (`POST /api/tasks`)
```json
{
  "title": "Implement User Authentication Middleware",
  "description": "Write JWT verification and role authorization logic.",
  "projectId": "b1b2c3d4-e5f6-4a1b-8c2d-111111111111",
  "assignedTo": "a1b2c3d4-e5f6-4a1b-8c2d-222222222222",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-15T00:00:00.000Z"
}
```

### 4. Update Task Details (`PUT /api/tasks/:id`)
```json
{
  "title": "Implement User Authentication Middleware - Phase 1",
  "priority": "medium"
}
```

### 5. Update Task Status (`PATCH /api/tasks/:id/status`)
```json
{
  "status": "in-progress"
}
```

---

## 15. Response Examples

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "c1b2c3d4-e5f6-4a1b-8c2d-999999999999",
    "title": "Implement User Authentication Middleware",
    "description": "Write JWT verification and role authorization logic.",
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

### Validation Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters long"
    },
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Duplicate Resource Conflict (`409 Conflict`)
```json
{
  "success": false,
  "message": "A user with this email already exists",
  "error": {
    "code": "EMAIL_ALREADY_EXISTS"
  }
}
```

### Resource Not Found Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Task not found",
  "error": {
    "code": "TASK_NOT_FOUND"
  }
}
```

---

## 16. Validation Rules

### User Schema (`POST /api/users`)
- `name`: Required string, minimum 2 characters.
- `email`: Required, must be a valid email format, normalized, unique.
- `role`: Optional string; must be one of `developer`, `manager`, `designer`, `tester`. Defaults to `developer`.

### Project Schema (`POST /api/projects`)
- `name`: Required string, minimum 2 characters.
- `description`: Required string, minimum 5 characters.
- `ownerId`: Required string referencing an existing user in store (`400` if invalid format, `404` if user not found).
- `status`: Optional string; must be one of `active`, `completed`, `archived`. Defaults to `active`.
- `progress`: Optional number between 0 and 100. Defaults to `0`.

### Task Schema (`POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`)
- `title`: Required string, minimum 2 characters.
- `projectId`: Required string referencing an existing project (`400` if invalid format, `404` if project not found).
- `assignedTo`: Optional string referencing an existing user (`404` if user not found, or null).
- `status`: Must be one of `todo`, `in-progress`, `done`. Defaults to `todo`.
- `priority`: Must be one of `low`, `medium`, `high`. Defaults to `medium`.
- `dueDate`: Optional valid ISO date string.

---

## 17. Error Handling
DevFlow API employs centralized error management:
1. **Validation Rejection**: `express-validator` captures syntactic and formatting errors early, returning `400 Bad Request` with field-level details.
2. **Missing References**: Cross-entity foreign key checks return `404 Not Found` with specific error codes (`OWNER_NOT_FOUND`, `PROJECT_NOT_FOUND`, `USER_NOT_FOUND`).
3. **404 Route Fallback**: Any unregistered path triggers [`notFoundMiddleware.js`](src/middleware/notFoundMiddleware.js) returning `{ "success": false, "message": "Route not found" }`.
4. **Global Catch-All**: [`errorMiddleware.js`](src/middleware/errorMiddleware.js) catches all unhandled exceptions, returning formatted JSON and logging server errors.

---

## 18. HTTP Status Codes

| Code | Meaning | Endpoint Usage |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | `GET`, `PUT`, `PATCH`, `DELETE` |
| `201 Created` | Resource created | Successful `POST` creations |
| `400 Bad Request` | Invalid input or schema | Validation failures, malformed query params, invalid enums |
| `404 Not Found` | Entity or route missing | Unregistered routes, non-existent records or foreign references |
| `409 Conflict` | Unique conflict | Attempting to create user with an already registered email |
| `500 Internal Server Error` | Server failure | Uncaught internal exceptions handled by error middleware |

---

## 19. Task Filtering Examples
The `GET /api/tasks` endpoint supports filtering via query parameters:

- **Filter by Status**:
  ```
  GET /api/tasks?status=done
  ```
- **Filter by Priority**:
  ```
  GET /api/tasks?priority=high
  ```
- **Filter by Project ID**:
  ```
  GET /api/tasks?projectId=b1b2c3d4-e5f6-4a1b-8c2d-111111111111
  ```
- **Combined Filtering**:
  ```
  GET /api/tasks?status=todo&priority=high
  ```
- **Invalid Filter Rejection**: Passing an invalid filter value (e.g. `?status=invalid`) returns `400 Bad Request`.

---

## 20. Postman Instructions
A pre-configured Postman collection is located at [`postman/DevFlow-API.postman_collection.json`](postman/DevFlow-API.postman_collection.json).

### Steps to Import & Execute:
1. Open **Postman**.
2. Click **Import** and select `postman/DevFlow-API.postman_collection.json`.
3. The collection is configured with default collection variables:
   - `baseUrl`: `http://localhost:5000`
   - `sampleUserId`: `a1b2c3d4-e5f6-4a1b-8c2d-111111111111`
   - `sampleProjectId`: `b1b2c3d4-e5f6-4a1b-8c2d-111111111111`
   - `sampleTaskId`: `c1b2c3d4-e5f6-4a1b-8c2d-111111111111`
4. Run requests across folders:
   - `Root & Health`
   - `Users` (Success, validation errors, 409 conflict, 404 lookup)
   - `Projects` (Success, validation errors, 404 owner check)
   - `Tasks` (Filtering, status update, full update, deletion, 404 reference checks)
   - `Error Cases` (404 route handling)

---

## 21. Automated Testing Instructions

### Verified Local Results:
- **Automated Tests (`npm test`)**: **34 passed / 0 failed** across 6 test suites
- **Linter Check (`npm run lint`)**: **0 errors / 0 warnings**
- **Live HTTP Check (`npm run test:live`)**: **27 passed / 0 failed** across all endpoints

### How to Run Tests:
```bash
# Run unit & integration test suite
npm test

# Run code style linter
npm run lint

# Run live endpoint verification against running server
npm run test:live
```

> [!TIP]
> **State Isolation Guarantee**: The test suite in `tests/api.test.js` resets the in-memory data store via `store.resetStore()` in `beforeEach()`, guaranteeing tests run independently without mutable state pollution.

---

## 22. Security Notes
- Zero private secrets, API keys, passwords, or credentials exist in the source code.
- `.env` is explicitly ignored by `.gitignore`.
- `.env.example` is committed as a template with non-sensitive placeholders.
- CORS is enabled with permissive defaults for local development and easily configurable for production restriction.

---

## 23. Task 3 Database Integration Note

> [!IMPORTANT]
> **Task 2 uses an in-memory data store. Persistent database integration is planned for Task 3.**  
> The backend architecture adheres strictly to modular separation: controllers interact through clean store interfaces, and all controller handlers are async-ready. When migrating to an ORM or persistent database in Task 3 (such as MongoDB, PostgreSQL, or MySQL), the data layer can be swapped without rewriting routing contracts or controller APIs.

---

## 24. Internship Deliverables Summary
1. Fully functional, modular Express REST API backend inside `DevFlow-API/`.
2. Verified CRUD endpoints for Users, Projects, and Tasks.
3. Task status transition endpoint (`PATCH /api/tasks/:id/status`).
4. Task query filtering by `status`, `priority`, and `projectId`.
5. Automated test suite with 34 tests passing with 100% success.
6. Clean ESLint configuration with 0 errors and 0 warnings.
7. Postman collection covering all endpoints, parameters, and error responses.
8. Comprehensive README documentation.

---

## 25. Author Information
- **Author**: Aswin Muthaiya
- **Internship Role**: Full Stack Development Intern
- **Program**: Innovation Hacks Full Stack Development Internship
- **GitHub**: [@Aswin9342373834](https://github.com/Aswin9342373834)
- **Repository**: [innovation-hacks-task-2-devflow-api](https://github.com/Aswin9342373834/innovation-hacks-task-2-devflow-api)

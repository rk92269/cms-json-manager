# CMS JSON Manager

This project is a CMS-style full-stack application for importing JSON from external APIs, reviewing and editing that content in an admin workspace, and saving curated content into MongoDB for downstream delivery.

The stack today is:

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React with hooks
- API client: Axios
- Deployment: Docker Compose with MongoDB, two backend instances, Nginx load balancing, and Kong as the API gateway

## Current Project Status

Phase 1 is complete as the baseline foundation.

Current working capabilities:

- generic CMS document storage in MongoDB
- preview-first import flow for external JSON APIs
- request builder with method, headers, and body support
- admin authoring workspace with a CM-style layout
- Postman-inspired JSON editing surface with `Pretty`, `Raw`, and `Schema` views
- save edited JSON into MongoDB
- public read-only view for published content
- Dockerized local deployment through Kong and Nginx

Current implementation status:

- backend CRUD, preview, import, and health routes are present
- frontend has a content explorer, request composer, and JSON editor workbench
- Docker stack builds and serves the client and API stack successfully
- the project is still JavaScript-based and does not yet include authentication, RBAC, schema enforcement, revision history, or automated test coverage

## Project Structure

```text
CMS/
|-- client/
|   |-- public/
|   |   `-- index.html
|   |-- src/
|   |   |-- api/
|   |   |   `-- documentApi.js
|   |   |-- components/
|   |   |   `-- admin/
|   |   |       `-- JsonEditorPanel.js
|   |   |-- pages/
|   |   |   |-- AdminPage.js
|   |   |   `-- PublicPage.js
|   |   |-- App.js
|   |   |-- index.js
|   |   `-- styles.css
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- package.json
|-- kong/
|   `-- kong.yml
|-- nginx/
|   `-- nginx.conf
|-- server/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   `-- cmsDocumentController.js
|   |-- models/
|   |   |-- CmsDocument.js
|   |   `-- Scheme.js
|   |-- routes/
|   |   `-- cmsDocumentRoutes.js
|   |-- .env
|   |-- Dockerfile
|   |-- package.json
|   `-- server.js
|-- docker-compose.yml
|-- README-sample.md
`-- README.md
```

## Architecture Summary

Request flow:

1. The browser frontend calls the API through Kong.
2. Kong forwards to Nginx.
3. Nginx balances requests across `server1` and `server2`.
4. Express reads and writes content documents in MongoDB.
5. Responses flow back through Nginx and Kong to the frontend.

Current core document fields:

- `title`
- `sourceUrl`
- `requestMethod`
- `requestHeaders`
- `requestBody`
- `contentType`
- `status`
- `jsonData`

## Main Backend Routes

Base route:

```text
/api/documents
```

Current routes:

- `GET /api/documents`
- `GET /api/documents/:id`
- `POST /api/documents`
- `PUT /api/documents/:id`
- `DELETE /api/documents/:id`
- `POST /api/documents/preview`
- `POST /api/documents/import`
- `GET /health`

## Local Development

Install backend packages:

```bash
cd server
npm install
```

Install frontend packages:

```bash
cd client
npm install
```

Run backend:

```bash
cd server
npm run dev
```

Run frontend:

```bash
cd client
npm start
```

Local URLs:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Docker Development

Build and start all services:

```bash
docker compose up --build
```

Available endpoints:

- frontend: `http://localhost:3000`
- Kong gateway: `http://localhost:8000`
- Nginx load balancer: `http://localhost:8080`
- backend instance 1: `http://localhost:5001`
- backend instance 2: `http://localhost:5002`
- MongoDB: `27017`

The frontend Docker image is built with:

```text
REACT_APP_API_URL=http://localhost:8000/api/documents
```

To stop the stack:

```bash
docker compose down
```

## Phase 2 Direction

Phase 2 will move the project from a prototype CMS workbench to a secure, production-leaning authoring platform.

Chosen defaults for Phase 2:

- authentication: JWT
- authorization: role-based access control with `Admin`, `Editor`, and `Viewer`
- editor direction: Monaco Editor as the primary JSON authoring surface
- validation direction: JSON Schema-based validation and schema-aware content types
- workflow rule: continue implementation one file at a time

Phase 2 themes:

- secure the API and admin workspace
- replace transitional JSON editing pieces with a Monaco-based editor experience
- add schema enforcement and stronger content modeling
- introduce revisions, audit history, search, and performance improvements
- add testing, code quality, and delivery guardrails

## Priority Order

Immediate priority:

- add authentication and authorization
- add route-level input validation and sanitization
- implement centralized error handling
- replace `react-json-view` with Monaco-based editing
- add schema-aware validation for content documents

Next sprint:

- add document versioning and rollback
- implement search and filtering
- add pagination for large content sets
- introduce backend and frontend automated tests
- add performance improvements such as indexing and caching preparation

Later:

- real-time collaboration
- advanced content type relationships
- analytics and monitoring
- multi-language support
- GraphQL and advanced integration features

## What the App Can Do Today

- import JSON from external CMS-style APIs
- preview request results before saving
- edit JSON in a structured authoring workspace
- inspect JSON in pretty, raw, and schema-oriented views
- save JSON into MongoDB
- publish or keep content in draft status
- view published content in the public interface
- run locally through Docker with gateway and load balancer layers

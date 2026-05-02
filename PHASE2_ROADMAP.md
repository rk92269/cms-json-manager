# Phase 2 Roadmap

## Goal

Phase 2 upgrades the current CMS JSON Manager from a functional prototype into a secure, production-leaning authoring platform with:

- JWT-based authentication
- role-based access control
- Monaco-based JSON authoring
- schema-aware validation
- stronger backend safety and error handling
- revision history and better content operations

This roadmap is implementation-oriented and should be followed one file at a time.

## Baseline Assumptions

- backend remains Node.js + Express + MongoDB + Mongoose
- frontend remains React for this phase
- Docker Compose remains the default local runtime path
- JWT is the selected authentication strategy
- `Admin`, `Editor`, and `Viewer` are the initial system roles
- Monaco Editor is the target replacement for the current transitional JSON editor
- TypeScript migration is intentionally deferred beyond this baseline Phase 2 scope

## Workstream 1: Authentication and Authorization

### Scope

- add user identity model
- add login flow
- protect API routes
- add role-based permission checks

### Deliverables

- `User` model with:
  - email or username
  - password hash
  - role
  - active status
- auth routes:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - refresh or explicit re-login strategy
- JWT signing and verification middleware
- RBAC middleware for `Admin`, `Editor`, `Viewer`
- protected document routes

### Permission Model

- `Viewer`
  - can read documents
  - cannot preview/import/create/update/delete
- `Editor`
  - can preview, import, create, and update
  - cannot delete documents or manage privileged integration settings
- `Admin`
  - full document access
  - can delete
  - can manage higher-risk integration settings and future admin-only actions

### Acceptance Criteria

- invalid login is rejected
- valid login returns a signed token
- missing token blocks protected routes
- wrong role blocks restricted routes
- existing read-only routes behave correctly for viewers

## Workstream 2: API Hardening and Middleware

### Scope

- validation
- sanitization
- rate limiting
- security headers
- centralized error handling

### Deliverables

- request validation middleware for:
  - `title`
  - `sourceUrl`
  - `requestMethod`
  - `requestHeaders`
  - `requestBody`
  - `contentType`
  - `status`
- sanitization for user-controlled inputs
- rate limiting on:
  - auth routes
  - preview/import routes
- security middleware:
  - `helmet`
  - stricter CORS policy
  - HTTPS-aware enforcement behavior for proxied deployment
- centralized Express error middleware
- consistent error response shape across controllers

### Acceptance Criteria

- malformed JSON request data returns safe validation errors
- invalid route payloads do not reach controller business logic
- repeated abusive requests are throttled
- frontend can reliably render backend error details from one stable format

## Workstream 3: Monaco Editor Migration

### Scope

- replace `react-json-view`
- keep Postman-style editing workflow
- improve validation and editing ergonomics

### Deliverables

- Monaco Editor integration in the admin JSON editor panel
- preserve the editor modes:
  - `Pretty`
  - `Raw`
  - `Schema`
- Monaco features:
  - syntax highlighting
  - format / beautify
  - inline parse errors
  - search
  - keyboard shortcuts for save/format
- keep request/response context panes in the editor UI
- keep preview-first workflow:
  - compose request
  - preview response
  - edit response
  - save to DB

### Acceptance Criteria

- Monaco loads document JSON without breaking existing save flow
- invalid raw JSON shows inline errors and blocks save
- beautify rewrites valid JSON
- mobile layout remains usable
- current preview/save lifecycle continues to work after the editor swap

## Workstream 4: Schema Validation and Content Types

### Scope

- add content modeling
- enforce JSON structure
- prepare for richer content relationships

### Deliverables

- content type registry
- starter content templates:
  - `Generic JSON`
  - `Page`
  - `Blog Post`
  - `Product`
- JSON Schema validation before save
- schema version field stored with content
- field-level custom validation hooks
- model preparation for nested references between documents

### Acceptance Criteria

- each saved document can declare a content type
- schema-invalid data cannot be saved
- schema version is stored and returned with documents
- validation messages are surfaced in the editor

## Workstream 5: Versioning, Search, and Content Operations

### Scope

- content revision history
- rollback
- search/filter/pagination
- performance groundwork

### Deliverables

- revision storage strategy for document updates
- endpoints for:
  - version listing
  - rollback
- audit metadata for content changes
- query support for:
  - `page`
  - `limit`
  - `search`
  - `status`
  - `contentType`
- database indexes for:
  - `title`
  - `status`
  - `contentType`
  - `updatedAt`

### Acceptance Criteria

- updating a document creates a revision
- rollback restores a previous document state
- large document lists no longer require unbounded full fetches
- list browsing supports filterable and paginated reads

## Workstream 6: Testing and Delivery Guardrails

### Scope

- automated test coverage
- linting and formatting
- CI baseline
- API documentation

### Deliverables

- backend tests with Jest and Supertest
- frontend tests with React Testing Library
- at least one Playwright end-to-end flow:
  - login
  - preview import
  - edit JSON
  - save content
- ESLint and Prettier
- GitHub Actions CI pipeline for:
  - install
  - test
  - client build
  - server build
  - Docker build smoke check
- Swagger/OpenAPI after auth routes stabilize

### Acceptance Criteria

- repo has a repeatable automated validation path
- client and server builds are checked in CI
- core content workflow is covered by at least one end-to-end test

## Recommended Execution Order

1. Authentication model and auth routes
2. JWT and RBAC middleware
3. Route validation and centralized error handling
4. Monaco migration
5. Schema registry and schema validation
6. Versioning and rollback
7. Search, filtering, and pagination
8. Tests, linting, CI, and API docs

## Explicit Non-Goals for Initial Phase 2 Delivery

These items stay documented for later and should not be mixed into the first Phase 2 delivery wave:

- OAuth-first identity integration
- GraphQL support
- Redis and background job queues
- real-time collaboration
- comments and annotations
- analytics and monitoring dashboards
- multi-language support
- TypeScript migration

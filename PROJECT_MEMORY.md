# Project Memory

## Project Goal

Build a headless CMS-style web application that can:

- call external CMS or content APIs
- preview imported JSON before saving
- provide an admin authoring workspace for editing JSON content
- store curated content in MongoDB
- expose saved content for public-facing consumption

The long-term goal is a secure, production-leaning content management platform with role-based access, schema-aware validation, revision history, and a stronger editor experience.

## Current Architecture

Backend:

- Node.js + Express
- MongoDB + Mongoose
- Axios for upstream API import/preview
- Dockerized as two backend instances behind Nginx and Kong

Frontend:

- React with hooks
- Axios API layer
- CM-style admin shell with content explorer and request composer
- Postman-inspired JSON editor workspace with `Pretty`, `Raw`, and `Schema` views
- dual renderer support with Monaco as the default and `react-json-view` as the alternate tree mode
- raw JSON editing works in both renderer modes

Deployment:

- Docker Compose
- MongoDB
- `server1` and `server2`
- Nginx load balancer
- Kong API gateway
- static frontend served by Nginx inside the client container

## Current Backend Status

Implemented:

- generic `CmsDocument` model
- CRUD routes for documents
- preview route for external API JSON without immediate save
- import route for saving previewed or fetched JSON into MongoDB
- health endpoint
- upstream error passthrough for API preview/import debugging

Not yet implemented:

- authentication
- authorization / roles
- request validation middleware
- centralized error middleware
- revision history
- search, filter, pagination
- JSON Schema persistence and validation
- audit logging

## Current Frontend Status

Implemented:

- CM-style shell with sidebar and topbar
- content explorer for saved documents
- request composer with method, URL, headers, body, and settings tabs
- preview-first import flow
- JSON editor panel with:
  - structured editing
  - raw JSON editing
  - schema-oriented view
  - beautify/apply actions
- public view for saved/published content

Not yet implemented:

- authentication screens and session handling
- dark/light theme toggle
- keyboard shortcuts
- undo/redo beyond editor-native behavior
- loading progress polish for longer requests
- mobile refinement for dense authoring flows

## Known Working Features

- Docker stack builds and runs successfully
- frontend loads from `http://localhost:3000`
- API is reachable through Kong at `http://localhost:8000/api/documents`
- preview-before-save workflow works at the API contract level
- document editing and save flow is present in the UI
- published content can be surfaced in the public page

## Known Technical Debt

- frontend now supports both Monaco and `react-json-view`; Monaco is the primary path and tree mode remains as an alternate renderer
- Monaco/tree mode switching should be verified against the save flow in the browser after each editor change
- raw JSON editing semantics are now shared across both renderer modes
- backend routes are not yet protected
- request validation is still handled too close to controller logic
- README history and implementation docs were previously drifting behind the real code
- the old `Scheme.js` model remains in the repo and is no longer the target architecture
- local non-Docker frontend build depends on installing client packages in the workspace
- `docker-compose.yml` still warns about the deprecated `version` field

## Current Deployment Model

Local development currently favors Docker:

- browser frontend -> Kong
- Kong -> Nginx
- Nginx -> `server1` / `server2`
- backends -> MongoDB

Frontend Docker build uses:

- `REACT_APP_API_URL=http://localhost:8000/api/documents`

This means browser traffic is expected to go through Kong in the Docker setup, not directly to a backend container.

## Current Risks and Blockers

- the project has intentionally reordered Phase 2 so editor modernization now comes before JWT/RBAC work
- no authentication means the admin workspace is effectively open if deployed as-is
- no RBAC means there is no separation between read, edit, and destructive operations
- imported JSON is flexible but not yet schema-governed
- no revision history means updates overwrite content without rollback support
- no automated test suite means regressions are likely as Phase 2 expands
- the Monaco migration now needs browser verification for both renderer modes and the existing save flow

## Next 10 Concrete Steps

1. Verify Monaco and tree mode switching in the browser with the current save flow.
2. Add Monaco formatting, inline parse feedback, and save-safe validation behavior for JSON editing.
3. Update client styling so both Monaco and `react-json-view` fit the CM/Postman workspace cleanly on desktop and mobile.
4. Rebuild and verify the Docker-served frontend after the editor dual-mode changes.
5. Decide whether `react-json-view` should remain as a long-term alternate or be deprecated after Monaco fully covers the editing flow.
6. Add backend auth dependencies and create a `User` model with hashed passwords and role fields.
7. Add auth controller/routes for login, session bootstrap, and current-user lookup.
8. Add JWT verification middleware and RBAC middleware for `Admin`, `Editor`, and `Viewer`.
9. Protect document routes so viewers are read-only, editors can preview/import/update, and admins can delete/manage integrations.
10. Add request validation, sanitization, and centralized backend error middleware before moving into schema validation and versioning.

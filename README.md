# CMS JSON Manager

This is a beginner-friendly full-stack web application built with:

- Node.js
- Express
- MongoDB with Mongoose
- React with hooks
- Axios
- `react-json-view` for WYSIWYG-style JSON editing

This project is designed as a generic CMS-style JSON manager.

It can:

- call an external CMS API
- load the returned JSON
- open the JSON in a tree-style editor
- allow edits to nested fields
- save the edited JSON into MongoDB
- display published JSON in a public frontend view

This project also follows the Docker deployment pattern from the sample app using:

- Kong as the API gateway
- Nginx as the load balancer
- two backend Node.js instances
- MongoDB as the shared database

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

## API Flow

1. Admin frontend calls the API through Kong
2. Kong forwards the request to Nginx
3. Nginx load balances the request to `server1` or `server2`
4. The backend reads or writes JSON documents in MongoDB
5. The response flows back through Nginx and Kong to the frontend

## Main Backend Routes

Base route:

```text
/api/documents
```

Routes:

- `GET /api/documents` get all saved documents
- `GET /api/documents/:id` get one document
- `POST /api/documents` create a document manually
- `PUT /api/documents/:id` update saved JSON
- `DELETE /api/documents/:id` delete a document
- `POST /api/documents/import` import JSON from an external CMS API
- `GET /health` backend health route

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

Backend URL:

```text
http://localhost:5000
```

Run frontend:

```bash
cd client
npm start
```

Frontend URL:

```text
http://localhost:3000
```

## Environment Variables

Backend `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cms_json_manager
```

Frontend environment:

```env
REACT_APP_API_URL=http://localhost:5000/api/documents
```

## Run with Docker

Build and start all services:

```bash
docker compose up --build
```

This starts:

- frontend on `http://localhost:3000`
- Kong API gateway on `http://localhost:8000`
- Nginx load balancer on `http://localhost:8080`
- backend instance 1 on `http://localhost:5001`
- backend instance 2 on `http://localhost:5002`
- MongoDB on port `27017`

The frontend Docker image is built with:

```text
REACT_APP_API_URL=http://localhost:8000/api/documents
```

So the browser frontend talks to Kong, not directly to a backend container.

To stop the containers:

```bash
docker compose down
```

## Manual API Testing

Test Kong health route:

```bash
curl http://localhost:8000/health
```

Get all documents through Kong:

```bash
curl http://localhost:8000/api/documents
```

Test Nginx directly:

```bash
curl http://localhost:8080/api/documents
```

Test backend instances directly:

```bash
curl http://localhost:5001/health
curl http://localhost:5002/health
```

Example import request:

```bash
curl -X POST http://localhost:8000/api/documents/import \
-H "Content-Type: application/json" \
-d "{\"title\":\"External CMS Data\",\"sourceUrl\":\"https://example.com/api/data\",\"requestMethod\":\"GET\",\"requestHeaders\":{\"Accept-Language\":\"en\"},\"contentType\":\"generic-json\",\"status\":\"draft\"}"
```

## What the App Can Do

- import JSON from any CMS API URL
- edit nested JSON in a tree-style editor
- add and remove JSON fields
- save JSON into MongoDB
- publish or keep content in draft mode
- show published content in a public view
- route API traffic through Kong and Nginx
- load balance requests across two backend containers

# Task Manager Full-Stack App

This is a beginner-friendly full-stack Task Manager project built with:

- Node.js
- Express
- MongoDB with Mongoose
- React with hooks
- Axios

This project now also demonstrates a load-balanced API architecture using:

- Kong as the API gateway
- Nginx as the load balancer
- two backend Node.js instances
- MongoDB as the shared database

## Project Structure

```text
task-manager-fullstack/
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- models/
|   |   `-- Task.js
|   |-- routes/
|   |   `-- taskRoutes.js
|   |-- .env
|   |-- .env.example
|   |-- Dockerfile
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- public/
|   |   `-- index.html
|   |-- src/
|   |   |-- components/
|   |   |   |-- TaskForm.js
|   |   |   `-- TaskList.js
|   |   |-- services/
|   |   |   `-- api.js
|   |   |-- App.js
|   |   |-- index.css
|   |   `-- index.js
|   |-- .env
|   |-- .env.example
|   |-- Dockerfile
|   `-- nginx.conf
|-- kong/
|   `-- kong.yml
|-- nginx/
|   `-- nginx.conf
`-- docker-compose.yml
```

## API Gateway + Load Balancer Request Flow

This project uses Kong as the API gateway, Nginx as the load balancer, and two Express backend containers behind the load balancer.

All services run with Docker Compose for easy local testing.

### Request Flow Diagram

```text
            +-------------+
            |   Client    |
            +-------------+
                   |
                   | HTTP Request (for example: GET /api/tasks)
                   v
            +-------------+
            |    Kong     |  (port 8000)
            +-------------+
                   |
                   | Forwards to internal service
                   v
            +-------------+
            |   Nginx     |  (port 8080 on host, 80 in Docker)
            +-------------+
                   |
           +-------+--------+
           |                |
           v                v
   +-------------+   +-------------+
   |  backend1   |   |  backend2   |
   |  (port 5000)|   |  (port 5000)|
   +-------------+   +-------------+
           |                |
           +-------+--------+
                   |
                   v
            +-------------+
            |   MongoDB   |
            +-------------+
```

### How Requests Flow Through the System

1. Client calls Kong:

```text
http://localhost:8000/api/tasks
```

2. Kong forwards the request to Nginx.

3. Nginx load balances the request to one backend container:

- `backend1:5000`
- `backend2:5000`

4. The backend reads or writes task data in MongoDB.

5. The response returns through:

```text
backend -> Nginx -> Kong -> client
```

## Install Packages

Install backend packages:

```bash
cd backend
npm install
```

Install frontend packages:

```bash
cd frontend
npm install
```

## Run the Backend

Make sure MongoDB is running first.

Then start the backend:

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## Run the Frontend

Start the frontend in another terminal:

```bash
cd frontend
npm start
```

The frontend runs on:

```text
http://localhost:3000
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

Note:

- the frontend Docker image receives its API URL during the image build
- in this project, `docker-compose.yml` passes `REACT_APP_API_URL=http://localhost:8000/api` as a Docker build argument
- the browser frontend talks to Kong, not directly to a backend container

To stop the containers:

```bash
docker compose down
```

## Manual API Testing with curl

Test Kong root route:

```bash
curl http://localhost:8000/
```

Test Kong health route:

```bash
curl http://localhost:8000/health
```

Get all tasks through Kong:

```bash
curl http://localhost:8000/api/tasks
```

Create a task through Kong:

```bash
curl -X POST http://localhost:8000/api/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Learn Express\",\"description\":\"Build CRUD API\",\"completed\":false}"
```

Update a task through Kong:

Replace `TASK_ID_HERE` with a real task ID.

```bash
curl -X PUT http://localhost:8000/api/tasks/TASK_ID_HERE \
-H "Content-Type: application/json" \
-d "{\"title\":\"Updated Task\",\"description\":\"Edited task\",\"completed\":true}"
```

Delete a task through Kong:

Replace `TASK_ID_HERE` with a real task ID.

```bash
curl -X DELETE http://localhost:8000/api/tasks/TASK_ID_HERE
```

### Hit the Load Balancer Directly

Nginx is also exposed directly on:

```text
http://localhost:8080
```

Example:

```bash
curl http://localhost:8080/api/tasks
```

This bypasses Kong and sends the request straight to Nginx, which then forwards it to `backend1` or `backend2`.

### Hit Backend Instances Directly

You can also test each backend container separately:

```bash
curl http://localhost:5001/health
curl http://localhost:5002/health
```

## Environment Variables

Backend `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/task-manager-db
```

Frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## What the App Can Do

- Add a task
- View all tasks
- Edit a task
- Delete a task
- Mark a task as completed or pending
- Route API traffic through Kong and Nginx
- Load balance API requests across two backend containers

## Docker Preparation

This project is set up to be Docker-friendly later because:

- backend and frontend are in separate folders
- environment variables are used for configuration
- the backend does not hardcode database settings in code
- the frontend API URL can be changed through `.env`
- Dockerfiles exist for both backend and frontend
- `docker-compose.yml` runs frontend, Kong, Nginx, two backend containers, and MongoDB together
- health checks are included for MongoDB and both backend containers

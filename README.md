# NodeDevProject

## **Prerequisites**

Ensure you have the following installed on your machine:

1. **Docker**
    - Install Docker from the official site: [Docker Download](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose**
    - Docker Compose is included in Docker Desktop for Windows and macOS.
    - For Linux, install Docker Compose:
      ```bash
      sudo apt update
      sudo apt install docker-compose
      ```
3. **Git**
    - Install Git: [Git Download](https://git-scm.com/downloads)

---

## **Cloning the Repository**

Start by cloning the project repository to your local machine:

```bash
git clone https://github.com/SolaDevSolide/NodeDevProject
cd NodeDevProject
```

---

## **Running the Project with Docker**

The project uses **Docker Compose** to run all services (backend, frontend, and PostgreSQL) simultaneously.

---

### **1. Starting the Development Environment**

To start the development environment (hot-reloading for both frontend and backend):

- **Linux / macOS / Windows (PowerShell):**

```bash
docker-compose up --build
```

### **What Happens:**

- **Backend**: Runs with `nodemon` for hot-reloading.
- **Frontend**: Angular serves in development mode (`ng serve`).
- **Database**: PostgreSQL runs in a container with persistent storage.

### **2. Accessing the Services**

Once the containers are up, you can access the following:

- **Frontend**: [http://localhost:4200](http://localhost:4200)
- **Backend**: [http://localhost:3000](http://localhost:3000)
- **Database**: PostgreSQL will be accessible at `localhost:5432`.

---

## **Environment Variables**

Environment variables are stored in the `.env` file located in the `backend` directory. Make sure to update these with
your configurations:

```plaintext
PORT=3000
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=postgres_db
DB_NAME=yourdbname
DB_PORT=5432
```

**Note**: The default values are configured for Docker Compose. No additional setup is required.

---

## **Stopping the Project**

To stop the containers:

```bash
docker-compose down
```

This will stop and remove all running containers.

---

## **Running Tests**

The backend includes tests that use Jest. To run tests within the Docker environment:

```bash
docker-compose run backend npm run test
```

---

## **Database Persistence**

The PostgreSQL database uses Docker volumes for persistent storage. Even if you stop the containers, your data will
remain intact.

To completely clean up the database (this will **delete all data**):

```bash
docker-compose down -v
```

---

## **Common Issues**

### **1. Port Conflicts**

If ports `3000` (backend) or `4200` (frontend) are already in use, you may need to stop other applications using these
ports or change the ports in `docker-compose.yml`:

```yaml
ports:
  - "NEW_PORT:3000"  # For backend
  - "NEW_PORT:4200"  # For frontend
```

### **2. Docker Permissions (Linux)**

If you face permissions issues running Docker commands, add your user to the Docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Restart your terminal session and try again.

### **3. PostgreSQL Connection Issues**

Ensure the database environment variables in the `.env` file match the `docker-compose.yml` settings.

---

## **Production Environment**

For production builds, use the dedicated Docker Compose file:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

This will build optimized, production-ready images for the frontend and backend.

---

## **Quick Reference Commands**

| Action                       | Command                                                |
|------------------------------|--------------------------------------------------------|
| Start development            | `docker-compose up --build`                            |
| Stop containers              | `docker-compose down`                                  |
| Run backend tests            | `docker-compose run backend npm test`                  |
| Rebuild containers           | `docker-compose up --build`                            |
| Clean containers and volumes | `docker-compose down -v`                               |
| Production build             | `docker-compose -f docker-compose.prod.yml up --build` |

---
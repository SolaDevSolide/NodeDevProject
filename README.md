# NodeDevProject

**A Dockerized Node.js + Angular + PostgreSQL application** that allows CSV file uploads, data visualization (using
tables, charts, and D3), and basic CRUD operations for products/orders stored in PostgreSQL.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Screenshots & Pages](#screenshots--pages)
3. [User's Guide](#users-guide)
4. [Prerequisites](#prerequisites)
5. [Cloning the Repository](#cloning-the-repository)
6. [Running the Project with Docker](#running-the-project-with-docker)
    - [1. Starting the Development Environment](#1-starting-the-development-environment)
    - [2. Accessing the Services](#2-accessing-the-services)
7. [Environment Variables](#environment-variables)
8. [Stopping the Project](#stopping-the-project)
9. [Running Tests](#running-tests)
10. [Database Persistence](#database-persistence)
11. [Common Issues and Fixes](#common-issues-and-fixes)
12. [Quick Reference Commands](#quick-reference-commands)

---

## Project Overview

This application provides:

1. **CSV Upload & Validation**: You can upload CSV files for **orders** and **products**, validate them, then insert
   them into PostgreSQL tables.
2. **Data Visualization**:
    - A **table-based** view of data for orders, products, or joined orders/products.
    - A **chart-based** page showing the number of products per order (using Chart.js).
    - A **D3-based** page for custom data visualization.
3. **CRUD Endpoints** for **Orders** and **Products**, plus a joined **Visualization** endpoint (
   `/api/visualization/join`).

Everything is containerized via Docker. The **frontend** (Angular) runs on port 4200, the **backend** (Node + Express)
on port 3000, and **PostgreSQL** on port 5432.

The only "hardcoded" port is the backend as the frontend did not like to be passed environment variable from
docker-compose ╮(╯_╰)╭

If there is any problem with ports please refer to the [Common Issues and Fixes](#common-issues-and-fixes).

---

## Screenshots & Pages

### **1. Main Page**

> A simple landing page with explanation and navigation links.

![Main Page](/screenshots/main_page.png)

- **Home**: Explains the CSV upload, database usage, and provides routes to:
    - **Upload** page
    - **Visualization** pages (tables, charts, D3)

### **2. CSV Upload Page**

> Where you can drag-and-drop or select CSV files (orders/products), validate them, and insert into PostgreSQL.

![CSV Upload](/screenshots/csv_upload.png)

- **Drag & Drop** zone
- **Validate** button
- **Insert** button

### **3. Visualization (Table)**

> A page that allows you to view **Orders**, **Products**, or a **Joined** table.

![Table Visualization](/screenshots/table_view.png)

- **Dropdown**: Choose between `Orders`, `Products`, or `Joined` data.
- **Angular Material** table (or expansion) displaying the relevant data.

### **4. Visualization (Charts)**

> A bar chart showing "Number of Products per Order" using `ng2-charts` + Chart.js.

![Chart Visualization](/screenshots/chart_view.png)

- **Bar Chart**: X-axis = `Order ID`, Y-axis = product count.

### **5. Visualization (D3)**

> A custom D3-based visualization that also shows "Number of Products per Order" or a custom diagram.

![D3 Visualization](/screenshots/d3_view.png)

- Draws an **SVG** using D3, each bar or shape representing data from the joined `/api/visualization/join`.

---

## User's Guide

1. **Navigating the App**:
    - On first load, you land on the **Main Page**.
    - **Upload**: Go to the CSV upload page to drag-and-drop your CSV files (orders or products), you may find some
      example csv files to drag and drop under the `/ressources` directory of the repo (if needed you can also run the
      python script `generate_csv.py` to make other csv).
        1. **Validate** the files to check if they match expected columns.
        2. **Insert** them into the PostgreSQL database.
    - **Visualization**: Under `/visualization`, you can choose:
        - **/visualization/table**: Switch between viewing `orders`, `products`, or the combined data in a table.
        - **/visualization/charts**: Shows a bar chart for “Number of Products per Order.”
        - **/visualization/d3**: A D3-based chart/diagram with the same data.
2. **CRUD**:
    - You can also create, read, update, or delete products (`/api/products/*`) or orders (`/api/orders/*`) via the API.
    - You can access the swagger api documentation under `/api-docs` of the backend.
3. **Dropping Tables**:
    - The API can drop entire tables (orders/products) if you want to reset via `/api/table/:tableName`.

---

## Prerequisites

Ensure you have the following installed on your machine:

1. **Docker**
    - On most linux distro docker is already included.
    - [Docker Download](https://www.docker.com/products/docker-desktop)
2. **Docker Compose**
    - Included with Docker Desktop on Windows/macOS.
    - On Linux, install with:
      ```bash
      sudo apt update
      sudo apt install docker-compose
      ```
3. **Git**
    - [Git Download](https://git-scm.com/downloads)

---

## Cloning the Repository

```bash
git clone https://github.com/SolaDevSolide/NodeDevProject
cd NodeDevProject
```

---

## Running the Project with Docker

### **1. Starting the Development Environment**

```bash
docker-compose up --build
```

- **Backend**: Runs with **nodemon** for hot-reloading on port 3000.
- **Frontend**: Angular dev server on port 4200.
- **Database**: PostgreSQL at port 5432.

### **2. Accessing the Services**

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **Database** (PostgreSQL): Host `localhost`, port `5432`.

---

## Environment Variables

Environment variables are managed directly within the `docker-compose.yml` file. Below are the default values as
configured:

### Backend Service

```yaml
environment:
  NODE_ENV: "development"
  PORT: "3000"
  DB_USER: "postgres"
  DB_PASSWORD: "admin"
  DB_HOST: "postgres_db"
  DB_NAME: "nodeAngular"
  DB_PORT: "5432"
```

### Database Service

```yaml
environment:
  POSTGRES_USER: "postgres"
  POSTGRES_PASSWORD: "admin"
  POSTGRES_DB: "nodeAngular"
```

### Notes

- These environment variables are already configured within the `docker-compose.yml` file, so no additional setup is
  required for Docker Compose.
- The `healthcheck` configuration ensures the database is ready before the backend attempts to connect.

To start the services, simply use the command:

```bash
docker-compose up
``` 

This will launch the backend, frontend, and PostgreSQL services with the preconfigured environment.

---

## Stopping the Project

```bash
docker-compose down
```

Stops and removes the containers.

---

## Running Tests

To run backend tests (Jest):

```bash
docker-compose run backend npm run test
```

Thoses tests ensure the backend is able to connect to the database and perform some basic operation on the tables.

---

## Database Persistence

PostgreSQL uses Docker volumes for persistent storage. Data remains intact after containers stop. To **fully reset**,
including wiping data:

```bash
docker-compose down -v
```

---

## Common Issues and Fixes

### 1. Port Conflicts

If the port `5432` (used by PostgreSQL), `3000` (backend), or `4200` (frontend) is already in use, you may encounter
errors when starting the services.

#### Fix:

- Edit `docker-compose.yml` to remap the conflicting ports:
  ```yaml
  services:
    postgres_db:
      ports:
        - "5433:5432" # Change host port to 5433 or any available port
    backend:
      ports:
        - "3001:3000" # Change host port to 3001 or any available port
    frontend:
      ports:
        - "4201:4200" # Change host port to 4201 or any available port
  ```
- Restart the Docker services:
  ```bash
  docker-compose down
  docker-compose up
  ```

### 2. Docker Permissions (Linux)

On Linux, you may encounter permissions issues when running Docker commands without `sudo`.

#### Fix:

- Add your user to the Docker group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### 3. PostgreSQL Port Already in Use

If the PostgreSQL port `5432` is already in use by another process, it may prevent the database container from starting.

#### Fix:

- **For Linux:**
    1. Check which process is using the port:
       ```bash
       sudo lsof -i :5432
       ```
    2. Stop the conflicting process:
       ```bash
       sudo kill -9 <PID>
       ```
    3. Alternatively, remap the PostgreSQL port in `docker-compose.yml` as shown in **Port Conflicts** above.

- **For Windows:**
    1. Check the port usage with PowerShell:
       ```powershell
       netstat -ano | findstr :5432
       ```
    2. Identify and stop the conflicting process using Task Manager or:
       ```powershell
       Stop-Process -Id <PID> -Force
       ```
    3. Alternatively, update the PostgreSQL port mapping in `docker-compose.yml`.

---

## Quick Reference Commands

| Action                     | Command                                   |
|----------------------------|-------------------------------------------|
| Start development          | `docker-compose up --build`               |
| Stop containers            | `docker-compose down`                     |
| Run backend tests          | `docker-compose run backend npm run test` |
| Rebuild containers         | `docker-compose up --build`               |
| Clean containers & volumes | `docker-compose down -v`                  |

---

**Enjoy using our app!** Feel free to open issues or contribute improvements via pull requests. And please don't delete
our main branch as it is not protected, if you do we will be very sad (´,_ゝ`)
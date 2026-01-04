# 🥛 Dairy Management System - Backend API

Complete Node.js/Express backend API for the Dairy Management System with **MySQL database**, TypeScript, Sequelize ORM, JWT authentication, and comprehensive business logic.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Deployment](#deployment)

## ✨ Features

### Core Modules

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Operator, Driver, Viewer)
  - Password recovery and reset
  - Secure password hashing with bcrypt

- **Product & Inventory Management**
  - Complete CRUD operations for products
  - Real-time stock tracking
  - Low stock alerts
  - Stock level categorization (normal, low, critical, out-of-stock)
  - Inventory reports

- **Production & Batch Management**
  - Batch creation and tracking
  - Quality control checks (temperature, pH, bacteria)
  - Production yield tracking
  - Operator assignment
  - Equipment and ingredient tracking

- **Client Management**
  - Client profiles with contact information
  - Delivery preferences
  - Purchase history and statistics
  - Client segmentation by type
  - Revenue tracking per client

- **Order & Delivery Management**
  - Order creation and tracking
  - Real-time order status updates
  - Driver assignment
  - Delivery scheduling
  - Order cancellation with stock restoration
  - Detailed tracking history

- **Invoicing & Finance**
  - Automated invoice generation from orders
  - Payment tracking
  - Overdue invoice detection
  - Financial summaries and reports
  - Tax calculation

- **Reports & Analytics**
  - Dashboard statistics
  - Sales reports (daily, monthly, yearly)
  - Production reports
  - Inventory reports
  - Client analytics
  - Financial reports

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0 with Sequelize ORM
- **ORM:** Sequelize-TypeScript
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs
- **Validation:** Express-validator
- **Rate Limiting:** Express-rate-limit
- **Logging:** Morgan, Winston
- **Environment:** dotenv

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **MySQL** (version 8.0 or higher)
  - Local installation OR
  - Cloud MySQL instance (AWS RDS, Google Cloud SQL, etc.)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   cd dairy-management-system/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your configuration:**
   ```env
   # Environment
   NODE_ENV=development

   # Server
   PORT=5000
   API_VERSION=v1

   # Database (MySQL)
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=dairy_management
   DB_USER=root
   DB_PASSWORD=your-mysql-password

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `API_VERSION` | API version prefix | `v1` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `dairy_management` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | **Required** |
| `JWT_SECRET` | Secret key for JWT signing | **Required** |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### MySQL Setup with XAMPP

#### Installation XAMPP

1. **Télécharger XAMPP:**
   - Windows/Linux/macOS: https://www.apachefriends.org/download.html
   - Choisir la version avec PHP 8.0+ et MySQL

2. **Installer XAMPP:**
   - Windows: Exécuter le fichier .exe
   - Linux: `sudo chmod +x xampp-installer.run && sudo ./xampp-installer.run`
   - macOS: Ouvrir le fichier .dmg

3. **Démarrer MySQL:**
   - Ouvrir XAMPP Control Panel
   - Cliquer sur "Start" pour MySQL
   - MySQL sera disponible sur `localhost:3306`

4. **Créer la base de données:**
   
   **Option A - Via phpMyAdmin:**
   - Ouvrir http://localhost/phpmyadmin
   - Cliquer sur "Nouvelle base de données"
   - Nom: `dairy_management`
   - Interclassement: `utf8mb4_general_ci`
   - Cliquer "Créer"

   **Option B - Via ligne de commande:**
   ```bash
   # Windows (depuis le dossier XAMPP)
   cd C:\xampp
   mysql\bin\mysql -u root -p
   
   # Linux/macOS
   /opt/lampp/bin/mysql -u root -p
   
   # Puis dans MySQL:
   CREATE DATABASE dairy_management CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   EXIT;
   ```

5. **Configuration par défaut XAMPP:**
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: `` (vide par défaut)
   - Database: `dairy_management`

#### Option Alternative: MySQL Standalone

Si vous ne voulez pas XAMPP, vous pouvez installer MySQL seul:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
Télécharger depuis https://dev.mysql.com/downloads/mysql/

Puis créer la base de données:
```bash
mysql -u root -p
CREATE DATABASE dairy_management;
EXIT;
```

## 🏃 Running the Application

### Development Mode

```bash
# Initialize database (creates tables)
npm run db:init

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

This starts the server with hot-reload enabled using nodemon.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Database Commands

```bash
# Initialize database (creates all tables)
npm run db:init

# Seed database with sample data
npm run db:seed

# Reset database (drop and recreate)
npm run db:reset
```

**Test Users Created:**
- **Admin:** admin@dairy.com / password123
- **Manager:** manager@dairy.com / password123
- **Operator:** operator@dairy.com / password123
- **Driver:** driver@dairy.com / password123

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |
| PUT | `/auth/reset-password/:token` | Reset password | Public |
| PUT | `/auth/update-password` | Update password | Private |

### Products Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | Get all products | Private |
| GET | `/products/:id` | Get single product | Private |
| POST | `/products` | Create product | Admin, Manager |
| PUT | `/products/:id` | Update product | Admin, Manager |
| DELETE | `/products/:id` | Delete product | Admin |
| PATCH | `/products/:id/stock` | Update stock | Admin, Manager, Operator |
| GET | `/products/alerts/low-stock` | Get low stock products | Private |

### Clients Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/clients` | Get all clients | Private |
| GET | `/clients/:id` | Get single client | Private |
| POST | `/clients` | Create client | Admin, Manager |
| PUT | `/clients/:id` | Update client | Admin, Manager |
| DELETE | `/clients/:id` | Delete client | Admin |
| GET | `/clients/:id/stats` | Get client statistics | Private |

### Orders Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/orders` | Get all orders | Private |
| GET | `/orders/:id` | Get single order | Private |
| POST | `/orders` | Create order | Admin, Manager |
| PUT | `/orders/:id` | Update order | Admin, Manager |
| PATCH | `/orders/:id/status` | Update order status | Private |
| PATCH | `/orders/:id/assign-driver` | Assign driver | Admin, Manager |
| PATCH | `/orders/:id/cancel` | Cancel order | Admin, Manager |

### Batches Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/batches` | Get all batches | Private |
| GET | `/batches/:id` | Get single batch | Private |
| POST | `/batches` | Create batch | Admin, Manager, Operator |
| PUT | `/batches/:id` | Update batch | Admin, Manager, Operator |
| PATCH | `/batches/:id/complete` | Complete batch | Admin, Manager, Operator |
| PATCH | `/batches/:id/quality-checks` | Update quality checks | Admin, Manager, Operator |
| DELETE | `/batches/:id` | Delete batch | Admin |

### Invoices Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/invoices` | Get all invoices | Private |
| GET | `/invoices/:id` | Get single invoice | Private |
| POST | `/invoices` | Create invoice | Admin, Manager |
| POST | `/invoices/from-order/:orderId` | Create from order | Admin, Manager |
| PUT | `/invoices/:id` | Update invoice | Admin, Manager |
| PATCH | `/invoices/:id/pay` | Mark as paid | Admin, Manager |
| DELETE | `/invoices/:id` | Delete invoice | Admin |
| GET | `/invoices/stats/summary` | Financial summary | Private |

### Dashboard & Reports Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard/stats` | Dashboard statistics | Private |
| GET | `/reports/sales` | Sales report | Private |
| GET | `/reports/production` | Production report | Private |
| GET | `/reports/inventory` | Inventory report | Private |
| GET | `/reports/clients` | Client report | Private |
| GET | `/reports/financial` | Financial report | Admin, Manager |

### Example Requests

#### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "viewer"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dairy.com",
    "password": "password123"
  }'
```

#### Create Product

```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Fresh Milk 2L",
    "category": "Milk",
    "sku": "MILK-FRESH-2L",
    "currentStock": 200,
    "minThreshold": 100,
    "maxCapacity": 500,
    "unit": "L",
    "unitPrice": 4.50,
    "costPrice": 3.20
  }'
```

## 🗄 Database Models

### User
- Authentication and authorization
- Roles: admin, manager, operator, driver, viewer
- Password hashing and reset functionality

### Product
- Product information and specifications
- Stock tracking and alerts
- Supplier information
- Storage requirements

### Client
- Client profiles and contact details
- Delivery preferences
- Revenue tracking
- Purchase history

### Order
- Order details and items
- Status tracking
- Delivery information
- Driver assignment

### Batch
- Production batch tracking
- Quality control checks
- Yield calculation
- Operator assignment

### Invoice
- Invoice generation
- Payment tracking
- Due date management
- Financial reporting

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How to Use

1. **Register or Login** to get a JWT token
2. **Include the token** in the Authorization header for protected routes:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

### Role-Based Access

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access |
| **Manager** | All except user management |
| **Operator** | Production and inventory |
| **Driver** | Order delivery updates |
| **Viewer** | Read-only access |

## 🚢 Deployment

### Deploy to Heroku

1. **Install Heroku CLI**
2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku app:**
   ```bash
   heroku create dairy-management-api
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_secret
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

### Deploy to DigitalOcean

1. Create a Droplet with Node.js
2. Clone the repository
3. Install dependencies
4. Set up PM2 for process management
5. Configure Nginx as reverse proxy

### Deploy with Docker

```bash
# Build image
docker build -t dairy-api .

# Run container
docker run -p 5000:5000 --env-file .env dairy-api
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact

For questions or support, please contact the development team.

---

Built with ❤️ for efficient dairy business management

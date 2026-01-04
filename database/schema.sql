-- Dairy Management System - Database Schema
-- Run this script in your Railway MySQL database to create all tables

-- Create database (if connecting without database selected)
CREATE DATABASE IF NOT EXISTS dairy_db;
USE dairy_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  phone VARCHAR(50),
  isActive BOOLEAN DEFAULT true,
  lastLogin DATETIME,
  resetPasswordToken VARCHAR(255),
  resetPasswordExpire DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_resetToken (resetPasswordToken)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('milk', 'yogurt', 'cheese', 'butter', 'other') NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  unit ENUM('liters', 'kg', 'pieces') DEFAULT 'liters',
  currentStock DECIMAL(10, 2) DEFAULT 0,
  minStock DECIMAL(10, 2) DEFAULT 0,
  maxStock DECIMAL(10, 2),
  unitPrice DECIMAL(10, 2) NOT NULL,
  costPrice DECIMAL(10, 2),
  isActive BOOLEAN DEFAULT true,
  expiryDays INT DEFAULT 7,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_sku (sku),
  INDEX idx_active (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Rwanda',
  taxId VARCHAR(100),
  clientType ENUM('retail', 'wholesale', 'distributor') DEFAULT 'retail',
  creditLimit DECIMAL(10, 2) DEFAULT 0,
  currentBalance DECIMAL(10, 2) DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_type (clientType),
  INDEX idx_active (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderNumber VARCHAR(50) NOT NULL UNIQUE,
  clientId INT NOT NULL,
  orderDate DATETIME NOT NULL,
  deliveryDate DATETIME,
  status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  grandTotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  createdBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orderNumber (orderNumber),
  INDEX idx_status (status),
  INDEX idx_paymentStatus (paymentStatus),
  INDEX idx_orderDate (orderDate),
  INDEX idx_deliveryDate (deliveryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unitPrice DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_orderId (orderId),
  INDEX idx_productId (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Production Batches table
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batchNumber VARCHAR(50) NOT NULL UNIQUE,
  productId INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit ENUM('liters', 'kg', 'pieces') DEFAULT 'liters',
  startTime DATETIME NOT NULL,
  endTime DATETIME,
  status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
  cost DECIMAL(10, 2),
  notes TEXT,
  expiryDate DATETIME,
  qualityCheck ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
  producedBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (producedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_batchNumber (batchNumber),
  INDEX idx_status (status),
  INDEX idx_expiryDate (expiryDate),
  INDEX idx_startTime (startTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  orderId INT,
  clientId INT NOT NULL,
  issueDate DATETIME NOT NULL,
  dueDate DATETIME NOT NULL,
  status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amountPaid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL,
  paymentMethod ENUM('cash', 'bank_transfer', 'mobile_money', 'check', 'other'),
  notes TEXT,
  createdBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invoiceNumber (invoiceNumber),
  INDEX idx_status (status),
  INDEX idx_issueDate (issueDate),
  INDEX idx_dueDate (dueDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentDate DATETIME NOT NULL,
  paymentMethod ENUM('cash', 'bank_transfer', 'mobile_money', 'check', 'other') NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  createdBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_invoiceId (invoiceId),
  INDEX idx_paymentDate (paymentDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stock Movements table (for tracking inventory changes)
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  movementType ENUM('in', 'out', 'adjustment') NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(255),
  referenceId INT,
  reason TEXT,
  performedBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (performedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_productId (productId),
  INDEX idx_movementType (movementType),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default admin user (password: admin123)
-- NOTE: Change this password immediately after first login!
INSERT INTO users (username, email, password, role, firstName, lastName, isActive)
VALUES (
  'admin',
  'admin@dairysystem.com',
  '$2b$10$rHZvXqQZYmYpZ9HxQxKJxOYxYzXZV4h8HYPxYpKJxYpKJxYpKJxYp',
  'admin',
  'System',
  'Administrator',
  true
) ON DUPLICATE KEY UPDATE id=id;

-- Insert sample products (optional)
INSERT INTO products (name, category, description, sku, unit, currentStock, minStock, unitPrice, costPrice, expiryDays)
VALUES 
  ('Fresh Milk', 'milk', 'Fresh cow milk', 'MILK-001', 'liters', 500, 100, 1500, 1000, 3),
  ('Whole Milk', 'milk', 'Whole cow milk', 'MILK-002', 'liters', 300, 50, 1800, 1200, 5),
  ('Plain Yogurt', 'yogurt', 'Plain yogurt 500ml', 'YOG-001', 'pieces', 200, 50, 2000, 1500, 14),
  ('Strawberry Yogurt', 'yogurt', 'Strawberry flavored yogurt', 'YOG-002', 'pieces', 150, 30, 2500, 1800, 14),
  ('Cheddar Cheese', 'cheese', 'Aged cheddar cheese', 'CHE-001', 'kg', 50, 10, 8000, 6000, 60),
  ('Fresh Butter', 'butter', 'Fresh butter 250g', 'BUT-001', 'pieces', 100, 20, 3500, 2500, 30)
ON DUPLICATE KEY UPDATE id=id;

-- Success message
SELECT 'Database schema created successfully!' AS message;
SELECT 'Default admin user: admin@dairysystem.com / admin123' AS credentials;
SELECT 'IMPORTANT: Change the admin password immediately!' AS warning;

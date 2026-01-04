# API Endpoints Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // Optional, for list responses
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer"
  }
}
```

#### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "admin@dairy.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
```
**Requires:** Authentication

#### Forgot Password
```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

#### Reset Password
```http
PUT /auth/reset-password/:resetToken
```

**Body:**
```json
{
  "password": "newpassword123"
}
```

### Products

#### Get All Products
```http
GET /products?category=Milk&status=low&search=fresh
```

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (normal, low, critical, out-of-stock)
- `search` (optional): Search in name, SKU, or barcode

#### Get Single Product
```http
GET /products/:id
```

#### Create Product
```http
POST /products
```

**Body:**
```json
{
  "name": "Fresh Milk 1L",
  "category": "Milk",
  "sku": "MILK-FRESH-1L",
  "barcode": "DRY001234567890",
  "description": "Fresh pasteurized whole milk",
  "currentStock": 450,
  "minThreshold": 200,
  "maxCapacity": 1000,
  "unit": "L",
  "unitPrice": 2.50,
  "costPrice": 1.80,
  "location": "Refrigerator 1",
  "shelfLife": 7,
  "storageTemp": "2-4°C",
  "supplier": "Local Farms Co."
}
```

#### Update Product Stock
```http
PATCH /products/:id/stock
```

**Body:**
```json
{
  "quantity": 100,
  "type": "add"  // "add", "subtract", or "set"
}
```

#### Get Low Stock Products
```http
GET /products/alerts/low-stock
```

### Clients

#### Get All Clients
```http
GET /clients?type=Restaurant&status=active&search=belle
```

#### Create Client
```http
POST /clients
```

**Body:**
```json
{
  "name": "Restaurant La Belle",
  "type": "Restaurant",
  "email": "contact@labelle.fr",
  "phone": "+33 1 23 45 67 89",
  "address": "123 Rue de la Paix, 75001 Paris",
  "contact": {
    "name": "Jean Dupont",
    "position": "Manager"
  },
  "preferences": {
    "deliveryDays": ["Monday", "Wednesday"],
    "paymentTerms": 30
  }
}
```

#### Get Client Statistics
```http
GET /clients/:id/stats
```

### Orders

#### Get All Orders
```http
GET /orders?status=pending&clientId=xxx&startDate=2025-01-01&endDate=2025-12-31
```

#### Create Order
```http
POST /orders
```

**Body:**
```json
{
  "clientId": "client_id_here",
  "items": [
    {
      "productId": "product_id",
      "quantity": 50
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  },
  "deliveryDate": "2025-12-25",
  "deliveryTime": "07:00-09:00",
  "specialInstructions": "Use service entrance"
}
```

#### Update Order Status
```http
PATCH /orders/:id/status
```

**Body:**
```json
{
  "status": "in-transit",
  "note": "Order picked up",
  "location": "Warehouse"
}
```

#### Assign Driver
```http
PATCH /orders/:id/assign-driver
```

**Body:**
```json
{
  "driverId": "driver_id",
  "driverName": "John Driver"
}
```

#### Cancel Order
```http
PATCH /orders/:id/cancel
```

**Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

### Batches

#### Get All Batches
```http
GET /batches?status=in-progress&productType=milk&startDate=2025-01-01
```

#### Create Batch
```http
POST /batches
```

**Body:**
```json
{
  "product": "Fresh Milk",
  "productType": "milk",
  "productId": "product_id_here",
  "quantity": 2500,
  "unit": "L",
  "startTime": "2025-12-20T08:00:00",
  "temperature": 72,
  "pH": 6.8,
  "ingredients": [
    {
      "name": "Raw Milk",
      "quantity": 2600,
      "unit": "L"
    }
  ]
}
```

#### Complete Batch
```http
PATCH /batches/:id/complete
```

**Body:**
```json
{
  "yield": 98,
  "qualityChecks": {
    "temperature": "pass",
    "pH": "pass",
    "bacteria": "pass"
  }
}
```

#### Update Quality Checks
```http
PATCH /batches/:id/quality-checks
```

**Body:**
```json
{
  "temperature": "pass",
  "pH": "pass",
  "bacteria": "fail"
}
```

### Invoices

#### Get All Invoices
```http
GET /invoices?status=paid&clientId=xxx&startDate=2025-01-01
```

#### Create Invoice from Order
```http
POST /invoices/from-order/:orderId
```

**Body:**
```json
{
  "paymentTerms": 30
}
```

#### Create Invoice
```http
POST /invoices
```

**Body:**
```json
{
  "clientId": "client_id",
  "items": [
    {
      "description": "Fresh Milk 1L",
      "quantity": 50,
      "unitPrice": 2.50,
      "total": 125.00
    }
  ],
  "dueDate": "2025-01-30",
  "notes": "Payment due within 30 days"
}
```

#### Mark Invoice as Paid
```http
PATCH /invoices/:id/pay
```

**Body:**
```json
{
  "paymentMethod": "Bank Transfer",
  "paymentReference": "TRX123456"
}
```

#### Get Financial Summary
```http
GET /invoices/stats/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 50000,
    "collected": 35000,
    "pending": 10000,
    "overdue": 5000
  }
}
```

### Dashboard & Reports

#### Get Dashboard Statistics
```http
GET /dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": {
      "total": 50,
      "lowStock": 5
    },
    "orders": {
      "total": 200,
      "pending": 10,
      "today": 5
    },
    "revenue": {
      "monthly": 25000,
      "today": 1500
    },
    "clients": {
      "active": 45
    },
    "production": {
      "activeBatches": 3
    }
  }
}
```

#### Get Sales Report
```http
GET /reports/sales?startDate=2025-01-01&endDate=2025-12-31&groupBy=month
```

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `groupBy` (optional): "day", "month", or "year"

#### Get Production Report
```http
GET /reports/production?startDate=2025-01-01&productType=milk
```

#### Get Inventory Report
```http
GET /reports/inventory
```

#### Get Client Report
```http
GET /reports/clients
```

#### Get Financial Report
```http
GET /reports/financial?startDate=2025-01-01&endDate=2025-12-31
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `DUPLICATE_ERROR` | Resource already exists |
| `SERVER_ERROR` | Internal server error |

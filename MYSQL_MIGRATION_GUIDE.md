# MySQL Migration - Remaining Work

## ✅ Completed

1. **Dependencies Updated** - package.json now has:
   - `sequelize` instead of `mongoose`
   - `sequelize-typescript` for TypeScript support
   - `mysql2` as the MySQL driver
   - `reflect-metadata` for decorators

2. **Database Configuration** - `src/config/database.ts`:
   - Now connects to MySQL using Sequelize
   - Configured with connection pooling
   - Auto-syncs models in development

3. **All 6 Models Converted** to Sequelize:
   - ✅ User.ts
   - ✅ Product.ts
   - ✅ Client.ts
   - ✅ Order.ts
   - ✅ Batch.ts
   - ✅ Invoice.ts

4. **Environment Variables Updated** - `.env.example`:
   - Changed from MONGODB_URI to DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

5. **Docker Configuration** - `docker-compose.yml`:
   - Replaced MongoDB with MySQL 8.0
   - Configured MySQL environment variables

## 🚧 Remaining Work

### 1. Update Controllers (Most Important)

All 6 controllers need Sequelize syntax updates:

#### Key Changes Needed:

**Mongoose → Sequelize Query Syntax:**
```typescript
// OLD (Mongoose)
await User.findOne({ email });
await User.findById(id);
await Product.find({ status: 'active' });
await Order.countDocuments();
await Client.create({ name, email });
await Product.findByIdAndUpdate(id, { stock: 10 });
await Order.findByIdAndDelete(id);

// NEW (Sequelize)
await User.findOne({ where: { email } });
await User.findByPk(id);
await Product.findAll({ where: { status: 'active' } });
await Order.count();
await Client.create({ name, email });
await Product.update({ currentStock: 10 }, { where: { id } });
await Order.destroy({ where: { id } });
```

**Relationship Queries:**
```typescript
// OLD (Mongoose)
await Order.findById(id).populate('clientId').populate('driverId');

// NEW (Sequelize)
await Order.findByPk(id, {
  include: [
    { model: Client, as: 'client' },
    { model: User, as: 'driver' }
  ]
});
```

**Aggregations:**
```typescript
// OLD (Mongoose)
await Order.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);

// NEW (Sequelize)
await Order.findAll({
  attributes: [
    'status',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['status']
});
```

### Controllers to Update:

1. **src/controllers/authController.ts**
   - Change `User.findOne({ email })` → `User.findOne({ where: { email } })`
   - Change `user._id` → `user.id`
   - Remove `.select('+password')` (Sequelize handles this differently)

2. **src/controllers/productController.ts**
   - Update all find/create/update/delete operations
   - Fix stock update logic
   - Update low stock queries

3. **src/controllers/clientController.ts**
   - Update CRUD operations
   - Fix client stats aggregations
   - Update search functionality

4. **src/controllers/orderController.ts**
   - Update order creation with includes
   - Fix status updates
   - Update driver assignment
   - Fix tracking events logic

5. **src/controllers/batchController.ts**
   - Update batch CRUD
   - Fix quality check updates
   - Update completion logic

6. **src/controllers/invoiceController.ts**
   - Update invoice CRUD
   - Fix financial summary aggregations
   - Update payment status logic

7. **src/controllers/dashboardController.ts**
   - Rewrite all aggregation queries
   - Fix date range queries
   - Update statistics calculations

### 2. Update Seed Script

**src/scripts/seed.ts** needs to:
- Import sequelize models instead of mongoose
- Use Sequelize create syntax
- Handle relationships properly
- Use `sequelize.sync({ force: true })` to recreate tables

### 3. Create Database Initialization Script

Create **src/scripts/initDatabase.ts**:
```typescript
import sequelize from '../config/database';

async function initDatabase() {
  try {
    await sequelize.sync({ force: true }); // Recreates all tables
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

initDatabase();
```

### 4. Update Server Entry Point

**src/server.ts** - Change:
```typescript
// OLD
import connectDB from './config/database';
await connectDB();

// NEW
import connectDB from './config/database';
await connectDB(); // Already updated, just verify
```

### 5. Add to package.json scripts

```json
"scripts": {
  "db:init": "ts-node src/scripts/initDatabase.ts",
  "db:seed": "ts-node src/scripts/seed.ts",
  "db:reset": "npm run db:init && npm run db:seed"
}
```

## 📋 Step-by-Step Completion Guide

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up MySQL Database avec XAMPP:**
   ```bash
   # Démarrer XAMPP MySQL (via le Control Panel ou la commande)
   # Windows: Ouvrir XAMPP Control Panel et cliquer "Start" pour MySQL
   # Linux: sudo /opt/lampp/lampp startmysql
   
   # Créer la base de données via phpMyAdmin ou ligne de commande:
   # Via phpMyAdmin: http://localhost/phpmyadmin
   # Créer une nouvelle base: dairy_management
   
   # OU via ligne de commande:
   # Windows: C:\xampp\mysql\bin\mysql.exe -u root -p
   # Linux: sudo /opt/lampp/bin/mysql -u root -p
   # Puis: CREATE DATABASE dairy_management;
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Éditer .env:
   # DB_HOST=localhost
   # DB_PORT=3306
   # DB_NAME=dairy_management
   # DB_USER=root
   # DB_PASSWORD=  (vide par défaut pour XAMPP)
   ```

4. **Initialize Database:**
   ```bash
   npm run db:init
   ```

5. **Test Compilation:**
   ```bash
   npm run build
   ```

6. **Update Each Controller** (use search & replace for common patterns)

7. **Update Seed Script**

8. **Test the Application:**
   ```bash
   npm run dev
   ```

📚 **Guide XAMPP Complet:** Voir `XAMPP_SETUP_GUIDE.md` pour des instructions détaillées.

## 🔍 Common Sequelize Patterns

### Finding Records:
```typescript
// Single record
const user = await User.findByPk(id);
const user = await User.findOne({ where: { email } });

// Multiple records
const users = await User.findAll({ where: { status: 'active' } });
const users = await User.findAll({ limit: 10, offset: 0 });

// With relationships
const order = await Order.findByPk(id, {
  include: [Client, User]
});
```

### Creating Records:
```typescript
const user = await User.create({ name, email, password });
```

### Updating Records:
```typescript
// Update and return instance
const user = await User.findByPk(id);
user.name = 'New Name';
await user.save();

// Bulk update
await User.update({ status: 'inactive' }, { where: { id } });
```

### Deleting Records:
```typescript
await User.destroy({ where: { id } });
```

### Transactions:
```typescript
const t = await sequelize.transaction();
try {
  await User.create({ name }, { transaction: t });
  await Order.create({ userId }, { transaction: t });
  await t.commit();
} catch (error) {
  await t.rollback();
}
```

## 🎯 Priority Order

1. **HIGH**: Update authController.ts (needed for login)
2. **HIGH**: Update productController.ts (core functionality)
3. **MEDIUM**: Update orderController.ts (core functionality)
4. **MEDIUM**: Update clientController.ts (core functionality)
5. **LOW**: Update batchController.ts
6. **LOW**: Update invoiceController.ts
7. **LOW**: Update dashboardController.ts (can be done last)
8. **MEDIUM**: Update seed.ts

## ⚠️ Important Notes

- Sequelize uses `id` instead of `_id`
- No need for `.toString()` on IDs
- Relationships are defined in models, not in queries
- Validation happens in model definitions
- Hooks are defined with decorators (@BeforeCreate, @BeforeUpdate)
- JSON fields work directly in MySQL 5.7+

## 📚 Resources

- [Sequelize Documentation](https://sequelize.org/)
- [Sequelize-TypeScript](https://github.com/sequelize/sequelize-typescript)
- [MySQL Documentation](https://dev.mysql.com/doc/)

import 'reflect-metadata';
import { sequelize } from '../config/database';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Batch from '../models/Batch';
import Invoice from '../models/Invoice';

/**
 * Initialize the database by syncing all models
 * This will create all tables based on model definitions
 */
async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Initialize hooks for all models
    User.initHooks();
    Product.initHooks();
    Order.initHooks();
    Batch.initHooks();
    Invoice.initHooks();
    console.log('✅ Model hooks initialized');
    
    // Sync all models (force: true will drop existing tables)
    // Remove force: true in production!
    await sequelize.sync({ force: true, alter: false });
    
    console.log('✅ All models synchronized successfully');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - products');
    console.log('   - clients');
    console.log('   - orders');
    console.log('   - batches');
    console.log('   - invoices');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();

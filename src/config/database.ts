import { Sequelize } from 'sequelize-typescript';
import 'reflect-metadata';
import { User } from '../models/User';
import Product from '../models/Product';
import Client from '../models/Client';
import Order from '../models/Order';
import Batch from '../models/Batch';
import Invoice from '../models/Invoice';

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://postgres:YOUR-PASSWORD@db.pckhbpzkxitdaumuznyl.supabase.co:5432/postgres',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Add models to sequelize instance
sequelize.addModels([User, Product, Client, Order, Batch, Invoice]);

// Initialize model hooks (for password hashing, etc.)
User.initHooks();
Product.initHooks();
Order.initHooks();
Batch.initHooks();
Invoice.initHooks();

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Database Connected (Supabase)`);
    
    // Sync models in development (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development' || process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: process.env.DB_ALTER === 'true' });
      console.log('✅ Database models synchronized');
    }

    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('PostgreSQL connection closed due to app termination');
      process.exit(0);
    });
  } catch (error: any) {
    console.error('❌ Error connecting to PostgreSQL:', error.message);
    console.log('⚠️  Server will continue running without database');
    // Don't exit - let server continue running
  }
};

export default connectDB;
export { sequelize };


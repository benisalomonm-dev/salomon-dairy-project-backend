import 'reflect-metadata';
import dotenv from 'dotenv';
import { mongoose } from '../config/database';
import User from '../models/User.mongo';
import Product from '../models/Product.mongo';
import Client from '../models/Client.mongo';
import Order from '../models/Order.mongo';
import Batch from '../models/Batch.mongo';
import Invoice from '../models/Invoice.mongo';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairy_management';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Client.deleteMany({});
    await Order.deleteMany({});
    await Batch.deleteMany({});
    await Invoice.deleteMany({});
    console.log('🧹 Database cleared');

    // Create 5 users with different roles
    const users = [];
    
    users.push(await User.create({
      name: 'Admin User',
      email: 'admin@dairy.com',
      password: 'admin123',
      role: 'admin',
      phone: '+33612345678',
      isActive: true,
    }));
    
    users.push(await User.create({
      name: 'Manager Pierre',
      email: 'manager@dairy.com',
      password: 'manager123',
      role: 'manager',
      phone: '+33612345679',
      isActive: true,
    }));
    
    users.push(await User.create({
      name: 'Operator Marie',
      email: 'operator@dairy.com',
      password: 'operator123',
      role: 'operator',
      phone: '+33612345680',
      isActive: true,
    }));
    
    users.push(await User.create({
      name: 'Driver Jean',
      email: 'driver@dairy.com',
      password: 'driver123',
      role: 'driver',
      phone: '+33612345681',
      isActive: true,
    }));
    
    users.push(await User.create({
      name: 'Viewer Sophie',
      email: 'viewer@dairy.com',
      password: 'viewer123',
      role: 'viewer',
      phone: '+33612345682',
      isActive: true,
    }));

    console.log('👥 Created 5 users');

    // Create 10 products
    const products = await Product.insertMany([
      {
        name: 'Fresh Milk 1L',
        category: 'milk',
        unit: 'liter',
        price: 2.50,
        stock: 450,
        minStock: 200,
        description: 'Fresh pasteurized whole milk',
        isActive: true,
        sku: 'MILK-FRESH-1L',
      },
      {
        name: 'Organic Milk 1L',
        category: 'milk',
        unit: 'liter',
        price: 3.50,
        stock: 320,
        minStock: 150,
        description: 'Organic whole milk from certified farms',
        isActive: true,
        sku: 'MILK-ORG-1L',
      },
      {
        name: 'Greek Yogurt 500g',
        category: 'yogurt',
        unit: 'kg',
        price: 4.20,
        stock: 280,
        minStock: 100,
        description: 'Thick and creamy Greek yogurt',
        isActive: true,
        sku: 'YOG-GREEK-500',
      },
      {
        name: 'Natural Yogurt 1kg',
        category: 'yogurt',
        unit: 'kg',
        price: 3.80,
        stock: 350,
        minStock: 150,
        description: 'Plain natural yogurt, no added sugar',
        isActive: true,
        sku: 'YOG-NAT-1KG',
      },
      {
        name: 'Cheddar Cheese 200g',
        category: 'cheese',
        unit: 'kg',
        price: 6.50,
        stock: 150,
        minStock: 80,
        description: 'Mature cheddar cheese',
        isActive: true,
        sku: 'CHE-CHED-200',
      },
      {
        name: 'Mozzarella 250g',
        category: 'cheese',
        unit: 'kg',
        price: 5.80,
        stock: 180,
        minStock: 70,
        description: 'Fresh mozzarella cheese',
        isActive: true,
        sku: 'CHE-MOZZ-250',
      },
      {
        name: 'Heavy Cream 500ml',
        category: 'cream',
        unit: 'liter',
        price: 4.50,
        stock: 200,
        minStock: 100,
        description: 'Premium heavy cream 35% fat',
        isActive: true,
        sku: 'CRM-HEAVY-500',
      },
      {
        name: 'Whipping Cream 250ml',
        category: 'cream',
        unit: 'liter',
        price: 3.20,
        stock: 160,
        minStock: 80,
        description: 'Whipping cream for desserts',
        isActive: true,
        sku: 'CRM-WHIP-250',
      },
      {
        name: 'Butter 250g',
        category: 'butter',
        unit: 'kg',
        price: 5.00,
        stock: 220,
        minStock: 100,
        description: 'Salted butter',
        isActive: true,
        sku: 'BUT-SALT-250',
      },
      {
        name: 'Skimmed Milk 1L',
        category: 'milk',
        unit: 'liter',
        price: 2.20,
        stock: 380,
        minStock: 180,
        description: 'Fat-free skimmed milk',
        isActive: true,
        sku: 'MILK-SKIM-1L',
      },
    ]);

    console.log('📦 Created 10 products');

    // Create 8 clients
    const clients = await Client.insertMany([
      {
        name: 'Restaurant La Belle Vue',
        email: 'contact@labellevue.fr',
        phone: '+33140123456',
        address: '15 Rue de la Paix, 75001 Paris',
        city: 'Paris',
        type: 'wholesale',
        creditLimit: 5000,
        balance: 0,
        isActive: true,
        notes: 'Premium restaurant client',
      },
      {
        name: 'SuperMarché Plus',
        email: 'orders@supermarcheplus.fr',
        phone: '+33140123457',
        address: '45 Avenue des Champs, 75008 Paris',
        city: 'Paris',
        type: 'wholesale',
        creditLimit: 10000,
        balance: 0,
        isActive: true,
      },
      {
        name: 'Café Le Petit Coin',
        email: 'lepetitcoin@cafe.fr',
        phone: '+33140123458',
        address: '8 Rue du Commerce, 69002 Lyon',
        city: 'Lyon',
        type: 'retail',
        creditLimit: 2000,
        balance: 0,
        isActive: true,
      },
      {
        name: 'Hôtel Grand Luxe',
        email: 'kitchen@grandluxe.fr',
        phone: '+33140123459',
        address: '120 Boulevard Haussmann, 75009 Paris',
        city: 'Paris',
        type: 'wholesale',
        creditLimit: 8000,
        balance: 0,
        isActive: true,
      },
      {
        name: 'Boulangerie Artisanale',
        email: 'contact@boulangerie-artisan.fr',
        phone: '+33140123460',
        address: '32 Rue de la Boulangerie, 13001 Marseille',
        city: 'Marseille',
        type: 'retail',
        creditLimit: 3000,
        balance: 0,
        isActive: true,
      },
      {
        name: 'Restaurant Le Gourmet',
        email: 'chef@legourmet.fr',
        phone: '+33140123461',
        address: '78 Rue Gastronomique, 06000 Nice',
        city: 'Nice',
        type: 'wholesale',
        creditLimit: 6000,
        balance: 0,
        isActive: true,
      },
      {
        name: 'Épicerie Bio Nature',
        email: 'orders@bionature.fr',
        phone: '+33140123462',
        address: '54 Avenue Verte, 33000 Bordeaux',
        city: 'Bordeaux',
        type: 'retail',
        creditLimit: 4000,
        balance: 0,
        isActive: true,
      },
      {
        name: 'Café des Arts',
        email: 'contact@cafedesarts.fr',
        phone: '+33140123463',
        address: '12 Place des Artistes, 31000 Toulouse',
        city: 'Toulouse',
        type: 'retail',
        creditLimit: 2500,
        balance: 0,
        isActive: true,
      },
    ]);

    console.log('👥 Created 8 clients');

    // Create 6 batches
    const batches = await Batch.insertMany([
      {
        batchNumber: 'BATCH-2025-001',
        productId: products[0]._id,
        productName: products[0].name,
        quantity: 500,
        productionDate: new Date('2025-12-20T06:00:00'),
        expiryDate: new Date('2025-12-27'),
        status: 'active',
        notes: 'Excellent quality, passed all tests',
      },
      {
        batchNumber: 'BATCH-2025-002',
        productId: products[2]._id,
        productName: products[2].name,
        quantity: 300,
        productionDate: new Date('2025-12-21T08:00:00'),
        expiryDate: new Date('2026-01-04'),
        status: 'active',
      },
      {
        batchNumber: 'BATCH-2025-003',
        productId: products[4]._id,
        productName: products[4].name,
        quantity: 200,
        productionDate: new Date('2025-12-19T07:00:00'),
        expiryDate: new Date('2026-01-18'),
        status: 'active',
        notes: 'Good texture and flavor',
      },
      {
        batchNumber: 'BATCH-2025-004',
        productId: products[1]._id,
        productName: products[1].name,
        quantity: 400,
        productionDate: new Date('2025-12-22T09:00:00'),
        expiryDate: new Date('2025-12-29'),
        status: 'active',
        notes: 'Awaiting final inspection',
      },
      {
        batchNumber: 'BATCH-2025-005',
        productId: products[6]._id,
        productName: products[6].name,
        quantity: 250,
        productionDate: new Date('2025-12-21T10:00:00'),
        expiryDate: new Date('2025-12-31'),
        status: 'active',
        notes: 'Premium quality cream',
      },
      {
        batchNumber: 'BATCH-2025-006',
        productId: products[8]._id,
        productName: products[8].name,
        quantity: 300,
        productionDate: new Date('2025-12-18T08:00:00'),
        expiryDate: new Date('2026-03-18'),
        status: 'active',
        notes: 'Consistent quality',
      },
    ]);

    console.log('🏭 Created 6 batches');

    // Create 7 orders
    const orders = await Order.insertMany([
      {
        orderNumber: 'ORD-2025-001',
        clientId: clients[0]._id,
        clientName: clients[0].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 50, price: 2.50, subtotal: 125 },
          { productId: products[2]._id, productName: products[2].name, quantity: 20, price: 4.20, subtotal: 84 },
        ],
        total: 250.80,
        status: 'pending',
        deliveryDate: new Date('2025-12-23'),
        deliveryAddress: '15 Rue de la Paix, 75001 Paris',
        notes: 'Urgent delivery needed',
        createdBy: users[1]._id,
      },
      {
        orderNumber: 'ORD-2025-002',
        clientId: clients[1]._id,
        clientName: clients[1].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 100, price: 2.50, subtotal: 250 },
          { productId: products[3]._id, productName: products[3].name, quantity: 50, price: 3.80, subtotal: 190 },
          { productId: products[4]._id, productName: products[4].name, quantity: 30, price: 6.50, subtotal: 195 },
        ],
        total: 762,
        status: 'processing',
        deliveryDate: new Date('2025-12-22'),
        deliveryAddress: '45 Avenue des Champs, 75008 Paris',
        createdBy: users[1]._id,
      },
      {
        orderNumber: 'ORD-2025-003',
        clientId: clients[2]._id,
        clientName: clients[2].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 30, price: 2.50, subtotal: 75 },
          { productId: products[6]._id, productName: products[6].name, quantity: 10, price: 4.50, subtotal: 45 },
        ],
        total: 144,
        status: 'delivered',
        deliveryDate: new Date('2025-12-21'),
        deliveryAddress: '8 Rue du Commerce, 69002 Lyon',
        createdBy: users[1]._id,
      },
      {
        orderNumber: 'ORD-2025-004',
        clientId: clients[3]._id,
        clientName: clients[3].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 80, price: 2.50, subtotal: 200 },
          { productId: products[2]._id, productName: products[2].name, quantity: 40, price: 4.20, subtotal: 168 },
          { productId: products[6]._id, productName: products[6].name, quantity: 25, price: 4.50, subtotal: 112.50 },
          { productId: products[8]._id, productName: products[8].name, quantity: 20, price: 5.00, subtotal: 100 },
        ],
        total: 696.60,
        status: 'pending',
        deliveryDate: new Date('2025-12-23'),
        deliveryAddress: '120 Boulevard Haussmann, 75009 Paris',
        createdBy: users[1]._id,
      },
      {
        orderNumber: 'ORD-2025-005',
        clientId: clients[4]._id,
        clientName: clients[4].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 40, price: 2.50, subtotal: 100 },
          { productId: products[6]._id, productName: products[6].name, quantity: 15, price: 4.50, subtotal: 67.50 },
          { productId: products[8]._id, productName: products[8].name, quantity: 25, price: 5.00, subtotal: 125 },
        ],
        total: 351,
        status: 'delivered',
        deliveryDate: new Date('2025-12-22'),
        deliveryAddress: '32 Rue de la Boulangerie, 13001 Marseille',
        createdBy: users[1]._id,
      },
      {
        orderNumber: 'ORD-2025-006',
        clientId: clients[5]._id,
        clientName: clients[5].name,
        items: [
          { productId: products[2]._id, productName: products[2].name, quantity: 25, price: 4.20, subtotal: 105 },
          { productId: products[4]._id, productName: products[4].name, quantity: 15, price: 6.50, subtotal: 97.50 },
        ],
        total: 243,
        status: 'pending',
        deliveryDate: new Date('2025-12-24'),
        deliveryAddress: '78 Rue Gastronomique, 06000 Nice',
        createdBy: users[1]._id,
      },
      {
        orderNumber: 'ORD-2025-007',
        clientId: clients[6]._id,
        clientName: clients[6].name,
        items: [
          { productId: products[1]._id, productName: products[1].name, quantity: 35, price: 3.50, subtotal: 122.50 },
          { productId: products[3]._id, productName: products[3].name, quantity: 30, price: 3.80, subtotal: 114 },
        ],
        total: 283.80,
        status: 'delivered',
        deliveryDate: new Date('2025-12-20'),
        deliveryAddress: '54 Avenue Verte, 33000 Bordeaux',
        createdBy: users[1]._id,
      },
    ]);

    console.log('📋 Created 7 orders');

    // Create 5 invoices
    const invoices = await Invoice.insertMany([
      {
        invoiceNumber: 'INV-2025-001',
        orderId: orders[2]._id,
        clientId: clients[2]._id,
        clientName: clients[2].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 30, price: 2.50, subtotal: 75 },
          { productId: products[6]._id, productName: products[6].name, quantity: 10, price: 4.50, subtotal: 45 },
        ],
        subtotal: 120,
        tax: 24,
        discount: 0,
        total: 144,
        status: 'paid',
        dueDate: new Date('2025-12-28'),
        paidDate: new Date('2025-12-21'),
        paymentMethod: 'card',
        notes: 'Payment received in full',
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: 'INV-2025-002',
        orderId: orders[4]._id,
        clientId: clients[4]._id,
        clientName: clients[4].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 40, price: 2.50, subtotal: 100 },
          { productId: products[6]._id, productName: products[6].name, quantity: 15, price: 4.50, subtotal: 67.50 },
          { productId: products[8]._id, productName: products[8].name, quantity: 25, price: 5.00, subtotal: 125 },
        ],
        subtotal: 292.50,
        tax: 58.50,
        discount: 0,
        total: 351,
        status: 'paid',
        dueDate: new Date('2026-01-06'),
        paidDate: new Date('2025-12-22'),
        paymentMethod: 'transfer',
        notes: 'Bank transfer received',
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: 'INV-2025-003',
        orderId: orders[6]._id,
        clientId: clients[6]._id,
        clientName: clients[6].name,
        items: [
          { productId: products[1]._id, productName: products[1].name, quantity: 35, price: 3.50, subtotal: 122.50 },
          { productId: products[3]._id, productName: products[3].name, quantity: 30, price: 3.80, subtotal: 114 },
        ],
        subtotal: 236.50,
        tax: 47.30,
        discount: 0,
        total: 283.80,
        status: 'paid',
        dueDate: new Date('2025-12-27'),
        paidDate: new Date('2025-12-20'),
        paymentMethod: 'cash',
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: 'INV-2025-004',
        orderId: orders[0]._id,
        clientId: clients[0]._id,
        clientName: clients[0].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 50, price: 2.50, subtotal: 125 },
          { productId: products[2]._id, productName: products[2].name, quantity: 20, price: 4.20, subtotal: 84 },
        ],
        subtotal: 209,
        tax: 41.80,
        discount: 0,
        total: 250.80,
        status: 'sent',
        dueDate: new Date('2026-01-21'),
        notes: 'Payment terms: 30 days',
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: 'INV-2025-005',
        orderId: orders[3]._id,
        clientId: clients[3]._id,
        clientName: clients[3].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, quantity: 80, price: 2.50, subtotal: 200 },
          { productId: products[2]._id, productName: products[2].name, quantity: 40, price: 4.20, subtotal: 168 },
          { productId: products[6]._id, productName: products[6].name, quantity: 25, price: 4.50, subtotal: 112.50 },
          { productId: products[8]._id, productName: products[8].name, quantity: 20, price: 5.00, subtotal: 100 },
        ],
        subtotal: 580.50,
        tax: 116.10,
        discount: 0,
        total: 696.60,
        status: 'sent',
        dueDate: new Date('2026-01-21'),
        notes: 'Hotel - Net 30 payment terms',
        createdBy: users[1]._id,
      },
    ]);

    console.log('💰 Created 5 invoices');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Batches: ${batches.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Invoices: ${invoices.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: admin@dairy.com');
    console.log('   Password: admin123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();

# Dairy Management System Backend - Setup Guide

## Quick Start

### 1. Prerequisites Check

Ensure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ MongoDB 5+ (`mongod --version`)
- ✅ npm or yarn (`npm --version`)

### 2. Installation Steps

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings (use nano, vim, or any text editor)
nano .env
```

### 3. Configure Environment

Minimum required `.env` configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dairy-management
JWT_SECRET=change-this-to-a-random-secret-key
FRONTEND_URL=http://localhost:5173
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Linux/macOS
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB
```

**Option B: MongoDB in Docker**
```bash
docker run -d -p 27017:27017 --name dairy-mongo mongo:7
```

**Option C: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Seed the Database

```bash
npm run seed
```

**This creates test users:**
- Admin: `admin@dairy.com` / `password123`
- Manager: `manager@dairy.com` / `password123`
- Operator: `operator@dairy.com` / `password123`
- Driver: `driver@dairy.com` / `password123`

### 6. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at: `http://localhost:5000`

### 7. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dairy.com","password":"password123"}'

# Get dashboard stats (replace YOUR_TOKEN with the token from login)
curl http://localhost:5000/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Check if MongoDB is running: `systemctl status mongod`
2. Verify connection string in `.env`
3. For MongoDB Atlas, check IP whitelist

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

### Issue: "JWT_SECRET is required"

**Solution:**
Ensure `.env` file has `JWT_SECRET` set to a random string

### Issue: TypeScript errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Project Structure
```
backend/
├── src/
│   ├── config/         # Database & configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts (seed, etc.)
│   └── server.ts       # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Start production server
npm run seed       # Seed database with sample data
```

### Adding New Features

1. **Create Model** in `src/models/`
2. **Create Controller** in `src/controllers/`
3. **Create Routes** in `src/routes/`
4. **Register Routes** in `src/server.ts`

## Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create dairy-api

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

### Deploy with Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## API Testing

### Using cURL

See `API_DOCUMENTATION.md` for complete endpoint examples

### Using Postman

1. Import collection from `postman_collection.json` (if available)
2. Set environment variable `BASE_URL` to `http://localhost:5000/api/v1`
3. After login, set `TOKEN` variable

### Using REST Client (VS Code)

Create `test.http` file:

```http
### Login
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@dairy.com",
  "password": "password123"
}

### Get Products
GET http://localhost:5000/api/v1/products
Authorization: Bearer YOUR_TOKEN_HERE
```

## Security Checklist

- [ ] Change default `JWT_SECRET` in production
- [ ] Use strong passwords for admin accounts
- [ ] Enable HTTPS in production
- [ ] Set up MongoDB authentication
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Regular security updates

## Performance Tips

1. **Use indexes** in MongoDB for frequently queried fields
2. **Enable compression** in production
3. **Use caching** for frequently accessed data
4. **Monitor** with PM2 or similar tools
5. **Set up logging** with Winston

## Support & Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Express.js Guide: https://expressjs.com/
- Mongoose Documentation: https://mongoosejs.com/
- JWT Introduction: https://jwt.io/introduction

## Next Steps

1. ✅ Complete backend setup
2. ✅ Test all API endpoints
3. ✅ Seed database with sample data
4. ⏭️ Connect frontend application
5. ⏭️ Deploy to production

---

Need help? Check the main README.md or API_DOCUMENTATION.md

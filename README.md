# Classroom Scheduler

A full-stack MERN application for managing classroom schedules, faculty assignments, and course scheduling.

## Features

- User authentication (JWT-based)
- Classroom scheduling and management
- Faculty management
- Course management
- Rescheduling capabilities
- Notifications system
- CSV import functionality
- Calendar export (ICS format)

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT
- **File Handling**: Multer
- **Calendar**: ICS

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Harshini_project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_scheduler?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_secure_random_string_here

# CORS Configuration
# For local development
FRONTEND_URL=http://localhost:5173
# For production deployment
# FRONTEND_URL=https://class-room-scheduler.vercel.app
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
# For local development
VITE_API_URL=http://localhost:5000

# For production deployment
# VITE_API_URL=https://classroomscheduler.onrender.com
```

## Running the Application

### Local Development

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Deployment

#### Backend (Render/Heroku)
- The backend is configured for deployment with the included `Procfile`
- Ensure environment variables are set in your deployment platform:
  - `MONGO_URI`: Your MongoDB connection string
  - `JWT_SECRET`: A secure random string for JWT signing
  - `FRONTEND_URL`: `https://class-room-scheduler.vercel.app`
- The `start` script will run the production server

#### Demo User Seeding (Required for Production)
After deploying the backend, you must seed demo users to enable login functionality:

1. **Set up environment variables on Render/Heroku** with the same `MONGO_URI` and a `JWT_SECRET`

2. **Run the seed script locally** (with production database):
   ```bash
   cd backend
   npm install
   # Set production environment variables temporarily
   export MONGO_URI="your_production_mongo_uri"
   export JWT_SECRET="your_production_jwt_secret"
   node seedDemoUsers.js
   ```

3. **Or run via Render Shell**:
   - Go to your Render dashboard
   - Open the Shell for your web service
   - Run: `node seedDemoUsers.js`

4. **Demo credentials after seeding**:
   - **Admin**: `admin` / `Admin@123`
   - **Coordinator**: `coord_cse` / `Coord@123`
   - **Faculty**: `fac_john` / `Faculty@123`
   - **Student**: `stu_cse_01` / `Student@123`

#### Frontend (Vercel/Netlify)
- Build the frontend: `npm run build`
- Deploy the `dist` folder to your hosting platform
- Set the `VITE_API_URL` environment variable to your deployed backend URL (e.g., `https://classroomscheduler.onrender.com`)
- Ensure `vercel.json` is included for proper client-side routing

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `FRONTEND_URL`: Frontend URL for CORS configuration

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule
- `GET /api/faculty` - Get faculty list
- `GET /api/courses` - Get courses list
- `GET /api/classrooms` - Get classrooms list
- `POST /api/import` - Import CSV data
- `GET /api/reschedules` - Get reschedule requests

## Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment Notes

1. **CORS Configuration**: Update `FRONTEND_URL` in backend `.env` to match your frontend domain
2. **Database**: Use MongoDB Atlas for cloud deployment
3. **Environment Variables**: Never commit `.env` files, use `.env.example` as template
4. **Build Process**: Frontend proxy is configured for local development only

## Troubleshooting

### Production Issues

- **404 Error on Page Refresh**: Ensure `vercel.json` is deployed with the frontend. It contains rewrite rules to handle client-side routing.
- **Login Not Working**: 
  1. Verify `JWT_SECRET` is set on Render/Heroku (check logs)
  2. Run `node seedDemoUsers.js` to create demo accounts
  3. Check browser console for CORS errors
- **CORS Errors**: 
  1. Verify `FRONTEND_URL` on backend matches your actual frontend domain
  2. Check for trailing slashes (should not have them)
  3. Ensure `VITE_API_URL` on frontend matches your backend domain
- **MongoDB Connection Errors**: 
  1. Whitelist Render/Heroku IP addresses in MongoDB Atlas
  2. Verify `MONGO_URI` is correct in production environment
- **Health Check**: Visit `https://your-backend.com/health` to verify backend status

### Local Development Issues

- **CORS Issues**: Ensure `FRONTEND_URL` matches your frontend domain
- **Database Connection**: Verify `MONGO_URI` is correct and accessible
- **Environment Variables**: Check that all required variables are set
- **Port Conflicts**: Change `PORT` if 5000 is already in use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

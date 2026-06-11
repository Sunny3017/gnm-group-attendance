# GNM Real Estate - Attendance & Payroll Management System

A comprehensive enterprise-grade attendance and payroll management system for GNM Real Estate.

## 🚀 Live Deployment

- **Frontend**: [https://gnm-attendance-dashboard.netlify.app/login](https://gnm-attendance-dashboard.netlify.app/login)
- **Backend API**: [https://gnm-group-attendance.onrender.com](https://gnm-group-attendance.onrender.com)

## Features

### Admin Panel
- Employee management (add, edit, delete)
- Attendance management with manual entry and editing
- Leave management
- Payroll generation and management
- Detailed reports (Excel and PDF)
- Dashboard with real-time statistics

### Employee Panel
- Attendance marking with geofencing
- Half-day option
- Attendance history
- Payroll history with salary slips
- Dashboard with personal statistics

### Key Features
- Employee login via mobile number
- Auto-calculated late penalty (after 09:00)
- Half-day penalty calculation based on monthly salary
- Geofencing for attendance verification
- PDF and Excel report generation

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- PDFKit (PDF reports)
- ExcelJS (Excel reports)

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- React Router
- Redux Toolkit

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Steps

1. Clone the repository
```bash
git clone https://github.com/Sunny3017/gnm-group-attendance.git
cd gnm-group-attendance
```

2. Install dependencies for both backend and frontend
```bash
npm run install:all
```

3. Create environment files
- Copy `.env.example` to `.env` in the root directory
- Copy `.env.example` to `backend/.env`
- Update the environment variables in both files

4. Start the development server
```bash
npm run dev
```

5. For production, build the frontend and start the backend
```bash
npm run build
npm start
```

## Environment Variables

### Backend
- `NODE_ENV`: Environment (development/production)
- `PORT`: Port number (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

### Frontend
- `VITE_API_URL`: API base URL (only needed for development)

## Usage

1. Open the application in your browser (default: http://localhost:5000)
2. Admin login: Use the admin credentials
3. Employee login: Use employee's mobile number and password

## Deployment

### Current Deployment

- **Frontend**: Deployed on Netlify
- **Backend**: Deployed on Render

### Deploy to Netlify (Frontend)

1. Connect your repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variables (if needed)
5. Deploy!

### Deploy to Render (Backend)

1. Connect your repository to Render
2. Set build command: `cd backend && npm install && cd ../frontend && npm install && npm run build`
3. Set start command: `cd backend && npm start`
4. Add environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your strong JWT secret
5. Deploy!

### Docker (Coming Soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the LICENSE file for details
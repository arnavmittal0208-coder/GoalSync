# GoalSync — Employee Performance Portal

**GoalSync** is a full-stack application for employee goal setting, performance tracking, manager approvals, and admin reporting.

This repository includes a React frontend and an Express backend. It is ready to deploy with:
- Frontend on **Vercel**
- Backend on **Render**
- Database on **MongoDB Atlas**

---

## Project Overview

GoalSync supports a structured performance workflow where:
- employees create and submit goals,
- managers review, approve, or reject goals,
- admins monitor progress, export reports, and manage users.

Features included in this project:
- login-first experience with protected routes
- employee, manager, and admin dashboards
- goal creation, submission, approval, rejection, and unlock
- shared goals and team coordination
- quarterly check-ins and progress tracking
- exportable Excel/CSV reports and audit logging

---

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT tokens and role-based access control
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## Repository Structure

TrackSphere - Copy - Copy22/
- goalsync-frontend/          # React frontend app
  - public/
  - src/
    - components/             # UI components and layout
    - context/                # auth and app state context
    - pages/                  # auth, employee, manager, admin views
    - routes/                 # protected routing
    - services/               # API client helpers
  - package.json
  - vite.config.js
- goalsync-backend/           # Express backend API
  - src/
    - config/                 # database and app config
    - controllers/            # request handlers
    - middleware/             # auth, validation, error handling
    - models/                 # Mongoose schemas
    - routes/                 # API endpoints
    - utils/                  # seed and helper scripts
  - package.json
  - src/server.js

---

## Local Setup

### Backend

1. Open a terminal in `goalsync-backend`
2. Run `npm install`
3. Create a `.env` file with the following values:
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/goalsync?retryWrites=true&w=majority`
   - `JWT_SECRET=your_strong_jwt_secret`
   - `CLIENT_URL=http://localhost:5173`
   - `PORT=5000`
4. Seed sample data with `npm run seed`
5. Start the backend with `npm run dev`

Backend default URL: `http://localhost:5000`

### Frontend

1. Open a terminal in `goalsync-frontend`
2. Run `npm install`
3. Start the frontend with `npm run dev`

Frontend default URL: `http://localhost:5173`

If the frontend needs to call the backend locally, add a `.env` file in `goalsync-frontend` with:
- `VITE_API_URL=http://localhost:5000/api`

---

## Deployment Guide

### Frontend on Vercel
1. Push `goalsync-frontend/` to GitHub.
2. Import the repository into Vercel.
3. Set environment variable: `VITE_API_URL=https://<your-backend>.onrender.com/api`
4. Deploy the frontend.

### Backend on Render
1. Push `goalsync-backend/` to GitHub.
2. Create a new Web Service on Render.
3. Configure environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (the deployed frontend URL)
   - `PORT=5000`
4. Deploy the backend.

### Database on MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. Create a database user and password.
3. Configure network access.
4. Use the Atlas connection string for `MONGODB_URI`.

---

## API Summary

Auth endpoints:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `PUT /api/auth/change-password`

Goal endpoints:
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `DELETE /api/goals/:id`
- `POST /api/goals/submit`
- `GET /api/goals/manager/team`
- `PUT /api/goals/:id/approve`
- `PUT /api/goals/:id/reject`
- `PUT /api/goals/:id/unlock`
- `POST /api/goals/shared`
- `GET /api/goals/admin/all`

Check-in endpoints:
- `GET /api/checkins`
- `POST /api/checkins`
- `PUT /api/checkins/:id/comment`
- `GET /api/checkins/team`

Report endpoints:
- `GET /api/reports?format=excel`
- `GET /api/reports?format=csv`
- `GET /api/reports/audit`
- `GET /api/reports/cycles`

---

## Demo Accounts

- Employee: `employee@goalsync.com` / `employee123`
- Manager: `manager@goalsync.com` / `manager123`
- Admin: `admin@goalsync.com` / `admin123`

---

## Key Features

- Role-based login for Employee / Manager / Admin
- Goal creation, approval, rejection, unlock, and shared goals
- Quarterly check-ins and progress tracking
- In-app notifications and analytics
- Excel/CSV report exports
- Audit log tracking
- Responsive user interface

---

## Notes

- The frontend and backend are deployed separately.
- Frontend goes to Vercel.
- Backend goes to Render.
- MongoDB Atlas is the recommended database for production.
- The app uses a login-first entry point.

---

## Need help?

If you want, I can also help you add GitHub badges, improve the README style, or create deployment scripts for Vercel and Render.

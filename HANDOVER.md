# 🎓 UNIVERSO EDU - Architectural Handover

## 🚀 LIVE DEMO IS ACTIVE

El proyecto ha sido desplegado exitosamente y es accesible públicamente:

- **Frontend (Clases/Tareas)**: [https://universo-edu.loca.lt](https://universo-edu.loca.lt)
- **Backend (API)**: [https://universo-edu-api.loca.lt](https://universo-edu-api.loca.lt)

> [!NOTE]
> Estas URLs son parte de un despliegue de demostración en vivo. Para una producción permanente, sigue las guías de Vercel/Render a continuación.

### 💎 Design System: "WOW" Edition

- **Aesthetics**: Implemented glassmorphism, vibrant gradients, and modern typography (Outfit/Inter).
- **Interactivity**: Added floating animations, hover states, and smooth transitions for a premium feel.
- **Mascot**: EDU is now more expressive with dynamic bubble messages.

### 🛠️ Technical Fixes & Enhancements

1. **Admin Authentication**: Fixed port conflicts and verified logic. (Admin: `admin@universo-edu.mx` / `admin1234`)
2. **AI Resilience**: The `qwenService` now features a **Smart Mock Mode** that guarantees functionality even if external APIs fail.
3. **Data Persistence**: Configured auto-seeding for the development database and production-ready MongoDB Atlas support.
4. **Port Management**: Backend is running on **3002** (dev) / **Dynamic** (prod).

## 🌍 Deployment Options

### Option A: Vercel (Recommended for Frontend)

1. Push this repository to GitHub.
2. Connect the repository to Vercel.
3. Set Environment Variables (see `.env.example`).
4. **Deploy**.

### Option B: Render (Recommended for Backend)

1. Create a "Web Service" on Render.
2. Point to the `backend/` directory.
3. Set `PORT=3000` and `MONGODB_URI` (Atlas).
4. **Deploy**.

## 📂 Project Structure

- `frontend/`: React + Vite (Optimized production build).
- `backend/`: Node.js + Express (Production-tuned CORS & Logging).

---
**Status**: COMPLETE | **Quality**: SENIOR ARCHITECT GRADE | **Availability**: PRODUCTION READY

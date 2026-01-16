# 🎓 UNIVERSO EDU

Plataforma educativa pública para estudiantes de 6° grado de primaria, alineada con la **Nueva Escuela Mexicana (NEM)**.

## ✨ Características

- **🤖 Chatbot Pedagógico EDU** - Asistente IA que guía a los estudiantes usando el método socrático (nunca da respuestas directas)
- **📋 Generador de Tareas NEM** - Genera tareas de aprendizaje basadas en proyectos alineadas con los campos formativos
- **⏰ Publicación Automática** - Las tareas se publican automáticamente de lunes a viernes a las 13:00 (hora de México)
- **🔐 Panel Administrativo** - Dashboard para docentes con generación de tareas y programación
- **💯 100% Gratuito** - Diseñado para escuelas públicas SEP sin costos de hosting

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Hosting |
|------------|------------|---------|
| Frontend | React + Vite + TypeScript | Vercel (Hobby) |
| Backend | Node.js + Express | Render (Free) |
| Base de Datos | MongoDB | Atlas (M0 Free) |
| IA | QWEN 3.5 MAX | Free API |

## 📁 Estructura del Proyecto

```
universo-edu/
├── backend/
│   ├── config/         # Configuraciones (DB, QWEN)
│   ├── models/         # Esquemas MongoDB
│   ├── routes/         # Endpoints API
│   ├── services/       # Lógica de negocio
│   ├── middleware/     # Auth y manejo de errores
│   └── server.js       # Entrada principal
├── frontend/
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── pages/      # Páginas de la app
│   │   └── services/   # APIs y servicios
│   └── index.html
└── .env.example        # Variables de entorno
```

## 🚀 Instalación Local

### Prerrequisitos

- Node.js 18+
- MongoDB (o cuenta en MongoDB Atlas)
- API Key de QWEN 3.5 MAX

### 1. Clonar y configurar

```bash
# Clonar repositorio
git clone <repo-url>
cd universo-edu

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

El servidor estará en `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará en `http://localhost:5173`

## ⚙️ Variables de Entorno

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=tu-secreto-jwt

# QWEN API
QWEN_CHATBOT_API_KEY=tu-api-key
QWEN_TASK_GENERATOR_API_KEY=tu-api-key
QWEN_FALLBACK_API_KEY=tu-api-key

# Server
PORT=3001
NODE_ENV=development
TZ=America/Mexico_City

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 📚 API Endpoints

### Autenticación

- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/me` - Usuario actual

### Chat (Estudiantes)

- `POST /api/chat/session` - Crear sesión de chat
- `POST /api/chat/message` - Enviar mensaje al chatbot
- `GET /api/chat/history/:sessionId` - Historial de chat

### Tareas (Estudiantes)

- `GET /api/tasks` - Obtener tareas publicadas
- `GET /api/tasks/:id` - Detalle de tarea

### Admin

- `POST /api/tasks/generate` - Generar tarea con IA
- `PUT /api/tasks/:id/publish` - Publicar tarea
- `GET /api/admin/stats` - Estadísticas del dashboard
- `GET /api/admin/schedules` - Programaciones activas

## 🏫 Campos Formativos NEM

1. **Lenguajes** - Lectura, escritura, expresión oral
2. **Saberes y Pensamiento Científico** - Matemáticas, ciencias naturales
3. **Ética, Naturaleza y Sociedades** - Historia, geografía, civismo
4. **De lo Humano y lo Comunitario** - Arte, convivencia, salud

## 🚀 Despliegue

### Frontend (Vercel)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno `VITE_API_URL`
3. Deploy automático

### Backend (Render)

1. Crear Web Service en Render
2. Conectar repositorio
3. Configurar variables de entorno
4. Deploy automático

### Base de Datos (MongoDB Atlas)

1. Crear cluster M0 (gratuito)
2. Crear usuario de base de datos
3. Obtener connection string

## 📄 Licencia

MIT License - Libre para uso educativo

## 🤝 Contribuciones

¡Contribuciones bienvenidas! Este proyecto está diseñado para escuelas públicas mexicanas.

---

Desarrollado con ❤️ para la educación pública de México 🇲🇽

# tasks-frontend

Frontend en React + Vite que consume la API de `Go-project-TaskManager`.

## Instalar y correr

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

## Estructura

```
tasks-frontend/
├── src/
│   ├── api/client.js         # todas las llamadas fetch a la API
│   ├── context/AuthContext.jsx  # maneja el token JWT globalmente
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Tasks.jsx          # CRUD completo
│   ├── App.jsx                # rutas
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

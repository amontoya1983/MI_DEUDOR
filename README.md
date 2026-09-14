# MI DEUDOR - Plataforma Pública de Consulta de Deudores

**MI DEUDOR** es una plataforma institucional y pública para la consulta y reporte de deudores morosos por parte de acreedores legítimos. La plataforma opera bajo un riguroso marco de legalidad, debido proceso y privacidad: **ningún registro se publica de forma automática**; cada denuncia debe superar una auditoría y verificación documental administrativa antes de ser visible públicamente.

---

## 🚀 Características Principales

- **Roles de Usuario**:
  - **Administrador**: Control de calidad, cotejo probatorio, aprobación/rechazo de denuncias, solicitud de correcciones, suspensión/reactivación de registros, configuración algorítmica de riesgo y auditoría total inmutable.
  - **Denunciante**: Registro y autenticación, diligenciamiento de formulario del deudor con fotografía, registro detallado de obligaciones con acreedores, adjuntos probatorios (pagarés, facturas, contratos) y declaración jurada legal.
  - **Visitante**: Acceso público sin autenticación para consultar deudores verificados, búsqueda por nombre o número de documento, filtrado por ciudad y nivel de riesgo, visualización de perfiles y desglose de obligaciones.
- **Algoritmo Configurable de Índice de Riesgo (1 a 100)**:
  - Ponderación de saldo adeudado (70%) y dispersión de acreedores (30%).
  - Clasificación en cuatro cuadrantes: Bajo (1-25), Medio (26-50), Alto (51-75) y Crítico (76-100).
  - Parámetros de referencia ajustables en tiempo real por el Administrador.
- **Trazabilidad y Auditoría (Audit Logs)**:
  - Registro de cada acción del sistema (quién, cuándo, entidad, IP y detalles probatorios).
- **Garantías Legales**:
  - Aceptación de términos y condiciones y declaración bajo gravedad de juramento previa a la radicación.
  - Derecho de rectificación y solicitud de corrección directa desde el perfil del deudor.

---

## 📐 Algoritmo de Cálculo de Puntaje

El índice de riesgo normalizado entre 1 y 100 evalúa la severidad patrimonial y la reincidencia ante múltiples acreedores:

$$\text{score} = \left( \frac{\text{montoTotal}}{\text{montoMaximoReferencia}} \times 70 \right) + \left( \frac{\text{cantidadAcreedores}}{\text{acreedoresMaximosReferencia}} \times 30 \right)$$

### Clasificación de Niveles de Riesgo:
- **1 - 25**: 🟢 **Riesgo Bajo** (Obligaciones reducidas con un número mínimo de acreedores).
- **26 - 50**: 🟡 **Riesgo Medio** (Exposición moderada o mora prolongada).
- **51 - 75**: 🟠 **Riesgo Alto** (Múltiples acreedores y volumen de deuda considerable).
- **76 - 100**: 🔴 **Riesgo Crítico** (Alto volumen patrimonial comprometido y dispersión de acreedores).

---

## 🗄️ Modelo de Base de Datos (Prisma & PostgreSQL)

El esquema relacional incluye las siguientes tablas normalizadas:
- `users`: Usuarios de la plataforma (Administradores y Denunciantes).
- `roles`: Definición de permisos (`ADMIN`, `REPORTER`, `VIEWER`).
- `debtors`: Ficha oficial del deudor con totales calculados y score consolidado.
- `creditors`: Personas naturales o jurídicas titulares del crédito.
- `debts`: Detalle individual de obligaciones (monto, moneda, vencimiento, estado).
- `complaints`: Denuncias radicadas con estados (`DRAFT`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`).
- `documents`: Documentos probatorios adjuntos (pagarés, facturas electrónicas, copias notariales).
- `audit_logs`: Registro cronológico e inmutable de eventos del sistema.

Archivos incluidos:
- `prisma/schema.prisma` (Definición Prisma)
- `prisma/schema.sql` (Script DDL estándar para PostgreSQL)

---

## 🛠️ Ejecución Local

### Prerrequisitos
- Node.js versión 20 o superior.
- Gestor de paquetes `npm`.

### Paso 1: Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd mi-deudor
npm install
```

### Paso 2: Configuración de Variables de Entorno
Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```
Ajustar las variables según la infraestructura deseada:
```env
APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/mideudor?schema=public"
AUTH_SECRET="super-secret-key-32-chars-long"
RISK_SCORE_MAX_DEBT_REFERENCE="50000000"
RISK_SCORE_MAX_CREDITORS_REFERENCE="10"
```

### Paso 3: Iniciar el Entorno de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en `http://localhost:3000`.

### Cuentas de Prueba Preconfiguradas:
- **Administrador de Cumplimiento**:
  - Correo: `admin@mideudor.com`
  - Contraseña: `admin123`
- **Denunciante Corporativo**:
  - Correo: `denunciante@empresa.com`
  - Contraseña: `user123`

---

## ☁️ Despliegue en Vercel

Para desplegar esta aplicación en **Vercel**, sigue los pasos a continuación:

### Opción A: Despliegue Directo vía Git
1. Sube tu repositorio a GitHub, GitLab o Bitbucket.
2. Ingresa a [Vercel](https://vercel.com) e importa tu repositorio.
3. En la sección **Build & Output Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En **Environment Variables**, agrega:
   - `DATABASE_URL`: Tu conexión de PostgreSQL (ej. Supabase, Neon o AWS RDS).
   - `AUTH_SECRET`: Clave aleatoria de al menos 32 caracteres.
   - `APP_URL`: La URL asignada por Vercel (ej. `https://mi-deudor.vercel.app`).
   - `RISK_SCORE_MAX_DEBT_REFERENCE`: `50000000`
   - `RISK_SCORE_MAX_CREDITORS_REFERENCE`: `10`
5. Haz clic en **Deploy**.

### Opción B: Despliegue Full-Stack mediante Vercel Serverless Functions
Si deseas ejecutar la API de Node.js en Serverless Functions de Vercel:
1. Crea un archivo `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
2. Ejecuta en tu terminal:
```bash
npx vercel
```

---

## 🐳 Docker para Desarrollo o Producción

El proyecto incluye un `Dockerfile` multi-etapa optimizado:

```bash
# Construir la imagen
docker build -t mi-deudor:latest .

# Ejecutar el contenedor
docker run -p 3000:3000 -d --name mi-deudor-app mi-deudor:latest
```

---

## 🔐 Seguridad y Buenas Prácticas

- **Validación con Zod**: Todos los datos de entrada del formulario de denuncias son validados en runtime.
- **Protección de Rutas**: Endpoints administrativos verifican rol `ADMIN` y token de sesión.
- **Inmutabilidad de Auditoría**: Cada cambio en el estado de una denuncia o deudor queda registrado con timestamp, identificador de usuario y dirección IP.
- **Sanitización y Privacidad**: Se ofrecen opciones de enmascaramiento de documentos sensibles para visitantes públicos.

---

Desarrollado con rigor técnico, enfoque en cumplimiento legal y diseño institucional de alta fidelidad.
